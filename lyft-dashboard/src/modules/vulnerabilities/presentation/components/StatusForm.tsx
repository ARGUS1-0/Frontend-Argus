"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  STATUSES,
  type StatusChange,
  type Vulnerability,
  type VulnerabilityStatus,
} from "../../domain/vulnerability";

import {
  MAX_JUSTIFICATION,
  validateStatusChange,
} from "../../application/update-vulnerability-status";

import { statusUI } from "../vulnerability-ui";

interface Props {
  item: Vulnerability;
  onSubmit: (change: StatusChange) => Promise<void>;
}

/** Cambio de estado del SOC. Cada cambio queda auditado en el backend. */
export function StatusForm({
  item,
  onSubmit,
}: Props) {
  const [status, setStatus] =
    useState<VulnerabilityStatus>(item.status);
  const [justification, setJustification] =
    useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const unchanged = status === item.status;
  const needsJustification =
    status === "false_positive";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);

    const change: StatusChange = {
      status,
      justification,
    };

    const invalid = validateStatusChange(change);

    if (invalid) {
      setError(invalid);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSubmit(change);
      setJustification("");
      setSaved(true);
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "No se pudo guardar el cambio.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 border-t border-line pt-5"
      aria-label="Cambiar estado del hallazgo"
    >
      <h4 className="text-sm font-semibold">
        Estado del hallazgo
      </h4>

      <label className="mt-3 block text-xs text-muted">
        Nuevo estado
        <select
          value={status}
          onChange={(event) => {
            setStatus(
              event.target.value as VulnerabilityStatus,
            );
            setError("");
            setSaved(false);
          }}
          className="dashboard-control mt-2 w-full"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {statusUI[value].label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-xs text-muted">
        Justificación
        {needsJustification ? " (obligatoria)" : " (opcional)"}
        <textarea
          value={justification}
          onChange={(event) => {
            setJustification(event.target.value);
            setError("");
          }}
          maxLength={MAX_JUSTIFICATION}
          rows={3}
          required={needsJustification}
          aria-invalid={Boolean(error) || undefined}
          placeholder={
            needsJustification
              ? "Evidencia de que no aplica (versión parcheada, servicio no expuesto…)"
              : "Contexto para la bitácora del SOC"
          }
          className="mt-2 w-full rounded-xl border border-line bg-white p-3 text-sm text-ink"
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="mt-2 text-xs text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {saved ? (
        <p
          role="status"
          className="mt-2 text-xs text-emerald-700"
        >
          Estado actualizado.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={unchanged || saving}
        className="mt-3 h-11 w-full rounded-xl bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar estado"}
      </button>
    </form>
  );
}
