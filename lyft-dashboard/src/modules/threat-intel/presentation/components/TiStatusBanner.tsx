"use client";

import { useState } from "react";
import { CircleCheck, CircleAlert, RefreshCw } from "lucide-react";

import type { TiStatus, TiSyncResult } from "../../domain/threat-intel";

import { formatDate, formatDateTime } from "../../application/threat-intel";

interface Props {
  status: TiStatus;
  sync: () => Promise<TiSyncResult>;
  onSynced: () => void;
}

const OUTCOME: Record<TiSyncResult["outcome"], string> = {
  UPDATED: "Datos actualizados.",
  UNCHANGED: "No hay datos nuevos en la API de Lyft.",
  FAILED: "La sincronización falló.",
  BUSY: "Ya hay una sincronización en curso.",
  DISABLED: "La integración no está configurada.",
};

/** Franja con qué tan frescos son los datos y si la integración funciona. */
export function TiStatusBanner({ status, sync, onSynced }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function syncNow() {
    setBusy(true);
    setMessage("");

    try {
      const result = await sync();

      setMessage(result.outcome === "FAILED" ? `${OUTCOME.FAILED} ${result.message}` : OUTCOME[result.outcome]);

      if (result.outcome === "UPDATED") onSynced();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No se pudo sincronizar.");
    } finally {
      setBusy(false);
    }
  }

  const data = status.data;
  const problem = !status.configured
    ? "La integración no está configurada en el backend (LYFT_TI_API_URL y LYFT_TI_API_KEY)."
    : status.keyRejected
      ? "La API de Lyft rechazó la llave (401). Hay que revisar LYFT_TI_API_KEY y reiniciar el backend."
      : status.lastCheckError
        ? `La última revisión falló: ${status.lastCheckError}`
        : status.lastRun?.status === "failed"
          ? `La última descarga falló: ${status.lastRun.error ?? "sin detalle"}. Se muestra la última copia buena.`
          : null;

  const facts = [
    { label: "CVE más reciente", value: formatDate(data?.newestPublished) },
    { label: "EPSS al", value: formatDate(data?.epssScoreDate) },
    { label: "Datos construidos", value: formatDateTime(data?.feedBuiltAt) },
    { label: "Última revisión", value: formatDateTime(status.lastCheckAt) },
  ];

  return (
    <div className="mt-6 space-y-3">
      {problem ? (
        <p role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {problem}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-white px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${problem ? "text-rose-700" : "text-emerald-700"}`}
        >
          {problem ? <CircleAlert size={15} aria-hidden="true" /> : <CircleCheck size={15} aria-hidden="true" />}
          {problem ? "Con problemas" : "Conectado"}
        </span>

        <dl className="flex flex-1 flex-wrap gap-x-6 gap-y-2 text-xs">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline gap-1.5">
              <dt className="text-muted">{fact.label}:</dt>
              <dd className="font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={syncNow}
          disabled={busy || !status.configured || status.keyRejected}
          className="btn btn-secondary h-9 text-xs"
        >
          <RefreshCw size={14} aria-hidden="true" className={busy ? "animate-spin" : ""} />
          {busy ? "Revisando…" : "Buscar datos nuevos"}
        </button>
      </div>

      <p className="text-[11px] leading-5 text-muted">
        &quot;Datos construidos&quot; es cuándo Lyft generó los archivos, no qué tan
        recientes son los CVE. El backend revisa cada 15 minutos y descarga solo
        si hay una versión nueva.
        {status.updateAvailable ? " Hay una versión nueva pendiente de descargar." : ""}
        {message ? <span role="status" className="ml-1 font-medium text-ink">{message}</span> : null}
      </p>
    </div>
  );
}
