import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Check } from "lucide-react";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/home/cta-banner";
import { FeaturePreview } from "@/components/features/feature-preview";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.features" });
  return { title: t("title"), description: t("description") };
}

const MODULES = ["dashboard", "courses", "news", "events", "chat", "documents"] as const;
type ModuleKey = (typeof MODULES)[number];

export default async function FeaturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { module } = await searchParams;
  const defaultTab: ModuleKey = (MODULES as readonly string[]).includes(module ?? "")
    ? (module as ModuleKey)
    : "courses";

  const t = await getTranslations("featuresPage");

  return (
    <MarketingShell>
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
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Tabs defaultValue={defaultTab}>
              <div className="flex justify-center">
                <TabsList>
                  {MODULES.map((m) => (
                    <TabsTrigger key={m} value={m}>
                      {t(`tabs.${m}`)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {MODULES.map((m) => (
                <TabsContent key={m} value={m}>
                  <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-8 sm:p-12 lg:grid-cols-2">
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {t(`${m}.title`)}
                      </h2>
                      <p className="mt-4 leading-relaxed text-muted-foreground">
                        {t(`${m}.text`)}
                      </p>
                      <ul className="mt-6 flex flex-col gap-3">
                        {[1, 2, 3].map((n) => (
                          <li key={n} className="flex items-center gap-3 text-sm font-medium">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-brand/12 text-green-brand">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                            {t(`${m}.b${n}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <FeaturePreview module={m} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Reveal>
        </div>
      </section>

      {/* Admin & Analytics */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t("admin.title")}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {t("admin.text")}
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {[1, 2, 3].map((n) => (
                    <li key={n} className="flex items-center gap-3 text-sm font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-brand/12 text-green-brand">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {t(`admin.b${n}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <FeaturePreview module="admin" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Payments & Stripe */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-8 sm:p-12 lg:grid-cols-2">
              <FeaturePreview module="payments" />
              <div className="order-first lg:order-last">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t("payments.title")}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {t("payments.text")}
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {[1, 2, 3].map((n) => (
                    <li key={n} className="flex items-center gap-3 text-sm font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-brand/12 text-green-brand">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {t(`payments.b${n}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
    </MarketingShell>
  );
}
