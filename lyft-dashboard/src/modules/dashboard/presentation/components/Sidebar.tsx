"use client";

import { Database, PieChart, ShieldAlert } from "lucide-react";

import { AppSidebar } from "@/core/layout/AppSidebar";

import type { Vulnerability } from "@/modules/vulnerabilities/domain/vulnerability";

import { severityUI } from "@/modules/vulnerabilities/presentation/vulnerability-ui";

const SECTIONS = [
  { href: "#resumen", label: "Resumen", icon: PieChart },
  { href: "#hallazgos", label: "Hallazgos y mitigación", icon: ShieldAlert },
  { href: "#fuentes", label: "Fuentes de datos", icon: Database },
];

/** Hallazgos recientes que se muestran en el menú (la lista completa está en la tabla). */
const HISTORY_LIMIT = 6;

interface Props {
  history: Vulnerability[];
  onSelect: (id: string) => void;
}

export function Sidebar({ history, onSelect }: Props) {
  const recent = [...history]
    .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
    .slice(0, HISTORY_LIMIT);

  return (
    <AppSidebar current="dashboard" sections={SECTIONS}>
      {recent.length > 0 ? (
        <>
          <p className="sidebar-label mt-7">Hallazgos recientes</p>

          <ul className="mt-2 space-y-0.5">
            {recent.map((item) => (
              <li key={item.id}>
                <a
                  href="#hallazgos"
                  onClick={() => onSelect(item.id)}
                  className="block rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-1.5 shrink-0 rounded-full ${
                        item.severity === "critical"
                          ? "bg-rose-400"
                          : item.severity === "high"
                            ? "bg-orange-400"
                            : item.severity === "medium"
                              ? "bg-amber-300"
                              : "bg-sky-300"
                      }`}
                    />
                    <span className="truncate text-xs text-slate-200">{item.title}</span>
                  </span>
                  <span className="mt-0.5 block pl-3.5 font-mono text-[10px] text-slate-500">
                    {item.id} · {severityUI[item.severity].label} · {item.detectedAt}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </AppSidebar>
  );
}
