"use client";

import { useState } from "react";

import { Sparkles } from "lucide-react";

interface Props {
  analyzed: boolean;
  onAnalyze: () => Promise<void>;
}

/** Pide al agente Claude que analice (o re-analice) el hallazgo: STIX + iTop → prioridad → Slack. */
export function AnalyzeButton({
  analyzed,
  onAnalyze,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");

    try {
      await onAnalyze();
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "El agente no pudo analizar el hallazgo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand px-4 text-sm font-medium text-brand hover:bg-pink-50 disabled:opacity-50"
      >
        <Sparkles size={16} aria-hidden="true" />
        {busy
          ? "Analizando con el agente…"
          : analyzed
            ? "Volver a analizar con IA"
            : "Analizar con IA"}
      </button>

      {busy ? (
        <p
          role="status"
          className="mt-2 text-xs text-muted"
        >
          Consultando iTop y priorizando. Puede tardar
          hasta un minuto.
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-2 text-xs text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
