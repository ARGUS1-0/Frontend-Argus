import {
  SEVERITIES,
  STATUSES,
  type Vulnerability,
  type VulnerabilityFilters,
} from "@/modules/vulnerabilities/domain/vulnerability";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function buildDashboard(
  items: Vulnerability[],
  filters: VulnerabilityFilters,
) {
  const query = normalize(filters.query.trim());

  const visible = items.filter(
    (item) =>
      (filters.severity === "all" ||
        item.severity === filters.severity) &&
      (filters.status === "all" ||
        item.status === filters.status) &&
      (filters.technology === "all" ||
        item.technology === filters.technology) &&
      normalize(
        `${item.id} ${item.title} ${item.technology}`,
      ).includes(query),
  );

  return {
    visible,

    stats: {
      total: visible.length,

      pending: visible.filter(
        (item) => item.status !== "resolved",
      ).length,

      critical: visible.filter(
        (item) =>
          item.severity === "critical" &&
          item.status !== "resolved",
      ).length,

      resolved: visible.filter(
        (item) => item.status === "resolved",
      ).length,
    },

    severityCounts: SEVERITIES.map((severity) => ({
      severity,
      total: visible.filter(
        (item) => item.severity === severity,
      ).length,
    })),

    statusCounts: STATUSES.map((status) => ({
      status,
      total: visible.filter(
        (item) => item.status === status,
      ).length,
    })),
  };
}

export type DashboardData = ReturnType<typeof buildDashboard>;