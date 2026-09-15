import assert from "node:assert/strict";
import test from "node:test";

const baseURL = process.env.SMOKE_BASE_URL;
const options = { skip: !baseURL && "Set SMOKE_BASE_URL to a running website" };

test("localized marketing pages render", options, async () => {
  for (const locale of ["en", "de", "fr", "es"]) {
    for (const page of ["", "/about", "/features", "/pricing", "/contact", "/legal/privacy", "/legal/imprint"]) {
      const response = await fetch(`${baseURL}/${locale}${page}`);
      assert.equal(response.status, 200, `${locale}${page}`);
      const html = await response.text();
      assert.ok(html.includes(`<html lang="${locale}"`), `Wrong locale on ${locale}${page}`);
      assert.ok(!html.includes("MISSING_MESSAGE"), `Missing translation on ${locale}${page}`);
    }
  }
});
