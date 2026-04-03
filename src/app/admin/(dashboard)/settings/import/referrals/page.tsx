"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Info } from "lucide-react";

type ImportResult = {
  imported: number;
  skipped: number;
  errors: number;
  total: number;
};

export default function ImportReferralsPage() {
  const [csvText, setCsvText] = useState("");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      setError("Please upload a .csv file");
      return;
    }
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setCsvText((e.target?.result as string) ?? "");
    reader.readAsText(file);
    setResult(null);
    setError("");
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (!csvText.trim()) { setError("No CSV loaded"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/referral-members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, filename }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const csvLines = csvText.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading text-heading text-2xl font-bold flex items-center gap-2">
          <Upload size={22} />
          Import Referral Members
        </h1>
        <p className="text-body-muted text-sm mt-1">
          Upload a CSV file to import existing referral program members. New referral codes will be generated for each member.
        </p>
      </div>

      {/* Expected format */}
      <div className="bg-blue-50 border border-blue-200 rounded-card p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-2">Expected CSV columns</p>
            <code className="text-xs text-blue-700 block">
              Created Date, First Name, Last Name, Email, Phone Number, Status, Url
            </code>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>· Only rows with <strong>Status: ENABLED</strong> will be imported</li>
              <li>· Duplicates by email are skipped</li>
              <li>· New unique referral codes are generated for each member</li>
              <li>· The old Shopjar URL is stored as a legacy reference</li>
              <li>· Members matching an existing customer email will be automatically linked</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-4 ${dragOver ? "border-brand-red bg-brand-pink-soft" : "border-border hover:border-brand-red/50"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {csvText ? (
          <div>
            <FileText size={32} className="mx-auto mb-3 text-brand-red" />
            <p className="font-semibold text-heading">{filename}</p>
            <p className="text-body-muted text-sm mt-1">{csvLines - 1} data rows detected</p>
            <p className="text-xs text-body-muted mt-2">Click to replace file</p>
          </div>
        ) : (
          <div>
            <Upload size={32} className="mx-auto mb-3 text-body-muted" />
            <p className="font-semibold text-heading mb-1">Drop your CSV file here</p>
            <p className="text-body-muted text-sm">or click to browse</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-card">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-emerald-600" />
            <p className="font-semibold text-emerald-800">Import complete</p>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: "Total rows", value: result.total },
              { label: "Imported", value: result.imported, green: true },
              { label: "Skipped", value: result.skipped },
              { label: "Errors", value: result.errors, red: result.errors > 0 },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-card p-3">
                <p className={`text-2xl font-bold font-heading ${s.green ? "text-emerald-600" : s.red ? "text-red-600" : "text-heading"}`}>{s.value}</p>
                <p className="text-xs text-body-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!csvText || loading}
        className="w-full bg-brand-red text-white font-heading font-bold py-3.5 rounded-pill hover:bg-brand-red-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {loading ? "Importing…" : "Import Referral Members"}
      </button>
    </div>
  );
}
