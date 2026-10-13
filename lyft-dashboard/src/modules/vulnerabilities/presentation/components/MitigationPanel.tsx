import { ShieldCheck } from "lucide-react";

import type { Vulnerability } from "../../domain/vulnerability";

import {
  severityUI,
  statusUI,
} from "../vulnerability-ui";

export function MitigationPanel({
  item,
}: {
  item: Vulnerability | null;
}) {
  return (
    <aside
      id="mitigacion"
      className="dashboard-card scroll-mt-6"
      aria-label="Detalle y recomendaciones"
    >
      <h2 className="flex items-center gap-2 font-semibold">
        <ShieldCheck
          size={19}
          className="text-brand"
          aria-hidden="true"
        />
        Mitigación
      </h2>

      {!item ? (
        <p className="mt-6 text-sm text-muted">
          Selecciona un hallazgo de la tabla.
        </p>
      ) : (
        <div aria-live="polite">
          <p className="mt-6 font-mono text-xs text-muted">
            {item.id} · {item.technology}
          </p>

          <h3 className="mt-2 text-lg font-semibold">
            {item.title}
          </h3>

          <p className="mt-3 text-xs text-muted">
            {severityUI[item.severity].label}
            {" · "}
            {statusUI[item.status].label}
            {" · "}
            {item.detectedAt}
          </p>

          <p className="mt-5 text-sm leading-6 text-muted">
            {item.description}
          </p>

          <h4 className="mt-6 text-sm font-semibold">
            Acciones sugeridas
          </h4>

          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-muted">
            {item.recommendations.map((recommendation) => (
              <li key={recommendation}>
                {recommendation}
              </li>
            ))}
          </ol>

          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-muted">
            Recomendaciones de ejemplo para este escenario
            ficticio.
          </p>
        </div>
      )}
    </aside>
  );
}