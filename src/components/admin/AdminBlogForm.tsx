"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  { value: "glp1-education", label: "GLP-1 Education" },
  { value: "weight-loss-tips", label: "Weight Loss Tips" },
  { value: "insurance-guides", label: "Insurance Guides" },
  { value: "patient-stories", label: "Patient Stories" },
];

type Translation = {
  locale: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type BlogPostInput = {
  id?: string;
  slug: string;
  category: string;
  authorName: string;
  featuredImage?: string | null;
  isPublished: boolean;
  translations: Translation[];
};

type Props = {
  locale: string;
  mode: "new" | "edit";
  initial?: BlogPostInput;
};

const emptyTranslation = (loc: string): Translation => ({
  locale: loc,
  title: "",
  excerpt: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
});

function readingTimeMinutes(body: string): number {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 220));
}

export function AdminBlogForm({ locale, mode, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "glp1-education");
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "Dr. Linda Moleon, MD");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);

  const initialEn = initial?.translations.find((t) => t.locale === "en") ?? emptyTranslation("en");
  const initialEs = initial?.translations.find((t) => t.locale === "es") ?? emptyTranslation("es");

  const [en, setEn] = useState<Translation>(initialEn);
  const [es, setEs] = useState<Translation>(initialEs);
  const [activeLocale, setActiveLocale] = useState<"en" | "es">("en");
  const [includeEs, setIncludeEs] = useState(!!initial?.translations.find((t) => t.locale === "es"));
  const [view, setView] = useState<"edit" | "preview">("edit");

  const t = activeLocale === "en" ? en : es;
  const setT = activeLocale === "en" ? setEn : setEs;

  const readTime = useMemo(() => readingTimeMinutes(t.body || ""), [t.body]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const translations: Translation[] = [];
    if (en.title || en.body) translations.push(en);
    if (includeEs && (es.title || es.body)) translations.push(es);

    if (translations.length === 0) {
      setError("At least one locale (English or Spanish) must have content");
      setSaving(false);
      return;
    }

    try {
      const url = mode === "new" ? "/api/admin/blog" : `/api/admin/blog/${initial!.id}`;
      const method = mode === "new" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          category,
          authorName,
          featuredImage: featuredImage.trim() || null,
          isPublished,
          translations,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }
      router.push(`/${locale}/admin/blog`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm(`Delete "${en.title || initial.slug}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Delete failed");
        setDeleting(false);
        return;
      }
      router.push(`/${locale}/admin/blog`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-heading text-heading text-lg font-bold">Post Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Slug</span>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              pattern="[a-z0-9-]+"
              placeholder="how-glp-1-medications-work"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none font-mono text-sm"
            />
            <span className="block text-xs text-body-muted mt-1">
              URL: /{locale}/blog/{slug || "..."}
            </span>
          </label>

          <label className="block">
            <span className="block text-sm font-semibold mb-1">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-semibold mb-1">Author</span>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Published (visible on site)</span>
          </label>

          <label className="block md:col-span-2">
            <span className="block text-sm font-semibold mb-1">Featured Image URL <span className="text-body-muted font-normal">(optional)</span></span>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://cdn.example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none font-mono text-sm"
            />
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Featured preview"
                className="mt-2 rounded-md border border-gray-200 max-h-48 object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </label>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-heading text-heading text-lg font-bold">Content</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeEs}
                onChange={(e) => setIncludeEs(e.target.checked)}
                className="w-4 h-4"
              />
              Include Spanish
            </label>
            <div className="flex border border-gray-300 rounded-md overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setView("edit")}
                className={`px-3 py-1.5 ${view === "edit" ? "bg-brand-red text-white" : "bg-white text-body-muted"}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setView("preview")}
                className={`px-3 py-1.5 ${view === "preview" ? "bg-brand-red text-white" : "bg-white text-body-muted"}`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveLocale("en")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeLocale === "en" ? "border-brand-red text-brand-red" : "border-transparent text-body-muted"}`}
          >
            English
          </button>
          {includeEs && (
            <button
              type="button"
              onClick={() => setActiveLocale("es")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeLocale === "es" ? "border-brand-red text-brand-red" : "border-transparent text-body-muted"}`}
            >
              Español
            </button>
          )}
        </div>

        {view === "edit" ? (
          <>
            <label className="block">
              <span className="block text-sm font-semibold mb-1">Title</span>
              <input
                required={activeLocale === "en"}
                value={t.title}
                onChange={(e) => setT({ ...t, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-semibold mb-1">Excerpt</span>
              <textarea
                required={activeLocale === "en"}
                value={t.excerpt}
                onChange={(e) => setT({ ...t, excerpt: e.target.value })}
                rows={2}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none"
              />
              <span className="block text-xs text-body-muted mt-1">
                {t.excerpt.length}/300 — shown on blog index card
              </span>
            </label>

            <label className="block">
              <span className="block text-sm font-semibold mb-1">
                Body (Markdown) <span className="text-body-muted font-normal">— ~{readTime} min read</span>
              </span>
              <textarea
                required={activeLocale === "en"}
                value={t.body}
                onChange={(e) => setT({ ...t, body: e.target.value })}
                rows={24}
                placeholder="## Section heading&#10;&#10;Paragraph with **bold**, *italics*, and [a link](https://example.com).&#10;&#10;### Subheading&#10;&#10;- list item one&#10;- list item two&#10;&#10;> A blockquote&#10;&#10;| Column | Column |&#10;|---|---|&#10;| Cell  | Cell  |&#10;&#10;![Image alt text](https://cdn.example.com/img.jpg)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none font-mono text-sm"
              />
              <span className="block text-xs text-body-muted mt-1">
                Full GitHub-flavored markdown: headings, bold, italics, links, lists, blockquotes, tables, code, images (use a hosted URL).
              </span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <label className="block">
                <span className="block text-sm font-semibold mb-1">SEO Title <span className="text-body-muted font-normal">(optional)</span></span>
                <input
                  value={t.seoTitle ?? ""}
                  onChange={(e) => setT({ ...t, seoTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold mb-1">SEO Description <span className="text-body-muted font-normal">(optional)</span></span>
                <input
                  value={t.seoDescription ?? ""}
                  onChange={(e) => setT({ ...t, seoDescription: e.target.value })}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none"
                />
              </label>
            </div>
          </>
        ) : (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            {featuredImage && (
              <img src={featuredImage} alt={t.title} className="w-full rounded-md mb-6" />
            )}
            <div className="text-xs uppercase tracking-wide text-brand-red font-semibold mb-2">
              {CATEGORIES.find((c) => c.value === category)?.label || category}
            </div>
            <h1 className="font-heading text-heading text-3xl font-bold mb-3">
              {t.title || "(untitled)"}
            </h1>
            <p className="text-body-muted text-sm mb-6">
              {authorName} · {readTime} min read
            </p>
            <div className="markdown-article text-body leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="font-heading text-2xl font-bold mt-8 mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="font-heading text-xl font-bold mt-8 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="font-heading text-lg font-bold mt-6 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                  a: ({ href, children }) => <a href={href} className="text-brand-red underline">{children}</a>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-pink-300 pl-4 italic my-4">{children}</blockquote>,
                  code: ({ children }) => <code className="bg-gray-200 text-brand-red px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                  img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="rounded-md my-4 max-w-full" />,
                  table: ({ children }) => <table className="border-collapse w-full my-4 text-sm">{children}</table>,
                  th: ({ children }) => <th className="border border-gray-300 px-3 py-1.5 bg-gray-100 text-left">{children}</th>,
                  td: ({ children }) => <td className="border border-gray-300 px-3 py-1.5">{children}</td>,
                }}
              >
                {t.body || "_(empty body)_"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "new" ? "Create Post" : "Save Changes"}
        </Button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete post"}
          </button>
        )}
      </div>
    </form>
  );
}
