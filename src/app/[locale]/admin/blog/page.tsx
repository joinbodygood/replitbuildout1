import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  "glp1-education": "GLP-1 Education",
  "weight-loss-tips": "Tips",
  "insurance-guides": "Insurance Guides",
  "patient-stories": "Stories",
};

export default async function AdminBlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = await db.blogPost.findMany({
    include: { translations: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const published = posts.filter((p) => p.isPublished).length;
  const drafts = posts.length - published;

  return (
    <section className="py-8 pb-16">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-body-muted mb-1">
              <Link href={`/${locale}/admin`} className="hover:text-brand-red">Dashboard</Link>
              <span>/</span>
              <span>Blog</span>
            </div>
            <h1 className="font-heading text-heading text-3xl font-bold">Blog Posts</h1>
            <p className="text-body-muted mt-1">
              {posts.length} total · {published} published · {drafts} drafts
            </p>
          </div>
          <Button href={`/${locale}/admin/blog/new`} size="md">+ New Post</Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-left px-4 py-3 font-semibold">Locales</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Updated</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-body-muted">
                    No blog posts yet. <Link href={`/${locale}/admin/blog/new`} className="text-brand-red underline">Create the first one</Link>.
                  </td>
                </tr>
              )}
              {posts.map((post) => {
                const titleEn = post.translations.find((t) => t.locale === "en")?.title;
                const titleEs = post.translations.find((t) => t.locale === "es")?.title;
                const title = titleEn || titleEs || "(untitled)";
                const locales = post.translations.map((t) => t.locale).sort().join(", ");
                return (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-md truncate">{title}</td>
                    <td className="px-4 py-3 text-body-muted font-mono text-xs">{post.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant="pink">{CATEGORY_LABELS[post.category] ?? post.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-body-muted text-xs uppercase">{locales || "—"}</td>
                    <td className="px-4 py-3">
                      {post.isPublished ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="muted">Draft</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body-muted text-xs">
                      {post.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/${locale}/admin/blog/${post.id}`}
                        className="text-brand-red hover:underline text-sm font-semibold"
                      >
                        Edit
                      </Link>
                      {post.isPublished && (
                        <>
                          <span className="text-body-muted mx-2">·</span>
                          <Link
                            href={`/${locale}/blog/${post.slug}`}
                            target="_blank"
                            className="text-body-muted hover:text-brand-red text-sm"
                          >
                            View
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
