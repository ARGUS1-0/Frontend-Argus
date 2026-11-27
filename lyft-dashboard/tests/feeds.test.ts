import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  createImportThreatFeed,
  DEFAULT_FEED_URL,
  safeHref,
  sortAdvisories,
  summarizeAdvisories,
  validateFeedUrl,
} from "../src/modules/vulnerabilities/application/import-threat-feed";
import type { FeedAdvisory } from "../src/modules/vulnerabilities/domain/vulnerability";
import { HttpVulnerabilityRepository } from "../src/modules/vulnerabilities/infrastructure/http-vulnerability.repository";
import { MockVulnerabilityRepository } from "../src/modules/vulnerabilities/infrastructure/mock-vulnerability.repository";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function stubFetch(status: number, body: unknown) {
  const calls: { url: string; init: RequestInit }[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return calls;
}

function advisory(overrides: Partial<FeedAdvisory>): FeedAdvisory {
  return {
    id: "a",
    cveId: null,
    title: "Aviso",
    link: null,
    category: null,
    publishedAt: null,
    description: null,
    cvssScore: null,
    severity: null,
    knownExploited: false,
    suspicious: false,
    suspiciousReasons: [],
    feedTitle: null,
    feedUrl: DEFAULT_FEED_URL,
    lastSeenAt: "2026-11-18T00:00:00Z",
    ...overrides,
  };
}

test("solo se aceptan URLs http(s) sin credenciales", () => {
  assert.equal(validateFeedUrl(DEFAULT_FEED_URL), null);
  assert.equal(validateFeedUrl("  https://example.com/feed.xml "), null);
  assert.ok(validateFeedUrl(""));
  assert.ok(validateFeedUrl("no es una url"));
  assert.ok(validateFeedUrl("file:///etc/passwd"));
  assert.ok(validateFeedUrl("javascript:alert(1)"));
  assert.ok(validateFeedUrl("https://user:pass@example.com/feed.xml"));
});

test("leer un feed manda la URL al backend como JSON", async () => {
  const result = {
    feedTitle: "SecIntel",
    feedUrl: DEFAULT_FEED_URL,
    insecureTransport: true,
    total: 12,
    created: 12,
    updated: 0,
    suspicious: 9,
    knownExploited: 1,
  };
  const calls = stubFetch(200, result);
  const repository = new HttpVulnerabilityRepository("http://localhost:8081", async () => "token-123");

  assert.deepEqual(await createImportThreatFeed(repository)(` ${DEFAULT_FEED_URL} `), result);
  assert.equal(calls[0].url, "http://localhost:8081/api/v1/feeds/import");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body as string), { url: DEFAULT_FEED_URL });
});

test("el error del backend (dominio no permitido) llega en español", async () => {
  stubFetch(400, { error: "El dominio evil.example no está en la lista de feeds permitidos" });
  const repository = new HttpVulnerabilityRepository("http://localhost:8081", async () => "token-123");

  await assert.rejects(
    createImportThreatFeed(repository)("https://evil.example/feed.xml"),
    /no está en la lista/,
  );
});

test("una URL inválida no llega al backend", async () => {
  const calls = stubFetch(200, {});
  const repository = new HttpVulnerabilityRepository("http://localhost:8081", async () => "token-123");

  await assert.rejects(createImportThreatFeed(repository)("ftp://example.com/f.xml"), /http/);
  assert.equal(calls.length, 0);
});

test("los avisos se ordenan por severidad y luego por fecha", () => {
  const sorted = sortAdvisories([
    advisory({ id: "medium", severity: "medium", publishedAt: "2026-11-03T12:00:00Z" }),
    advisory({ id: "none" }),
    advisory({ id: "critical-old", severity: "critical", publishedAt: "2026-11-01T00:00:00Z" }),
    advisory({ id: "critical-new", severity: "critical", publishedAt: "2026-11-03T00:00:00Z" }),
  ]);

  assert.deepEqual(sorted.map((a) => a.id), ["critical-new", "critical-old", "medium", "none"]);
});

test("el resumen cuenta críticos, KEV y sospechosos", () => {
  assert.deepEqual(
    summarizeAdvisories([
      advisory({ severity: "critical", knownExploited: true }),
      advisory({ severity: "critical", suspicious: true }),
      advisory({ severity: "high", suspicious: true }),
    ]),
    { total: 3, critical: 2, knownExploited: 1, suspicious: 2 },
  );
});

test("solo se enlazan URLs http(s)", () => {
  assert.equal(safeHref("https://secintel-feeds.net/vuln/CVE-2026-2290"), "https://secintel-feeds.net/vuln/CVE-2026-2290");
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("data:text/html,hola"), null);
  assert.equal(safeHref(null), null);
});

test("la demo no tiene avisos y pide el backend para leer feeds", async () => {
  const repository = new MockVulnerabilityRepository();
  assert.deepEqual(await repository.listFeedAdvisories(), []);
  await assert.rejects(repository.importFeed(), /NEXT_PUBLIC_API_URL/);
});
