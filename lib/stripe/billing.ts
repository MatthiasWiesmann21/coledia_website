import "server-only";

import { db } from "@/lib/db";
import { getStripe, getOwnerTierPriceId, isStripeConfigured, isValidTier } from "./client";

export type BillingError =
  | "stripe_unavailable"
  | "invalid_tier"
  | "no_price_configured"
  | "no_customer"
  | "checkout_failed"
  | "portal_failed"
  | "unexpected";

export interface BillingResult {
  ok: true;
  url: string;
}

export interface BillingErrorResult {
  ok: false;
  error: BillingError;
}

export async function createOwnerCheckoutSession(opts: {
  ownerUserId: string;
  ownerEmail: string;
  tier: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<BillingResult | BillingErrorResult> {
  if (!isStripeConfigured()) return { ok: false, error: "stripe_unavailable" };
  if (!isValidTier(opts.tier) || opts.tier === "free") return { ok: false, error: "invalid_tier" };

  const priceId = getOwnerTierPriceId(opts.tier);
  if (!priceId) return { ok: false, error: "no_price_configured" };

  try {
    const stripe = getStripe();
    const owner = await db.ownerAccount.findUnique({
      where: { userId: opts.ownerUserId },
      select: { id: true, stripeCustomerId: true },
    });
    if (!owner) return { ok: false, error: "unexpected" };

    let customerId = owner.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: opts.ownerEmail,
        metadata: { ownerAccountId: owner.id, userId: opts.ownerUserId },
      });
      customerId = customer.id;
      await db.ownerAccount.update({
        where: { id: owner.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      metadata: {
        ownerAccountId: owner.id,
        userId: opts.ownerUserId,
        tier: opts.tier,
        type: "owner_tier_subscription",
      },
    });

    if (!session.url) return { ok: false, error: "checkout_failed" };
    return { ok: true, url: session.url };
  } catch {
    return { ok: false, error: "checkout_failed" };
  }
}

export async function createBillingPortalSession(opts: {
  ownerUserId: string;
  returnUrl: string;
}): Promise<BillingResult | BillingErrorResult> {
  if (!isStripeConfigured()) return { ok: false, error: "stripe_unavailable" };

  try {
    const stripe = getStripe();
    const owner = await db.ownerAccount.findUnique({
      where: { userId: opts.ownerUserId },
      select: { stripeCustomerId: true },
    });
    if (!owner?.stripeCustomerId) return { ok: false, error: "no_customer" };

    const session = await stripe.billingPortal.sessions.create({
      customer: owner.stripeCustomerId,
      return_url: opts.returnUrl,
    });

    if (!session.url) return { ok: false, error: "portal_failed" };
    return { ok: true, url: session.url };
  } catch {
    return { ok: false, error: "portal_failed" };
  }
}
