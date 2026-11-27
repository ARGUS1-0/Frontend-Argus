import {
  CircleCheckBig,
  CircleDot,
  ShieldOff,
  Siren,
  type LucideIcon,
} from "lucide-react";

import type { DashboardData } from "../../application/build-dashboard";

interface Card {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  /** Color del número. */
  color: string;
  /** Fondo y color del ícono. */
  chip: string;
  /** Franja superior de la tarjeta. */
  accent: string;
}

export function StatCards({
  stats,
}: {
  stats: DashboardData["stats"];
}) {
  const cards: Card[] = [
    {
      label: "Alertas abiertas",
      value: stats.open,
      description: "Sin iniciar atención; excluye las que están en proceso.",
      icon: CircleDot,
      color: "text-violet-700",
      chip: "bg-violet-50 text-violet-700",
      accent: "from-violet-500 to-fuchsia-500",
    },
    {
      label: "Críticas de Nessus",
      value: stats.nessusCritical,
      description: "Críticas abiertas o en proceso detectadas por Nessus.",
      icon: Siren,
      color: "text-rose-700",
      chip: "bg-rose-50 text-rose-700",
      accent: "from-rose-500 to-pink-500",
    },
    {
      label: "Falsos positivos reportados",
      value: stats.falsePositives,
      description: "Hallazgos clasificados como falsos positivos.",
      icon: ShieldOff,
      color: "text-slate-700",
      chip: "bg-slate-100 text-slate-600",
      accent: "from-slate-400 to-slate-500",
    },
    {
      label: "Resueltas",
      value: stats.resolved,
      description: "Hallazgos resueltos; excluye los falsos positivos.",
      icon: CircleCheckBig,
      color: "text-emerald-700",
      chip: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted" role="status">
        Métricas según los filtros actuales · {stats.total} hallazgos
      </p>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="list" aria-label="Métricas de seguridad">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <section
              key={card.label}
              role="listitem"
              className="dashboard-card dashboard-card-hover relative overflow-hidden"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.accent}`}
              />

              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xs font-medium text-muted">{card.label}</h3>

                <span
                  aria-hidden="true"
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${card.chip}`}
                >
                  <Icon size={18} />
                </span>
              </div>

              <p className={`mt-1 text-3xl font-semibold tabular-nums ${card.color}`}>
                {card.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">
                {card.description}
              </p>
            </section>
          );
        })}
    </div>
    </div>
  );
}
