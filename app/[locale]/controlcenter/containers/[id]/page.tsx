import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ContainerForm } from "@/components/controlcenter/container-form";
import { ContainerActions } from "@/components/controlcenter/container-actions";
import { ContainerStatus } from "@/components/controlcenter/container-status";

export default async function ContainerPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const { owner } = await requireOwner(locale);
  const container = await db.container.findFirst({ where: { id, ownerId: owner.id }, select: { id: true, name: true, subdomain: true, customDomain: true, status: true, plan: true, deletedAt: true, createdAt: true, dokployApplicationId: true } });
  if (!container) notFound();
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  const deleted = Boolean(container.deletedAt) || container.status === "deleted";
  const mutable = !deleted && !container.dokployApplicationId && ["mock", "error", "provisioning"].includes(container.status);
  const baseDomain = process.env.CONTAINER_BASE_DOMAIN || "coledia.com";
  const validLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  const validDomain = baseDomain.length <= 253 && baseDomain.includes(".") && baseDomain.split(".").every((label) => validLabel.test(label));
  const liveUrl = !deleted && container.status === "active" && validLabel.test(container.subdomain) && validDomain && `${container.subdomain}.${baseDomain}`.length <= 253 ? `https://${container.subdomain}.${baseDomain}` : null;
  const plan = ["starter", "club", "organization"].includes(container.plan) ? container.plan : "unknown";
  return <>
    <Link href="/controlcenter/containers" className="inline-block text-sm font-medium text-teal-brand hover:underline">{t("backToContainers")}</Link>
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="wrap-break-word text-3xl font-extrabold tracking-tight">{container.name}</h1><ContainerStatus status={deleted ? "deleted" : container.status} locale={locale} /></div>
      <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">{t("subdomain")}</dt><dd className="mt-1 break-all font-medium">{container.subdomain}</dd></div>
        <div><dt className="text-muted-foreground">{t("containerPlan")}</dt><dd className="mt-1 font-medium">{t(`plans.${plan}`)}</dd></div>
        <div><dt className="text-muted-foreground">{t("customDomain")}</dt><dd className="mt-1 break-all font-medium">{container.customDomain || t("notSet")}</dd></div>
        <div><dt className="text-muted-foreground">{t("created")}</dt><dd className="mt-1 font-medium"><time dateTime={container.createdAt.toISOString()}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(container.createdAt)}</time></dd></div>
      </dl>
      {container.status === "error" && !deleted && <p role="status" className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm">{t("safeProvisionError")}</p>}
      {container.status === "mock" && !deleted && <p className="mt-6 rounded-2xl bg-muted p-4 text-sm">{t("mockDescription")}</p>}
      {deleted && <p className="mt-6 rounded-2xl bg-muted p-4 text-sm">{t("retentionNote")}</p>}
      {liveUrl && <Button asChild className="mt-6" variant="teal"><a href={liveUrl} target="_blank" rel="noopener noreferrer">{t("openContainer")}</a></Button>}
    </section>
    {mutable ? <div className="grid items-start gap-6 xl:grid-cols-2"><ContainerForm container={{ id: container.id, name: container.name, subdomain: container.subdomain, customDomain: container.customDomain }} allowCustomDomain={owner.tier === "organization"} /><ContainerActions id={container.id} subdomain={container.subdomain} canRetry={container.status === "error"} /></div> : !deleted && <p className="rounded-2xl bg-muted p-4 text-sm">{t("readOnly")}</p>}
  </>;
}
