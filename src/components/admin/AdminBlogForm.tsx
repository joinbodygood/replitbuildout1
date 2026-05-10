"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function AdminBlogForm({ locale, mode, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "glp1-education");
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "Dr. Linda Moleon, MD");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);

  const initialEn = initial?.translations.find((t) => t.locale === "en") ?? emptyTranslation("en");
  const initialEs = initial?.translations.find((t) => t.locale === "es") ?? emptyTranslation("es");

  const [en, setEn] = useState<Translation>(initialEn);
  const [es, setEs] = useState<Translation>(initialEs);
  const [activeTab, setActiveTab] = useState<"en" | "es">("en");
  const [includeEs, setIncludeEs] = useState(!!initial?.translations.find((t) => t.locale === "es"));

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
        body: JSON.stringify({ slug, category, authorName, isPublished, translations }),
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

  const t = activeTab === "en" ? en : es;
  const setT = activeTab === "en" ? setEn : setEs;

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
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-heading text-lg font-bold">Content</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeEs}
              onChange={(e) => setIncludeEs(e.target.checked)}
              className="w-4 h-4"
            />
            Include Spanish (es)
          </label>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("en")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === "en" ? "border-brand-red text-brand-red" : "border-transparent text-body-muted"}`}
          >
            English
          </button>
          {includeEs && (
            <button
              type="button"
              onClick={() => setActiveTab("es")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === "es" ? "border-brand-red text-brand-red" : "border-transparent text-body-muted"}`}
            >
              Español
            </button>
          )}
        </div>

        <label className="block">
          <span className="block text-sm font-semibold mb-1">Title</span>
          <input
            required={activeTab === "en"}
            value={t.title}
            onChange={(e) => setT({ ...t, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-semibold mb-1">Excerpt</span>
          <textarea
            required={activeTab === "en"}
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
          <span className="block text-sm font-semibold mb-1">Body (Markdown)</span>
          <textarea
            required={activeTab === "en"}
            value={t.body}
            onChange={(e) => setT({ ...t, body: e.target.value })}
            rows={20}
            placeholder="## Section heading&#10;&#10;Paragraph text. Use **bold** for emphasis.&#10;&#10;### Subheading&#10;&#10;- list item one&#10;- list item two"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-brand-red focus:outline-none font-mono text-sm"
          />
          <span className="block text-xs text-body-muted mt-1">
            Supported: `##` h2, `###` h3, `**bold**`, `- list item`, paragraph breaks
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
