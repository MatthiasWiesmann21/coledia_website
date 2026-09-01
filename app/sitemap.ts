import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://coledia.com";

const PATHS = ["", "/about", "/features", "/pricing", "/contact", "/legal/imprint", "/legal/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    routing.locales.map((locale) => {
      const languages: Record<string, string> = {};
      for (const loc of routing.locales) {
        languages[loc] = `${BASE_URL}/${loc}${path}`;
      }
      return {
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: path === "" ? 1 : 0.8,
        alternates: { languages },
      };
    })
  );
}
