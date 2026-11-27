import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  createUpdateVulnerabilityStatus,
  validateStatusChange,
} from "../src/modules/vulnerabilities/application/update-vulnerability-status";
import {
  ApiError,
  HttpVulnerabilityRepository,
} from "../src/modules/vulnerabilities/infrastructure/http-vulnerability.repository";
import { validateNessusFile } from "../src/modules/vulnerabilities/application/upload-nessus-scan";
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

test("un falso positivo exige justificación; los demás estados no", () => {
  assert.ok(validateStatusChange({ status: "false_positive", justification: "  " }));
  assert.equal(validateStatusChange({ status: "false_positive", justification: "Parche aplicado" }), null);
  assert.equal(validateStatusChange({ status: "resolved" }), null);
});

test("el repositorio HTTP manda el ID token de Firebase y el cambio de estado", async () => {
  const calls = stubFetch(200, { id: "v-1", status: "false_positive" });
  const repository = new HttpVulnerabilityRepository("http://localhost:8081/", async () => "token-123");

  const updated = await createUpdateVulnerabilityStatus(repository)("v-1", {
    status: "false_positive",
    justification: "  Versión parcheada  ",
  });

  assert.equal(updated.status, "false_positive");
  assert.equal(calls[0].url, "http://localhost:8081/api/v1/vulnerabilities/v-1/status");
  assert.equal(calls[0].init.method, "PATCH");
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers.Authorization, "Bearer token-123");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    status: "false_positive",
    justification: "Versión parcheada",
  });
});

test("sin sesión o con 401 el repositorio falla con un mensaje en español", async () => {
  const calls = stubFetch(401, { error: "Invalid or expired Firebase ID token" });

  await assert.rejects(
    new HttpVulnerabilityRepository("http://api", async () => null).list(),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(calls.length, 0, "sin token no se llama al backend");

  await assert.rejects(
    new HttpVulnerabilityRepository("http://api", async () => "expired").list(),
    /sesión expiró/,
  );
});

test("el CSV de Nessus se sube como multipart sin forzar Content-Type JSON", async () => {
  const calls = stubFetch(202, { scan_id: "scan-1", topic: "nessus-raw-events", published: 4 });
  const repository = new HttpVulnerabilityRepository("http://localhost:8081", async () => "token-123");

  const result = await repository.uploadNessusScan(
    new File(["Plugin ID,Risk\n100634,Critical\n"], "argus1_scan.csv", { type: "text/csv" }),
  );

  assert.deepEqual(result, { scanId: "scan-1", published: 4 });
  assert.equal(calls[0].url, "http://localhost:8081/api/v1/ingest/nessus");
  assert.ok(calls[0].init.body instanceof FormData);
  assert.ok((calls[0].init.body as FormData).get("file") instanceof File);
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers["Content-Type"], undefined);
});

test("solo se aceptan CSV o XML de Nessus no vacíos de hasta 50 MB", () => {
  assert.ok(validateNessusFile({ name: "scan.pdf", size: 10 }));
  assert.ok(validateNessusFile({ name: "scan.csv", size: 0 }));
  assert.ok(validateNessusFile({ name: "scan.csv", size: 51 * 1024 * 1024 }));
  assert.ok(validateNessusFile({ name: "scan.xml", size: 0 }));
  assert.equal(validateNessusFile({ name: "Argus1.CSV", size: 10 }), null);
  assert.equal(validateNessusFile({ name: "argus1_scan.xml", size: 10 }), null);
  assert.equal(validateNessusFile({ name: "Argus1.NESSUS", size: 10 }), null);
});

test("el XML de Nessus se sube por el mismo endpoint", async () => {
  const calls = stubFetch(202, { scan_id: "scan-2", topic: "nessus-raw-events", published: 1 });
  const repository = new HttpVulnerabilityRepository("http://localhost:8081", async () => "token-123");

  const result = await repository.uploadNessusScan(
    new File(["<NessusClientData_v2/>"], "argus1_scan.nessus", { type: "application/xml" }),
  );

  assert.deepEqual(result, { scanId: "scan-2", published: 1 });
  assert.equal(calls[0].url, "http://localhost:8081/api/v1/ingest/nessus");
  assert.equal(((calls[0].init.body as FormData).get("file") as File).name, "argus1_scan.nessus");
});

test("la demo permite cambiar el estado sin alterar los datos base", async () => {
  const repository = new MockVulnerabilityRepository();
  await repository.updateStatus("DEMO-001", { status: "resolved" });

  const items = await repository.list();
  assert.equal(items.find((item) => item.id === "DEMO-001")?.status, "resolved");

  const fresh = await new MockVulnerabilityRepository().list();
  assert.equal(fresh.find((item) => item.id === "DEMO-001")?.status, "open");
});
