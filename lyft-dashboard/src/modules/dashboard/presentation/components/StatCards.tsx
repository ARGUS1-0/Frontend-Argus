import type { DashboardData } from "../../application/build-dashboard";

export function StatCards({
  stats,
}: {
  stats: DashboardData["stats"];
}) {
  const cards = [
    {
      label: "Hallazgos filtrados",
      value: stats.total,
      color: "text-ink",
    },
    {
      label: "Pendientes",
      value: stats.pending,
      color: "text-violet-700",
    },
    {
      label: "Críticas pendientes",
      value: stats.critical,
      color: "text-rose-700",
    },
    {
      label: "Resueltas",
      value: stats.resolved,
      color: "text-emerald-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <section
          key={card.label}
          className="dashboard-card"
        >
          <h2 className="text-xs text-muted">
            {card.label}
          </h2>

          <p
            className={`mt-3 text-3xl font-semibold ${card.color}`}
          >
            {card.value}
          </p>
        </section>
      ))}
    </div>
  );
}