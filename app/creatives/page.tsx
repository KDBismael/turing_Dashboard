"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Creative } from "@/lib/types";
import { useCreativeStore } from "@/lib/store/creative-store";
import { parseCsvFile } from "@/lib/csv-parser";

type SortKey =
  | "id"
  | "product"
  | "creator"
  | "contentType"
  | "month"
  | "status"
  | "budgetSpent"
  | "conversions"
  | "roas"
  | "cpa";

type SortState = { key: SortKey; direction: "asc" | "desc" };

export default function CreativesPage() {
  const router = useRouter();
  const creatives = useCreativeStore((state) => state.creatives);
  const filters = useCreativeStore((state) => state.filters);
  const setFilter = useCreativeStore((state) => state.setFilter);
  const clearFilters = useCreativeStore((state) => state.clearFilters);
  const setCreatives = useCreativeStore((state) => state.setCreatives);
  const [sort, setSort] = useState<SortState>({ key: "roas", direction: "desc" });
  const [showImport, setShowImport] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    return creatives.filter((item) => {
      const matchProduct = !filters.product || item.product === filters.product;
      const matchCreator = !filters.creator || item.creator === filters.creator;
      const matchType =
        !filters.contentType || item.contentType === filters.contentType;
      const matchMonth = !filters.month || item.month === filters.month;
      const matchStatus = !filters.status || item.status === filters.status;
      const query = (filters.search ?? "").trim().toLowerCase();
      const matchSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.product.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query);
      return matchProduct && matchCreator && matchType && matchMonth && matchStatus && matchSearch;
    });
  }, [creatives, filters]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    items.sort((a, b) => compareBy(a, b, sort));
    return items;
  }, [filtered, sort]);

  const products = Array.from(new Set(creatives.map((c) => c.product)));
  const creators = Array.from(new Set(creatives.map((c) => c.creator)));
  const types = Array.from(new Set(creatives.map((c) => c.contentType)));
  const months = Array.from(new Set(creatives.map((c) => c.month)));
  const statuses = Array.from(new Set(creatives.map((c) => c.status)));

  const reset = () => {
    clearFilters();
    setSort({ key: "roas", direction: "desc" });
    setError(null);
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleImport = async () => {
    setError(null);
    if (!file) {
      setError("Sélectionnez un CSV.");
      return;
    }
    try {
      setUploading(true);
      const parsed = await parseCsvFile(file);
      if (!parsed.length) {
        setError("Aucune ligne valide trouvée.");
        return;
      }
      setCreatives(parsed);
      clearFilters();
      setShowImport(false);
      setFile(null);
    } catch (err) {
      setError("Échec du parsing du CSV.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">
            Créations
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tableau des créas
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={reset}>
            Réinitialiser
          </Button>
          <Button onClick={() => setShowImport(true)}>Nouveau rapport</Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            <FilterSelect
              label="Produit"
              value={filters.product ?? "all"}
              onChange={(val) => setFilter("product", val === "all" ? undefined : val)}
              options={products}
            />
            <FilterSelect
              label="Créateur"
              value={filters.creator ?? "all"}
              onChange={(val) => setFilter("creator", val === "all" ? undefined : val)}
              options={creators}
            />
            <FilterSelect
              label="Type"
              value={filters.contentType ?? "all"}
              onChange={(val) =>
                setFilter("contentType", val === "all" ? undefined : val)
              }
              options={types}
            />
            <FilterSelect
              label="Mois"
              value={filters.month ?? "all"}
              onChange={(val) => setFilter("month", val === "all" ? undefined : val)}
              options={months}
            />
            <FilterSelect
              label="Statut"
              value={filters.status ?? "all"}
              onChange={(val) => setFilter("status", val === "all" ? undefined : val)}
              options={statuses}
            />
          </div>
          <input
            value={filters.search ?? ""}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Recherche par ID, produit, créateur..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des créations</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th
                  onClick={() => toggleSort("id")}
                  sorted={sort.key === "id"}
                  direction={sort.direction}
                >
                  Nom de l&apos;annonce
                </Th>
                <Th
                  onClick={() => toggleSort("product")}
                  sorted={sort.key === "product"}
                  direction={sort.direction}
                >
                  Produit
                </Th>
                <Th
                  onClick={() => toggleSort("creator")}
                  sorted={sort.key === "creator"}
                  direction={sort.direction}
                >
                  Créateur
                </Th>
                <Th
                  onClick={() => toggleSort("contentType")}
                  sorted={sort.key === "contentType"}
                  direction={sort.direction}
                >
                  Type
                </Th>
                <Th
                  onClick={() => toggleSort("month")}
                  sorted={sort.key === "month"}
                  direction={sort.direction}
                >
                  Mois
                </Th>
                <Th
                  onClick={() => toggleSort("status")}
                  sorted={sort.key === "status"}
                  direction={sort.direction}
                >
                  Statut
                </Th>
                <Th
                  onClick={() => toggleSort("budgetSpent")}
                  sorted={sort.key === "budgetSpent"}
                  direction={sort.direction}
                >
                  Budget (€)
                </Th>
                <Th
                  onClick={() => toggleSort("conversions")}
                  sorted={sort.key === "conversions"}
                  direction={sort.direction}
                >
                  Conversions
                </Th>
                <Th
                  onClick={() => toggleSort("roas")}
                  sorted={sort.key === "roas"}
                  direction={sort.direction}
                >
                  ROAS
                </Th>
                <Th
                  onClick={() => toggleSort("cpa")}
                  sorted={sort.key === "cpa"}
                  direction={sort.direction}
                >
                  Coût par conversion (€)
                </Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sorted.length ? (
                sorted.map((creative) => {
                  const href = `/creatives/${creative.id}`;
                  return (
                    <tr
                      key={creative.id}
                      className="cursor-pointer hover:bg-slate-50/70 focus-within:bg-slate-50/70"
                      onClick={() => router.push(href)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(href);
                      }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Voir ${creative.id}`}
                    >
                      <Td className="font-medium text-slate-900">
                        <Link href={href} className="hover:underline">
                          {creative.id}
                        </Link>
                      </Td>
                      <Td>{creative.product}</Td>
                      <Td>{creative.creator}</Td>
                      <Td>{creative.contentType}</Td>
                      <Td>{creative.month}</Td>
                      <Td>{creative.status}</Td>
                      <Td>{creative.budgetSpent.toLocaleString("fr-FR")}</Td>
                      <Td>{creative.conversions.toLocaleString("fr-FR")}</Td>
                      <Td className="font-semibold text-green-600">
                        {creative.roas.toFixed(2)}
                      </Td>
                      <Td>{creative.cpa.toFixed(2)}</Td>
                      <Td className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={href}>Voir</Link>
                        </Button>
                      </Td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    Aucune créa pour ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {showImport ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.12em] text-slate-500">
                  Nouveau rapport
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Importer un CSV
                </h2>
                <p className="text-sm text-slate-600">
                  Sélectionne un fichier CSV pour analyser de nouvelles créas.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setShowImport(false)}>
                Fermer
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowImport(false)}>
                  Annuler
                </Button>
                <Button onClick={handleImport} disabled={uploading}>
                  {uploading ? "Import..." : "Analyser"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="all">Tous</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Th({
  children,
  onClick,
  sorted,
  direction,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sorted?: boolean;
  direction?: "asc" | "desc";
}) {
  return (
    <th
      className="select-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500"
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {children}
        {sorted ? <span>{direction === "asc" ? "↑" : "↓"}</span> : null}
      </div>
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-3 text-slate-700 ${className ?? ""}`}>{children}</td>
  );
}

function compareBy(a: Creative, b: Creative, sort: SortState) {
  const dir = sort.direction === "asc" ? 1 : -1;
  const key = sort.key;
  const av = a[key];
  const bv = b[key];
  if (typeof av === "number" && typeof bv === "number") {
    return av > bv ? dir : av < bv ? -dir : 0;
  }
  return String(av).localeCompare(String(bv)) * dir;
}
