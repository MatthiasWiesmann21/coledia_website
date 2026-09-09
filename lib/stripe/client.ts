import "server-only";

import Stripe from "stripe";

let instance: Stripe | null = null;

export function isStripeConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(
    env.STRIPE_SECRET_KEY?.trim() &&
    env.STRIPE_WEBHOOK_SECRET?.trim(),
  );
}

export function getStripe(): Stripe {
  if (!instance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("stripe_unavailable");
    instance = new Stripe(key, {
      apiVersion: "2025-08-27.basil" as Stripe.LatestApiVersion,
    });
  }
  return instance;
}

export function getOwnerTierPriceId(
  tier: string,
  env: Record<string, string | undefined> = process.env,
): string | null {
  switch (tier) {
    case "club":
      return env.STRIPE_PRICE_CLUB ?? null;
    case "organization":
      return env.STRIPE_PRICE_ORGANIZATION ?? null;
    default:
      return null;
  }
}

export const OWNER_TIERS = ["free", "club", "organization"] as const;
export type OwnerTier = (typeof OWNER_TIERS)[number];

export function isValidTier(value: string): value is OwnerTier {
  return (OWNER_TIERS as readonly string[]).includes(value);
}
