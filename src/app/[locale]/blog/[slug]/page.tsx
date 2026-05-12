import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MarkdownArticle, readingTimeMinutes } from "@/components/blog/MarkdownArticle";
import { buildAlternates, type SupportedLocale } from "@/lib/seo/alternates";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;

  // Pull the post WITH the list of locales it has translations for. We use
  // `translations` without a `where` filter so we know which locales exist
  // (independent of which one we're rendering).
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: {
      featuredImage: true,
      translations: {
        select: { locale: true, title: true, seoTitle: true, seoDescription: true, excerpt: true },
      },
    },
  });
  if (!post) return {};

  const availableLocales = post.translations.map((t) => t.locale) as SupportedLocale[];
  const currentT = post.translations.find((t) => t.locale === locale);

  // If we're rendering /es/blog/<slug> but no ES translation exists, the page
  // is about to call notFound() in the default export below. Belt-and-suspenders:
  // emit noindex/nofollow so any short-lived rendering of an empty body is not
  // crawled, AND so Search Console's "alternate without return link" bucket
  // clears up. 461 /es/blog/* URLs are in this state right now.
  if (!currentT) {
    return {
      robots: { index: false, follow: false },
    };
  }

  return {
    title: currentT.seoTitle || currentT.title,
    description: currentT.seoDescription || currentT.excerpt,
    openGraph: {
      title: currentT.seoTitle || currentT.title,
      description: currentT.seoDescription || currentT.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    alternates: buildAlternates({
      path: `/blog/${slug}`,
      currentLocale: locale as SupportedLocale,
      availableLocales,
    }),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isEs = locale === "es";

  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });

  if (!post || !post.isPublished || !post.translations[0]) notFound();

  const t = post.translations[0];
  const minutes = readingTimeMinutes(t.body);

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <Badge variant="pink">{post.category.replace(/-/g, " ").toUpperCase()}</Badge>
          <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
            {t.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-body-muted text-sm">
            <span>{post.authorName}</span>
            <span>•</span>
            {post.publishedAt && (
              <>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString(
                    locale === "es" ? "es-US" : "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </span>
                <span>•</span>
              </>
            )}
            <span>{minutes} {isEs ? "min de lectura" : "min read"}</span>
          </div>
        </Container>
      </section>

      {post.featuredImage && (
        <section className="bg-brand-pink-soft pb-12">
          <Container narrow>
            <img
              src={post.featuredImage}
              alt={t.title}
              className="w-full rounded-card shadow-card"
            />
          </Container>
        </section>
      )}

      <section className="py-16">
        <Container narrow>
          <MarkdownArticle body={t.body} />

          <div className="mt-12 p-8 bg-brand-pink-soft rounded-card text-center">
            <p className="font-heading text-heading text-xl font-bold mb-2">
              {isEs ? "¿Lista para comenzar?" : "Ready to get started?"}
            </p>
            <p className="text-body-muted mb-4">
              {isEs
                ? "Toma nuestro cuestionario para encontrar el programa perfecto para ti."
                : "Take our quiz to find the perfect program for you."}
            </p>
            <Button href={`/${locale}/quiz`} size="lg">
              {isEs ? "Toma el Cuestionario" : "Take the Quiz"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
