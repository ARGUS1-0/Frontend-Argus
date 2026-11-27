"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { Upload } from "lucide-react";

import type { IngestResult } from "../../domain/vulnerability";

import {
  NESSUS_FILE_ACCEPT,
  validateNessusFile,
} from "../../application/upload-nessus-scan";

interface Props {
  upload: (file: File) => Promise<IngestResult>;
  /** Se llama tras publicar en Kafka para volver a leer los hallazgos. */
  onUploaded: () => void;
}

// El consumidor de Kafka guarda en MySQL de forma asíncrona: se espera un
// momento antes de recargar la tabla.
const RELOAD_DELAY_MS = 3000;

export function NessusUpload({
  upload,
  onUploaded,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setMessage("");

    const invalid = validateNessusFile(file);

    if (invalid) {
      setError(invalid);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await upload(file);

      setMessage(
        result.published === 0
          ? "El escaneo no tiene hallazgos de riesgo medio o superior."
          : `Se enviaron ${result.published} hallazgos a Kafka. Actualizando la tabla…`,
      );

      if (result.published > 0) {
        setTimeout(onUploaded, RELOAD_DELAY_MS);
      }
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "No se pudo subir el escaneo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="dashboard-card flex flex-wrap items-start justify-between gap-4"
      aria-label="Subir escaneo de Nessus"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-brand"><Upload size={18} /></span>
        <div className="min-w-0">
        <h3 className="font-semibold">Subir un escaneo</h3>

        <p className="mt-1 text-xs text-muted">
          Sube el CSV o el XML (.nessus) exportado.
          Se publican los hallazgos de riesgo medio o
          superior.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-2 text-xs text-rose-700"
          >
            {error}
          </p>
        ) : null}

        {message ? (
          <p
            role="status"
            className="mt-2 text-xs text-emerald-700"
          >
            {message}
          </p>
        ) : null}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept={NESSUS_FILE_ACCEPT}
        onChange={handleFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="btn btn-secondary"
      >
        <Upload size={16} aria-hidden="true" />
        {busy ? "Subiendo…" : "Subir CSV / XML"}
      </button>
    </section>
  );
}
