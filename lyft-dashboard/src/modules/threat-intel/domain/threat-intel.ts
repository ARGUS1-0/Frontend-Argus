/**
 * Datos de la API de inteligencia de amenazas de Lyft, servidos por
 * Argus_Backend desde su copia en MySQL (/api/v1/ti/*).
 *
 * Todo el texto que viene de la API (descripciones, rationale, títulos)
 * es dato externo no confiable: se muestra siempre como texto (React lo
 * escapa) y nunca con dangerouslySetInnerHTML.
 */

/** Códigos de tier de Lyft. No se traducen a CRÍTICA/ALTA ni a SLAs. */
export type TiTier =
  | "immediate"
  | "out-of-cycle"
  | "scheduled"
  | "defer"
  | "informational";

export interface TiDataInfo {
  feedBuiltAt: string | null;
  syncedAt: string | null;
  epssScoreDate: string | null;
  newestPublished: string | null;
  decisions: number | null;
  distinctCves: number | null;
  components: number | null;
  articles: number | null;
}

export interface TiRunInfo {
  status: "success" | "failed";
  requestedBy: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  feedBuiltAt: string | null;
  error: string | null;
}

export interface TiStatus {
  configured: boolean;
  keyRejected: boolean;
  syncing: boolean;
  lastCheckAt: string | null;
  lastCheckError: string | null;
  upstreamBuiltAt: string | null;
  updateAvailable: boolean;
  data: TiDataInfo | null;
  lastRun: TiRunInfo | null;
  architectureInferred: boolean;
  freshnessNote: string;
}

/** /summary de la API (solo los campos que usa la página). */
export interface TiSummary {
  meta?: {
    built_at?: string;
    as_of?: { epss_score_date?: string };
  };
  totals?: {
    decisions?: number;
    distinct_cves?: number;
    needs_review_decisions?: number;
    kev_decisions?: number;
  };
  decisions_by_tier?: Partial<Record<TiTier, number>>;
  distinct_cves_by_highest_tier?: Partial<Record<TiTier, number>>;
  top10_by_tier_then_score?: {
    item_id: string;
    component_id: string;
    tier: TiTier | null;
    score: number | null;
    kev: boolean;
  }[];
  published_range?: [string, string];
  tier_labels?: Partial<Record<TiTier, string>>;
}

export interface TiSummaryResponse {
  status: TiStatus;
  summary: TiSummary | null;
}

/** Fila de la tabla de decisiones. */
export interface TiDecisionRow {
  itemId: string;
  componentId: string;
  componentName: string | null;
  resultType: string | null;
  tier: TiTier | null;
  tierLabel: string | null;
  score: number | null;
  kev: boolean;
  needsReview: boolean;
  published: string | null;
  cvssV31: number | null;
  epssPercentile: number | null;
  rationale: string | null;
}

export interface TiDecisionPage {
  total: number;
  distinctCves: number;
  returned: number;
  offset: number;
  results: TiDecisionRow[];
}

export interface TiDecisionFilters {
  product?: string;
  text?: string;
  cve?: string;
  tier?: TiTier | "";
  from?: string;
  to?: string;
  kev?: "" | "true" | "false";
  review?: "" | "true" | "false";
  cwe?: string;
}

/** Decisión completa tal como la devuelve la API (solo lo que se muestra). */
export interface TiDecisionDetail {
  item_id: string;
  component_id: string;
  result_type?: string | null;
  tier?: TiTier | null;
  tier_label?: string | null;
  score?: number | null;
  score_terms?: Record<string, number> | null;
  decision_point_labels?: Partial<
    Record<"exploitation" | "exposure" | "automatable" | "human_impact", string>
  > | null;
  kev?: boolean;
  kev_date_added?: string | null;
  kev_due_date?: string | null;
  epss_percentile?: number | null;
  epss_probability?: number | null;
  epss_score_date?: string | null;
  cvss_v31?: number | null;
  published?: string | null;
  last_modified?: string | null;
  confidence?: number | null;
  method_labels?: string[] | null;
  needs_review?: boolean;
  needs_review_reason_labels?: string[] | null;
  flag_labels?: string[] | null;
  rationale?: string | null;
  rationale_llm?: string | null;
  rationale_llm_language?: string | null;
  description?: string | null;
  description_language?: string | null;
  cwe_ids?: string[] | null;
  predicted_cwe?: unknown;
  links?: {
    nvd?: string | null;
    references_total?: number | null;
  } | null;
  component?: {
    name?: string | null;
    vendor?: string | null;
    layer?: string | null;
    criticality?: string | null;
    exposure?: string | null;
    patch_responsibility?: string | null;
    evidence?: string | null;
  } | null;
}

export type TiLookupStatus = "ok" | "no_match" | "not_found";

export interface TiCveLookup {
  cveId: string;
  source: "feed" | "live";
  status: TiLookupStatus;
  cached: boolean;
  published: string | null;
  description: string | null;
  descriptionLanguage: string | null;
  decisions: TiDecisionDetail[];
  feedBuiltAt: string | null;
  epssScoreDate: string | null;
  asOfUtc: string | null;
  note: string | null;
}

export interface TiSyncResult {
  outcome: "UPDATED" | "UNCHANGED" | "FAILED" | "BUSY" | "DISABLED";
  feedBuiltAt: string | null;
  decisions: number | null;
  message: string;
}

export interface ThreatIntelRepository {
  summary(): Promise<TiSummaryResponse>;
  decisions(
    filters: TiDecisionFilters,
    limit: number,
    offset: number,
  ): Promise<TiDecisionPage>;
  decision(
    itemId: string,
    componentId: string,
  ): Promise<TiDecisionDetail>;
  lookupCve(id: string): Promise<TiCveLookup>;
  sync(): Promise<TiSyncResult>;
}
