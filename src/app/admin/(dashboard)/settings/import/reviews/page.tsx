"use client";

import { useState, useRef } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Upload, Star, CheckCircle, XCircle, FileJson, Info } from "lucide-react";

type ImportResult = {
  imported:   number;
  skipped:    number;
  unmapped:   number;
  duplicates: number;
  total:      number;
};

export default function ImportReviewsPage() {
  const [file,     setFile]     = useState<File | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<ImportResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.endsWith(".json")) { setError("Please upload a .json file"); return; }
    setFile(f);
    setError(null);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/admin/import/reviews", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Import failed"); return; }
      setResult(data);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Import Reviews"
        breadcrumbs={[{ label: "Admin" }, { label: "Settings" }, { label: "Import" }, { label: "Reviews" }]}
        user={{ name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6 space-y-6 max-w-3xl">

        <div className="bg-yellow-50 border border-yellow-200 rounded-[12px] p-4 flex gap-3">
          <Info size={18} className="text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Judge.me Reviews Import</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Upload a JSON file exported from Judge.me. Only <strong>published</strong> reviews will be imported
              (1–2 star reviews that are unpublished will be skipped). Reviews are auto-approved and displayed
              immediately. Reviews that cannot be matched to a product are stored as general site reviews.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
          <p className="text-sm font-semibold text-[#0C0D0F] mb-2">Expected JSON format</p>
          <p className="text-xs text-[#55575A] mb-3">Each review object should have these fields:</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#55575A]">
            {[
              ["id", "Judge.me review ID (for dedup)"],
              ["rating", "1–5 star rating"],
              ["title", "Review headline"],
              ["body", "Review text"],
              ["reviewer.name", "Reviewer display name"],
              ["reviewer.email", "Reviewer email"],
              ["product_external_id", "Shopify product ID"],
              ["verified", '"verified-purchase" or other'],
              ["published", "true/false — unpublished are skipped"],
              ["featured", "true/false — featured flag"],
              ["created_at", "Original review date"],
            ].map(([field, desc]) => (
              <div key={field} className="flex gap-1.5">
                <code className="text-[#0C0D0F] font-mono shrink-0">{field}</code>
                <span className="text-[#A0A0A0]">— {desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={`rounded-[12px] border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            dragging ? "border-[#0C0D0F] bg-[#F9F9F9]" : "border-[#E5E5E5] hover:border-[#0C0D0F]/30"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          <FileJson size={36} className="text-[#55575A] mb-3" />
          {file ? (
            <>
              <p className="font-semibold text-[#0C0D0F]">{file.name}</p>
              <p className="text-sm text-[#55575A]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#0C0D0F]">Drop your JSON file here</p>
              <p className="text-sm text-[#55575A] mt-1">or click to browse</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[8px] text-sm text-red-700">
            <XCircle size={16} />
            {error}
          </div>
        )}

        <button
          disabled={!file || loading}
          onClick={handleImport}
          className="flex items-center gap-2 px-6 py-3 rounded-[10px] bg-[#0C0D0F] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0C0D0F]/80 transition-colors"
        >
          <Upload size={16} />
          {loading ? "Importing…" : "Start Import"}
        </button>

        {result && (
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-green-600" />
              <p className="font-semibold text-[#0C0D0F]">Import Complete</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Reviews imported",      value: result.imported,   color: "text-green-600"  },
                { label: "Skipped (unpublished)", value: result.skipped,    color: "text-orange-600" },
                { label: "Unmapped (site-wide)",  value: result.unmapped,   color: "text-blue-600"   },
                { label: "Duplicates skipped",    value: result.duplicates, color: "text-[#55575A]"  },
              ].map((s) => (
                <div key={s.label} className="bg-[#F9F9F9] rounded-[8px] p-3">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                  <p className="text-xs text-[#55575A] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-[8px]">
              <p className="text-xs text-green-700">
                <Star size={12} className="inline mr-1" />
                {result.imported} reviews are now live on the site. Manage them in{" "}
                <a href="/admin/content/reviews" className="font-semibold underline">Content → Reviews</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
