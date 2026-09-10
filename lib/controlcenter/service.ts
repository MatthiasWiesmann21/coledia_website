import type { Container, OwnerAccount } from "@/prisma/generated/client";
import type { ProvisionResult, ProvisionInput, DeprovisionFn } from "../dokploy/provision";
import {
  canUseCustomDomain,
  containerIdSchema,
  containerInputSchema,
  deleteContainerInputSchema,
  getContainerLimit,
  updateContainerInputSchema,
  type ContainerActionResult,
  type ContainerError,
} from "./policy";

export type ContainerChange = Partial<Pick<Container,
  "name" | "subdomain" | "customDomain" | "status" | "provisionError" | "deletedAt" | "dokployApplicationId"
>>;

export interface ContainerTransaction {
  owner: OwnerAccount;
  countNonDeleted(): Promise<number>;
  find(id: string): Promise<Container | null>;
  create(input: { name: string; subdomain: string }): Promise<Container>;
  update(id: string, data: ContainerChange): Promise<void>;
  updateTenant(tenantId: string, data: {
    name?: string;
    subdomain?: string;
    customDomain?: string | null;
    status?: string;
  }): Promise<void>;
}

export interface ContainerStore {
  withOwner<T>(userId: string, work: (tx: ContainerTransaction) => Promise<T>): Promise<T>;
}

function failure(error: ContainerError): ContainerActionResult {
  return { ok: false, error };
}

export function databaseErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return;
  return typeof error.code === "string" ? error.code : undefined;
}

function isDomainConflict(error: unknown): boolean {
  if (databaseErrorCode(error) !== "P2002" || typeof error !== "object" ||
    error === null || !("meta" in error)) return false;
  const meta = error.meta;
  if (typeof meta !== "object" || meta === null || !("target" in meta)) return false;
  const targets = Array.isArray(meta.target) ? meta.target : [meta.target];
  return targets.some((target) => typeof target === "string" && /subdomain|customdomain/i.test(target));
}

function isMutable(container: Container): boolean {
  return !container.deletedAt &&
    ["error", "mock", "provisioning"].includes(container.status);
}

function isLive(container: Container): boolean {
  return !container.deletedAt && Boolean(container.dokployApplicationId);
}

export function createContainerService(deps: {
  store: ContainerStore;
  provision: (input: ProvisionInput) => Promise<ProvisionResult>;
  deprovision?: DeprovisionFn | null;
  buildEnvVars: (input: { tenantId: string }) => Record<string, string>;
  now?: () => Date;
}) {
  async function execute(
    userId: string | null,
    work: (tx: ContainerTransaction) => Promise<ContainerActionResult>,
  ): Promise<ContainerActionResult> {
    if (!userId) return failure("unauthenticated");
    try {
      return await deps.store.withOwner(userId, async (tx) => {
        if (tx.owner.status !== "active") return failure("operation_not_allowed");
        return work(tx);
      });
    } catch (error) {
      return failure(isDomainConflict(error) ? "domain_unavailable" : "unexpected");
    }
  }

  async function provisionContainer(
    tx: ContainerTransaction,
    container: Container,
  ) {
    const envVars = deps.buildEnvVars({ tenantId: container.tenantId });
    let result: ProvisionResult;
    try {
      result = await deps.provision({
        name: container.name,
        subdomain: container.subdomain,
        customDomain: container.customDomain,
        tenantId: container.tenantId,
        envVars,
      });
    } catch {
      result = { status: "error", provisionError: "provisioning_failed" };
    }
    if (result.status === "active" || result.status === "provisioning") {
      await tx.update(container.id, {
        status: result.status,
        provisionError: null,
        dokployApplicationId: result.dokployApplicationId,
      });
    } else {
      await tx.update(container.id, result);
    }
    return result;
  }

  async function deprovisionIfLive(container: Container, action: "stop" | "delete") {
    if (!container.dokployApplicationId || !deps.deprovision) return;
    try {
      await deps.deprovision(container.dokployApplicationId, action);
    } catch {
      // Deprovisioning failure is logged but does not block the database state change.
      // The container is still soft-deleted; admin can manually clean up later.
    }
  }

  return {
    async create(userId: string | null, input: unknown): Promise<ContainerActionResult> {
      if (!userId) return failure("unauthenticated");
      const parsed = containerInputSchema.safeParse(input);
      if (!parsed.success) return failure("invalid_input");
      return execute(userId, async (tx) => {
        const limit = getContainerLimit(tx.owner.tier);
        if (limit !== null && await tx.countNonDeleted() >= limit) return failure("limit_reached");
        const container = await tx.create(parsed.data);
        await provisionContainer(tx, container);
        return { ok: true, id: container.id };
      });
    },

    async update(userId: string | null, input: unknown): Promise<ContainerActionResult> {
      if (!userId) return failure("unauthenticated");
      const parsed = updateContainerInputSchema.safeParse(input);
      if (!parsed.success) return failure("invalid_input");
      return execute(userId, async (tx) => {
        const container = await tx.find(parsed.data.id);
        if (!container) return failure("not_found");
        if (!isMutable(container)) return failure("operation_not_allowed");
        const { name, subdomain, customDomain } = parsed.data;
        if (customDomain && !canUseCustomDomain(tx.owner.tier)) return failure("custom_domain_not_allowed");
        const data = {
          name,
          subdomain,
          ...(customDomain !== undefined ? { customDomain: customDomain || null } : {}),
        };
        await tx.update(container.id, data);
        await tx.updateTenant(container.tenantId, data);
        return { ok: true, id: container.id };
      });
    },

    async delete(userId: string | null, input: unknown): Promise<ContainerActionResult> {
      if (!userId) return failure("unauthenticated");
      const parsed = deleteContainerInputSchema.safeParse(input);
      if (!parsed.success) return failure("invalid_input");
      return execute(userId, async (tx) => {
        const container = await tx.find(parsed.data.id);
        if (!container) return failure("not_found");
        if (container.deletedAt) return failure("operation_not_allowed");
        if (!isMutable(container) && !isLive(container)) return failure("operation_not_allowed");
        if (parsed.data.confirmation !== container.subdomain) return failure("confirmation_mismatch");
        await deprovisionIfLive(container, "stop");
        await tx.update(container.id, {
          status: "deleted",
          deletedAt: deps.now?.() ?? new Date(),
          provisionError: null,
        });
        await tx.updateTenant(container.tenantId, { status: "cancelled" });
        return { ok: true, id: container.id };
      });
    },

    async retry(userId: string | null, input: unknown): Promise<ContainerActionResult> {
      if (!userId) return failure("unauthenticated");
      const parsed = containerIdSchema.safeParse(input);
      if (!parsed.success) return failure("invalid_input");
      return execute(userId, async (tx) => {
        const container = await tx.find(parsed.data.id);
        if (!container) return failure("not_found");
        if (container.deletedAt) return failure("operation_not_allowed");
        if (container.status !== "error") return failure("operation_not_allowed");
        const result = await provisionContainer(tx, container);
        return result.status === "error"
          ? failure("provisioning_unavailable")
          : { ok: true, id: container.id };
      });
    },
  };
}
