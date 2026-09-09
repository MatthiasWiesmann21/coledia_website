import "server-only";

import { db } from "@/lib/db";
import type { ContainerStore, ContainerTransaction } from "./service";
import { retryTransaction } from "./transactions";
import { ensureOwnerAccount } from "./owner";

export const containerStore: ContainerStore = {
  async withOwner<T>(userId: string, work: (tx: ContainerTransaction) => Promise<T>): Promise<T> {
    await ensureOwnerAccount(userId);
    return retryTransaction(() => db.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id FROM OwnerAccount WHERE userId = ${userId} FOR UPDATE
      `;
      const owner = await tx.ownerAccount.findUniqueOrThrow({ where: { userId } });
      return work({
        owner,
        countNonDeleted: () => tx.container.count({
          where: { ownerId: owner.id, status: { not: "deleted" } },
        }),
        find: (id) => tx.container.findFirst({ where: { id, ownerId: owner.id } }),
        create: async (input) => {
          const tenant = await tx.tenant.create({
            data: {
              ...input,
              plan: "starter",
              status: "suspended",
              memberships: { create: { userId, role: "owner" } },
              branding: { create: {} },
            },
          });
          return tx.container.create({
            data: {
              ...input,
              ownerId: owner.id,
              tenantId: tenant.id,
              plan: "starter",
              status: "provisioning",
            },
          });
        },
        update: async (id, data) => {
          await tx.container.update({ where: { id, ownerId: owner.id }, data });
        },
        updateTenant: async (tenantId, data) => {
          const container = await tx.container.findFirst({
            where: { tenantId, ownerId: owner.id },
            select: { id: true },
          });
          if (!container) throw new Error("not_found");
          await tx.tenant.update({ where: { id: tenantId }, data });
        },
      });
    }, { isolationLevel: "Serializable", maxWait: 5_000, timeout: 10_000 }));
  },
};
