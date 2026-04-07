"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/translations";

// ---- Types ----

export type MapFilters = {
  search: string;
  distrito: string;
  f11: boolean;
  f7: boolean;
  futsal: boolean;
  dinner: boolean;
};

export const DEFAULT_FILTERS: MapFilters = {
  search: "",
  distrito: "",
  f11: false,
  f7: false,
  futsal: false,
  dinner: false,
};

// ---- i18n labels ----

const i18n: Record<string, Record<Locale, string>> = {
  search: {
    pt: "Pesquisar equipa ou local...",
    br: "Pesquisar time ou local...",
    es: "Buscar equipo o lugar...",
    en: "Search team or location...",
  },
  allDistricts: {
    pt: "Todos os distritos",
    br: "Todos os estados",
    es: "Todas las provincias",
    en: "All districts",
  },
  dinner: {
    pt: "Jantar 3.ª Parte",
    br: "Jantar 3.ª Parte",
    es: "Cena 3.ª Parte",
    en: "Post-Match Dinner",
  },
  clear: {
    pt: "Limpar filtros",
    br: "Limpar filtros",
    es: "Limpiar filtros",
    en: "Clear filters",
  },
  showing: {
    pt: "A mostrar",
    br: "Mostrando",
    es: "Mostrando",
    en: "Showing",
  },
  of: {
    pt: "de",
    br: "de",
    es: "de",
    en: "of",
  },
};

function l(key: string, locale: Locale) {
  return i18n[key]?.[locale] ?? i18n[key]?.pt ?? key;
}

// ---- Districts ----

const DISTRICTS = [
  "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco",
  "Coimbra", "Évora", "Faro", "Guarda", "Leiria",
  "Lisboa", "Portalegre", "Porto", "Santarém", "Setúbal",
  "Viana do Castelo", "Vila Real", "Viseu",
  "Açores", "Madeira", "Internacional",
];

// ---- Component ----

export function MapFiltersBar({
  filters,
  onChange,
  total,
  showing,
  locale,
}: {
  filters: MapFilters;
  onChange: (f: MapFilters) => void;
  total: number;
  showing: number;
  locale: Locale;
}) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange({ ...filters, search: value });
      }, 300);
    },
    [filters, onChange],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasFilters =
    filters.search !== "" ||
    filters.distrito !== "" ||
    filters.f11 ||
    filters.f7 ||
    filters.futsal ||
    filters.dinner;

  const clearAll = () => {
    setLocalSearch("");
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="mb-3 rounded-lg border bg-card p-3 space-y-3">
      {/* Row 1: search + district */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            debouncedSearch(e.target.value);
          }}
          placeholder={l("search", locale)}
          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          value={filters.distrito}
          onChange={(e) => onChange({ ...filters, distrito: e.target.value })}
          className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">{l("allDistricts", locale)}</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: checkboxes + clear + counter */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.f11}
            onChange={(e) => onChange({ ...filters, f11: e.target.checked })}
            className="accent-green-700"
          />
          F11
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.f7}
            onChange={(e) => onChange({ ...filters, f7: e.target.checked })}
            className="accent-blue-700"
          />
          F7
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.futsal}
            onChange={(e) => onChange({ ...filters, futsal: e.target.checked })}
            className="accent-purple-700"
          />
          Futsal
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.dinner}
            onChange={(e) => onChange({ ...filters, dinner: e.target.checked })}
            className="accent-amber-600"
          />
          {l("dinner", locale)}
        </label>

        {hasFilters && (
          <button
            onClick={clearAll}
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {l("clear", locale)}
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
          {l("showing", locale)} {showing} {l("of", locale)} {total}
        </span>
      </div>
    </div>
  );
}
