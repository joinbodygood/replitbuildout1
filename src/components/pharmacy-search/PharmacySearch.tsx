"use client";

import { useState, useCallback } from "react";

export interface PharmacyResult {
  npi: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string;
}

export interface PharmacySelection {
  pharmacy_name: string;
  pharmacy_zip: string;
  pharmacy_phone?: string;
  pharmacy_npi?: string;
  pharmacy_address?: string;
  pharmacy_fax?: string;
}

interface PharmacySearchProps {
  onSelect: (pharmacy: PharmacySelection) => void;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="11" fill="currentColor" />
      <path
        d="M6.5 11.5L9.5 14.5L15.5 8.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PharmacyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 21V7l9-4 9 4v14H3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="9" y="11" width="6" height="1.5" rx="0.5" fill="currentColor" />
      <rect x="11.25" y="9" width="1.5" height="6" rx="0.5" fill="currentColor" />
      <path
        d="M9 17h6v4H9v-4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="#E5E5E5" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#ED1B1B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PharmacySearch({ onSelect }: PharmacySearchProps) {
  const [zip, setZip] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [results, setResults] = useState<PharmacyResult[]>([]);
  const [selected, setSelected] = useState<PharmacyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmedZip = zip.trim();
    if (!/^\d{5}$/.test(trimmedZip)) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSelected(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({ zip: trimmedZip });
      if (pharmacyName.trim()) {
        params.set("name", pharmacyName.trim());
      }

      const res = await fetch(`/api/pharmacy-search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResults(data.pharmacies ?? []);
    } catch {
      setError("Unable to reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [zip, pharmacyName]);

  const handleConfirm = useCallback(() => {
    if (!selected) return;

    onSelect({
      pharmacy_name: selected.name,
      pharmacy_zip: selected.zip,
      pharmacy_phone: selected.phone,
      pharmacy_npi: selected.npi,
      pharmacy_address: `${selected.address}, ${selected.city}, ${selected.state} ${selected.zip}`,
      pharmacy_fax: selected.fax,
    });
  }, [selected, onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full">
      <h3 className="font-semibold text-lg text-gray-900 mb-1">Find Your Pharmacy</h3>
      <p className="text-sm text-gray-500 mb-4">
        Enter your zip code to see nearby pharmacies, or add a pharmacy name to narrow it down.
        Your prescription will be sent there for pickup.
      </p>

      {/* Search inputs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          value={pharmacyName}
          onChange={(e) => setPharmacyName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pharmacy name (optional)"
          aria-label="Pharmacy name"
          className="flex-1 h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          onKeyDown={handleKeyDown}
          placeholder="Zip code *"
          aria-label="Zip code"
          className="w-full sm:w-32 h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="h-11 px-5 rounded-lg bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <SearchIcon className="shrink-0" />
          <span>Search</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <SpinnerIcon />
          <p className="text-sm text-gray-500">Searching pharmacies...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-5">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && searched && results.length === 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-8 text-center mb-5">
          <PharmacyIcon className="mx-auto mb-3 text-blue-500" />
          <p className="text-sm font-semibold text-gray-900 mb-1">No pharmacies found</p>
          <p className="text-sm text-gray-500">
            Try a different zip code or check for typos.
          </p>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {results.map((pharmacy) => {
            const isSelected = selected?.npi === pharmacy.npi;
            return (
              <button
                key={pharmacy.npi}
                type="button"
                onClick={() => setSelected(pharmacy)}
                aria-pressed={isSelected}
                className={`relative w-full text-left rounded-xl border-2 p-4 transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 text-blue-500">
                    <CheckIcon />
                  </span>
                )}
                <div className="flex items-start gap-3 mb-2">
                  <span className="shrink-0 mt-0.5 text-blue-500">
                    <PharmacyIcon />
                  </span>
                  <span className="font-semibold text-sm text-gray-900 leading-snug pr-6">
                    {pharmacy.name}
                  </span>
                </div>
                <div className="pl-9 space-y-0.5">
                  <p className="text-xs text-gray-500">
                    {pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.zip}
                  </p>
                  {pharmacy.phone && (
                    <p className="text-xs text-gray-500">Phone: {pharmacy.phone}</p>
                  )}
                  {pharmacy.fax && (
                    <p className="text-xs text-gray-500">Fax: {pharmacy.fax}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">NPI: {pharmacy.npi}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Confirm CTA */}
      {selected && !loading && (
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full h-12 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
        >
          Confirm Pharmacy
        </button>
      )}
    </div>
  );
}
