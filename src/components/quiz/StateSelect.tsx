"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Washington D.C.",
];

type StateSelectProps = {
  locale: string;
  onSelect: (state: string) => void;
};

export function StateSelect({ locale, onSelect }: StateSelectProps) {
  const isEs = locale === "es";
  const [search, setSearch] = useState("");

  const filtered = US_STATES.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-2 text-center">
        {isEs ? "¿En qué estado vives?" : "First things first — what state do you live in?"}
      </h2>
      <p className="text-body-muted text-center mb-6">
        {isEs
          ? "Necesitamos verificar que estamos disponibles en tu área."
          : "We need to verify we're available in your area."}
      </p>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-body-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isEs ? "Buscar estado..." : "Search state..."}
          className="w-full pl-9 pr-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors text-sm"
          autoFocus
        />
      </div>

      <div className="max-h-72 overflow-y-auto rounded-card border border-border divide-y divide-border">
        {filtered.length === 0 ? (
          <p className="text-body-muted text-sm text-center py-6">
            {isEs ? "No se encontraron resultados" : "No results found"}
          </p>
        ) : (
          filtered.map((state) => (
            <button
              key={state}
              onClick={() => onSelect(state)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-heading bg-surface hover:bg-brand-pink-soft hover:text-brand-red transition-colors"
            >
              {state}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
