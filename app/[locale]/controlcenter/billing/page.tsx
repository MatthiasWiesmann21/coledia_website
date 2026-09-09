import { getTranslations } from "next-intl/server";
import { requireOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe/client";
import { PlanSummary } from "@/components/controlcenter/plan-summary";
import { BillingActions } from "@/components/controlcenter/billing-actions";

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { owner } = await requireOwner(locale);
  const count = await db.container.count({ where: { ownerId: owner.id, deletedAt: null, status: { not: "deleted" } } });
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  const stripeConfigured = isStripeConfigured();
  const hasSubscription = Boolean(owner.stripeSubscriptionId);
  const plans = [{ tier: "free", price: 0, limit: 1 }, { tier: "club", price: 29, limit: 3 }, { tier: "organization", price: 99, limit: null }] as const;
  return <>
    <h1 className="text-3xl font-extrabold tracking-tight">{t("billing")}</h1>
    <PlanSummary tier={owner.tier} count={count} locale={locale} />
    {!stripeConfigured
      ? <p role="status" className="rounded-2xl bg-muted p-4 text-sm leading-relaxed">{t("billingLater")}</p>
      : <p role="status" className="rounded-2xl bg-muted p-4 text-sm leading-relaxed">{t("billingActive")}</p>}
    <BillingActions currentTier={owner.tier} stripeConfigured={stripeConfigured} hasSubscription={hasSubscription} />
    <div className="grid gap-4 md:grid-cols-3">{plans.map((plan) => <section key={plan.tier} className={`rounded-3xl border p-6 ${plan.tier === owner.tier ? "border-teal-brand bg-card shadow-sm" : "border-border bg-card"}`}><h2 className="font-bold">{t(`tiers.${plan.tier}`)}</h2>{plan.tier === owner.tier && <p className="mt-1 text-xs font-medium text-teal-brand">{t("currentTier")}</p>}<p className="mt-4 text-2xl font-extrabold">CHF {plan.price}<span className="text-xs font-normal text-muted-foreground"> {t("perMonth")}</span></p><p className="mt-3 text-sm">{t("containerAllowance", { limit: plan.limit === null ? t("unlimited") : plan.limit })}</p>{plan.tier === "organization" && <p className="mt-2 text-sm text-muted-foreground">{t("customDomainIncluded")}</p>}</section>)}</div>
  </>;
}
