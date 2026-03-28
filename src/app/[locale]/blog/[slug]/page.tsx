import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string; slug: string }> };

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

  // Simple markdown-to-HTML: headers, bold, lists
  const htmlBody = t.body
    .replace(/^### (.+)$/gm, '<h3 class="font-heading text-heading text-lg font-bold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-heading text-heading text-xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-heading">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-body">• $1</li>')
    .replace(/\n\n/g, '</p><p class="text-body leading-relaxed mb-4">')
    .replace(/\n/g, "<br />");

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <Badge variant="pink">{post.category.replace(/-/g, " ").toUpperCase()}</Badge>
          <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
            {t.title}
          </h1>
          <div className="flex items-center gap-3 text-body-muted text-sm">
            <span>{post.authorName}</span>
            <span>•</span>
            {post.publishedAt && (
              <span>
                {new Date(post.publishedAt).toLocaleDateString(
                  locale === "es" ? "es-US" : "en-US",
                  { month: "long", day: "numeric", year: "numeric" }
                )}
              </span>
            )}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          <div
            className="text-body leading-relaxed"
            dangerouslySetInnerHTML={{ __html: `<p class="text-body leading-relaxed mb-4">${htmlBody}</p>` }}
          />

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
