import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, isStripeConfigured, isValidTier } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe_unavailable" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch {
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  if (metadata.type !== "owner_tier_subscription") return;

  const ownerAccountId = metadata.ownerAccountId;
  const tier = metadata.tier;
  if (!ownerAccountId || !tier || !isValidTier(tier)) return;

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  await db.ownerAccount.update({
    where: { id: ownerAccountId },
    data: {
      tier,
      stripeCustomerId: customerId ?? null,
      stripeSubscriptionId: subscriptionId ?? null,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const owner = await db.ownerAccount.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!owner) return;

  const status = subscription.status;
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

  if (status === "active") {
    const priceId = subscription.items.data[0]?.price?.id;
    let tier = owner.tier;
    if (priceId === process.env.STRIPE_PRICE_CLUB) tier = "club";
    else if (priceId === process.env.STRIPE_PRICE_ORGANIZATION) tier = "organization";

    await db.ownerAccount.update({
      where: { id: owner.id },
      data: {
        tier,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  } else if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    await db.ownerAccount.update({
      where: { id: owner.id },
      data: {
        tier: "free",
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  }
}
