import type {
  ThreatIntelRepository,
  TiCveLookup,
  TiDecisionDetail,
  TiDecisionFilters,
  TiDecisionPage,
  TiSummaryResponse,
  TiSyncResult,
} from "../domain/threat-intel";

import { decisionsQuery } from "../application/threat-intel";

import {
  ApiError,
  type TokenProvider,
} from "@/modules/vulnerabilities/infrastructure/http-vulnerability.repository";

const MESSAGES: Record<number, string> = {
  401: "Tu sesión expiró. Vuelve a iniciar sesión.",
  429: "Llegaste al límite de búsquedas en vivo. Espera un minuto.",
  502: "Una fuente de la API de Lyft falló. Intenta más tarde.",
  503: "La inteligencia de amenazas no está disponible en este momento.",
};

/**
 * Repositorio contra /api/v1/ti/* de Argus_Backend. El navegador nunca
 * llama a la API de Lyft: la llave vive solo en el backend.
 */
export class HttpThreatIntelRepository implements ThreatIntelRepository {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly getToken: TokenProvider,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  summary(): Promise<TiSummaryResponse> {
    return this.request<TiSummaryResponse>("/api/v1/ti/summary");
  }

  decisions(
    filters: TiDecisionFilters,
    limit: number,
    offset: number,
  ): Promise<TiDecisionPage> {
    return this.request<TiDecisionPage>(
      `/api/v1/ti/decisions?${decisionsQuery(filters, limit, offset)}`,
    );
  }

  decision(
    itemId: string,
    componentId: string,
  ): Promise<TiDecisionDetail> {
    return this.request<TiDecisionDetail>(
      `/api/v1/ti/decisions/${encodeURIComponent(itemId)}/${encodeURIComponent(componentId)}`,
    );
  }

  lookupCve(id: string): Promise<TiCveLookup> {
    return this.request<TiCveLookup>(
      `/api/v1/ti/cve/${encodeURIComponent(id)}`,
    );
  }

  sync(): Promise<TiSyncResult> {
    return this.request<TiSyncResult>("/api/v1/ti/sync", {
      method: "POST",
    });
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const token = await this.getToken();

    if (!token) throw new ApiError(MESSAGES[401], 401);

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new ApiError("No pudimos conectar con el servidor de Argus.", 0);
    }

    if (!response.ok) {
      throw new ApiError(await errorMessage(response), response.status);
    }

    return (await response.json()) as T;
  }
}

/** Se prefiere el detalle del backend ({"error": "..."}), que ya viene en español. */
async function errorMessage(response: Response): Promise<string> {
  if (response.status === 401) return MESSAGES[401];

  try {
    const body = (await response.json()) as { error?: unknown };

    if (typeof body.error === "string" && body.error) return body.error;
  } catch {
    // Cuerpo vacío o no JSON.
  }

  return (
    MESSAGES[response.status] ??
    `Error inesperado del servidor (${response.status}).`
  );
}
