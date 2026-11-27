"use client";

import { createGetVulnerabilities } from "@/modules/vulnerabilities/application/get-vulnerabilities";
import { createUpdateVulnerabilityStatus } from "@/modules/vulnerabilities/application/update-vulnerability-status";
import { createUploadNessusScan } from "@/modules/vulnerabilities/application/upload-nessus-scan";
import { createImportThreatFeed } from "@/modules/vulnerabilities/application/import-threat-feed";

import type { VulnerabilityRepository } from "@/modules/vulnerabilities/domain/vulnerability";

import { HttpVulnerabilityRepository } from "@/modules/vulnerabilities/infrastructure/http-vulnerability.repository";
import { MockVulnerabilityRepository } from "@/modules/vulnerabilities/infrastructure/mock-vulnerability.repository";

import { getFirebaseAuth } from "@/modules/auth/infrastructure/firebase-client";

import { DashboardView } from "@/modules/dashboard/presentation/DashboardView";

// Con NEXT_PUBLIC_API_URL (p. ej. http://localhost:8081) se usa Argus_Backend;
// sin ella, los datos ficticios de demostración.
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const demo = !apiUrl;

const repository: VulnerabilityRepository = apiUrl
  ? new HttpVulnerabilityRepository(
      apiUrl,
      async () =>
        (await getFirebaseAuth().currentUser?.getIdToken()) ??
        null,
    )
  : new MockVulnerabilityRepository();

const load = createGetVulnerabilities(repository);

const updateStatus =
  createUpdateVulnerabilityStatus(repository);

const uploadScan = createUploadNessusScan(repository);

const analyze = (id: string) => repository.analyze(id);

const loadAgentStatus = () => repository.agentStatus();

const startScan = () => repository.startScan();

const listScans = () => repository.listScans();

const scanConfig = () => repository.scanConfig();

const importFeed = createImportThreatFeed(repository);

const listFeedAdvisories = () => repository.listFeedAdvisories();

export function DashboardModule() {
  return (
    <DashboardView
      load={load}
      updateStatus={updateStatus}
      uploadScan={uploadScan}
      analyze={analyze}
      loadAgentStatus={loadAgentStatus}
      startScan={startScan}
      listScans={listScans}
      scanConfig={scanConfig}
      importFeed={importFeed}
      listFeedAdvisories={listFeedAdvisories}
      demo={demo}
    />
  );
}
