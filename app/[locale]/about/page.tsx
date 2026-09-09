import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Coffee, Scale, ShieldCheck, Wrench } from "lucide-react";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Timeline } from "@/components/about/timeline";
import { CtaBanner } from "@/components/home/cta-banner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.about" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  return (
    <MarketingShell>
      {/* Intro */}
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

      {/* Founder */}
      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <Reveal direction="right">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-teal-brand/15 blur-2xl" />
              <div className="flex aspect-square flex-col items-center justify-center rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-4xl">MW</AvatarFallback>
                </Avatar>
                <p className="mt-6 text-xl font-extrabold">{t("founderName")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("founderRole")}</p>
                <Badge variant="orange" className="mt-5">
                  {t("missionBadge")}
                </Badge>
              </div>
            </div>
          </Reveal>

          <Reveal direction="left">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("founderTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{t("founderText1")}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{t("founderText2")}</p>
            <Link
              href="/contact"
              className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-teal-brand px-6 font-semibold text-white shadow-lg shadow-teal-brand/25 transition-all hover:-translate-y-0.5 hover:bg-[#006666]"
            >
              <Coffee className="h-4 w-4" />
              {t("founderCta")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <Timeline
        title={t("timeline.title")}
        milestones={[1, 2, 3].map((n) => ({
          year: t(`timeline.m${n}Year`),
          title: t(`timeline.m${n}Title`),
          text: t(`timeline.m${n}Text`),
        }))}
      />

      {/* Values */}
      <section className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-brand">
              {t("values.kicker")}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("values.title")}
            </h2>
          </Reveal>
          <StaggerGroup className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Scale, title: t("values.v1Title"), text: t("values.v1Text") },
              { icon: Wrench, title: t("values.v2Title"), text: t("values.v2Text") },
              { icon: ShieldCheck, title: t("values.v3Title"), text: t("values.v3Text") },
            ].map((v) => (
              <StaggerItem key={v.title}>
                <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-sm">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-brand/12 text-orange-brand">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
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
    </MarketingShell>
  );
}
