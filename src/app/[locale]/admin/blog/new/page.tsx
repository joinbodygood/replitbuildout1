import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { AdminBlogForm } from "@/components/admin/AdminBlogForm";

type Props = { params: Promise<{ locale: string }> };

export default async function NewBlogPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="py-8 pb-16">
      <Container>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-body-muted mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-brand-red">Dashboard</Link>
            <span>/</span>
            <Link href={`/${locale}/admin/blog`} className="hover:text-brand-red">Blog</Link>
            <span>/</span>
            <span>New</span>
          </div>
          <h1 className="font-heading text-heading text-3xl font-bold">New Blog Post</h1>
        </div>

        <AdminBlogForm locale={locale} mode="new" />
      </Container>
    </section>
  );
}
