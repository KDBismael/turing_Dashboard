"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreativeStore } from "@/lib/store/creative-store";
import { parseCsvFile } from "@/lib/csv-parser";

export function CsvUploadOverlay() {
  const creatives = useCreativeStore((state) => state.creatives);
  const setCreatives = useCreativeStore((state) => state.setCreatives);
  const clearFilters = useCreativeStore((state) => state.clearFilters);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (creatives.length > 0) {
    return null;
  }

  const handleUpload = async () => {
    setError(null);
    if (!file) {
      setError("Sélectionnez un fichier CSV.");
      return;
    }
    try {
      setLoading(true);
      const parsed = await parseCsvFile(file);
      if (!parsed.length) {
        setError("Aucune ligne valide trouvée dans ce CSV.");
        return;
      }
      setCreatives(parsed);
      clearFilters();
    } catch (err) {
      setError("Échec du parsing. Vérifiez le format du CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Importer votre CSV</CardTitle>
          <CardDescription>
            Chargez votre fichier pour afficher les KPIs et classements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Fichier CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFile(null)} disabled={loading}>
              Effacer
            </Button>
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? "Import..." : "Analyser"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
