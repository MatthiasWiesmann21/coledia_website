import assert from "node:assert/strict";
import { test } from "node:test";
import type { Container, OwnerAccount } from "../prisma/generated/client";
import {
  createContainerService,
  type ContainerStore,
  type ContainerTransaction,
} from "../lib/controlcenter/service";
import { retryTransaction } from "../lib/controlcenter/transactions";
import {
  canUseCustomDomain,
  containerInputSchema,
  customDomainSchema,
  getContainerLimit,
  isMockProvisioningEnabled,
  subdomainSchema,
} from "../lib/controlcenter/policy";
import {
  provisionContainer, type ProvisionResult, type ProvisionInput,
} from "../lib/dokploy/provision";

const now = new Date("2026-01-01T00:00:00Z");

function owner(userId: string, tier = "free"): OwnerAccount {
  return {
    id: `owner-${userId}`, userId, tier, status: "active",
    stripeCustomerId: null, stripeSubscriptionId: null, currentPeriodEnd: null,
    createdAt: now, updatedAt: now,
  };
}

class MemoryStore implements ContainerStore {
  owners = new Map([["alice", owner("alice")], ["bob", owner("bob")]]);
  containers = new Map<string, Container>();
  tenants = new Map<string, { name: string; subdomain: string; customDomain: string | null; status: string }>();
  memberships: Array<{ userId: string; tenantId: string; role: string }> = [];
  branding = new Set<string>();
  failTenantUpdate = false;
  transactions = 0;
  private queue = Promise.resolve();

  async withOwner<T>(userId: string, work: (tx: ContainerTransaction) => Promise<T>): Promise<T> {
    const preceding = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => { release = resolve; });
    await preceding;
    this.transactions++;
    const snapshot = structuredClone({
      containers: this.containers, tenants: this.tenants,
      memberships: this.memberships, branding: this.branding,
    });
    const account = this.owners.get(userId)!;
    const assertUnique = (subdomain: string, customDomain: string | null, except?: string) => {
      for (const item of this.containers.values()) {
        if (item.id !== except && (item.subdomain === subdomain ||
          (customDomain && item.customDomain === customDomain))) {
          throw { code: "P2002", meta: { target: item.subdomain === subdomain ? "Container_subdomain_key" : "Container_customDomain_key" } };
        }
      }
    };
    try {
      return await work({
        owner: account,
        countNonDeleted: async () => [...this.containers.values()]
          .filter((item) => item.ownerId === account.id && item.status !== "deleted").length,
        find: async (id) => {
          const item = this.containers.get(id);
          return item?.ownerId === account.id ? { ...item } : null;
        },
        create: async (input) => {
          assertUnique(input.subdomain, null);
          const id = `container-${this.containers.size + 1}`;
          const tenantId = `tenant-${id}`;
          const item: Container = {
            id, tenantId, ownerId: account.id, ...input, customDomain: null,
            dokployApplicationId: null, status: "provisioning", plan: "starter",
            provisionError: null, deletedAt: null, createdAt: now, updatedAt: now,
          };
          this.containers.set(id, item);
          this.tenants.set(tenantId, { ...input, customDomain: null, status: "suspended" });
          this.memberships.push({ userId, tenantId, role: "owner" });
          this.branding.add(tenantId);
          return { ...item };
        },
        update: async (id, data) => {
          const item = this.containers.get(id)!;
          assert.equal(item.ownerId, account.id);
          const next = { ...item, ...data };
          assertUnique(next.subdomain, next.customDomain, id);
          this.containers.set(id, next);
        },
        updateTenant: async (id, data) => {
          if (this.failTenantUpdate) throw new Error("database_details_must_not_leak");
          this.tenants.set(id, { ...this.tenants.get(id)!, ...data });
        },
      });
    } catch (error) {
      this.containers = snapshot.containers;
      this.tenants = snapshot.tenants;
      this.memberships = snapshot.memberships;
      this.branding = snapshot.branding;
      throw error;
    } finally {
      release();
    }
  }
}

function fixture(
  provision: (input: ProvisionInput) => Promise<ProvisionResult> =
    async () => ({ status: "mock", provisionError: null }),
  deprovision: ((id: string, action: "stop" | "delete") => Promise<void>) | null = null,
) {
  const store = new MemoryStore();
  const service = createContainerService({
    store,
    provision,
    deprovision,
    buildEnvVars: ({ tenantId }) => ({ TENANT_ID: tenantId, NODE_ENV: "production" }),
    now: () => now,
  });
  return { store, service };
}

