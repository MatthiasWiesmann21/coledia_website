"use client";

import * as React from "react";

import deMessages from "../../messages/de.json";
import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";
import frMessages from "../../messages/fr.json";

export const PREVIEW_LOCALES = ["en", "de", "fr", "es"] as const;
export type PreviewLocale = (typeof PREVIEW_LOCALES)[number];

const SHOWCASE: Record<PreviewLocale, typeof enMessages.showcase> = {
  en: enMessages.showcase,
  de: deMessages.showcase as typeof enMessages.showcase,
  fr: frMessages.showcase as typeof enMessages.showcase,
  es: esMessages.showcase as typeof enMessages.showcase,
};

function lookup(locale: PreviewLocale, key: string): string {
  let node: unknown = SHOWCASE[locale];
  for (const part of key.split(".")) {
    if (node && typeof node === "object") {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof node === "string" ? node : key;
}

export type PreviewVariant = {
  card: string;
  subtle: string;
  muted: string;
  faint: string;
  input: string;
  chip: string;
  chipActive: string;
  line: string;
};

const DARK: PreviewVariant = {
  card: "bg-white/4",
  subtle: "text-white/60",
  muted: "text-white/50",
  faint: "text-white/40",
  input: "bg-white/5",
  chip: "bg-white/6 text-white/60 hover:bg-white/10",
  chipActive: "bg-teal-brand text-white",
  line: "border-white/8",
};

const LIGHT: PreviewVariant = {
  card: "bg-navy/4",
  subtle: "text-navy/60",
  muted: "text-navy/50",
  faint: "text-navy/40",
  input: "bg-navy/6",
  chip: "bg-navy/6 text-navy/60 hover:bg-navy/10",
  chipActive: "bg-teal-brand text-white",
  line: "border-navy/8",
};

type PreviewContextValue = {
  t: (key: string) => string;
  isDark: boolean;
  locale: PreviewLocale;
  setLocale: (locale: PreviewLocale) => void;
  toggleDark: () => void;
  query: string;
  setQuery: (query: string) => void;
  v: PreviewVariant;
};

const PreviewContext = React.createContext<PreviewContextValue | null>(null);

export function PreviewProvider({
  defaultLocale,
  defaultDark,
  children,
}: {
  defaultLocale: PreviewLocale;
  defaultDark: boolean;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = React.useState<PreviewLocale>(defaultLocale);
  const [isDark, setIsDark] = React.useState(defaultDark);
  const [query, setQuery] = React.useState("");

  const value = React.useMemo<PreviewContextValue>(
    () => ({
      t: (key: string) => lookup(locale, key),
      isDark,
      locale,
      setLocale,
      toggleDark: () => setIsDark((d) => !d),
      query,
      setQuery,
      v: isDark ? DARK : LIGHT,
    }),
    [locale, isDark, query]
  );

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function usePreview(): PreviewContextValue {
  const ctx = React.useContext(PreviewContext);
  if (!ctx) throw new Error("usePreview must be used inside PreviewProvider");
  return ctx;
}
