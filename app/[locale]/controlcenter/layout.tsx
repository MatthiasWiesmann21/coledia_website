import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { requireOwner } from "@/lib/session";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { SessionNav } from "@/components/auth/session-nav";
import { ControlcenterNav } from "@/components/controlcenter/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ControlcenterLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations({ locale, namespace: "controlcenter" });
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <a href="#controlcenter-content" className="sr-only focus:not-sr-only focus:block focus:rounded-xl focus:bg-card focus:p-3">{t("skipToContent")}</a>
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:px-6">
        <Link href="/" aria-label={t("backHome")}><Logo /></Link>
        <div className="flex flex-wrap items-center gap-2"><ThemeSwitcher /><LocaleSwitcher /><SessionNav /></div>
      </header>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[220px_1fr]">
        <ControlcenterNav />
        <main id="controlcenter-content" className="min-w-0 space-y-6 pb-12">
          <div role="note" className="rounded-2xl border border-orange-brand/30 bg-orange-brand/10 p-4 text-sm leading-relaxed"><p className="font-bold">{t("phaseTitle")}</p><p className="mt-1">{t("phaseDescription")}</p></div>
          {children}
        </main>
      </div>
    </div>
  );
}
