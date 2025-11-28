"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreativeStore } from "@/lib/store/creative-store";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function CreativeDetailPage() {
  const params = useParams();
  const creaId = params.id as string;
  const creatives = useCreativeStore((state) => state.creatives);
  const creative = useMemo(() => {
    return creatives.find(
      (item) => item.id.toLowerCase() === creaId.toLowerCase(),
    );
  }, [creatives, params.id]);

  if (!creatives.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Aucune donnée chargée
        </h1>
        <p className="text-sm text-slate-600">
          Importez un CSV pour voir le détail d&apos;une création.
        </p>
        <Button asChild>
          <Link href="/creatives">Aller au tableau</Link>
        </Button>
      </div>
    );
  }
  console.log("Creative detail page for ID:", params.id);
  if (!creative) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Création introuvable
        </h1>
        <p className="text-sm text-slate-600">
          Charge un CSV contenant cette créa ou choisis une ligne dans le tableau.
        </p>
        <Button asChild>
          <Link href="/creatives">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const metrics = [
    { label: "Budget dépensé (€)", value: creative.budgetSpent.toLocaleString("fr-FR") },
    { label: "Conversions", value: creative.conversions.toLocaleString("fr-FR") },
    { label: "ROAS", value: creative.roas.toFixed(2) },
    { label: "Coût par conversion (€)", value: creative.cpa.toFixed(2) },
    { label: "Revenu estimé (€)", value: creative.estimatedRevenue.toLocaleString("fr-FR") },
    { label: "Impressions", value: creative.impressions.toLocaleString("fr-FR") },
    { label: "Clics", value: creative.clicks.toLocaleString("fr-FR") },
    { label: "Taux de clic (%)", value: creative.ctr.toFixed(2) },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">
            Création
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {creative.id}
          </h1>
          <p className="text-sm text-slate-600">
            {creative.product} · {creative.creator}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href="/creatives">Retour</Link>
          </Button>
          <Button asChild>
            <Link href="/">Dashboard</Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Détails</CardTitle>
          <CardDescription>
            Synthèse des indicateurs clés pour cette création.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-slate-100 p-3"
            >
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
                {metric.label}
              </p>
              <p className="text-xl font-semibold text-slate-900">
                {metric.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {creative.previewLink ? (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
            <CardDescription>
              Prévisualisation intégrée du lien. Ouvre dans un nouvel onglet si non
              compatible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative w-full overflow-hidden rounded-lg border border-slate-200" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={creative.previewLink}
                title={`Aperçu ${creative.id}`}
                className="absolute left-0 top-0 h-full w-full"
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
            <Button asChild variant="secondary">
              <Link href={creative.previewLink} target="_blank" rel="noreferrer">
                Ouvrir dans un nouvel onglet
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Méta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Info label="Type de contenu" value={creative.contentType} />
          <Info label="Angle marketing" value={creative.angle} />
          <Info label="Hook" value={creative.hook} />
          <Info label="Mois" value={creative.month} />
          <Info label="Statut" value={creative.status} />
          <Info label="Date de lancement" value={creative.launchDate ?? "N/A"} />
          {creative.previewLink ? (
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
                Lien aperçu
              </p>
              <Link
                href={creative.previewLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 underline"
              >
                Ouvrir l&apos;aperçu
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
