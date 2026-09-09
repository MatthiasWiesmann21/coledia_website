import assert from "node:assert/strict";
import { test } from "node:test";
import { isStripeConfigured, isValidTier, getOwnerTierPriceId } from "../lib/stripe/client";

test("isStripeConfigured checks for secret key and webhook secret", () => {
  assert.equal(isStripeConfigured({}), false);
  assert.equal(isStripeConfigured({ STRIPE_SECRET_KEY: "sk_test_x" }), false);
  assert.equal(isStripeConfigured({ STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x" }), true);
  assert.equal(isStripeConfigured({ STRIPE_SECRET_KEY: "  ", STRIPE_WEBHOOK_SECRET: "whsec_x" }), false);
});

test("isValidTier accepts free, club, organization and rejects others", () => {
  assert.equal(isValidTier("free"), true);
  assert.equal(isValidTier("club"), true);
  assert.equal(isValidTier("organization"), true);
  assert.equal(isValidTier("enterprise"), false);
  assert.equal(isValidTier(""), false);
});

test("getOwnerTierPriceId returns env-configured price IDs", () => {
  assert.equal(getOwnerTierPriceId("free", {}), null);
  assert.equal(getOwnerTierPriceId("club", { STRIPE_PRICE_CLUB: "price_club_123" }), "price_club_123");
  assert.equal(getOwnerTierPriceId("organization", { STRIPE_PRICE_ORGANIZATION: "price_org_456" }), "price_org_456");
  assert.equal(getOwnerTierPriceId("club", {}), null);
  assert.equal(getOwnerTierPriceId("unknown", { STRIPE_PRICE_CLUB: "x" }), null);
});

test("billing service returns stripe_unavailable when not configured", async () => {
  const { createOwnerCheckoutSession, createBillingPortalSession } = await import("../lib/stripe/billing");
  const original = process.env.STRIPE_SECRET_KEY;
  const originalWh = process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  try {
    const checkoutResult = await createOwnerCheckoutSession({
      ownerUserId: "user-1", ownerEmail: "test@example.com", tier: "club",
      successUrl: "https://example.com/success", cancelUrl: "https://example.com/cancel",
    });
    assert.equal(checkoutResult.ok, false);
    if (!checkoutResult.ok) assert.equal(checkoutResult.error, "stripe_unavailable");

    const portalResult = await createBillingPortalSession({
      ownerUserId: "user-1", returnUrl: "https://example.com/return",
    });
    assert.equal(portalResult.ok, false);
    if (!portalResult.ok) assert.equal(portalResult.error, "stripe_unavailable");
  } finally {
    if (original) process.env.STRIPE_SECRET_KEY = original;
    if (originalWh) process.env.STRIPE_WEBHOOK_SECRET = originalWh;
  }
});

test("billing service rejects invalid tier and free tier", async () => {
  const { createOwnerCheckoutSession } = await import("../lib/stripe/billing");
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_fake";
  try {
    const invalidResult = await createOwnerCheckoutSession({
      ownerUserId: "user-1", ownerEmail: "test@example.com", tier: "enterprise",
      successUrl: "https://example.com/success", cancelUrl: "https://example.com/cancel",
    });
    assert.equal(invalidResult.ok, false);
    if (!invalidResult.ok) assert.equal(invalidResult.error, "invalid_tier");

    const freeResult = await createOwnerCheckoutSession({
      ownerUserId: "user-1", ownerEmail: "test@example.com", tier: "free",
      successUrl: "https://example.com/success", cancelUrl: "https://example.com/cancel",
    });
    assert.equal(freeResult.ok, false);
    if (!freeResult.ok) assert.equal(freeResult.error, "invalid_tier");
  } finally {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  }
});

test("billing service returns no_price_configured when price env is missing", async () => {
  const { createOwnerCheckoutSession } = await import("../lib/stripe/billing");
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_fake";
  delete process.env.STRIPE_PRICE_CLUB;
  delete process.env.STRIPE_PRICE_ORGANIZATION;
  try {
    // Without a price ID configured, the service should reject before hitting the DB or Stripe API.
    const result = await createOwnerCheckoutSession({
      ownerUserId: "user-1", ownerEmail: "test@example.com", tier: "club",
      successUrl: "https://example.com/success", cancelUrl: "https://example.com/cancel",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "no_price_configured");
  } finally {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  }
});
