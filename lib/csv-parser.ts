"use client";

type PapaParseModule = typeof import("papaparse");
import { Creative } from "./types";

type Row = Record<string, any>;

const fieldMap: Record<keyof Creative, string[]> = {
  id: ["Nom de l'annonce", "Nom", "id"],
  product: ["Produit", "product"],
  creator: ["Créateur", "creator"],
  contentType: ["Type de contenu", "Type", "contentType"],
  angle: ["Angle marketing", "Angle", "angle"],
  hook: ["Hook", "Accroche", "hook"],
  month: ["Mois", "month"],
  status: ["Statut", "status"],
  budgetSpent: ["Budget dépensé (€)", "Budget", "budgetSpent"],
  conversions: ["Conversions (achats)", "Conversions", "conversions"],
  estimatedRevenue: ["Revenu estimé (€)", "Revenu", "estimatedRevenue"],
  roas: ["ROAS", "roas"],
  cpa: ["Coût par conversion (€)", "CPA", "cpa"],
  impressions: ["Impressions", "impressions"],
  clicks: ["Clics", "clicks"],
  ctr: ["Taux de clic (%)", "CTR", "ctr"],
  launchDate: ["Date de lancement", "launchDate"],
  previewLink: ["Lien aperçu", "Preview", "previewLink"],
};

export async function parseCsvFile(file: File): Promise<Creative[]> {
  const Papa = (await import("papaparse")).default;

  return new Promise((resolve, reject) => {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = Array.isArray(results.data) ? results.data : [];
          const sanitized = rows
            .map(sanitizeRow)
            .filter((item): item is Creative => Boolean(item));
          resolve(sanitized);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

function sanitizeRow(row: Row): Creative | null {
  if (!row) return null;

  const getString = (key: keyof Creative): string => {
    const value = pickValue(row, fieldMap[key]);
    if (value === undefined || value === null) return "";
    return String(value).trim();
  };

  const getNumber = (key: keyof Creative): number => {
    const value = pickValue(row, fieldMap[key]);
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const id = getString("id");
  const product = getString("product");
  if (!id || !product) return null;

  const strings = ["creator", "contentType", "angle", "hook", "month", "status"] as const;

  const sanitized: Creative = {
    id,
    product,
    creator: getString("creator"),
    contentType: getString("contentType"),
    angle: getString("angle"),
    hook: getString("hook"),
    month: getString("month"),
    status: getString("status"),
    budgetSpent: getNumber("budgetSpent"),
    conversions: getNumber("conversions"),
    estimatedRevenue: getNumber("estimatedRevenue"),
    roas: getNumber("roas"),
    cpa: getNumber("cpa"),
    impressions: getNumber("impressions"),
    clicks: getNumber("clicks"),
    ctr: getNumber("ctr"),
  };

  const launchDateRaw = pickValue(row, fieldMap.launchDate);
  sanitized.launchDate =
    launchDateRaw === undefined || launchDateRaw === null
      ? undefined
      : String(launchDateRaw).trim() || undefined;

  const previewRaw = pickValue(row, fieldMap.previewLink);
  sanitized.previewLink =
    previewRaw === undefined || previewRaw === null
      ? undefined
      : String(previewRaw).trim() || undefined;

  const isEmpty =
    strings.every((key) => sanitized[key] === "") &&
    sanitized.budgetSpent === 0 &&
    sanitized.conversions === 0 &&
    sanitized.estimatedRevenue === 0 &&
    sanitized.roas === 0 &&
    sanitized.cpa === 0 &&
    sanitized.impressions === 0 &&
    sanitized.clicks === 0 &&
    sanitized.ctr === 0 &&
    !sanitized.launchDate;

  return isEmpty ? null : sanitized;
}

function pickValue(row: Row, keys: string[]) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const value = row[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
  }
  return undefined;
}
