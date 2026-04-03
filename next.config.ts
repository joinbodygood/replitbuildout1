import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN ?? "",
  ].filter(Boolean),
  devIndicators: false,
  async redirects() {
    return [
      // Shopify /pages/* → new clean URLs (301 permanent)
      { source: "/pages/privacy-policy",   destination: "/en/privacy-policy",   permanent: true },
      { source: "/pages/terms-of-service", destination: "/en/terms-of-service", permanent: true },
      { source: "/pages/refund-policy",    destination: "/en/refund-policy",    permanent: true },
      { source: "/pages/shipping-policy",  destination: "/en/shipping-policy",  permanent: true },
      { source: "/pages/faq",              destination: "/en/faq",              permanent: true },
      // Old short routes → canonical URLs
      { source: "/:locale/privacy",        destination: "/:locale/privacy-policy",   permanent: true },
      { source: "/:locale/terms",          destination: "/:locale/terms-of-service", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
