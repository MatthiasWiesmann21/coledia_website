import assert from "node:assert/strict";
import { test } from "node:test";
import { getAuth, isAuthConfigured } from "../lib/auth";
import { GET, POST } from "../app/api/auth/[...all]/route";
import nodemailer from "nodemailer";
import { sendAuthEmail } from "../lib/email";

const keys = [
  "DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "NODE_ENV", "AUTH_REQUIRE_EMAIL_VERIFICATION",
  "SMTP_HOST", "SMTP_PORT", "SMTP_FROM", "SMTP_USER", "SMTP_PASSWORD", "SMTP_SECURE",
];

async function withEnv(work: () => Promise<void>) {
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    await work();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("auth imports safely without configuration and routes return safe 503", async () => {
  await withEnv(async () => {
    for (const key of keys) delete process.env[key];
    assert.equal(isAuthConfigured(), false);
    assert.throws(getAuth, { message: "auth_unavailable" });
    for (const handler of [GET, POST]) {
      const response = await handler(new Request("http://localhost/api/auth/get-session"));
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { error: "auth_unavailable" });
    }
    for (const missing of keys.slice(0, 3)) {
      process.env.DATABASE_URL = "mysql://example:example@localhost/example";
      process.env.BETTER_AUTH_SECRET = "test-only-secret-not-used-to-connect-anywhere";
      process.env.BETTER_AUTH_URL = "https://website.coledia.example";
      process.env[missing] = " ";
      assert.equal(isAuthConfigured(), false);
    }
  });
});

test("production ignores verification bypass and auth uses host-only website cookies", async () => {
  await withEnv(async () => {
    process.env.DATABASE_URL = "mysql://example:example@localhost/example";
    process.env.BETTER_AUTH_SECRET = "test-only-secret-not-used-to-connect-anywhere";
    process.env.BETTER_AUTH_URL = "https://website.coledia.example";
    Object.assign(process.env, { NODE_ENV: "production" });
    process.env.AUTH_REQUIRE_EMAIL_VERIFICATION = "false";
    assert.equal(isAuthConfigured(), true);
    const auth = getAuth();
    assert.equal(getAuth(), auth);
    assert.equal(auth.options.emailAndPassword?.requireEmailVerification, true);
    assert.equal(auth.options.emailAndPassword?.revokeSessionsOnPasswordReset, true);
    assert.equal(auth.options.advanced?.cookiePrefix, "coledia-website");
    assert.equal(auth.options.advanced?.crossSubDomainCookies?.enabled, false);
    assert.equal("domain" in auth.options.advanced.defaultCookieAttributes, false);
    assert.equal(auth.options.advanced?.defaultCookieAttributes?.secure, true);
    assert.equal(auth.options.user?.additionalFields?.twoFactorEnabled.input, false);
    assert.equal(auth.options.session?.cookieCache?.enabled, false);
    assert.equal(typeof auth.options.emailVerification?.sendVerificationEmail, "function");
    assert.equal(typeof auth.options.emailAndPassword?.sendResetPassword, "function");
    assert.equal(typeof auth.options.databaseHooks?.user?.create?.after, "function");
  });
});

test("SMTP delivers the provided verification/reset URL without logging and sanitizes failures", async (t) => {
  await withEnv(async () => {
    for (const key of keys) delete process.env[key];
    await assert.rejects(sendAuthEmail({ to: "owner@club.ch", url: "https://website.example/verify?token=test", kind: "verification" }), { message: "email_unavailable" });
    Object.assign(process.env, {
      NODE_ENV: "production", SMTP_HOST: "smtp.example", SMTP_FROM: "Coledia <no-reply@example.com>",
      SMTP_PORT: "587", SMTP_USER: "smtp-user", SMTP_PASSWORD: "smtp-password",
    });
    let options: unknown;
    const messages: unknown[] = [];
    let closed = 0;
    let fail = false;
    t.mock.method(nodemailer, "createTransport", (value: unknown) => {
      options = value;
      return {
        sendMail: async (message: unknown) => {
          if (fail) throw new Error("smtp_password_and_url_must_not_leak");
          messages.push(message);
        },
        close: () => { closed++; },
      };
    });
    for (const kind of ["verification", "reset"] as const) {
      await sendAuthEmail({ to: "owner@club.ch", url: `https://website.example/${kind}?token=test`, kind });
    }
    assert.equal(messages.length, 2);
    assert.ok(typeof options === "object" && options !== null);
    assert.equal(Reflect.get(options, "logger"), false);
    assert.equal(Reflect.get(options, "debug"), false);
    assert.equal(Reflect.get(options, "requireTLS"), true);
    for (const [index, message] of messages.entries()) {
      assert.ok(typeof message === "object" && message !== null);
      assert.equal(Reflect.get(message, "text"), `https://website.example/${index === 0 ? "verification" : "reset"}?token=test`);
      assert.equal(Reflect.get(message, "disableUrlAccess"), true);
      assert.equal(Reflect.get(message, "disableFileAccess"), true);
    }
    fail = true;
    await assert.rejects(sendAuthEmail({ to: "owner@club.ch", url: "https://website.example/reset?token=test", kind: "reset" }), { message: "email_unavailable" });
    assert.equal(closed, 3);
  });
});
