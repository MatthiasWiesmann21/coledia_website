import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { PrismaClient } from "@/prisma/generated/client";
import { PrismaClient as PrismaClientCtor } from "@/prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Required by the Prisma MariaDB driver adapter.",
    );
  }
  const adapter = new PrismaMariaDb(url);
  return new PrismaClientCtor({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getDb(): PrismaClient {
  if (globalForPrisma.db) return globalForPrisma.db;
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.db = client;
  }
  return client;
}

/**
 * Lazy Prisma client proxy.
 *
 * Prisma ORM v7 requires a driver adapter (`@prisma/adapter-mariadb`) that
 * needs `DATABASE_URL` at construction time. The old v6 client was lazy and
 * did not throw until a query was executed. To preserve that behavior (so
 * test modules can import `db` without a configured database), we defer
 * client creation to first property access via a Proxy.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getDb();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