async function createOne(service: ReturnType<typeof createContainerService>, subdomain = "alice-club") {
  const result = await service.create("alice", { name: "Alice Club", subdomain });
  assert.equal(result.ok, true);
  assert.ok(result.ok && result.id);
  return result.id;
}

test("tier policy is conservative and domains require organization", () => {
  assert.equal(getContainerLimit("free"), 1);
  assert.equal(getContainerLimit("club"), 3);
  assert.equal(getContainerLimit("organization"), null);
  assert.equal(getContainerLimit("unknown"), 1);
  assert.equal(canUseCustomDomain("free"), false);
  assert.equal(canUseCustomDomain("club"), false);
  assert.equal(canUseCustomDomain("organization"), true);
});

test("input normalization and domain validation reject malformed or reserved hosts", () => {
  assert.equal(subdomainSchema.parse(" My-Club "), "my-club");
  for (const value of ["app", "admin", "api", "localhost", "ab", "-club", "club-", "a.b", "xn--club", "a".repeat(64)]) {
    assert.equal(subdomainSchema.safeParse(value).success, false, value);
  }
  assert.equal(customDomainSchema.parse(" Learn.MyClub.ch "), "learn.myclub.ch");
  for (const value of ["https://club.ch", "club.ch/path", "club.ch:443", "127.0.0.1", "localhost", "club.local", "*.club.ch", "a..ch"]) {
    assert.equal(customDomainSchema.safeParse(value).success, false, value);
  }
  assert.equal(containerInputSchema.safeParse({ name: " ", subdomain: "club" }).success, false);
});

