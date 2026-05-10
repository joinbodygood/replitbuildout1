import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { AdminBlogForm, type BlogPostInput } from "@/components/admin/AdminBlogForm";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const post = await db.blogPost.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!post) notFound();

  const initial: BlogPostInput = {
    id: post.id,
    slug: post.slug,
    category: post.category,
    authorName: post.authorName,
    featuredImage: post.featuredImage,
    isPublished: post.isPublished,
    translations: post.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      excerpt: t.excerpt,
      body: t.body,
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
    })),
  };

  return (
    <section className="py-8 pb-16">
      <Container>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-body-muted mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-brand-red">Dashboard</Link>
            <span>/</span>
            <Link href={`/${locale}/admin/blog`} className="hover:text-brand-red">Blog</Link>
            <span>/</span>
            <span className="font-mono">{post.slug}</span>
          </div>
          <h1 className="font-heading text-heading text-3xl font-bold">Edit Blog Post</h1>
        </div>

        <AdminBlogForm locale={locale} mode="edit" initial={initial} />
      </Container>
    </section>
  );
}
