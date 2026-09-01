import { getTranslations } from "next-intl/server";
import { HeartHandshake } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/logo";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  const productLinks = [
    { label: t("productFeatures"), href: "/features" },
    { label: t("productPricing"), href: "/pricing" },
    { label: t("productDemo"), href: "/" },
  ];
  const companyLinks = [
    { label: t("companyAbout"), href: "/about" },
    { label: t("companyContact"), href: "/contact" },
  ];
  const legalLinks = [
    { label: t("legalImprint"), href: "/legal/imprint" },
    { label: t("legalPrivacy"), href: "/legal/privacy" },
  ];

  return (
    <footer className="mt-24 px-4 pb-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Personal banner */}
        <div className="mb-10 flex flex-col items-start gap-4 rounded-3xl bg-navy p-8 text-white sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-brand">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">{t("bannerTitle")}</p>
            <p className="mt-1 max-w-2xl text-sm text-white/70">{t("bannerText")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo showTagline />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">{t("product")}</p>
            <ul className="flex flex-col gap-2">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-teal-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">{t("company")}</p>
            <ul className="flex flex-col gap-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-teal-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://wiesmann-se.ch"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-teal-brand"
                >
                  {t("companyWiesmann")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">{t("legal")}</p>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-teal-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} Coledia – {t("rights")}
          </p>
          <p>
            {t("productOf")}{" "}
            <a
              href="https://wiesmann-se.ch"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-teal-brand hover:underline"
            >
              wiesmann-se.ch
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
