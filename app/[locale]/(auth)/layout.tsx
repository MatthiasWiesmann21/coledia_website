import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("auth");
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label={t("backHome")}><Logo /></Link>
        <div className="flex gap-2"><ThemeSwitcher /><LocaleSwitcher /></div>
      </header>
      <main className="mx-auto my-auto w-full max-w-md py-16"><div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">{children}</div><Link href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:underline">{t("backHome")}</Link></main>
    </div>
  );
}
