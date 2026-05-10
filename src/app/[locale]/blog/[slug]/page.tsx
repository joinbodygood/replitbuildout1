import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MarkdownArticle, readingTimeMinutes } from "@/components/blog/MarkdownArticle";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });
  const t = post?.translations[0];
  if (!post || !t) return {};
  return {
    title: t.seoTitle || t.title,
    description: t.seoDescription || t.excerpt,
    openGraph: {
      title: t.seoTitle || t.title,
      description: t.seoDescription || t.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
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
