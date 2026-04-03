"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, ExternalLink, Eye } from "lucide-react";

const SLUG_META: Record<string, { title: string; publicPath: string }> = {
  "privacy-policy":    { title: "Privacy Policy",                  publicPath: "/en/privacy-policy" },
  "terms-of-service":  { title: "Terms of Service",                publicPath: "/en/terms-of-service" },
  "refund-policy":     { title: "Refund and Cancellation Policy",   publicPath: "/en/refund-policy" },
  "shipping-policy":   { title: "Shipping Policy",                  publicPath: "/en/shipping-policy" },
  "faq":               { title: "FAQ",                              publicPath: "/en/faq" },
};

export default function EditLegalPagePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { slug } = params;

  const meta = SLUG_META[slug] ?? { title: slug, publicPath: `/en/${slug}` };

  const [title, setTitle] = useState(meta.title);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/legal-pages/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.page) {
          setTitle(data.page.title);
          setContent(data.page.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/legal-pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-body-muted">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/content/legal")}
          className="flex items-center gap-1.5 text-sm text-body-muted hover:text-brand-red transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Legal Pages
        </button>
        <span className="text-body-muted">/</span>
        <span className="text-sm text-heading font-medium">{meta.title}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-heading text-2xl font-bold">{meta.title}</h1>
        <div className="flex items-center gap-3">
          <a
            href={meta.publicPath}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-body-muted hover:text-brand-red transition-colors border border-border px-3 py-2 rounded-card"
          >
            <ExternalLink size={14} />
            View live
          </a>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 text-sm border border-border px-3 py-2 rounded-card hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <Eye size={14} />
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-brand-red text-white font-medium px-5 py-2 rounded-card text-sm hover:bg-brand-red-hover transition-colors disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-heading mb-1.5">Page title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-card text-sm focus:outline-none focus:border-brand-red transition-colors"
        />
      </div>

      {preview ? (
        <div className="border border-border rounded-xl p-8 bg-white min-h-[500px]">
          <h1 className="font-heading text-heading text-3xl font-bold mb-6">{title}</h1>
          <div
            className="prose prose-sm max-w-none text-body legal-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-heading mb-1.5">
            Page content <span className="text-body-muted font-normal">(HTML)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={30}
            placeholder="Paste your HTML content here…"
            className="w-full px-4 py-3 border border-border rounded-card text-sm font-mono focus:outline-none focus:border-brand-red transition-colors resize-y"
          />
          <p className="text-xs text-body-muted mt-2">
            All standard HTML is supported: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
          </p>
        </div>
      )}
    </div>
  );
}
