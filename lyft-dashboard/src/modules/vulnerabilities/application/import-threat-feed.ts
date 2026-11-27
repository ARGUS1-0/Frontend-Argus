import type {
  FeedAdvisory,
  Severity,
  VulnerabilityRepository,
} from "../domain/vulnerability";

/** Feed de avisos del proyecto; se sugiere en el campo de URL. */
export const DEFAULT_FEED_URL =
  "http://martinmolina.com.mx/concentracion/lyft-threat-feed.xml";

const MAX_URL_LENGTH = 2048;

/**
 * Revisión rápida antes de llamar al backend. La lista de dominios
 * permitidos y el resto de las reglas anti-SSRF viven en el backend.
 */
export function validateFeedUrl(raw: string): string | null {
  const value = raw.trim();

  if (!value) return "Escribe la URL del feed.";

  if (value.length > MAX_URL_LENGTH) {
    return "La URL es demasiado larga.";
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return "La URL no es válida.";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "La URL debe empezar con http:// o https://.";
  }

  if (url.username || url.password) {
    return "La URL no puede incluir usuario ni contraseña.";
  }

  return null;
}

export function createImportThreatFeed(
  repository: VulnerabilityRepository,
) {
  return async (url: string) => {
    const error = validateFeedUrl(url);

    if (error) {
      throw new Error(error);
    }

    return repository.importFeed(url.trim());
  };
}

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Más severos primero; a igual severidad, el más reciente. */
export function sortAdvisories(
  advisories: FeedAdvisory[],
): FeedAdvisory[] {
  return [...advisories].sort((a, b) => {
    const rank =
      (b.severity ? SEVERITY_RANK[b.severity] : 0) -
      (a.severity ? SEVERITY_RANK[a.severity] : 0);

    if (rank !== 0) return rank;

    return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
  });
}

export interface AdvisorySummary {
  total: number;
  critical: number;
  knownExploited: number;
  suspicious: number;
}

export function summarizeAdvisories(
  advisories: FeedAdvisory[],
): AdvisorySummary {
  return {
    total: advisories.length,
    critical: advisories.filter((a) => a.severity === "critical").length,
    knownExploited: advisories.filter((a) => a.knownExploited).length,
    suspicious: advisories.filter((a) => a.suspicious).length,
  };
}

/** Solo enlaces http(s); cualquier otro esquema (javascript:, data:) se descarta. */
export function safeHref(link: string | null): string | null {
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
