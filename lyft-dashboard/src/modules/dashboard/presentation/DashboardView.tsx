"use client";

import { useEffect, useState } from "react";

import type { Vulnerability } from "@/modules/vulnerabilities/domain/vulnerability";

import {
  useAppDispatch,
  useAppSelector,
} from "@/core/hooks";

import {
  resetFilters,
  updateFilters,
} from "@/modules/vulnerabilities/presentation/store/filters.slice";

import { VulnerabilityFilters } from "@/modules/vulnerabilities/presentation/components/VulnerabilityFilters";
import { VulnerabilityTable } from "@/modules/vulnerabilities/presentation/components/VulnerabilityTable";
import { MitigationPanel } from "@/modules/vulnerabilities/presentation/components/MitigationPanel";

import { buildDashboard } from "../application/build-dashboard";

import { Sidebar } from "./components/Sidebar";
import { StatCards } from "./components/StatCards";
import { DashboardCharts } from "./components/DashboardCharts";

interface Props {
  load: () => Promise<Vulnerability[]>;
}

export function DashboardView({ load }: Props) {
  const dispatch = useAppDispatch();

  const filters = useAppSelector(
    (state) => state.vulnerabilityFilters,
  );

  const [items, setItems] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let active = true;

    load()
      .then((result) => {
        if (active) {
          setItems(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "No se pudieron cargar los datos de demostración.",
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [load]);

  if (loading) {
    return (
      <main
        role="status"
        className="p-10 text-muted"
      >
        Cargando dashboard…
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-10">
        <p role="alert">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="dashboard-control mt-4"
        >
          Reintentar
        </button>
      </main>
    );
  }

  const data = buildDashboard(items, filters);

  const selected =
    data.visible.find((item) => item.id === selectedId) ??
    data.visible[0] ??
    null;

  const technologies = [
    ...new Set(items.map((item) => item.technology)),
  ].sort();

  return (
    <div className="min-h-dvh bg-slate-50 lg:pl-64">
      <Sidebar
        history={items}
        onSelect={(id) => {
          dispatch(resetFilters());
          setSelectedId(id);
        }}
      />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-7 sm:px-7 lg:px-9">
        <header
          id="resumen"
          className="scroll-mt-6"
        >
          <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[10px] font-semibold tracking-wider text-brand">
            DATOS DE DEMOSTRACIÓN
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Resumen de seguridad
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Casos ficticios del proyecto académico. No
            representan hallazgos reales de Lyft.
          </p>
        </header>

        <VulnerabilityFilters
          filters={filters}
          technologies={technologies}
          onChange={(patch) =>
            dispatch(updateFilters(patch))
          }
          onReset={() => dispatch(resetFilters())}
        />

        <StatCards stats={data.stats} />

        <DashboardCharts data={data} />

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
          <VulnerabilityTable
            items={data.visible}
            selectedId={selected?.id}
            onSelect={setSelectedId}
          />

          <MitigationPanel item={selected} />
        </div>
      </main>
    </div>
  );
}