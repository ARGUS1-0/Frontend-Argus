"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { CardTitle } from "@/core/layout/PageLayout";

import type { TiCveLookup } from "../../domain/threat-intel";

import {
  INFERRED_WARNING,
  formatDate,
  formatDateTime,
  languageNote,
  lookupHeadline,
  normalizeCveId,
} from "../../application/threat-intel";

import { TiDecisionDetail } from "./TiDecisionDetail";

interface Props {
  lookup: (id: string) => Promise<TiCveLookup>;
}

/**
 * "¿Este CVE afecta a Lyft?" Primero busca en la copia local; si no está,
 * el backend consulta la API en vivo (con su propio límite por usuario).
 */
export function CveSearch({ lookup }: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TiCveLookup | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const id = normalizeCveId(value);

    if (!id) {
      setError("Escribe un id con la forma CVE-AAAA-NNNN (por ejemplo CVE-2026-12345).");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);

    try {
      setResult(await lookup(id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo buscar el CVE.");
    } finally {
      setBusy(false);
    }
  }

  const descriptionNote = languageNote(result?.descriptionLanguage);

  return (
    <div className="dashboard-card">
      <CardTitle
        icon={<Search size={18} />}
        title="¿Este CVE afecta a Lyft?"
        description="Primero se busca en la copia local. Si no está, se consulta la API de Lyft en vivo (unas pocas búsquedas por minuto por usuario)."
      />

      <form onSubmit={submit} className="mt-5 flex flex-wrap gap-2" role="search">
        <label htmlFor="cve-id" className="sr-only">Id del CVE</label>
        <input
          id="cve-id"
          className="dashboard-control w-64 font-mono uppercase"
          value={value}
          maxLength={20}
          placeholder="CVE-2026-12345"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "cve-error" : undefined}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" disabled={busy} className="btn btn-dark h-11">
          <Search size={15} aria-hidden="true" />
          {busy ? "Buscando… (puede tardar hasta un minuto)" : "Buscar"}
        </button>
      </form>

      {error ? (
        <p id="cve-error" role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4" aria-live="polite">
          <p
            className={`rounded-xl p-3 text-sm ${
              result.status === "ok" ? "bg-violet-50 text-violet-900" : "bg-slate-100 text-slate-700"
            }`}
          >
            {lookupHeadline(result)}
          </p>

          <p className="text-xs text-muted">
            Fuente: {result.source === "feed" ? "copia local de los datos de Lyft" : "API de Lyft en vivo"}
            {result.cached ? " (resultado en caché)" : ""}
            {result.epssScoreDate ? ` · EPSS al ${formatDate(result.epssScoreDate)}` : ""}
            {result.asOfUtc ? ` · consultado ${formatDateTime(result.asOfUtc)}` : ""}
            {result.published ? ` · publicado en NVD ${formatDate(result.published)}` : ""}
          </p>

          {result.status === "no_match" && result.description ? (
            <section>
              <h3 className="text-xs font-semibold text-muted">
                Descripción del CVE{descriptionNote ? ` (${descriptionNote})` : ""}
              </h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{result.description}</p>
            </section>
          ) : null}

          {result.status !== "not_found" ? (
            <p className="text-xs text-muted">{INFERRED_WARNING}</p>
          ) : null}

          {result.decisions.map((decision) => (
            <div key={`${decision.item_id}|${decision.component_id}`} className="rounded-2xl border border-line p-4">
              <TiDecisionDetail decision={decision} live={result.source === "live"} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
