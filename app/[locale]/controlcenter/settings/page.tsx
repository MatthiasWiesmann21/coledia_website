import { getTranslations } from "next-intl/server";
import { requireOwner } from "@/lib/session";
import { SettingsForms } from "@/components/auth/settings-forms";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { session } = await requireOwner(locale);
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  return <><h1 className="text-3xl font-extrabold tracking-tight">{t("settings")}</h1><SettingsForms name={session.user.name ?? ""} email={session.user.email} /></>;
}
