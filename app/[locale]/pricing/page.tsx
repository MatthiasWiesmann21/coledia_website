import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/home/cta-banner";
import { PricingSection } from "@/components/home/pricing-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.pricing" });
  return { title: t("title"), description: t("description") };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const pricing = await getTranslations("home.pricing");
  const faq = await getTranslations("pricing.faq");
  const cta = await getTranslations("pricing.cta");

  return (
    <MarketingShell>
      <PricingSection
        labels={{
          kicker: pricing("kicker"),
          title: pricing("title"),
          subtitle: pricing("subtitle"),
          monthly: pricing("monthly"),
          annual: pricing("annual"),
          saveNote: pricing("saveNote"),
          perMonth: pricing("perMonth"),
          billedAnnually: pricing("billedAnnually"),
          popular: pricing("popular"),
          ctaButton: pricing("ctaButton"),
          tiers: [
            {
              name: pricing("tier1.name"),
              priceMonthly: pricing("tier1.priceMonthly"),
              priceAnnual: pricing("tier1.priceAnnual"),
              description: pricing("tier1.description"),
              features: [
                pricing("tier1.f1"),
                pricing("tier1.f2"),
                pricing("tier1.f3"),
                pricing("tier1.f4"),
              ],
            },
            {
              name: pricing("tier2.name"),
              priceMonthly: pricing("tier2.priceMonthly"),
              priceAnnual: pricing("tier2.priceAnnual"),
              description: pricing("tier2.description"),
              features: [
                pricing("tier2.f1"),
                pricing("tier2.f2"),
                pricing("tier2.f3"),
                pricing("tier2.f4"),
                pricing("tier2.f5"),
              ],
            },
            {
              name: pricing("tier3.name"),
              priceMonthly: pricing("tier3.priceMonthly"),
              priceAnnual: pricing("tier3.priceAnnual"),
              description: pricing("tier3.description"),
              features: [
                pricing("tier3.f1"),
                pricing("tier3.f2"),
                pricing("tier3.f3"),
                pricing("tier3.f4"),
                pricing("tier3.f5"),
              ],
            },
          ],
          comparison: {
            title: pricing("comparison.title"),
            feature: pricing("comparison.feature"),
            starter: pricing("comparison.starter"),
            club: pricing("comparison.club"),
            org: pricing("comparison.org"),
            rows: [
              {
                label: pricing("comparison.r1Label"),
                starter: pricing("comparison.r1Starter"),
                club: pricing("comparison.r1Club"),
                org: pricing("comparison.r1Org"),
              },
              {
                label: pricing("comparison.r2Label"),
                starter: pricing("comparison.r2Starter"),
                club: pricing("comparison.r2Club"),
                org: pricing("comparison.r2Org"),
              },
              {
                label: pricing("comparison.r3Label"),
                starter: pricing("comparison.r3Starter"),
                club: pricing("comparison.r3Club"),
                org: pricing("comparison.r3Org"),
              },
              {
                label: pricing("comparison.r4Label"),
                starter: pricing("comparison.r4Starter"),
                club: pricing("comparison.r4Club"),
                org: pricing("comparison.r4Org"),
              },
              {
                label: pricing("comparison.r5Label"),
                starter: pricing("comparison.r5Starter"),
                club: pricing("comparison.r5Club"),
                org: pricing("comparison.r5Org"),
              },
              {
                label: pricing("comparison.r6Label"),
                starter: pricing("comparison.r6Starter"),
                club: pricing("comparison.r6Club"),
                org: pricing("comparison.r6Org"),
              },
              {
                label: pricing("comparison.r7Label"),
                starter: pricing("comparison.r7Starter"),
                club: pricing("comparison.r7Club"),
                org: pricing("comparison.r7Org"),
              },
              {
                label: pricing("comparison.r8Label"),
                starter: pricing("comparison.r8Starter"),
                club: pricing("comparison.r8Club"),
                org: pricing("comparison.r8Org"),
              },
              {
                label: pricing("comparison.r9Label"),
                starter: pricing("comparison.r9Starter"),
                club: pricing("comparison.r9Club"),
                org: pricing("comparison.r9Org"),
              },
              {
                label: pricing("comparison.r10Label"),
                starter: pricing("comparison.r10Starter"),
                club: pricing("comparison.r10Club"),
                org: pricing("comparison.r10Org"),
              },
              {
                label: pricing("comparison.r11Label"),
                starter: pricing("comparison.r11Starter"),
                club: pricing("comparison.r11Club"),
                org: pricing("comparison.r11Org"),
              },
              {
                label: pricing("comparison.r12Label"),
                starter: pricing("comparison.r12Starter"),
                club: pricing("comparison.r12Club"),
                org: pricing("comparison.r12Org"),
              },
              {
                label: pricing("comparison.r13Label"),
                starter: pricing("comparison.r13Starter"),
                club: pricing("comparison.r13Club"),
                org: pricing("comparison.r13Org"),
              },
              {
                label: pricing("comparison.r14Label"),
                starter: pricing("comparison.r14Starter"),
                club: pricing("comparison.r14Club"),
                org: pricing("comparison.r14Org"),
              },
              {
                label: pricing("comparison.r15Label"),
                starter: pricing("comparison.r15Starter"),
                club: pricing("comparison.r15Club"),
                org: pricing("comparison.r15Org"),
              },
              {
                label: pricing("comparison.r16Label"),
                starter: pricing("comparison.r16Starter"),
                club: pricing("comparison.r16Club"),
                org: pricing("comparison.r16Org"),
              },
              {
                label: pricing("comparison.r17Label"),
                starter: pricing("comparison.r17Starter"),
                club: pricing("comparison.r17Club"),
                org: pricing("comparison.r17Org"),
              },
              {
                label: pricing("comparison.r18Label"),
                starter: pricing("comparison.r18Starter"),
                club: pricing("comparison.r18Club"),
                org: pricing("comparison.r18Org"),
              },
            ],
          },
        }}
      />

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <Reveal className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {faq("title")}
            </h2>
          </Reveal>
          <Reveal>
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <AccordionItem key={n} value={`q${n}`}>
                  <AccordionTrigger>{faq(`q${n}`)}</AccordionTrigger>
                  <AccordionContent>
                    {n === 5 ? (
                      <>
                        {faq("a5Part1")}{" "}
                        <Link
                          href="/contact"
                          className="font-semibold text-orange-brand hover:underline"
                        >
                          {faq("a5Link")}
                        </Link>{" "}
                        {faq("a5Part2")}
                      </>
                    ) : (
                      faq(`a${n}`)
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <CtaBanner
        labels={{
          title: cta("title"),
          subtitle: cta("subtitle"),
          button: cta("button"),
          note: "",
        }}
      />
    </MarketingShell>
  );
}
