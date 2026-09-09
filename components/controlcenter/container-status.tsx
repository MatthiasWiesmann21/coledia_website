import { getTranslations } from "next-intl/server";

export async function ContainerStatus({ status, locale }: { status: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  const key = ["active", "provisioning", "error", "mock", "deleted", "suspended"].includes(status) ? status : "unknown";
  const color = key === "error" ? "bg-destructive/10 text-destructive" : key === "active" ? "bg-teal-brand/10 text-teal-brand" : "bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{t(`statuses.${key}`)}</span>;
}
