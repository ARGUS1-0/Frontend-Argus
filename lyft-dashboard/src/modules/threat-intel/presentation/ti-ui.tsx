import type { TiTier } from "../domain/threat-intel";

import { tierLabel } from "../application/threat-intel";

/**
 * Colores de los tiers de Lyft. Son a propósito distintos de los de
 * severidad de Argus (Crítica/Alta…): un tier no es una prioridad de Argus.
 */
export const tierUI: Record<TiTier | "none", { badge: string; color: string }> = {
  immediate: { badge: "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200", color: "#a21caf" },
  "out-of-cycle": { badge: "bg-violet-100 text-violet-800 ring-violet-200", color: "#7c3aed" },
  scheduled: { badge: "bg-indigo-50 text-indigo-700 ring-indigo-200", color: "#4f46e5" },
  defer: { badge: "bg-slate-100 text-slate-600 ring-slate-200", color: "#64748b" },
  informational: { badge: "bg-teal-50 text-teal-700 ring-teal-200", color: "#0f766e" },
  none: { badge: "bg-slate-50 text-slate-500 ring-slate-200", color: "#94a3b8" },
};

export function TierBadge({
  tier,
  label,
  resultType,
}: {
  tier: TiTier | null | undefined;
  label?: string | null;
  resultType?: string | null;
}) {
  const code: TiTier | "none" =
    tier ?? (resultType === "informational" ? "informational" : "none");

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tierUI[code].badge}`}
      title="Tier del modelo de Lyft (no es la prioridad de Argus)"
    >
      {label || tierLabel(tier, undefined, resultType)}
    </span>
  );
}
