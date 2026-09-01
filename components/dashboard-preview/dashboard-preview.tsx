"use client";

import * as React from "react";
import {
  BookOpen,
  CalendarClock,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Newspaper,
  Search,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/layout/logo";
import {
  PREVIEW_LOCALES,
  PreviewProvider,
  usePreview,
  type PreviewLocale,
} from "@/components/dashboard-preview/preview-context";
import {
  CoursesPanel,
  DashboardPanel,
  EventsPanel,
  NewsPanel,
} from "@/components/dashboard-preview/pages";
import { ChatPanel } from "@/components/dashboard-preview/chat-page";
import { DocumentsPanel } from "@/components/dashboard-preview/docs-page";

const NAV_ITEMS = [
  { key: "courses", icon: BookOpen },
  { key: "dashboard", icon: LayoutDashboard },
  { key: "news", icon: Newspaper },
  { key: "events", icon: CalendarClock },
  { key: "chat", icon: MessageSquare },
  { key: "documents", icon: FileText },
] as const;

type PageKey = (typeof NAV_ITEMS)[number]["key"];

const PANELS: Record<PageKey, React.ComponentType> = {
  courses: CoursesPanel,
  dashboard: DashboardPanel,
  news: NewsPanel,
  events: EventsPanel,
  chat: ChatPanel,
  documents: DocumentsPanel,
};

function TopBar() {
  const { t, v, isDark, toggleDark, locale, setLocale, query, setQuery } = usePreview();

  return (
    <div className={cn("mb-4 flex items-center gap-2.5 border-b pb-3", v.line)}>
      {/* Search */}
      <div
        className={cn(
          "flex h-8 w-full max-w-56 items-center gap-2 rounded-full px-3",
          v.input
        )}
      >
        <Search className={cn("h-3 w-3 shrink-0", v.faint)} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("sections.search")}
          className="w-full bg-transparent text-[10.5px] outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleDark}
          title={isDark ? "Light" : "Dark"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-105",
            v.input
          )}
        >
          {isDark ? <Sun className="h-3.5 w-3.5 text-orange-brand" /> : <Moon className="h-3.5 w-3.5 text-blue-brand" />}
        </button>

        {/* Language switcher */}
        <div className={cn("flex items-center rounded-full p-0.5", v.input)}>
          {PREVIEW_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={cn(
                "rounded-full px-1.5 py-1 text-[8px] font-bold uppercase transition-all",
                locale === l ? "bg-teal-brand text-white" : v.muted
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Profile */}
        <div className="ml-1 h-8 w-8 shrink-0 rounded-full bg-linear-to-br from-orange-brand to-teal-brand" />
      </div>
    </div>
  );
}

function Shell() {
  const { t, v, isDark } = usePreview();
  const [active, setActive] = React.useState<PageKey>("dashboard");
  const ActivePanel = PANELS[active];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border shadow-2xl shadow-navy/40 transition-colors",
        isDark ? "bg-navy-deep text-white" : "bg-[#f3f7f9] text-navy"
      )}
    >
      <div className="flex h-[34rem]">
        {/* Sidebar */}
        <aside
          className={cn(
            "hidden w-12 shrink-0 flex-col gap-1 border-r p-2 sm:flex sm:w-44 sm:p-3",
            v.line
          )}
        >
          <div className="mb-3 flex items-center justify-center gap-2 px-1 py-1 sm:justify-start sm:px-2">
            <LogoIcon className="h-6 w-6 shrink-0" />
            <span className="hidden text-sm font-bold sm:inline">coledia</span>
          </div>
          {NAV_ITEMS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-pressed={active === key}
              title={t(`sidebar.${key}`)}
              className={cn(
                "flex items-center justify-center gap-2.5 rounded-xl px-2 py-2 text-xs font-medium transition-colors sm:justify-start sm:px-3",
                active === key ? "bg-teal-brand text-white shadow-md shadow-teal-brand/30" : v.chip
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{t(`sidebar.${key}`)}</span>
            </button>
          ))}
        </aside>

        {/* Main: fixed header + scrollable content */}
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <TopBar />
          <div className="min-h-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full overflow-y-auto pr-1"
              >
                <ActivePanel />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  const siteLocale = useLocale();
  const defaultLocale: PreviewLocale = (PREVIEW_LOCALES as readonly string[]).includes(siteLocale)
    ? (siteLocale as PreviewLocale)
    : "en";

  return (
    <PreviewProvider defaultLocale={defaultLocale} defaultDark>
      <Shell />
    </PreviewProvider>
  );
}
