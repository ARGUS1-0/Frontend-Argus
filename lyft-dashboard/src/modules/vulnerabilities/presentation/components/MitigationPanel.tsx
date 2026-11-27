import type { ReactNode } from "react";
import { Bot, ListChecks, ShieldCheck } from "lucide-react";

import { CardTitle } from "@/core/layout/PageLayout";

import type {
  StatusChange,
  Vulnerability,
} from "../../domain/vulnerability";

import {
  aiActionUI,
  severityUI,
  sourceUI,
  statusUI,
} from "../vulnerability-ui";

import { AnalyzeButton } from "./AnalyzeButton";
import { StatusForm } from "./StatusForm";

interface Props {
  item: Vulnerability | null;
  demo: boolean;
  onStatusChange: (
    id: string,
    change: StatusChange,
  ) => Promise<void>;
  /** Solo cuando el agente Claude está configurado en el backend. */
  onAnalyze?: (id: string) => Promise<void>;
}

function BlockTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
      <span aria-hidden="true">{icon}</span>
      {children}
    </h4>
  );
}

export function MitigationPanel({
  item,
  demo,
  onStatusChange,
  onAnalyze,
}: Props) {
  return (
    <aside
      id="mitigacion"
      className="dashboard-card scroll-mt-6"
      aria-label="Detalle y recomendaciones"
    >
      <CardTitle
        icon={<ShieldCheck size={18} />}
        title="Mitigación"
        description="Detalle, análisis y estado del hallazgo elegido."
      />

      {!item ? (
        <p className="mt-6 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Selecciona un hallazgo de la tabla.
        </p>
      ) : (
        <div aria-live="polite" className="mt-5 space-y-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityUI[item.severity].badge}`}>
                {severityUI[item.severity].label}
                {item.severityProvisional ? " · preliminar" : ""}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-line">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: statusUI[item.status].color }} />
                {statusUI[item.status].label}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-line">
                {sourceUI[item.source]}
              </span>
            </div>

            <h3 className="mt-3 text-base font-semibold leading-6">{item.title}</h3>

            <p className="mt-1 font-mono text-[11px] text-muted">
              {item.id} · {item.technology}
              {item.cveId ? ` · ${item.cveId}` : ""}
              {item.cvssScore != null ? ` · CVSS ${item.cvssScore}` : ""}
              {" · "}
              {item.detectedAt}
            </p>

            {item.severityProvisional ? (
              <p className="mt-2 text-[11px] text-muted">
                Severidad preliminar de Nessus hasta que el agente analice el hallazgo.
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-6 text-slate-700">{item.description}</p>

          {item.aiAnalysis?.justification ? (
            <section className="space-y-2">
              <BlockTitle icon={<Bot size={14} />}>
                Análisis del agente
                {item.aiAnalysis.action ? ` · ${aiActionUI[item.aiAnalysis.action]}` : ""}
              </BlockTitle>
              <p className="rounded-xl border border-line p-3 text-sm leading-6 text-slate-700">
                {item.aiAnalysis.justification}
              </p>
            </section>
          ) : null}

          <section className="space-y-2">
            <BlockTitle icon={<ListChecks size={14} />}>Acciones sugeridas</BlockTitle>

            {item.recommendations.length === 0 ? (
              <p className="text-sm text-muted">Aún no hay recomendaciones para este hallazgo.</p>
            ) : (
              <ol className="space-y-2">
                {item.recommendations.map((recommendation, index) => (
                  <li key={`${index}-${recommendation}`} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-pink-50 text-[11px] font-semibold text-brand"
                    >
                      {index + 1}
                    </span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ol>
            )}

            <p className="text-[11px] leading-5 text-muted">
              {demo
                ? "Recomendaciones de ejemplo para este escenario ficticio."
                : item.aiAnalysis
                  ? "Recomendación redactada por el agente de Argus."
                  : "Solución propuesta por Nessus. El agente de Argus aún no analiza este hallazgo."}
            </p>
          </section>

          {onAnalyze ? (
            <AnalyzeButton
              analyzed={Boolean(item.aiAnalysis)}
              onAnalyze={() => onAnalyze(item.id)}
            />
          ) : null}

          <StatusForm
            item={item}
            onSubmit={(change) => onStatusChange(item.id, change)}
          />
        </div>
      )}
    </aside>
  );
}
