import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // Limit parallel build workers to reduce peak memory on small servers.
    cpus: 2,
  },
};

export default withNextIntl(nextConfig);
