"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Radar } from "lucide-react";

import type {
  ScanConfig,
  ScanRun,
  ScanRunStatus,
} from "../../domain/vulnerability";

interface Props {
  startScan: () => Promise<ScanRun>;
  listScans: () => Promise<ScanRun[]>;
  scanConfig: () => Promise<ScanConfig>;
  /** Al terminar un escaneo se recargan los hallazgos (el agente los analizará). */
  onFinished: () => void;
}

const POLL_MS = 10_000;

const statusUI: Record<ScanRunStatus, string> = {
  queued: "En cola",
  running: "Escaneando con Nessus",
  exporting: "Exportando CSV",
  completed: "Completado",
  failed: "Falló",
};

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

function isActive(run: ScanRun | undefined) {
  return (
    run?.status === "queued" ||
    run?.status === "running" ||
    run?.status === "exporting"
  );
}

/** Botón "Escanear ahora", horario programado y estado del último escaneo de Nessus. */
export function NessusScanPanel({
  startScan,
  listScans,
  scanConfig,
  onFinished,
}: Props) {
  const [config, setConfig] = useState<ScanConfig | null>(null);
  const [last, setLast] = useState<ScanRun | undefined>();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const wasActive = useRef(false);

  const refresh = useCallback(async () => {
    const [latest] = await listScans();

    if (wasActive.current && !isActive(latest) && latest?.status === "completed") {
      onFinished();
    }

    wasActive.current = isActive(latest);
    setLast(latest);
  }, [listScans, onFinished]);

  useEffect(() => {
    let active = true;

    scanConfig()
      .then((result) => {
        if (active) setConfig(result);
      })
      .catch(() => {
        if (active) setError("No se pudo leer la configuración de Nessus.");
      });

    // Si una lectura falla, el panel sigue usable y se reintenta en el siguiente ciclo.
    const poll = () => {
      refresh().catch(() => {});
    };

    const first = setTimeout(poll, 0);
    const timer = setInterval(poll, POLL_MS);

    return () => {
      active = false;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [scanConfig, refresh]);

  async function scanNow() {
    setStarting(true);
    setError("");

    try {
      const run = await startScan();
      wasActive.current = isActive(run);
      setLast(run);
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "No se pudo lanzar el escaneo.",
      );
    } finally {
      setStarting(false);
    }
  }

  const running = isActive(last);

  return (
    <section
      className="dashboard-card"
      aria-label="Escaneo programado de Nessus"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-brand"><Radar size={18} /></span>
          <div className="min-w-0">
          <h3 className="font-semibold">Escanear activos</h3>

          <p className="mt-1 text-xs text-muted">
            {!config
              ? "Cargando configuración…"
              : !config.configured
                ? "Nessus no está configurado en el backend (NESSUS_URL, API keys y NESSUS_SCAN_ID)."
                : config.nextRunAt
                  ? `Próximo escaneo programado: ${dateFormat.format(new Date(config.nextRunAt))} (${config.timeZone})`
                  : "Sin horario programado (NESSUS_SCAN_CRON=off)."}
          </p>
          <p className="mt-1 text-[11px] text-muted">Toma los activos de iTop y lanza el escaneo en Nessus.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={scanNow}
          disabled={!config?.configured || running || starting}
          className="btn btn-primary"
        >
          <Radar size={16} aria-hidden="true" />
          {starting
            ? "Lanzando…"
            : running
              ? "Escaneo en curso"
              : "Escanear ahora"}
        </button>
      </div>

      {last ? (
        <div
          className="mt-4 rounded-xl border border-line bg-slate-50 p-3 text-xs leading-5 text-muted"
          aria-live="polite"
        >
          <p>
            <span className="font-semibold text-ink">
              {statusUI[last.status]}
            </span>
            {" · "}
            {last.trigger === "scheduled"
              ? "Programado"
              : `Manual${last.requestedBy ? ` (${last.requestedBy})` : ""}`}
            {" · "}
            {dateFormat.format(new Date(last.createdAt))}
          </p>

          <p className="mt-1">
            {last.targets.length > 0
              ? `${last.targets.length} objetivos de ${last.targetsSource === "itop" ? "iTop" : "inventario local"}: ${last.targets.join(", ")}`
              : "Objetivos definidos en el escaneo de Nessus."}
          </p>

          {last.message ? (
            <p
              className={`mt-1 ${last.status === "failed" ? "text-rose-700" : ""}`}
            >
              {last.status === "completed" && last.published != null
                ? `${last.published} hallazgos enviados al agente para su análisis.`
                : last.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-2 text-xs text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
