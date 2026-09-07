import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { PitchSection } from "@/components/home/pitch-section";
import { FeatureGrid } from "@/components/home/feature-grid";
import { CtaBanner } from "@/components/home/cta-banner";
import { DashboardPreview } from "@/components/dashboard-preview/dashboard-preview";
import { Reveal } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return { title: t("title"), description: t("description") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const hero = await getTranslations("home.hero");
  const pitch = await getTranslations("home.pitch");
  const features = await getTranslations("home.features");
  const cta = await getTranslations("home.cta");
  const showcase = await getTranslations("home.showcase");

  return (
    <>
      <Hero
        labels={{
          badge: hero("badge"),
          titleA: hero("titleA"),
          titleB: hero("titleB"),
          subtitle: hero("subtitle"),
          ctaPrimary: hero("ctaPrimary"),
          ctaSecondary: hero("ctaSecondary"),
          stats: [
            { value: hero("stat1Value"), label: hero("stat1Label") },
            { value: hero("stat2Value"), label: hero("stat2Label") },
            { value: hero("stat3Value"), label: hero("stat3Label") },
          ],
        }}
      />

      <PitchSection
        labels={{
          kicker: pitch("kicker"),
          title: pitch("title"),
          lead: pitch("lead"),
          points: [
            { title: pitch("point1Title"), text: pitch("point1Text") },
            { title: pitch("point2Title"), text: pitch("point2Text") },
            { title: pitch("point3Title"), text: pitch("point3Text") },
          ],
        }}
      />

      {/* App Preview Showcase */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-brand">
              {showcase("kicker")}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {showcase("title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{showcase("subtitle")}</p>
          </Reveal>
          <Reveal direction="up" delay={0.15}>
            <div className="glow-teal rounded-4xl">
              <DashboardPreview />
            </div>
          </Reveal>
        </div>
      </section>

      <FeatureGrid
        labels={{
          kicker: features("kicker"),
          title: features("title"),
          subtitle: features("subtitle"),
          learnMore: features("learnMore"),
          items: [
            { title: features("f1Title"), text: features("f1Text") },
            { title: features("f2Title"), text: features("f2Text") },
            { title: features("f3Title"), text: features("f3Text") },
            { title: features("f4Title"), text: features("f4Text") },
            { title: features("f5Title"), text: features("f5Text") },
            { title: features("f6Title"), text: features("f6Text") },
            { title: features("f7Title"), text: features("f7Text") },
            { title: features("f8Title"), text: features("f8Text") },
            { title: features("f9Title"), text: features("f9Text") },
          ],
        }}
      />

      <CtaBanner
        labels={{
          title: cta("title"),
          subtitle: cta("subtitle"),
          button: cta("button"),
          note: cta("note"),
        }}
      />
    </>
  );
}
