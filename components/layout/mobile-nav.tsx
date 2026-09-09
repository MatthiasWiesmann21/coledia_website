"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SessionNav } from "@/components/auth/session-nav";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "features", href: "/features" },
  { key: "pricing", href: "/pricing" },
  { key: "contact", href: "/contact" },
] as const;

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("toggleMenu")} className="rounded-full xl:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo showTagline />
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-6 pb-6" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
          <SessionNav onNavigate={() => setOpen(false)} />
          <Button asChild className="mt-4">
            <Link href="/contact" onClick={() => setOpen(false)}>
              {t("cta")}
            </Link>
          </Button>
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-6">
            <ThemeSwitcher />
            <LocaleSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
