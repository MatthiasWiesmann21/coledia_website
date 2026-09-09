import assert from "node:assert/strict";
import test from "node:test";

const baseURL = process.env.SMOKE_BASE_URL;
const options = { skip: !baseURL && "Set SMOKE_BASE_URL to a running website without auth credentials" };

test("localized marketing and auth pages render without database credentials", options, async () => {
  for (const locale of ["en", "de", "fr", "es"]) {
    for (const page of ["", "/about", "/features", "/pricing", "/contact", "/legal/privacy", "/legal/imprint", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"]) {
      const response = await fetch(`${baseURL}/${locale}${page}`);
      assert.equal(response.status, 200, `${locale}${page}`);
      const html = await response.text();
      assert.ok(html.includes(`<html lang="${locale}"`), `Wrong locale on ${locale}${page}`);
      assert.ok(!html.includes("MISSING_MESSAGE"), `Missing translation on ${locale}${page}`);
    }
  }
});

test("unauthenticated controlcenter routes redirect to localized sign-in", options, async () => {
  for (const locale of ["en", "de", "fr", "es"]) {
    for (const page of ["", "/containers", "/containers/nonexistent", "/billing", "/settings"]) {
      const response = await fetch(`${baseURL}/${locale}/controlcenter${page}`, { redirect: "manual" });
      if ([307, 308].includes(response.status)) {
        assert.equal(new URL(response.headers.get("location")!, baseURL).pathname, `/${locale}/sign-in`);
      } else {
        assert.equal(response.status, 200);
        const html = await response.text();
        assert.ok(html.includes(`/${locale}/sign-in`), "Streamed redirect must target sign-in");
        assert.ok(html.includes("NEXT_REDIRECT"), "Protected route must redirect, not render content");
      }
    }
  }
});

test("unconfigured auth API returns an unlocalized non-cacheable 503", options, async () => {
  const response = await fetch(`${baseURL}/api/auth/get-session`, { redirect: "manual" });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { error: "auth_unavailable" });
});
