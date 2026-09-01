import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Check } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/home/cta-banner";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.pricing" });
  return { title: t("title"), description: t("description") };
}

const TIERS = [
  { key: "tier1", features: 4 },
  { key: "tier2", features: 5, featured: true },
  { key: "tier3", features: 5 },
] as const;

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pricing");
  const common = await getTranslations("common");

  return (
    <>
      <section className="px-4 pt-16 sm:pt-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-brand">
            {t("kicker")}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("lead")}</p>
        </Reveal>
      </section>

      <section className="px-4 py-16">
        <StaggerGroup className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <StaggerItem key={tier.key}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border bg-card p-8 shadow-sm",
                  "featured" in tier
                    ? "border-teal-brand shadow-xl shadow-teal-brand/10"
                    : "border-border"
                )}
              >
                {"featured" in tier && (
                  <Badge variant="orange" className="absolute -top-3 right-6">
                    {common("popular")}
                  </Badge>
                )}
                <h2 className="text-lg font-bold">{t(`${tier.key}.name`)}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t(`${tier.key}.description`)}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    CHF {t(`${tier.key}.price`)}
                  </span>
                  <span className="text-sm text-muted-foreground">{common("perMonth")}</span>
                </div>
                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {Array.from({ length: tier.features }, (_, i) => i + 1).map((n) => (
                    <li key={n} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-brand/12 text-green-brand">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {t(`${tier.key}.f${n}`)}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={cn(
                    "mt-8 inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5",
                    "featured" in tier
                      ? "bg-orange-brand text-white shadow-lg shadow-orange-brand/25 hover:bg-[#d14a0a]"
                      : "border-2 border-border hover:bg-muted"
                  )}
                >
                  {t("cta.button")}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">{t("note")}</p>
        </Reveal>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <Reveal className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("faq.title")}
            </h2>
          </Reveal>
          <Reveal>
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <AccordionItem key={n} value={`q${n}`}>
                  <AccordionTrigger>{t(`faq.q${n}`)}</AccordionTrigger>
                  <AccordionContent>{t(`faq.a${n}`)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <CtaBanner
        labels={{
          title: t("cta.title"),
          subtitle: t("cta.subtitle"),
          button: t("cta.button"),
          note: "",
        }}
      />
    </>
  );
}
