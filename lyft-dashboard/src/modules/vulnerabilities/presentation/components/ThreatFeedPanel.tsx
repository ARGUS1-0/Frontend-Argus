"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { AlertTriangle, Rss, ShieldAlert } from "lucide-react";

import type {
  FeedAdvisory,
  FeedImportResult,
} from "../../domain/vulnerability";

import {
  DEFAULT_FEED_URL,
  safeHref,
  sortAdvisories,
  summarizeAdvisories,
  validateFeedUrl,
} from "../../application/import-threat-feed";

import { severityUI } from "../vulnerability-ui";

interface Props {
  importFeed: (url: string) => Promise<FeedImportResult>;
  listAdvisories: () => Promise<FeedAdvisory[]>;
}

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Sin fecha"
    : dateFormat.format(date);
}

/**
 * Lee un feed RSS de avisos de vulnerabilidades (a través del backend) y
 * muestra sus avisos. Los avisos son inteligencia externa: no entran a la
 * tabla de hallazgos ni los analiza el agente.
 */
export function ThreatFeedPanel({
  importFeed,
  listAdvisories,
}: Props) {
  const [url, setUrl] = useState(DEFAULT_FEED_URL);
  const [items, setItems] = useState<FeedAdvisory[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] =
    useState<FeedImportResult | null>(null);
  const [onlySuspicious, setOnlySuspicious] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setItems(sortAdvisories(await listAdvisories()));
  }, [listAdvisories]);

  useEffect(() => {
    let active = true;

    listAdvisories()
      .then((result) => {
        if (active) setItems(sortAdvisories(result));
      })
      .catch(() => {
        // Sin avisos guardados el panel solo muestra el formulario.
      });

    return () => {
      active = false;
    };
  }, [listAdvisories]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setResult(null);

    const invalid = validateFeedUrl(url);

    if (invalid) {
      setError(invalid);
      return;
    }

    setBusy(true);
    setError("");

    try {
      setResult(await importFeed(url.trim()));
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "No se pudo leer el feed.",
      );
    } finally {
      setBusy(false);
    }
  }

  const summary = summarizeAdvisories(items);

  const visible = onlySuspicious
    ? items.filter((item) => item.suspicious)
    : items;

  return (
    <section
      id="feeds"
      className="dashboard-card min-w-0 scroll-mt-6"
      aria-label="Avisos de feeds de vulnerabilidades"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-brand"><Rss size={18} /></span>
          <div className="min-w-0">
          <h3 className="font-semibold">Feed de vulnerabilidades</h3>

          <p className="mt-1 max-w-2xl text-xs text-muted">
            Lee un feed RSS (.xml) de avisos. La severidad se calcula con
            el CVSS y la marca KEV del aviso; el texto del feed no puede
            cambiarla. Los avisos que intentan manipular la clasificación
            se marcan como sospechosos.
          </p>
          </div>
        </div>

        {items.length > 0 ? (
          <dl className="flex flex-wrap gap-2 text-xs">
            <SummaryChip label="Avisos" value={summary.total} />
            <SummaryChip
              label="Críticos"
              value={summary.critical}
              tone="text-rose-700"
            />
            <SummaryChip
              label="Explotados (KEV)"
              value={summary.knownExploited}
              tone="text-rose-700"
            />
            <SummaryChip
              label="Sospechosos"
              value={summary.suspicious}
              tone="text-amber-800"
            />
          </dl>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="feed-url">
          URL del feed
        </label>

        <input
          id="feed-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://ejemplo.com/feed.xml"
          className="dashboard-control flex-1"
        />

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary h-11"
        >
          <Rss size={16} aria-hidden="true" />
          {busy ? "Leyendo…" : "Leer feed"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div role="status" className="mt-2 space-y-1 text-xs">
          <p className="text-emerald-700">
            {result.feedTitle ?? "Feed"}: {result.total} avisos (
            {result.created} nuevos, {result.updated} actualizados).
            {result.suspicious > 0
              ? ` ${result.suspicious} marcados como sospechosos.`
              : ""}
          </p>

          {result.insecureTransport ? (
            <p className="text-amber-800">
              El feed se descargó por http:// sin cifrar: alguien en la
              red podría alterarlo. Usa https:// si el proveedor lo
              ofrece.
            </p>
          ) : null}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Todavía no hay avisos. Lee un feed para verlos aquí.
        </p>
      ) : (
        <>
          <label className="mt-5 flex w-fit items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={onlySuspicious}
              onChange={(event) =>
                setOnlySuspicious(event.target.checked)
              }
            />
            Solo sospechosos
          </label>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Aviso</th>
                  <th className="px-3 py-3 font-medium">Severidad</th>
                  <th className="px-3 py-3 font-medium">CVSS</th>
                  <th className="px-3 py-3 font-medium">Categoría</th>
                  <th className="px-3 py-3 font-medium">Publicado</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((item) => (
                  <AdvisoryRow
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() =>
                      setExpandedId((current) =>
                        current === item.id ? null : item.id,
                      )
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function SummaryChip({
  label,
  value,
  tone = "text-ink",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-line px-3 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-base font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}

function AdvisoryRow({
  item,
  expanded,
  onToggle,
}: {
  item: FeedAdvisory;
  expanded: boolean;
  onToggle: () => void;
}) {
  const href = safeHref(item.link);
  const detailsId = `feed-details-${item.id}`;

  return (
    <tr
        className={`border-b border-line align-top last:border-0 ${
          item.suspicious ? "bg-amber-50/60" : ""
        }`}
      >
        <td className="max-w-md px-3 py-4">
          <p className="font-medium">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:underline"
              >
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
            {item.cveId ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                {item.cveId}
              </span>
            ) : null}

            {item.knownExploited ? (
              <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
                <ShieldAlert size={12} aria-hidden="true" />
                Explotada activamente (KEV)
              </span>
            ) : null}

            {item.suspicious ? (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
                <AlertTriangle size={12} aria-hidden="true" />
                Sospechoso
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="mt-2 text-xs font-medium text-brand hover:underline"
          >
            {expanded ? "Ocultar detalle" : "Ver detalle"}
          </button>

          {expanded ? (
            <div id={detailsId} className="mt-2 space-y-2 text-xs">
              {item.suspicious ? (
                <ul className="list-disc space-y-1 rounded-xl bg-amber-50 py-2 pl-6 pr-3 text-amber-900">
                  {item.suspiciousReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}

              {item.description ? (
                <div>
                  <p className="font-medium text-muted">
                    Texto del feed (no verificado)
                  </p>
                  <p className="mt-1 whitespace-pre-line leading-5">
                    {item.description}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </td>

        <td className="px-3 py-4">
          {item.severity ? (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityUI[item.severity].badge}`}
            >
              {severityUI[item.severity].label}
            </span>
          ) : (
            <span className="text-xs text-muted">Sin CVSS</span>
          )}
        </td>

        <td className="px-3 py-4 tabular-nums">
          {item.cvssScore ?? "—"}
        </td>

        <td className="px-3 py-4 text-xs text-muted">
          {item.category ?? "—"}
        </td>

        <td className="px-3 py-4 text-xs text-muted">
          {formatDate(item.publishedAt)}
        </td>
      </tr>
  );
}
