"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  AgentStatus,
  FeedAdvisory,
  FeedImportResult,
  IngestResult,
  ScanConfig,
  ScanRun,
  StatusChange,
  Vulnerability,
} from "@/modules/vulnerabilities/domain/vulnerability";

import {
  useAppDispatch,
  useAppSelector,
} from "@/core/hooks";

import {
  resetFilters,
  updateFilters,
} from "@/modules/vulnerabilities/presentation/store/filters.slice";

import { VulnerabilityFilters } from "@/modules/vulnerabilities/presentation/components/VulnerabilityFilters";
import { VulnerabilityTable } from "@/modules/vulnerabilities/presentation/components/VulnerabilityTable";
import { MitigationPanel } from "@/modules/vulnerabilities/presentation/components/MitigationPanel";
import { NessusUpload } from "@/modules/vulnerabilities/presentation/components/NessusUpload";
import { NessusScanPanel } from "@/modules/vulnerabilities/presentation/components/NessusScanPanel";
import { ThreatFeedPanel } from "@/modules/vulnerabilities/presentation/components/ThreatFeedPanel";

import { buildDashboard } from "../application/build-dashboard";

import { Sidebar } from "./components/Sidebar";
import { StatCards } from "./components/StatCards";
import { DashboardCharts } from "./components/DashboardCharts";

import { PageHeader, PageSection } from "@/core/layout/PageLayout";

interface Props {
  load: () => Promise<Vulnerability[]>;
  updateStatus: (
    id: string,
    change: StatusChange,
  ) => Promise<Vulnerability>;
  uploadScan: (file: File) => Promise<IngestResult>;
  /** true con los datos ficticios (sin NEXT_PUBLIC_API_URL). */
  demo: boolean;
  analyze: (id: string) => Promise<Vulnerability>;
  loadAgentStatus: () => Promise<AgentStatus>;
  startScan: () => Promise<ScanRun>;
  listScans: () => Promise<ScanRun[]>;
  scanConfig: () => Promise<ScanConfig>;
  importFeed: (url: string) => Promise<FeedImportResult>;
  listFeedAdvisories: () => Promise<FeedAdvisory[]>;
}

// El agente analiza en segundo plano: con el backend, la tabla se refresca sola.
const AUTO_REFRESH_MS = 30_000;

export function DashboardView({
  load,
  updateStatus,
  uploadScan,
  demo,
  analyze,
  loadAgentStatus,
  startScan,
  listScans,
  scanConfig,
  importFeed,
  listFeedAdvisories,
}: Props) {
  const dispatch = useAppDispatch();

  const filters = useAppSelector(
    (state) => state.vulnerabilityFilters,
  );

  const [items, setItems] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState<
    string | null
  >(null);

  // Cambia para volver a leer los hallazgos (p. ej. tras subir un escaneo).
  const [reloadKey, setReloadKey] = useState(0);

  const [agentStatus, setAgentStatus] =
    useState<AgentStatus | null>(null);

  useEffect(() => {
    if (demo) return;

    let active = true;

    loadAgentStatus()
      .then((status) => {
        if (active) setAgentStatus(status);
      })
      .catch(() => {
        // Sin estado del agente simplemente no se muestra el botón.
      });

    const timer = setInterval(
      () => setReloadKey((key) => key + 1),
      AUTO_REFRESH_MS,
    );

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [demo, loadAgentStatus]);

  useEffect(() => {
    let active = true;

    load()
      .then((result) => {
        if (active) {
          setItems(result);
          setLoading(false);
        }
      })
      .catch((reason: unknown) => {
        // Si falla un refresco en segundo plano se conservan los datos ya mostrados.
        if (active && reloadKey === 0) {
          setError(
            demo
              ? "No se pudieron cargar los datos de demostración."
              : reason instanceof Error && reason.message
                ? `No se pudieron cargar los hallazgos. ${reason.message}`
                : "No se pudieron cargar los hallazgos.",
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [load, demo, reloadKey]);

  async function changeStatus(
    id: string,
    change: StatusChange,
  ) {
    const updated = await updateStatus(id, change);

    replaceItem(updated);
  }

  const reload = useCallback(
    () => setReloadKey((key) => key + 1),
    [],
  );

  async function analyzeFinding(id: string) {
    replaceItem(await analyze(id));
  }

  function replaceItem(updated: Vulnerability) {
    setItems((current) =>
      current.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    );
  }

  if (loading) {
    return (
      <main
        role="status"
        className="p-10 text-muted"
      >
        Cargando dashboard…
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-10">
        <p role="alert">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="dashboard-control mt-4"
        >
          Reintentar
        </button>
      </main>
    );
  }

  const data = buildDashboard(items, filters);

  const selected =
    data.visible.find((item) => item.id === selectedId) ??
    data.visible[0] ??
    null;

  const technologies = [
    ...new Set(items.map((item) => item.technology)),
  ].sort();

  return (
    <div className="min-h-dvh bg-slate-50 lg:pl-64">
      <Sidebar
        history={items}
        onSelect={(id) => {
          dispatch(resetFilters());
          setSelectedId(id);
        }}
      />

      <main className="mx-auto max-w-[1500px] space-y-10 px-4 py-8 sm:px-7 lg:px-10">
        <PageHeader
          eyebrow={
            <span className="inline-flex items-center gap-2">
              {demo ? null : (
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand" />
                </span>
              )}
              {demo ? "Datos de demostración" : "Escaneos de Nessus"}
            </span>
          }
          title="Resumen de seguridad"
          description={
            demo
              ? "Casos ficticios del proyecto académico. No representan hallazgos reales de Lyft."
              : "Hallazgos de los activos simulados de argus1, priorizados por el agente de Argus."
          }
        >
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-medium text-muted">
              Filtros · aplican al resumen y a la tabla de hallazgos
            </p>
            <VulnerabilityFilters
              filters={filters}
              technologies={technologies}
              onChange={(patch) => dispatch(updateFilters(patch))}
              onReset={() => dispatch(resetFilters())}
            />
          </div>
        </PageHeader>

        <PageSection
          id="resumen"
          index={1}
          title="Resumen"
          description="Alertas, severidad y estado de los hallazgos que pasan los filtros."
        >
          <StatCards stats={data.stats} />
          <DashboardCharts data={data} />
        </PageSection>

        <PageSection
          id="hallazgos"
          index={2}
          title="Hallazgos y mitigación"
          description="Elige un hallazgo de la tabla para ver su análisis, las acciones sugeridas y cambiar su estado."
        >
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
            <VulnerabilityTable
              items={data.visible}
              selectedId={selected?.id}
              onSelect={setSelectedId}
            />

            <div className="xl:sticky xl:top-6">
              <MitigationPanel
                key={selected?.id ?? "none"}
                item={selected}
                demo={demo}
                onStatusChange={changeStatus}
                onAnalyze={agentStatus?.claudeEnabled ? analyzeFinding : undefined}
              />
            </div>
          </div>
        </PageSection>

        <PageSection
          id="fuentes"
          index={3}
          title="Fuentes de datos"
          description="Cómo llegan los hallazgos y avisos a Argus: escaneos de Nessus y feeds de vulnerabilidades."
        >
          {demo ? null : (
            <div className="grid gap-5 xl:grid-cols-2">
              <NessusScanPanel
                startScan={startScan}
                listScans={listScans}
                scanConfig={scanConfig}
                onFinished={reload}
              />

              <NessusUpload upload={uploadScan} onUploaded={reload} />
            </div>
          )}

          <ThreatFeedPanel importFeed={importFeed} listAdvisories={listFeedAdvisories} />
        </PageSection>
      </main>
    </div>
  );
}
