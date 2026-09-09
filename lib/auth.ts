import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { sendAuthEmail } from "@/lib/email";
import { ensureOwnerAccount } from "@/lib/controlcenter/owner";

export function isAuthConfigured(): boolean {
  return ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"].every(
    (key) => Boolean(process.env[key]?.trim()),
  );
}

function createAuth() {
  const requireEmailVerification =
    process.env.NODE_ENV === "production" ||
    process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === "true";

  return betterAuth({
    database: prismaAdapter(db, { provider: "mysql" }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
    advanced: {
      cookiePrefix: "coledia-website",
      crossSubDomainCookies: { enabled: false },
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
    logger: { disabled: true },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({ to: user.email, url, kind: "reset" });
      },
    },
    emailVerification: {
      sendOnSignUp: requireEmailVerification,
      sendOnSignIn: requireEmailVerification,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail({ to: user.email, url, kind: "verification" });
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    user: {
      additionalFields: {
        twoFactorEnabled: {
          type: "boolean",
          defaultValue: false,
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await ensureOwnerAccount(user.id);
          },
        },
      },
    },
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  if (!isAuthConfigured()) throw new Error("auth_unavailable");
  instance ??= createAuth();
  return instance;
}

export type Session = ReturnType<typeof getAuth>["$Infer"]["Session"];
