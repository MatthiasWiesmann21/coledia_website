"use client";

import { useState } from "react";
import { ArrowRight, Check, Minus } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type TierLabels = {
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  description: string;
  features: string[];
};

type ComparisonLabels = {
  title: string;
  feature: string;
  starter: string;
  club: string;
  org: string;
  rows: { label: string; starter: string; club: string; org: string }[];
};

type PricingLabels = {
  kicker: string;
  title: string;
  subtitle: string;
  monthly: string;
  annual: string;
  saveNote: string;
  perMonth: string;
  billedAnnually: string;
  popular: string;
  viewAll?: string;
  ctaButton: string;
  tiers: [TierLabels, TierLabels, TierLabels];
  comparison: ComparisonLabels;
};

/** Render a cell value: "yes" → check, "no" → dash, anything else → text. */
function Cell({ value }: { value: string }) {
  if (value === "yes") {
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-brand/12 text-green-brand">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  return <span className="font-semibold text-foreground">{value}</span>;
}

export function PricingSection({ labels }: { labels: PricingLabels }) {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-brand">
            {labels.kicker}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {labels.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{labels.subtitle}</p>
        </Reveal>

        {/* Billing toggle */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm font-semibold transition-colors",
              !annual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {labels.monthly}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors duration-200",
              annual ? "bg-teal-brand" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
                annual ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-semibold transition-colors",
              annual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {labels.annual}
          </span>
          <span
            className={cn(
              "rounded-full bg-green-brand/12 px-2.5 py-0.5 text-xs font-semibold text-green-brand transition-opacity duration-200",
              annual ? "opacity-100" : "opacity-0"
            )}
          >
            {labels.saveNote}
          </span>
        </div>

        {/* Tier cards */}
        <StaggerGroup className="grid gap-6 md:grid-cols-3">
          {labels.tiers.map((tier, i) => {
            const featured = i === 1;
            const price = annual ? tier.priceAnnual : tier.priceMonthly;
            return (
              <StaggerItem key={tier.name} lift={false}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl border bg-card p-8 shadow-sm",
                    featured
                      ? "border-teal-brand shadow-xl shadow-teal-brand/10"
                      : "border-border"
                  )}
                >
                  {featured && (
                    <Badge variant="orange" className="absolute -top-3 right-6">
                      {labels.popular}
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold">{tier.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">CHF {price}</span>
                    <span className="text-sm text-muted-foreground">{labels.perMonth}</span>
                  </div>
                  {annual && (
                    <p className="mt-1 text-xs text-muted-foreground">{labels.billedAnnually}</p>
                  )}
                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {tier.features.map((f, n) => (
                      <li key={n} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-brand/12 text-green-brand">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={cn(
                      "mt-8 inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5",
                      featured
                        ? "bg-orange-brand text-white shadow-lg shadow-orange-brand/25 hover:bg-[#d14a0a]"
                        : "border-2 border-border hover:bg-muted"
                    )}
                  >
                    {labels.ctaButton}
                  </Link>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* View all link (hidden on the pricing page itself) */}
        {labels.viewAll && (
          <Reveal className="mt-6 text-center" delay={0.1}>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-brand hover:underline"
            >
              {labels.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        )}

        {/* Comparison table */}
        <Reveal className="mt-14" delay={0.15}>
          <h3 className="mb-6 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            {labels.comparison.title}
          </h3>
          <div className="overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full min-w-160 border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-bold">{labels.comparison.feature}</th>
                  <th className="p-4 text-center font-bold">{labels.comparison.starter}</th>
                  <th className="p-4 text-center font-bold">{labels.comparison.club}</th>
                  <th className="p-4 text-center font-bold">{labels.comparison.org}</th>
                </tr>
              </thead>
              <tbody>
                {labels.comparison.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-border last:border-0",
                      i % 2 === 1 && "bg-muted/30"
                    )}
                  >
                    <td className="p-4 font-medium">{row.label}</td>
                    <td className="p-4 text-center"><Cell value={row.starter} /></td>
                    <td className="p-4 text-center"><Cell value={row.club} /></td>
                    <td className="p-4 text-center"><Cell value={row.org} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
