import { getTranslations } from "next-intl/server";
import { requireOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { getContainerLimit } from "@/lib/controlcenter/policy";
import { Link } from "@/i18n/navigation";
import { ContainerForm } from "@/components/controlcenter/container-form";
import { ContainerStatus } from "@/components/controlcenter/container-status";
import { PlanSummary } from "@/components/controlcenter/plan-summary";

export default async function ContainersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { owner } = await requireOwner(locale);
  const containers = await db.container.findMany({ where: { ownerId: owner.id }, select: { id: true, name: true, subdomain: true, status: true, deletedAt: true }, orderBy: { createdAt: "desc" } });
  const count = containers.filter((container) => !container.deletedAt && container.status !== "deleted").length;
  const limit = getContainerLimit(owner.tier);
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  return <>
    <h1 className="text-3xl font-extrabold tracking-tight">{t("containers")}</h1>
    <PlanSummary tier={owner.tier} count={count} locale={locale} />
    <section aria-label={t("containers")} className="space-y-4">
      {containers.length === 0 ? <div className="rounded-3xl border border-dashed border-border p-8 text-center"><h2 className="text-lg font-bold">{t("emptyTitle")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("emptyDescription")}</p></div> : containers.map((container) => <article key={container.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6"><div className="min-w-0"><h2 className="break-words text-lg font-bold"><Link href={`/controlcenter/containers/${encodeURIComponent(container.id)}`} className="hover:text-teal-brand hover:underline">{container.name}</Link></h2><p className="mt-1 break-all text-sm text-muted-foreground">{container.subdomain}</p>{container.deletedAt && <p className="mt-2 text-xs text-muted-foreground">{t("retained")}</p>}</div><ContainerStatus status={container.deletedAt ? "deleted" : container.status} locale={locale} /></article>)}
    </section>
    <ContainerForm disabled={limit !== null && count >= limit} />
  </>;
}
