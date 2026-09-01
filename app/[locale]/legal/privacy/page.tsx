import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal.privacy");

  const paragraphs = [
    { title: t("p1Title"), text: t("p1Text") },
    { title: t("p2Title"), text: t("p2Text") },
    { title: t("p3Title"), text: t("p3Text") },
  ];

  return (
    <section className="px-4 pb-20 pt-16 sm:pt-24">
      <Reveal className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight">{t("title")}</h1>
        <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-border bg-card p-8">
          {paragraphs.map((p) => (
            <div key={p.title}>
              <p className="font-bold">{p.title}</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
          <Badge variant="outline" className="self-start">
            {t("note")}
          </Badge>
        </div>
      </Reveal>
    </section>
  );
}
