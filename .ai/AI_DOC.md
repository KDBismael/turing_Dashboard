# Turing Data Insights Dashboard – AI Project Context

This document defines the **exact specs** that the coding assistant (Codex/Copilot) must follow when generating code for this project.

The goal is to build a **dashboard** that helps users find insights in their ad performance data stored in a CSV file (`AG1-Data.csv`).

---

## 1. Tech Stack & Constraints

- **Framework**: Next.js 14+ with App Router (`app/` directory).
- **Language**: TypeScript everywhere (strict types).
- **UI library**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS.
- **State management**: Zustand.
- **Charts**: Use `recharts` (or another simple React chart lib, but prefer `recharts`).
- **Data source**: Local CSV file `data/AG1-Data.csv` read on the **server** with Node `fs`.
- **Routing**:
  - `/` → Overview dashboard.
  - `/creatives` → Creatives table.
  - `/creatives/[id]` → Single creative detail page.

Non-goals:

- No authentication.
- No real DB (data only from CSV).
- No complex form CRUD; this is read-only analytics.

---

## 2. Data Source & Types

The entire app is driven by one CSV file:

- Path: `data/AG1-Data.csv`.
- Each row represents **one creative (ad)**.

The CSV will have **French headers** (or similar). We normalize them to an internal TypeScript type called `Creative`.

Expected semantic fields (column header names can vary slightly, so mapping is allowed):

- `Nom de l'annonce` → `id` (string, unique identifier)
- `Produit` → `product` (string)
- `Créateur` → `creator` (string)
- `Type de contenu` → `contentType` (string)
- `Angle` or `Angle marketing` → `angle` (string)
- `Hook` → `hook` (string)
- `Mois` → `month` (string or `"YYYY-MM"`; treat as string)
- `Statut` → `status` (string, e.g. "active", "paused", etc.)
- `Budget dépensé (€)` → `budgetSpent` (number)
- `Conversions (achats)` → `conversions` (number)
- `Revenu estimé (€)` → `estimatedRevenue` (number)
- `ROAS` → `roas` (number)
- `Coût par conversion (€)` → `cpa` (number)
- `Impressions` → `impressions` (number)
- `Clics` → `clicks` (number)
- `Taux de clic (%)` → `ctr` (number; can be treated as percent, e.g. 2.5 for 2.5%)
- `Date de lancement` (if present) → `launchDate` (string, ISO or raw)

> IMPORTANT FOR THE AI:  
> - When reading the CSV, map the **actual header names** to the fields of the `Creative` interface below.  
> - If some headers are missing, treat the fields as optional.

### 2.1 TypeScript data model

```ts
export type Creative = {
  id: string;                // Nom de l'annonce (unique per row)
  product: string;           // Produit
  creator: string;           // Créateur
  contentType: string;       // Type de contenu
  angle: string;             // Angle marketing
  hook: string;              // Hook
  month: string;             // Mois (e.g. "2024-01" or "Janvier 2024")
  status: string;            // Statut (e.g. "actif", "en pause", etc.)

  budgetSpent: number;       // Budget dépensé (€)
  conversions: number;       // Conversions (achats)
  estimatedRevenue: number;  // Revenu estimé (€)
  roas: number;              // ROAS
  cpa: number;               // Coût par conversion (€)

  impressions: number;       // Impressions
  clicks: number;            // Clics
  ctr: number;               // Taux de clic (%)

  launchDate?: string;       // Date de lancement (optional)
};
