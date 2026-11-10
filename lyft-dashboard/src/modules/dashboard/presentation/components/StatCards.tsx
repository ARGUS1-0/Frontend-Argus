import type { DashboardData } from "../../application/build-dashboard";

export function StatCards({
  stats,
}: {
  stats: DashboardData["stats"];
}) {
  const cards = [
    {
      label: "Alertas abiertas",
      value: stats.open,
      description: "Sin iniciar atención; excluye las que están en proceso.",
      color: "text-violet-700",
    },
    {
      label: "Críticas de Nessus",
      value: stats.nessusCritical,
      description: "Críticas abiertas o en proceso detectadas por Nessus.",
      color: "text-rose-700",
    },
    {
      label: "Falsos positivos reportados",
      value: stats.falsePositives,
      description: "Hallazgos clasificados como falsos positivos.",
      color: "text-slate-700",
    },
    {
      label: "Resueltas",
      value: stats.resolved,
      description: "Hallazgos resueltos; excluye los falsos positivos.",
      color: "text-emerald-700",
    },
  ];

  return (
    <section aria-label="Métricas de seguridad" className="space-y-3">
      <p className="text-xs text-muted" role="status">
        Métricas según los filtros actuales · {stats.total} hallazgos
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <section key={card.label} className="dashboard-card">
            <h2 className="text-xs text-muted">{card.label}</h2>
            <p className={`mt-3 text-3xl font-semibold ${card.color}`}>
              {card.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              {card.description}
            </p>
          </section>
        ))}
      </div>
    </section>
  );
}
