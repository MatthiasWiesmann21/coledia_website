import { ImageResponse } from "next/og";
import type { ImageResponseOptions } from "next/server";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  const { locale } = await params;
  const validLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: validLocale, namespace: "home.hero" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "linear-gradient(135deg, #0C2340 0%, #081830 100%)",
          color: "#F4F6F8",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#2AA99B",
            marginBottom: 24,
          }}
        >
          coledia.com
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>{t("titleA")}</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            background: "linear-gradient(90deg, #2AA99B, #1F78B4)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {t("titleB")}
        </div>
        <div style={{ fontSize: 26, color: "#9AA9BD", marginTop: 32 }}>{t("subtitle")}</div>
      </div>
    ),
    size as ImageResponseOptions
  );
}
