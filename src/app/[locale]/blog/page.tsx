import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEs = locale === "es";

  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    include: { translations: { where: { locale } } },
    orderBy: { publishedAt: "desc" },
  });

  const categoryLabels: Record<string, string> = isEs
    ? { "glp1-education": "Educación GLP-1", "weight-loss-tips": "Consejos", "insurance-guides": "Guías de Seguro", "patient-stories": "Historias" }
    : { "glp1-education": "GLP-1 Education", "weight-loss-tips": "Tips", "insurance-guides": "Insurance Guides", "patient-stories": "Stories" };

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container>
          <h1 className="font-heading text-heading text-4xl font-bold text-center mb-4">
            {isEs ? "Blog" : "Blog"}
          </h1>
          <p className="text-body-muted text-lg text-center max-w-2xl mx-auto">
            {isEs
              ? "Educación, consejos y guías sobre pérdida de peso y medicamentos GLP-1."
              : "Education, tips, and guides about weight loss and GLP-1 medications."}
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const t = post.translations[0];
              if (!t) return null;

              return (
                <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                  <Card className="h-full cursor-pointer">
                    <Badge variant="pink">
                      {categoryLabels[post.category] || post.category}
                    </Badge>
                    <h2 className="font-heading text-heading text-xl font-bold mt-3 mb-2">
                      {t.title}
                    </h2>
                    <p className="text-body-muted text-sm mb-3 line-clamp-3">
                      {t.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-body-muted">
                      <span>{post.authorName}</span>
                      {post.publishedAt && (
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString(
                            locale === "es" ? "es-US" : "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
