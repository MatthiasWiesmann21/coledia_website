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
  const t = await getTranslations({ locale, namespace: "legal.imprint" });
  return { title: t("title") };
}

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal.imprint");

  return (
    <section className="px-4 pb-20 pt-16 sm:pt-24">
      <Reveal className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight">{t("title")}</h1>
        <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-border bg-card p-8 leading-relaxed">
          <p className="text-lg font-bold">{t("company")}</p>
          <p className="text-muted-foreground">{t("owner")}</p>
          <p className="text-muted-foreground">{t("addressLine")}</p>
          <p>
            <a href="mailto:hello@coledia.com" className="font-medium text-teal-brand hover:underline">
              {t("email")}
            </a>
          </p>
          <p>
            <a
              href="https://wiesmann-se.ch"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-teal-brand hover:underline"
            >
              {t("web")}
            </a>
          </p>
          <Badge variant="outline" className="mt-4 self-start">
            {t("note")}
          </Badge>
        </div>
      </Reveal>
    </section>
  );
}
