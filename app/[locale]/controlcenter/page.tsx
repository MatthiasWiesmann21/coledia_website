import { getTranslations } from "next-intl/server";
import { requireOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PlanSummary } from "@/components/controlcenter/plan-summary";

export default async function OverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { owner } = await requireOwner(locale);
  const count = await db.container.count({ where: { ownerId: owner.id, deletedAt: null, status: { not: "deleted" } } });
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  return <>
    <div><h1 className="text-3xl font-extrabold tracking-tight">{t("overview")}</h1><p className="mt-3 text-muted-foreground">{t("welcome")}</p></div>
    <div className="grid gap-6 md:grid-cols-2"><PlanSummary tier={owner.tier} count={count} locale={locale} /><section className="rounded-3xl border border-border bg-card p-6 shadow-sm"><h2 className="text-xl font-bold">{t("containers")}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("manageDescription")}</p><Button asChild className="mt-6"><Link href="/controlcenter/containers">{t("manageContainers")}</Link></Button></section></div>
  </>;
}
