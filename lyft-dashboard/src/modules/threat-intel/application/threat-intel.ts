import type {
  TiCveLookup,
  TiDecisionFilters,
  TiTier,
} from "../domain/threat-intel";

/** Orden de urgencia: el tier manda; el score solo ordena dentro del tier. */
export const TIER_ORDER: TiTier[] = [
  "immediate",
  "out-of-cycle",
  "scheduled",
  "defer",
  "informational",
];

/** Etiquetas por defecto (la API manda las suyas en tier_labels). */
export const DEFAULT_TIER_LABELS: Record<TiTier, string> = {
  immediate: "Inmediato",
  "out-of-cycle": "Fuera de ciclo",
  scheduled: "Programado",
  defer: "Diferir",
  informational: "Informativo",
};

/** Aviso obligatorio en cada vista con decisiones de Lyft. */
export const INFERRED_WARNING =
  "El inventario de Lyft es inferido, no confirmado, y no tiene versiones: cada decisión significa \"si el componente que usa Lyft está en el rango afectado\".";

const CVE_ID = /^CVE-\d{4}-\d{4,7}$/;

/** CVE-AAAA-NNNN en mayúsculas, o null si no tiene esa forma. */
export function normalizeCveId(raw: string): string | null {
  const id = raw.trim().toUpperCase();

  return CVE_ID.test(id) ? id : null;
}

/** Query string de /api/v1/ti/decisions; omite los filtros vacíos. */
export function decisionsQuery(
  filters: TiDecisionFilters,
  limit: number,
  offset: number,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "string" && value.trim()) {
      params.set(key, value.trim());
    }
  }

  params.set("limit", String(limit));
  params.set("offset", String(offset));

  return params.toString();
}

export function tierLabel(
  tier: TiTier | null | undefined,
  labels?: Partial<Record<TiTier, string>>,
  resultType?: string | null,
): string {
  const code: TiTier | null =
    tier ?? (resultType === "informational" ? "informational" : null);

  if (!code) return "Sin tier";

  return labels?.[code] ?? DEFAULT_TIER_LABELS[code] ?? code;
}

/** Mensaje principal del resultado de una búsqueda de CVE. */
export function lookupHeadline(result: TiCveLookup): string {
  switch (result.status) {
    case "not_found":
      return `${result.cveId} aún no está en NVD (puede ser un id mal escrito, reservado o demasiado nuevo).`;
    case "no_match":
      return `Ningún componente del inventario coincide con ${result.cveId}. Esto no significa que Lyft no esté afectado: el inventario es inferido y no tiene versiones.`;
    default: {
      const n = result.decisions.length;

      return `${result.cveId} coincide con ${n} ${n === 1 ? "componente" : "componentes"} del inventario inferido.`;
    }
  }
}

/** El CWE sugerido puede venir como texto o como objeto. */
export function predictedCweText(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const key of ["cwe_id", "id", "cwe", "top"]) {
      if (typeof record[key] === "string") return record[key] as string;
    }
  }

  return null;
}

export function formatScore(score: number | null | undefined): string {
  return typeof score === "number" ? score.toFixed(1) : "—";
}

/** 0.99673 → "99.7" (percentil EPSS). */
export function formatPercentile(
  value: number | null | undefined,
): string {
  return typeof value === "number" ? (value * 100).toFixed(1) : "—";
}

const dateTime = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateOnly = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : dateTime.format(date);
}

/** "2026-11-16" o "2026-10-22T14:17:37.190" → fecha sin hora. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);

  return Number.isNaN(date.getTime()) ? value : dateOnly.format(date);
}

/** Solo enlaces http(s); cualquier otro esquema (javascript:, data:) se descarta. */
export function safeHref(link: string | null | undefined): string | null {
  if (!link) return null;

  try {
    const url = new URL(link);

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** Etiqueta del idioma de un texto de la API. */
export function languageNote(
  language: string | null | undefined,
): string | null {
  if (language === "es") return "traducción automática";
  if (language === "en") return "texto original en inglés";

  return null;
}
