"use client";

import { useCallback, useEffect, useState } from "react";
import { Info } from "lucide-react";

import { Drawer } from "@/core/layout/Drawer";
import { PageHeader, PageSection } from "@/core/layout/PageLayout";

import type {
  ThreatIntelRepository,
  TiDecisionDetail as Detail,
  TiSummaryResponse,
} from "../domain/threat-intel";

import { INFERRED_WARNING } from "../application/threat-intel";

import { TiSidebar } from "./components/TiSidebar";
import { TiStatusBanner } from "./components/TiStatusBanner";
import { TiSummaryPanel } from "./components/TiSummaryPanel";
import { TiDecisionTable } from "./components/TiDecisionTable";
import { TiDecisionDetail } from "./components/TiDecisionDetail";
import { CveSearch } from "./components/CveSearch";

interface Props {
  /** null sin NEXT_PUBLIC_API_URL: esta sección no tiene datos de demostración. */
  repository: ThreatIntelRepository | null;
}

/** Sección "Inteligencia de amenazas": todo lo que expone la API de Lyft, vía Argus_Backend. */
export function ThreatIntelView({ repository }: Props) {
  const [data, setData] = useState<TiSummaryResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(repository));
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!repository) return;
    let active = true;

    repository
      .summary()
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el resumen.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [repository, reloadKey]);

  const loadDecisions = useCallback(
    (...args: Parameters<ThreatIntelRepository["decisions"]>) => {
      if (!repository) return Promise.reject(new Error("Sin backend."));
      return repository.decisions(...args);
    },
    [repository],
  );

  const select = useCallback(
    (itemId: string, componentId: string) => {
      if (!repository) return;
      setSelectedKey(`${itemId}|${componentId}`);
      setDetail(null);
      setDetailError("");
      repository
        .decision(itemId, componentId)
        .then(setDetail)
        .catch((reason: unknown) =>
          setDetailError(reason instanceof Error ? reason.message : "No se pudo cargar el detalle."),
        );
    },
    [repository],
  );

  const summary = data?.summary ?? null;

  return (
    <div className="min-h-dvh bg-slate-50 lg:pl-64">
      <TiSidebar />

      <main className="mx-auto max-w-[1500px] space-y-10 px-4 py-8 sm:px-7 lg:px-10">
        <PageHeader
          eyebrow="API de inteligencia de amenazas de Lyft"
          title="Inteligencia de amenazas"
          description="Qué CVE podrían afectar a los componentes que usa Lyft, con la decisión de parcheo (tier) del modelo de Lyft. Es contexto: no cambia la prioridad que Argus asigna a sus hallazgos."
        >
          <p className="mt-4 flex max-w-4xl gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
            <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              {INFERRED_WARNING} Que no haya coincidencias no significa que Lyft esté a salvo.
            </span>
          </p>

          {repository && data ? (
            <TiStatusBanner
              status={data.status}
              sync={() => repository.sync()}
              onSynced={() => setReloadKey((k) => k + 1)}
            />
          ) : null}
        </PageHeader>

        {!repository ? (
          <p className="dashboard-card text-sm text-muted">
            Esta sección necesita el backend de Argus (NEXT_PUBLIC_API_URL). No tiene datos de demostración.
          </p>
        ) : loading ? (
          <p role="status" className="text-sm text-muted">Cargando inteligencia de amenazas…</p>
        ) : error ? (
          <div className="dashboard-card">
            <p role="alert" className="text-sm text-rose-800">{error}</p>
            <button type="button" className="btn btn-secondary mt-3" onClick={() => setReloadKey((k) => k + 1)}>
              Reintentar
            </button>
          </div>
        ) : data ? (
          <>
            {summary ? (
              <>
                <PageSection
                  id="resumen"
                  index={1}
                  title="Resumen"
                  description="Totales del feed de Lyft, decisiones por tier y las más urgentes."
                >
                  <TiSummaryPanel summary={summary} onSelect={select} />
                </PageSection>

                <PageSection
                  id="decisiones"
                  index={2}
                  title="Decisiones de Lyft"
                  description="Cada fila es un par (CVE, componente del inventario inferido). Un tier más urgente siempre va antes, aunque su score sea menor. Haz clic en una fila para ver el detalle."
                >
                  <TiDecisionTable
                    load={loadDecisions}
                    labels={summary.tier_labels}
                    selectedKey={selectedKey}
                    onSelect={select}
                    reloadKey={reloadKey}
                  />
                </PageSection>
              </>
            ) : (
              <p className="dashboard-card text-sm text-muted">
                Todavía no hay una copia de los datos de Lyft. El backend la descarga poco después de arrancar;
                también puedes usar &quot;Buscar datos nuevos&quot;.
              </p>
            )}

            <PageSection
              id="buscar-cve"
              index={summary ? 3 : 1}
              title="Buscar CVE"
              description="Consulta un CVE puntual, aunque no esté en el feed."
            >
              <CveSearch lookup={(id) => repository.lookupCve(id)} />
            </PageSection>
          </>
        ) : null}
      </main>

      <Drawer
        open={selectedKey !== null}
        title="Detalle de la decisión"
        onClose={() => {
          setSelectedKey(null);
          setDetail(null);
          setDetailError("");
        }}
      >
        <div aria-live="polite">
          {detailError ? (
            <p role="alert" className="text-sm text-rose-800">{detailError}</p>
          ) : detail ? (
            <TiDecisionDetail decision={detail} />
          ) : (
            <p className="text-sm text-muted">Cargando…</p>
          )}
        </div>
      </Drawer>
    </div>
  );
}