test("reserved app hosts and database hostname width are respected", () => {
  assert.equal(subdomainSchema.safeParse("blog").success, false);
  const withinLimit = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(60)}.ch`;
  assert.equal(withinLimit.length, 191);
  assert.equal(customDomainSchema.safeParse(withinLimit).success, true);
  assert.equal(customDomainSchema.safeParse(`a.${withinLimit}`).success, false);
});

test("mock provisioning fails closed without a known development environment", () => {
  assert.equal(isMockProvisioningEnabled({ CONTROL_CENTER_MOCK_PROVISIONING: "true" }), false);
  assert.equal(isMockProvisioningEnabled({ NODE_ENV: "staging", CONTROL_CENTER_MOCK_PROVISIONING: "true" }), false);
});

test("mock provisioning requires an explicit flag and is impossible in production", () => {
  assert.equal(isMockProvisioningEnabled({ NODE_ENV: "development" }), false);
  assert.equal(isMockProvisioningEnabled({ NODE_ENV: "test", CONTROL_CENTER_MOCK_PROVISIONING: "true" }), true);
  assert.equal(isMockProvisioningEnabled({ NODE_ENV: "production", CONTROL_CENTER_MOCK_PROVISIONING: "true" }), false);
  assert.equal(isMockProvisioningEnabled({ NODE_ENV: "development", CONTROL_CENTER_MOCK_PROVISIONING: "1" }), false);
  const expected = isMockProvisioningEnabled()
    ? { status: "mock", provisionError: null }
    : { status: "error", provisionError: "provisioning_unavailable" };
  assert.deepEqual(provisionContainer(), expected);
});

test("all operations reject unauthenticated calls without touching the store", async () => {
  const { service, store } = fixture();
  for (const method of [service.create, service.update, service.delete, service.retry]) {
    assert.deepEqual(await method(null, {}), { ok: false, error: "unauthenticated" });
  }
  assert.equal(store.transactions, 0);
});

test("every operation validates untrusted runtime input", async () => {
  const { service, store } = fixture();
  for (const method of [service.create, service.update, service.delete, service.retry]) {
    assert.deepEqual(await method("alice", null), { ok: false, error: "invalid_input" });
  }
  assert.equal(store.transactions, 0);
});

test("creation ignores client ownership, tier and plan and creates the tenant graph", async () => {
  const { service, store } = fixture();
  const result = await service.create("alice", {
    name: " My club ", subdomain: "MY-CLUB", ownerId: "owner-bob", userId: "bob", plan: "organization", tier: "organization",
  });
  assert.ok(result.ok && result.id);
  const item = store.containers.get(result.id)!;
  assert.equal(item.ownerId, "owner-alice");
  assert.equal(item.plan, "starter");
  assert.equal(item.name, "My club");
  assert.equal(item.subdomain, "my-club");
  assert.equal(item.status, "mock");
  assert.equal(item.dokployApplicationId, null);
  assert.ok(store.tenants.has(item.tenantId));
  assert.ok(store.branding.has(item.tenantId));
  assert.deepEqual(store.memberships, [{ userId: "alice", tenantId: item.tenantId, role: "owner" }]);
});

test("concurrent creation cannot exceed the owner limit", async () => {
  const { service, store } = fixture();
  const results = await Promise.all([
    service.create("alice", { name: "First", subdomain: "first-club" }),
    service.create("alice", { name: "Second", subdomain: "second-club" }),
  ]);
  assert.equal(results.filter((result) => result.ok).length, 1);
  assert.deepEqual(results.find((result) => !result.ok), { ok: false, error: "limit_reached" });
  assert.equal(store.containers.size, 1);
  assert.equal(store.tenants.size, 1);
});

test("failed provisioning is persisted safely and counts against the limit", async () => {
  const { service, store } = fixture(async () => { throw new Error("secret_token_or_remote_url"); });
  const id = await createOne(service);
  assert.equal(store.containers.get(id)?.status, "error");
  assert.equal(store.containers.get(id)?.provisionError, "provisioning_failed");
  assert.deepEqual(await service.retry("alice", { id }), { ok: false, error: "provisioning_unavailable" });
  assert.deepEqual(await service.create("alice", { name: "Second", subdomain: "second-club" }), { ok: false, error: "limit_reached" });
});

test("other owners cannot read or mutate a container by submitting its id", async () => {
  const { service, store } = fixture();
  const id = await createOne(service);
  const before = structuredClone(store.containers.get(id));
  assert.deepEqual(await service.update("bob", { id, name: "Hijack", subdomain: "hijacked" }), { ok: false, error: "not_found" });
  assert.deepEqual(await service.delete("bob", { id, confirmation: "alice-club" }), { ok: false, error: "not_found" });
  assert.deepEqual(await service.retry("bob", { id }), { ok: false, error: "not_found" });
  assert.deepEqual(store.containers.get(id), before);
});

test("organization domains are metadata only and tenant/container changes stay in sync", async () => {
  const { service, store } = fixture();
  const id = await createOne(service);
  const input = { id, name: "Renamed", subdomain: "renamed-club", customDomain: "learn.club.ch" };
  assert.deepEqual(await service.update("alice", input), { ok: false, error: "custom_domain_not_allowed" });
  store.owners.get("alice")!.tier = "organization";
  assert.deepEqual(await service.update("alice", input), { ok: true, id });
  const item = store.containers.get(id)!;
  assert.equal(item.status, "mock");
  assert.equal(item.customDomain, input.customDomain);
  assert.deepEqual(store.tenants.get(item.tenantId), {
    name: input.name, subdomain: input.subdomain, customDomain: input.customDomain, status: "suspended",
  });
});

test("delete requires the exact current slug, retains domains, and cancels the tenant", async () => {
  const { service, store } = fixture();
  store.owners.get("alice")!.tier = "organization";
  const id = await createOne(service);
  await service.update("alice", { id, name: "Renamed", subdomain: "renamed-club", customDomain: "learn.club.ch" });
  for (const confirmation of ["alice-club", "RENAMED-CLUB", " renamed-club"]) {
    assert.deepEqual(await service.delete("alice", { id, confirmation }), { ok: false, error: "confirmation_mismatch" });
  }
  assert.deepEqual(await service.delete("alice", { id, confirmation: "renamed-club" }), { ok: true, id });
  const item = store.containers.get(id)!;
  assert.equal(item.status, "deleted");
  assert.deepEqual(item.deletedAt, now);
  assert.equal(item.subdomain, "renamed-club");
  assert.equal(item.customDomain, "learn.club.ch");
  assert.equal(store.tenants.get(item.tenantId)?.status, "cancelled");
  assert.equal(store.memberships.length, 1);
  assert.equal(store.branding.size, 1);
  assert.deepEqual(await service.create("bob", { name: "Reuse", subdomain: "renamed-club" }), { ok: false, error: "domain_unavailable" });
});

test("soft deletion releases quota but deleted records can never be resurrected", async () => {
  const { service, store } = fixture(async () => ({ status: "error", provisionError: "provisioning_unavailable" }));
  const id = await createOne(service);
  const results = await Promise.all([
    service.delete("alice", { id, confirmation: "alice-club" }),
    service.retry("alice", { id }),
  ]);
  assert.deepEqual(results, [{ ok: true, id }, { ok: false, error: "operation_not_allowed" }]);
  assert.equal(store.containers.get(id)?.status, "deleted");
  assert.deepEqual(await service.update("alice", { id, name: "Restored", subdomain: "restored-club" }), { ok: false, error: "operation_not_allowed" });
  await createOne(service, "new-club");
  assert.equal(store.containers.size, 2);
});

test("retry-before-delete is serialized and the final state remains deleted", async () => {
  let shouldMock = false;
  const { service, store } = fixture(async () => shouldMock
    ? { status: "mock", provisionError: null }
    : { status: "error", provisionError: "provisioning_unavailable" });
  const id = await createOne(service);
  shouldMock = true;
  const results = await Promise.all([
    service.retry("alice", { id }),
    service.delete("alice", { id, confirmation: "alice-club" }),
  ]);
  assert.deepEqual(results, [{ ok: true, id }, { ok: true, id }]);
  assert.equal(store.containers.get(id)?.status, "deleted");
});

test("active, deleting, and real Dokploy resources cannot be changed but live ones can be stopped", async () => {
  for (const [override, canDelete] of [
    [{ status: "active" }, false],
    [{ status: "deleting" }, false],
    [{ dokployApplicationId: "real-app" }, true],
    [{ status: "error", deletedAt: now }, false],
  ] as const) {
    const { service, store } = fixture();
    const id = await createOne(service);
    Object.assign(store.containers.get(id)!, override);
    const deleteResult = await service.delete("alice", { id, confirmation: "alice-club" });
    if (canDelete) {
      assert.equal(deleteResult.ok, true);
    } else {
      assert.deepEqual(deleteResult, { ok: false, error: "operation_not_allowed" });
    }
    assert.deepEqual(await service.retry("alice", { id }), { ok: false, error: "operation_not_allowed" });
    assert.deepEqual(await service.update("alice", { id, name: "Changed", subdomain: "changed-club" }), { ok: false, error: "operation_not_allowed" });
  }
});

test("transaction failure rolls back state and returns only a safe key", async () => {
  const { service, store } = fixture();
  const id = await createOne(service);
  store.failTenantUpdate = true;
  assert.deepEqual(await service.delete("alice", { id, confirmation: "alice-club" }), { ok: false, error: "unexpected" });
  assert.equal(store.containers.get(id)?.status, "mock");
  assert.equal(store.containers.get(id)?.deletedAt, null);
});

test("inactive owner accounts cannot mutate resources", async () => {
  const { service, store } = fixture();
  const id = await createOne(service);
  store.owners.get("alice")!.status = "suspended";
  assert.deepEqual(await service.create("alice", { name: "Second", subdomain: "second-club" }), { ok: false, error: "operation_not_allowed" });
  assert.deepEqual(await service.delete("alice", { id, confirmation: "alice-club" }), { ok: false, error: "operation_not_allowed" });
});

test("deprovisioning is called with stop action when deleting a live container", async () => {
  const deprovisionCalls: Array<{ id: string; action: string }> = [];
  const { service, store } = fixture(
    async () => ({ status: "mock", provisionError: null }),
    async (id, action) => { deprovisionCalls.push({ id, action }); },
  );
  const id = await createOne(service);
  store.containers.get(id)!.dokployApplicationId = "real-app-001";
  assert.deepEqual(await service.delete("alice", { id, confirmation: "alice-club" }), { ok: true, id });
  assert.equal(deprovisionCalls.length, 1);
  assert.equal(deprovisionCalls[0].id, "real-app-001");
  assert.equal(deprovisionCalls[0].action, "stop");
  assert.equal(store.containers.get(id)?.status, "deleted");
});

test("deprovisioning failure does not block soft deletion", async () => {
  const { service, store } = fixture(
    async () => ({ status: "mock", provisionError: null }),
    async () => { throw new Error("dokploy_unreachable"); },
  );
  const id = await createOne(service);
  store.containers.get(id)!.dokployApplicationId = "real-app-002";
  assert.deepEqual(await service.delete("alice", { id, confirmation: "alice-club" }), { ok: true, id });
  assert.equal(store.containers.get(id)?.status, "deleted");
});

test("serialization conflicts retry at most three times and other faults do not retry", async () => {
  let attempts = 0;
  const pauses: number[] = [];
  const result = await retryTransaction(async () => {
    attempts++;
    if (attempts < 3) throw { code: "P2034" };
    return "success";
  }, async (attempt) => { pauses.push(attempt); });
  assert.equal(result, "success");
  assert.equal(attempts, 3);
  assert.deepEqual(pauses, [0, 1]);
  attempts = 0;
  await assert.rejects(retryTransaction(async () => {
    attempts++;
    throw Object.assign(new Error("conflict"), { code: "P2034" });
  }, async () => {}));
  assert.equal(attempts, 3);
  attempts = 0;
  await assert.rejects(retryTransaction(async () => {
    attempts++;
    throw Object.assign(new Error("unique"), { code: "P2002" });
  }, async () => {}));
  assert.equal(attempts, 1);
});
