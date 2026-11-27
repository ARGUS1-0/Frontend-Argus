"use client";

import type { ThreatIntelRepository } from "@/modules/threat-intel/domain/threat-intel";

import { HttpThreatIntelRepository } from "@/modules/threat-intel/infrastructure/http-threat-intel.repository";

import { getFirebaseAuth } from "@/modules/auth/infrastructure/firebase-client";

import { ThreatIntelView } from "@/modules/threat-intel/presentation/ThreatIntelView";

// Igual que el dashboard: con NEXT_PUBLIC_API_URL se usa Argus_Backend. Esta
// sección no tiene datos de demostración.
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const repository: ThreatIntelRepository | null = apiUrl
  ? new HttpThreatIntelRepository(
      apiUrl,
      async () => (await getFirebaseAuth().currentUser?.getIdToken()) ?? null,
    )
  : null;

export function ThreatIntelModule() {
  return <ThreatIntelView repository={repository} />;
}
