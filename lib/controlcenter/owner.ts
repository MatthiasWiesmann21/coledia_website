import "server-only";

import { db } from "@/lib/db";
import { databaseErrorCode } from "./service";

export async function ensureOwnerAccount(userId: string) {
  try {
    return await db.ownerAccount.upsert({
      where: { userId },
      update: {},
      create: { userId, tier: "free", status: "active" },
    });
  } catch (error) {
    if (databaseErrorCode(error) !== "P2002") throw error;
    const owner = await db.ownerAccount.findUnique({ where: { userId } });
    if (!owner) throw error;
    return owner;
  }
}
