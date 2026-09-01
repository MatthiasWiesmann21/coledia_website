import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "features", href: "/features" },
  { key: "pricing", href: "/pricing" },
  { key: "contact", href: "/contact" },
] as const;

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-4">
      <div className="glass flex h-16 items-center justify-between rounded-full border border-border/60 px-4 shadow-lg shadow-navy/5 dark:shadow-navy/40 sm:px-6">
        <Link href="/" aria-label="coledia.com home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex sm:items-center sm:gap-1.5">
            <ThemeSwitcher />
            <LocaleSwitcher />
          </div>
          <Button asChild className="hidden lg:inline-flex">
            <Link href="/contact">{t("cta")}</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
