"use client";

import { createGetVulnerabilities } from "@/modules/vulnerabilities/application/get-vulnerabilities";

import { MockVulnerabilityRepository } from "@/modules/vulnerabilities/infrastructure/mock-vulnerability.repository";

import { DashboardView } from "@/modules/dashboard/presentation/DashboardView";

const load = createGetVulnerabilities(
  new MockVulnerabilityRepository(),
);

export function DashboardModule() {
  return <DashboardView load={load} />;
}