"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Creative } from "@/lib/types";
import { useCreativeStore } from "@/lib/store/creative-store";

export default function Home() {
  const creatives = useCreativeStore((state) => state.creatives);
  const filters = useCreativeStore((state) => state.filters);
  const setFilter = useCreativeStore((state) => state.setFilter);
  const clearFilters = useCreativeStore((state) => state.clearFilters);

  const filtered = useMemo(() => {
    return creatives.filter((item) => {
      const matchProduct = !filters.product || item.product === filters.product;
      const matchMonth = !filters.month || item.month === filters.month;
      const matchStatus = !filters.status || item.status === filters.status;
      return matchProduct && matchMonth && matchStatus;
    });
  }, [creatives, filters]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const roasByMonth = useMemo(() => buildRoasByMonth(filtered), [filtered]);
  const budgetByProduct = useMemo(
    () => buildBudgetByProduct(filtered),
    [filtered],
  );
  const topCreativesRoas = useMemo(
    () => [...filtered].sort((a, b) => b.roas - a.roas).slice(0, 5),
    [filtered],
  );
  const topCreatorsByConversions = useMemo(
    () => buildTopCreatorsByConversions(filtered),
    [filtered],
  );

  const products = Array.from(new Set(creatives.map((c) => c.product)));
  const months = Array.from(new Set(creatives.map((c) => c.month)));
  const statuses = Array.from(new Set(creatives.map((c) => c.status)));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.12em] text-slate-500">
          Overview
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Performance globale des créas
        </h1>
        <div className="grid gap-3 md:grid-cols-3">
          <FilterSelect
            label="Produit"
            value={filters.product ?? "all"}
            onChange={(val) => setFilter("product", val === "all" ? undefined : val)}
            options={products}
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              clearFilters();
            }}
          >
            Réinitialiser
          </Button>
          <Button>Exporter</Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Budget dépensé" value={`${kpis.budget.toLocaleString("fr-FR")} €`} />
        <StatCard label="Conversions" value={kpis.conversions.toLocaleString("fr-FR")} />
        <StatCard label="ROAS moyen" value={kpis.avgRoas.toFixed(2)} />
        <StatCard label="Coût par conversion" value={`${kpis.avgCpa.toFixed(2)} €`} />
        <StatCard label="Revenu total" value={`${kpis.revenue.toLocaleString("fr-FR")} €`} />
        <StatCard label="Nombre de créas" value={kpis.count.toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ROAS par mois</CardTitle>
            <CardDescription>Barres: ROAS moyen par mois</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {roasByMonth.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roasByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="roas" fill="#2563eb" name="ROAS moyen" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget par produit</CardTitle>
            <CardDescription>Répartition du budget dépensé</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {budgetByProduct.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    dataKey="budget"
                    data={budgetByProduct}
                    nameKey="product"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#10b981"
                    label
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 créas par ROAS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCreativesRoas.length ? (
              topCreativesRoas.map((creative) => (
                <RankingRow
                  key={creative.id}
                  title={`${creative.id} · ${creative.product}`}
                  subtitle={creative.contentType}
                  metric={`${creative.roas.toFixed(2)} ROAS`}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 créateurs par conversions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCreatorsByConversions.length ? (
              topCreatorsByConversions.map((item) => (
                <RankingRow
                  key={item.creator}
                  title={item.creator}
                  subtitle={`${item.count} créa(s)`}
                  metric={`${item.conversions.toLocaleString("fr-FR")} conv.`}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>
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
        onChange={(e) => onChange(e.target.value as FilterValue)}
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-xs uppercase tracking-[0.08em]">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function RankingRow({
  title,
  subtitle,
  metric,
}: {
  title: string;
  subtitle?: string;
  metric: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {subtitle ? (
          <p className="text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <p className="text-sm font-semibold text-slate-900">{metric}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Pas de données pour ces filtres.
    </div>
  );
}

function computeKpis(data: Creative[]) {
  const base = {
    budget: 0,
    conversions: 0,
    avgRoas: 0,
    avgCpa: 0,
    revenue: 0,
    count: data.length,
  };
  if (!data.length) return base;

  const totals = data.reduce(
    (acc, item) => {
      acc.budget += item.budgetSpent;
      acc.conversions += item.conversions;
      acc.roas += item.roas;
      acc.cpa += item.cpa;
      acc.revenue += item.estimatedRevenue;
      return acc;
    },
    { budget: 0, conversions: 0, roas: 0, cpa: 0, revenue: 0 },
  );

  return {
    budget: totals.budget,
    conversions: totals.conversions,
    avgRoas: totals.roas / data.length,
    avgCpa: totals.cpa / data.length,
    revenue: totals.revenue,
    count: data.length,
  };
}

function buildRoasByMonth(data: Creative[]) {
  const map = new Map<string, { roasTotal: number; count: number }>();
  data.forEach((item) => {
    const current = map.get(item.month) ?? { roasTotal: 0, count: 0 };
    current.roasTotal += item.roas;
    current.count += 1;
    map.set(item.month, current);
  });

  return Array.from(map.entries()).map(([month, entry]) => ({
    month,
    roas: entry.roasTotal / entry.count,
  }));
}

function buildBudgetByProduct(data: Creative[]) {
  const map = new Map<string, number>();
  data.forEach((item) => {
    map.set(item.product, (map.get(item.product) ?? 0) + item.budgetSpent);
  });
  return Array.from(map.entries()).map(([product, budget]) => ({
    product,
    budget,
  }));
}

function buildTopCreatorsByConversions(data: Creative[]) {
  const map = new Map<string, { conversions: number; count: number }>();
  data.forEach((item) => {
    const current = map.get(item.creator) ?? { conversions: 0, count: 0 };
    current.conversions += item.conversions;
    current.count += 1;
    map.set(item.creator, current);
  });

  return Array.from(map.entries())
    .map(([creator, values]) => ({
      creator,
      conversions: values.conversions,
      count: values.count,
    }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5);
}
