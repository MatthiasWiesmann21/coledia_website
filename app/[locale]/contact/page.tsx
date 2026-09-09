import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Coffee, Mail, MessageCircle } from "lucide-react";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact/contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.contact" });
  return { title: t("title"), description: t("description") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");

  return (
    <MarketingShell>
    <section className="px-4 pb-20 pt-16 sm:pt-24">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-teal-brand">
          {t("kicker")}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("lead")}</p>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-5">
        <Reveal direction="right" className="lg:col-span-3">
          <ContactForm />
        </Reveal>

        <Reveal direction="left" delay={0.1} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-5">
            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-brand">
                {t("direct.title")}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>MW</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{t("direct.name")}</p>
                  <p className="text-xs text-muted-foreground">{t("direct.role")}</p>
                </div>
              </div>
              <a
                href="mailto:hello@coledia.com"
                className="mt-5 flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Mail className="h-4 w-4 text-teal-brand" />
                {t("direct.email")}
              </a>
              <div className="mt-3 flex items-center gap-3 px-1 text-xs text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-teal-brand" />
                {t("direct.response")}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-navy p-7 text-white">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-brand/25 blur-2xl" />
              <p className="relative text-lg font-bold">{t("direct.coffeeTitle")}</p>
              <p className="relative mt-2 text-sm leading-relaxed text-white/70">
                {t("direct.coffeeText")}
              </p>
              <span className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-orange-brand px-5 py-2.5 text-sm font-semibold">
                <Coffee className="h-4 w-4" />
                hello@coledia.com
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
    </MarketingShell>
  );
}
