import { getTranslations } from "next-intl/server";
import { getContainerLimit } from "@/lib/controlcenter/policy";

export async function PlanSummary({ tier, count, locale }: { tier: string; count: number; locale: string }) {
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  const limit = getContainerLimit(tier);
  const tierKey = tier === "organization" || tier === "club" ? tier : "free";
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-muted-foreground">{t("currentPlan")}</h2>
      <p className="mt-2 text-2xl font-extrabold">{t(`tiers.${tierKey}`)}</p>
      <p className="mt-3 text-sm">{t("usage", { count, limit: limit === null ? t("unlimited") : limit })}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t("usageNote")}</p>
    </section>
  );
}
