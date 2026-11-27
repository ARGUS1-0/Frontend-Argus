"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bug, Layers, ShieldAlert, UserCheck, type LucideIcon } from "lucide-react";

import type { TiSummary } from "../../domain/threat-intel";

import { TIER_ORDER, formatScore, tierLabel } from "../../application/threat-intel";

import { TierBadge, tierUI } from "../ti-ui";

interface Card {
  label: string;
  value: number | undefined;
  description: string;
  icon: LucideIcon;
}

/** Tarjetas, decisiones por tier y las 10 más urgentes (tier primero, luego score). */
export function TiSummaryPanel({
  summary,
  onSelect,
}: {
  summary: TiSummary;
  onSelect: (itemId: string, componentId: string) => void;
}) {
  const labels = summary.tier_labels;
  const totals = summary.totals ?? {};

  const cards: Card[] = [
    {
      label: "Decisiones",
      value: totals.decisions,
      description: "Una por cada par (CVE, componente del inventario).",
      icon: Layers,
    },
    {
      label: "CVE distintos",
      value: totals.distinct_cves,
      description: "Cada CVE se cuenta una vez.",
      icon: Bug,
    },
    {
      label: "En KEV de CISA",
      value: totals.kev_decisions,
      description: "Decisiones sobre CVE explotados activamente.",
      icon: ShieldAlert,
    },
    {
      label: "Requieren revisión",
      value: totals.needs_review_decisions,
      description: "Cruces que una persona debe confirmar.",
      icon: UserCheck,
    },
  ];

  const tierData = TIER_ORDER.map((tier) => ({
    tier,
    name: tierLabel(tier, labels),
    decisions: summary.decisions_by_tier?.[tier] ?? 0,
    cves: summary.distinct_cves_by_highest_tier?.[tier] ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, description, icon: Icon }) => (
          <article key={label} className="dashboard-card relative overflow-hidden">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-500 to-fuchsia-500" />
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted">{label}</h3>
              <span className="rounded-lg bg-violet-50 p-2 text-violet-700">
                <Icon size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{value ?? "—"}</p>
            <p className="mt-2 text-xs text-muted">{description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="dashboard-card min-w-0">
          <h3 className="font-semibold">Decisiones por tier de Lyft</h3>
          <p className="mt-1 text-xs text-muted">
            Del más urgente al menos urgente. Informativo: lo parcha un proveedor.
          </p>

          <p className="sr-only">
            {tierData.map((t) => `${t.name}: ${t.decisions} decisiones, ${t.cves} CVE`).join(". ")}
          </p>

          <div className="mt-5 h-60" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={tierData} margin={{ left: -20, right: 10, top: 22 }}>
                <CartesianGrid vertical={false} stroke="#e4e2e9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: "rgb(124 58 237 / 6%)" }}
                  formatter={(value) => [value, "Decisiones"]}
                />
                <Bar dataKey="decisions" radius={[8, 8, 0, 0]} maxBarSize={56} isAnimationActive={false}>
                  <LabelList dataKey="decisions" position="top" fontSize={12} fill="#171725" />
                  {tierData.map((entry) => (
                    <Cell key={entry.tier} fill={tierUI[entry.tier].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="mt-4 w-full text-left text-xs">
            <caption className="sr-only">Decisiones y CVE por tier</caption>
            <thead className="text-muted">
              <tr>
                <th scope="col" className="py-1 font-medium">Tier</th>
                <th scope="col" className="py-1 text-right font-medium">Decisiones</th>
                <th scope="col" className="py-1 text-right font-medium">CVE (tier más urgente)</th>
              </tr>
            </thead>
            <tbody>
              {tierData.map((t) => (
                <tr key={t.tier} className="border-t border-line">
                  <td className="py-1.5"><TierBadge tier={t.tier} label={t.name} /></td>
                  <td className="py-1.5 text-right tabular-nums">{t.decisions}</td>
                  <td className="py-1.5 text-right tabular-nums">{t.cves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="dashboard-card min-w-0">
          <h3 className="font-semibold">Las 10 más urgentes</h3>
          <p className="mt-1 text-xs text-muted">Ordenadas por tier y, dentro de cada tier, por score.</p>

          <ol className="mt-4 divide-y divide-line">
            {(summary.top10_by_tier_then_score ?? []).map((row) => (
              <li key={`${row.item_id}|${row.component_id}`}>
                <button
                  type="button"
                  onClick={() => onSelect(row.item_id, row.component_id)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-xs">{row.item_id}</span>
                    <span className="block truncate text-xs text-muted">
                      {row.component_id}
                      {row.kev ? " · KEV" : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <TierBadge tier={row.tier} label={tierLabel(row.tier, labels)} />
                    <span className="w-10 text-right text-xs tabular-nums text-muted">{formatScore(row.score)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
