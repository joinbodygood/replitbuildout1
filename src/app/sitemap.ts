import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = "https://joinbodygood.com";

export const revalidate = 600; // re-render sitemap at most every 10 minutes so newly-published blog posts appear quickly

const staticPages: Array<{
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "", priority: 1.0, freq: "weekly" },
  { path: "/about", priority: 0.7, freq: "monthly" },
  { path: "/how-it-works", priority: 0.8, freq: "monthly" },
  { path: "/pricing", priority: 0.8, freq: "monthly" },
  { path: "/programs", priority: 0.8, freq: "monthly" },
  { path: "/quiz", priority: 0.9, freq: "weekly" },
  { path: "/insurance-check", priority: 0.8, freq: "monthly" },
  { path: "/faq", priority: 0.6, freq: "monthly" },
  { path: "/blog", priority: 0.9, freq: "daily" },
  { path: "/reviews", priority: 0.6, freq: "weekly" },
  { path: "/refer", priority: 0.5, freq: "monthly" },
  { path: "/supplements", priority: 0.6, freq: "monthly" },
  { path: "/privacy", priority: 0.3, freq: "yearly" },
  { path: "/terms", priority: 0.3, freq: "yearly" },
  { path: "/telehealth-consent", priority: 0.3, freq: "yearly" },
  { path: "/hipaa-notice", priority: 0.3, freq: "yearly" },
  { path: "/refund-policy", priority: 0.3, freq: "yearly" },
  { path: "/shipping-policy", priority: 0.3, freq: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["en", "es"] as const;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
      });
    }
  }

  try {
    const posts = await db.blogPost.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        translations: { select: { locale: true } },
      },
      orderBy: { publishedAt: "desc" },
    });

    for (const post of posts) {
      const localesForPost = new Set(post.translations.map((t) => t.locale));
      const iterLocales = localesForPost.size > 0 ? Array.from(localesForPost) : ["en"];
      for (const locale of iterLocales) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // If the DB is briefly unreachable we still emit the static section
    // rather than 500-ing the whole sitemap.
  }

  return entries;
}
