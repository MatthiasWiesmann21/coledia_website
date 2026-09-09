"use client";

import { LayoutDashboard, Boxes, CreditCard, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const items = [
  { key: "overview", href: "/controlcenter", icon: LayoutDashboard },
  { key: "containers", href: "/controlcenter/containers", icon: Boxes },
  { key: "billing", href: "/controlcenter/billing", icon: CreditCard },
  { key: "settings", href: "/controlcenter/settings", icon: Settings },
] as const;

export function ControlcenterNav() {
  const t = useTranslations("controlcenter");
  const pathname = usePathname();
  return <nav aria-label={t("navigation")} className="flex flex-wrap gap-2 rounded-3xl border border-border bg-card p-3 lg:flex-col">{items.map(({ key, href, icon: Icon }) => {
    const active = href === "/controlcenter" ? pathname === href : pathname.startsWith(href);
    return <Link key={key} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${active ? "bg-teal-brand/10 text-teal-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon aria-hidden="true" className="h-4 w-4" />{t(key)}</Link>;
  })}</nav>;
}
