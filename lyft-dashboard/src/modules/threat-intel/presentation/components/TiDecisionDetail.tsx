import type { ReactNode } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

import type { TiDecisionDetail as Detail } from "../../domain/threat-intel";

import {
  INFERRED_WARNING,
  formatDate,
  formatPercentile,
  formatScore,
  languageNote,
  predictedCweText,
  safeHref,
} from "../../application/threat-intel";

import { TierBadge } from "../ti-ui";

const DECISION_POINTS: { key: "exploitation" | "exposure" | "automatable" | "human_impact"; label: string }[] = [
  { key: "exploitation", label: "Explotación" },
  { key: "exposure", label: "Exposición" },
  { key: "automatable", label: "Automatizable" },
  { key: "human_impact", label: "Impacto humano" },
];

const COMPONENT_LABELS: Record<string, string> = {
  layer: "Capa",
  criticality: "Criticidad",
  exposure: "Exposición",
  patch_responsibility: "Quién parcha",
  evidence: "Evidencia del inventario",
};

/** Códigos del componente en español; un código desconocido se muestra tal cual. */
const CODE_LABELS: Record<string, string> = {
  "very-high": "muy alta",
  high: "alta",
  medium: "media",
  low: "baja",
  open: "abierta",
  controlled: "controlada",
  small: "pequeña",
  lyft: "Lyft",
  vendor: "proveedor",
  shared: "compartida",
  "first-party": "propia de Lyft (primera mano)",
  secondary: "fuente secundaria",
  aggregator: "agregador",
  assumed: "supuesta",
};

const codeLabel = (value: string | null | undefined) => (value ? (CODE_LABELS[value] ?? value) : "—");

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

/**
 * Detalle de una decisión de Lyft. Todo el texto viene de la API y se
 * muestra como texto plano (React lo escapa). El único enlace es el de NVD,
 * y solo si es http(s).
 */
export function TiDecisionDetail({ decision, live = false }: { decision: Detail; live?: boolean }) {
  const nvd = safeHref(decision.links?.nvd);
  const suggestedCwe = predictedCweText(decision.predicted_cwe);
  const component = decision.component ?? {};
  const reviewReasons = decision.needs_review_reason_labels ?? [];
  const flags = decision.flag_labels ?? [];
  const descriptionNote = languageNote(decision.description_language);
  const llmNote = languageNote(decision.rationale_llm_language);

  return (
    <article className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{decision.item_id}</p>
          <h3 className="mt-1 text-lg font-semibold">
            {component.name ?? decision.component_id}
          </h3>
          {component.vendor ? <p className="text-xs text-muted">{component.vendor}</p> : null}
        </div>

        <div className="text-right">
          <TierBadge tier={decision.tier} label={decision.tier_label} resultType={decision.result_type} />
          <p className="mt-2 text-xs text-muted">
            Score {formatScore(decision.score)} / 100
          </p>
        </div>
      </header>

      <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
        <AlertTriangle size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          {INFERRED_WARNING} El score solo ordena dentro del tier; no es una
          probabilidad. El tier es de Lyft y no reemplaza la prioridad de Argus.
        </span>
      </p>

      {decision.rationale ? (
        <section>
          <h4 className="text-sm font-semibold text-ink">Razón (regla determinista)</h4>
          <blockquote className="mt-1 border-l-2 border-line pl-3 text-sm leading-6">
            {decision.rationale}
          </blockquote>
        </section>
      ) : null}

      {decision.rationale_llm ? (
        <section>
          <h4 className="text-sm font-semibold text-ink">
            Explicación generada por IA{llmNote ? ` (${llmNote})` : ""}
          </h4>
          <p className="mt-1 text-sm leading-6 text-slate-700">{decision.rationale_llm}</p>
          <p className="mt-1 text-[11px] text-muted">No cambia el tier.</p>
        </section>
      ) : null}

      <section>
        <h4 className="text-sm font-semibold text-ink">Entradas de la decisión (SSVC)</h4>
        <dl className="mt-2 grid grid-cols-2 gap-3">
          {DECISION_POINTS.map(({ key, label }) => (
            <Field key={key} label={label}>
              {decision.decision_point_labels?.[key] ?? "—"}
            </Field>
          ))}
        </dl>
      </section>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="KEV (CISA)">
          {decision.kev
            ? `Sí, desde ${formatDate(decision.kev_date_added)}`
            : "No"}
        </Field>
        <Field label="Percentil EPSS">
          {formatPercentile(decision.epss_percentile)}
          {decision.epss_score_date ? (
            <span className="block text-[11px] text-muted">al {formatDate(decision.epss_score_date)}</span>
          ) : null}
        </Field>
        <Field label="CVSS 3.1">{decision.cvss_v31 ?? "—"}</Field>
        <Field label="Publicado en NVD">{formatDate(decision.published)}</Field>
        <Field label="CWE (NVD)">{decision.cwe_ids?.length ? decision.cwe_ids.join(", ") : "—"}</Field>
        <Field label="CWE sugerido">
          {suggestedCwe ? `${suggestedCwe} (sugerencia del clasificador)` : "—"}
        </Field>
        <Field label="Confianza del cruce">
          {typeof decision.confidence === "number" ? decision.confidence.toFixed(2) : "—"}
          {decision.method_labels?.length ? (
            <span className="block text-[11px] text-muted">por {decision.method_labels.join(", ")}</span>
          ) : null}
        </Field>
      </dl>

      {decision.needs_review ? (
        <section className="rounded-xl border border-orange-200 bg-orange-50 p-3">
          <h4 className="text-xs font-semibold text-orange-900">Requiere revisión humana</h4>
          {reviewReasons.length ? (
            <ul className="mt-1 list-disc pl-5 text-xs text-orange-900">
              {reviewReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section>
        <h4 className="text-sm font-semibold text-ink">Componente del inventario (inferido)</h4>
        <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(COMPONENT_LABELS).map(([key, label]) => (
            <Field key={key} label={label}>
              {codeLabel((component as Record<string, string | null | undefined>)[key])}
            </Field>
          ))}
        </dl>
      </section>

      {flags.length ? (
        <p className="text-xs text-muted">
          Marcas: {flags.join(" · ")}
        </p>
      ) : null}

      {decision.description ? (
        <section>
          <h4 className="text-sm font-semibold text-ink">
            Descripción del CVE{descriptionNote ? ` (${descriptionNote})` : ""}
          </h4>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{decision.description}</p>
        </section>
      ) : null}

      {live ? (
        <p className="text-[11px] text-muted">
          Búsqueda en vivo: sin explicación de IA ni CWE sugerido; EPSS de la
          fecha de los datos, no de hoy.
        </p>
      ) : null}

      {nvd ? (
        <a
          href={nvd}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          Ver en NVD <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : null}
    </article>
  );
}
