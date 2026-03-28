import type { MetadataRoute } from "next";

const BASE_URL = "https://joinbodygood.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "es"];

  const staticPages = [
    "",
    "/about",
    "/how-it-works",
    "/pricing",
    "/faq",
    "/programs",
    "/quiz",
    "/insurance-check",
    "/privacy",
    "/terms",
    "/telehealth-consent",
    "/hipaa-notice",
    "/refund-policy",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : 0.7,
      });
    }
  }

  return entries;
}
