import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildDashboard } from "../src/modules/dashboard/application/build-dashboard";
import { StatCards } from "../src/modules/dashboard/presentation/components/StatCards";
import {
  STATUSES,
  type Vulnerability,
  type VulnerabilityFilters,
} from "../src/modules/vulnerabilities/domain/vulnerability";
import { MockVulnerabilityRepository } from "../src/modules/vulnerabilities/infrastructure/mock-vulnerability.repository";

const filters: VulnerabilityFilters = {
  query: "",
  severity: "all",
  status: "all",
  technology: "all",
};

const finding: Vulnerability = {
  id: "TEST-001",
  title: "Autorización insuficiente",
  technology: "Envoy",
  source: "nessus",
  severity: "critical",
  status: "open",
  detectedAt: "2026-10-11",
  description: "Caso de prueba",
  recommendations: [],
};

test("las métricas distinguen origen, severidad y estado", () => {
  const items: Vulnerability[] = [
    finding,
    { ...finding, id: "2", status: "in_progress" },
    { ...finding, id: "3", source: "manual" },
    { ...finding, id: "4", status: "resolved" },
    { ...finding, id: "5", status: "false_positive" },
    { ...finding, id: "6", severity: "high" },
  ];
  const original = structuredClone(items);
  const data = buildDashboard(items, filters);

  assert.deepEqual(data.stats, {
    total: 6, open: 3, nessusCritical: 2, falsePositives: 1, resolved: 1,
  });
  assert.deepEqual(items, original);
  assert.equal(data.statusCounts.reduce((sum, item) => sum + item.total, 0), 6);
  assert.equal(data.severityCounts.reduce((sum, item) => sum + item.total, 0), 6);
});

test("cada estado filtra las tarjetas y las gráficas de forma consistente", () => {
  const items = STATUSES.map((status, index) => ({
    ...finding, id: String(index), status,
  }));
  for (const status of STATUSES) {
    const data = buildDashboard(items, { ...filters, status });
    assert.equal(data.stats.total, 1);
    assert.equal(data.visible[0].status, status);
    assert.equal(data.stats.open, Number(status === "open"));
    assert.equal(data.stats.falsePositives, Number(status === "false_positive"));
    assert.equal(data.stats.resolved, Number(status === "resolved"));
    assert.equal(data.stats.nessusCritical, Number(status === "open" || status === "in_progress"));
    assert.equal(data.statusCounts.find((item) => item.status === status)?.total, 1);
  }
});

test("combina búsqueda sin acentos con filtros de tecnología y severidad", () => {
  const data = buildDashboard([
    finding,
    { ...finding, id: "2", technology: "Redis" },
    { ...finding, id: "3", severity: "high" },
  ], {
    ...filters, query: "  AUTORIZACION  ", technology: "Envoy", severity: "critical",
  });
  assert.deepEqual(data.visible, [finding]);
  assert.equal(data.stats.nessusCritical, 1);
});

test("sin hallazgos o sin coincidencias devuelve métricas en cero", () => {
  for (const items of [[], [finding]]) {
    const data = buildDashboard(items, { ...filters, query: "inexistente" });
    assert.deepEqual(data.stats, {
      total: 0, open: 0, nessusCritical: 0, falsePositives: 0, resolved: 0,
    });
    assert.ok(data.statusCounts.every((item) => item.total === 0));
    assert.ok(data.severityCounts.every((item) => item.total === 0));
  }
});

test("los datos demo incluyen un falso positivo sin contarlo como crítico activo", async () => {
  const items = await new MockVulnerabilityRepository().list();
  assert.deepEqual(buildDashboard(items, filters).stats, {
    total: 7, open: 2, nessusCritical: 1, falsePositives: 1, resolved: 2,
  });
});

test("las tarjetas muestran las cuatro métricas y su alcance incluso en cero", () => {
  const stats = buildDashboard([], filters).stats;
  const html = renderToStaticMarkup(createElement(StatCards, { stats }));
  for (const label of [
    "Alertas abiertas", "Críticas de Nessus", "Falsos positivos reportados", "Resueltas",
  ]) {
    assert.ok(html.includes(label));
  }
  assert.ok(html.includes("Métricas según los filtros actuales"));
  assert.ok(html.includes("0 hallazgos"));
  assert.equal((html.match(/>0<\/p>/g) ?? []).length, 4);
});
