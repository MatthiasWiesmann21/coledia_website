"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createOwnerCheckoutSession,
  createBillingPortalSession,
  type BillingError,
} from "@/lib/stripe/billing";

export type BillingActionResult =
  | { ok: true; url: string }
  | { ok: false; error: BillingError };

export async function startTierUpgrade(tier: string): Promise<BillingActionResult> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: "stripe_unavailable" };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const result = await createOwnerCheckoutSession({
      ownerUserId: session.user.id,
      ownerEmail: session.user.email,
      tier,
      successUrl: `${appUrl}/${"en"}/controlcenter/billing?upgraded=1`,
      cancelUrl: `${appUrl}/${"en"}/controlcenter/billing?canceled=1`,
    });

    if (result.ok) {
      revalidatePath("/[locale]/controlcenter", "layout");
    }
    return result;
  } catch {
    return { ok: false, error: "unexpected" };
  }
}

export async function openBillingPortal(): Promise<BillingActionResult> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: "stripe_unavailable" };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const result = await createBillingPortalSession({
      ownerUserId: session.user.id,
      returnUrl: `${appUrl}/${"en"}/controlcenter/billing`,
    });

    return result;
  } catch {
    return { ok: false, error: "unexpected" };
  }
}
