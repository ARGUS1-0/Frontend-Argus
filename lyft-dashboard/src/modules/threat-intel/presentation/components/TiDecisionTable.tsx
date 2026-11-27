"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

import type {
  TiDecisionFilters,
  TiDecisionPage,
  TiTier,
} from "../../domain/threat-intel";

import {
  TIER_ORDER,
  formatDate,
  formatPercentile,
  formatScore,
  tierLabel,
} from "../../application/threat-intel";

import { TierBadge } from "../ti-ui";

const PAGE_SIZE = 25;

const EMPTY: TiDecisionFilters = {
  product: "",
  text: "",
  cve: "",
  tier: "",
  from: "",
  to: "",
  kev: "",
  review: "",
  cwe: "",
};

/** Filtros que viven en "Más filtros". */
const ADVANCED: (keyof TiDecisionFilters)[] = ["cwe", "from", "to", "kev", "review"];

interface Props {
  load: (filters: TiDecisionFilters, limit: number, offset: number) => Promise<TiDecisionPage>;
  labels?: Partial<Record<TiTier, string>>;
  selectedKey: string | null;
  onSelect: (itemId: string, componentId: string) => void;
  /** Cambia cuando se descargan datos nuevos. */
  reloadKey: number;
}

/** Tabla de decisiones: tier primero y score solo dentro del tier (lo ordena el backend). */
export function TiDecisionTable({ load, labels, selectedKey, onSelect, reloadKey }: Props) {
  const [draft, setDraft] = useState<TiDecisionFilters>(EMPTY);
  const [filters, setFilters] = useState<TiDecisionFilters>(EMPTY);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<TiDecisionPage | null>(null);
  const [error, setError] = useState("");
  // Consulta que terminó de cargar; si no coincide con la actual, está cargando.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const requestKey = JSON.stringify([filters, offset, reloadKey]);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;

    load(filters, PAGE_SIZE, offset)
      .then((result) => {
        if (!active) return;
        setPage(result);
        setError("");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudieron cargar las decisiones.");
      })
      .finally(() => {
        if (active) setLoadedKey(JSON.stringify([filters, offset, reloadKey]));
      });

    return () => {
      active = false;
    };
  }, [load, filters, offset, reloadKey]);

  function apply(event: FormEvent) {
    event.preventDefault();
    setOffset(0);
    setFilters({ ...draft });
  }

  function reset() {
    setDraft(EMPTY);
    setOffset(0);
    setFilters(EMPTY);
  }

  const set = (patch: Partial<TiDecisionFilters>) => setDraft((current) => ({ ...current, ...patch }));
  const activeAdvanced = ADVANCED.filter((key) => Boolean(filters[key])).length;
  const activeTotal = Object.values(filters).filter(Boolean).length;
  const total = page?.total ?? 0;
  const lastShown = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="dashboard-card min-w-0">
      <form onSubmit={apply} className="rounded-xl border border-line bg-slate-50/70 p-3" aria-label="Filtros de decisiones">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px_auto]">
          <label className="field-label">
            Producto o componente
            <input
              className="dashboard-control mt-1 w-full"
              value={draft.product}
              maxLength={200}
              placeholder="envoy, redis…"
              onChange={(e) => set({ product: e.target.value })}
            />
          </label>
          <label className="field-label">
            Texto en la descripción
            <input
              className="dashboard-control mt-1 w-full"
              value={draft.text}
              maxLength={200}
              placeholder="desbordamiento…"
              onChange={(e) => set({ text: e.target.value })}
            />
          </label>
          <label className="field-label">
            Tier
            <select
              className="dashboard-control mt-1 w-full"
              value={draft.tier}
              onChange={(e) => set({ tier: e.target.value as TiTier | "" })}
            >
              <option value="">Todos</option>
              {TIER_ORDER.map((tier) => (
                <option key={tier} value={tier}>{tierLabel(tier, labels)}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn btn-dark h-11">Buscar</button>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              aria-controls="ti-filtros-avanzados"
              className="btn btn-secondary h-11"
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              Más filtros{activeAdvanced ? ` (${activeAdvanced})` : ""}
            </button>
          </div>
        </div>

        {showAdvanced ? (
          <div id="ti-filtros-avanzados" className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="field-label">
              CWE (NVD o sugerido)
              <input
                className="dashboard-control mt-1 w-full"
                value={draft.cwe}
                maxLength={10}
                placeholder="CWE-79"
                onChange={(e) => set({ cwe: e.target.value })}
              />
            </label>
            <label className="field-label">
              Publicado en NVD desde
              <input type="date" className="dashboard-control mt-1 w-full" value={draft.from} onChange={(e) => set({ from: e.target.value })} />
            </label>
            <label className="field-label">
              Hasta
              <input type="date" className="dashboard-control mt-1 w-full" value={draft.to} onChange={(e) => set({ to: e.target.value })} />
            </label>
            <label className="field-label">
              KEV de CISA
              <select className="dashboard-control mt-1 w-full" value={draft.kev} onChange={(e) => set({ kev: e.target.value as TiDecisionFilters["kev"] })}>
                <option value="">Todos</option>
                <option value="true">Solo en KEV</option>
                <option value="false">Fuera de KEV</option>
              </select>
            </label>
            <label className="field-label">
              Revisión humana
              <select className="dashboard-control mt-1 w-full" value={draft.review} onChange={(e) => set({ review: e.target.value as TiDecisionFilters["review"] })}>
                <option value="">Todos</option>
                <option value="true">Requiere revisión</option>
                <option value="false">No requiere</option>
              </select>
            </label>
          </div>
        ) : null}
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted" aria-live="polite">
          {loading && !page
            ? "Cargando…"
            : total === 0
              ? "Ninguna decisión coincide con los filtros."
              : `${offset + 1}–${lastShown} de ${total} decisiones · ${page?.distinctCves ?? 0} CVE distintos`}
        </p>
        {activeTotal > 0 ? (
          <button type="button" onClick={reset} className="text-xs font-medium text-brand hover:underline">
            Quitar filtros ({activeTotal})
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>
      ) : null}

      {page && page.results.length > 0 ? (
        <div className={`mt-3 overflow-x-auto transition-opacity ${loading ? "opacity-50" : ""}`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-medium">CVE</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Componente (inferido)</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Tier de Lyft</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Score</th>
                <th scope="col" className="px-3 py-2.5 font-medium">KEV</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">EPSS pct.</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Publicado</th>
                <th scope="col" className="px-3 py-2.5"><span className="sr-only">Detalle</span></th>
              </tr>
            </thead>
            <tbody>
              {page.results.map((row) => {
                const key = `${row.itemId}|${row.componentId}`;
                const selected = selectedKey === key;

                return (
                  <tr
                    key={key}
                    onClick={() => onSelect(row.itemId, row.componentId)}
                    className={`cursor-pointer border-b border-line transition-colors last:border-0 ${
                      selected ? "bg-violet-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                      {row.itemId}
                      {row.needsReview ? (
                        <span className="ml-2 rounded bg-orange-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-orange-800">
                          revisar
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-56 truncate px-3 py-3 text-xs" title={row.componentName ?? row.componentId}>
                      {row.componentName ?? row.componentId}
                    </td>
                    <td className="px-3 py-3">
                      <TierBadge tier={row.tier} label={row.tierLabel} resultType={row.resultType} />
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{formatScore(row.score)}</td>
                    <td className="px-3 py-3 text-xs">
                      {row.kev ? (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700">KEV</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-xs tabular-nums">{formatPercentile(row.epssPercentile)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">{formatDate(row.published)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelect(row.itemId, row.componentId);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                        aria-label={`Ver detalle de ${row.itemId} en ${row.componentName ?? row.componentId}`}
                      >
                        Ver <ChevronRight size={14} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {total > PAGE_SIZE ? (
        <nav aria-label="Páginas de decisiones" className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
          <span className="text-xs text-muted">
            Página {Math.floor(offset / PAGE_SIZE) + 1} de {Math.ceil(total / PAGE_SIZE)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary h-9"
              disabled={offset === 0 || loading}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              <ChevronLeft size={15} aria-hidden="true" /> Anterior
            </button>
            <button
              type="button"
              className="btn btn-secondary h-9"
              disabled={lastShown >= total || loading}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Siguiente <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
