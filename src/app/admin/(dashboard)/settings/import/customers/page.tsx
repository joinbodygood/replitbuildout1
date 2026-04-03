"use client";

import { useState, useRef } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Upload, Users, CheckCircle, AlertCircle, XCircle, FileJson } from "lucide-react";

const SEGMENTS = [
  { key: "self-pay",         label: "Self-Pay Customers",           color: "bg-blue-100 text-blue-700" },
  { key: "compound",        label: "Compound Medication Customers", color: "bg-purple-100 text-purple-700" },
  { key: "insurance",       label: "Insurance Customers",          color: "bg-green-100 text-green-700" },
  { key: "oral",            label: "Oral Medication Customers",    color: "bg-cyan-100 text-cyan-700" },
  { key: "quiz-lead",       label: "Quiz Leads",                   color: "bg-yellow-100 text-yellow-700" },
  { key: "vip",             label: "VIP Customers",                color: "bg-orange-100 text-orange-700" },
  { key: "supplements",     label: "Supplement Customers",         color: "bg-teal-100 text-teal-700" },
  { key: "email-subscriber",label: "Email Subscribers",            color: "bg-pink-100 text-pink-700" },
];

type ImportResult = {
  imported:  number;
  merged:    number;
  skipped:   number;
  total:     number;
};

export default function ImportCustomersPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<ImportResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [dragging,  setDragging]  = useState(false);
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
      const res  = await fetch("/api/admin/import/customers", { method: "POST", body: form });
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
        title="Import Customers"
        breadcrumbs={[{ label: "Admin" }, { label: "Settings" }, { label: "Import" }, { label: "Customers" }]}
        user={{ name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6 space-y-6 max-w-3xl">

        {/* Header info */}
        <div className="bg-blue-50 border border-blue-200 rounded-[12px] p-4 flex gap-3">
          <Users size={18} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Shopify Customer Import</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Upload a JSON file exported from Shopify containing your customer list. Duplicate emails
              will be merged (keeping the record with more orders). Customers will <strong>not</strong> receive
              login credentials — they will need to register fresh on the site.
            </p>
          </div>
        </div>

        {/* Segment mapping info */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
          <p className="text-sm font-semibold text-[#0C0D0F] mb-3">Automatic Segment Detection</p>
          <p className="text-xs text-[#55575A] mb-3">Customers are automatically assigned to segments based on their Shopify tags:</p>
          <div className="flex flex-wrap gap-2">
            {SEGMENTS.map((s) => (
              <span key={s.key} className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                {s.label}
              </span>
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

        {/* Import button */}
        <button
          disabled={!file || loading}
          onClick={handleImport}
          className="flex items-center gap-2 px-6 py-3 rounded-[10px] bg-[#0C0D0F] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0C0D0F]/80 transition-colors"
        >
          <Upload size={16} />
          {loading ? "Importing…" : "Start Import"}
        </button>

        {/* Result summary */}
        {result && (
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-green-600" />
              <p className="font-semibold text-[#0C0D0F]">Import Complete</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Successfully imported",   value: result.imported,  color: "text-green-600" },
                { label: "Duplicates merged",        value: result.merged,   color: "text-blue-600"  },
                { label: "Skipped (no email)",       value: result.skipped,  color: "text-orange-600"},
                { label: "Total in database",        value: result.total,    color: "text-[#0C0D0F]" },
              ].map((s) => (
                <div key={s.label} className="bg-[#F9F9F9] rounded-[8px] p-3">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                  <p className="text-xs text-[#55575A] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
