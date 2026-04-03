"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FileText, Plus, ExternalLink, Pencil } from "lucide-react";

type Page = {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
  createdAt: string;
};

const REQUIRED_PAGES = [
  { slug: "privacy-policy", title: "Privacy Policy", publicUrl: "/en/privacy-policy" },
  { slug: "terms-of-service", title: "Terms of Service", publicUrl: "/en/terms-of-service" },
  { slug: "refund-policy", title: "Refund and Cancellation Policy", publicUrl: "/en/refund-policy" },
  { slug: "shipping-policy", title: "Shipping Policy", publicUrl: "/en/shipping-policy" },
  { slug: "faq", title: "FAQ", publicUrl: "/en/faq" },
];

export default function LegalPagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/legal-pages");
    const data = await res.json();
    setPages(data.pages ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pageMap = new Map(pages.map((p) => [p.slug, p]));

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-heading text-heading text-2xl font-bold flex items-center gap-2">
          <FileText size={22} />
          Legal Pages
        </h1>
        <p className="text-body-muted text-sm mt-1">
          Manage the content of your legal and policy pages. Content is rendered as HTML on the public site.
        </p>
      </div>

      <div className="space-y-3">
        {REQUIRED_PAGES.map((rp) => {
          const existing = pageMap.get(rp.slug);
          return (
            <div key={rp.slug} className="bg-white border border-border rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface-dim rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-body-muted" />
                </div>
                <div>
                  <p className="font-heading font-bold text-heading">{rp.title}</p>
                  <p className="text-xs text-body-muted font-mono">/{rp.slug}</p>
                  {existing && (
                    <p className="text-[11px] text-body-muted mt-0.5">
                      Last updated: {new Date(existing.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {existing ? (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                    Content saved
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                    No content yet
                  </span>
                )}
                <a
                  href={rp.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-body-muted hover:text-brand-red transition-colors"
                  title="View public page"
                >
                  <ExternalLink size={15} />
                </a>
                <Link
                  href={`/admin/content/legal/${rp.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-sm font-medium rounded-card hover:bg-brand-red-hover transition-colors"
                >
                  <Pencil size={13} />
                  {existing ? "Edit" : "Add Content"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-surface-dim rounded-card">
        <p className="text-xs text-body-muted flex items-start gap-2">
          <Plus size={14} className="shrink-0 mt-0.5" />
          To add content, click "Add Content" next to any page. Paste or type HTML — all standard HTML tags are supported. Content is rendered directly on the public page.
        </p>
      </div>
    </div>
  );
}
