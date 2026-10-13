"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardData } from "../../application/build-dashboard";

import {
  severityUI,
  statusUI,
} from "@/modules/vulnerabilities/presentation/vulnerability-ui";

export function DashboardCharts({
  data,
}: {
  data: DashboardData;
}) {
  const severityData = data.severityCounts.map((item) => ({
    name: severityUI[item.severity].label,
    total: item.total,
  }));

  const statusData = data.statusCounts.map((item) => ({
    name: statusUI[item.status].label,
    total: item.total,
    fill: statusUI[item.status].color,
  }));

  if (data.stats.total === 0) {
    return (
      <div className="dashboard-card text-sm text-muted">
        No hay datos para graficar con estos filtros.
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="dashboard-card min-w-0">
        <h2 className="font-semibold">
          Distribución por severidad
        </h2>

        <p className="sr-only">
          {severityData
            .map((item) => `${item.name}: ${item.total}`)
            .join(". ")}
        </p>

        <div className="mt-5 h-56">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <BarChart
              data={severityData}
              margin={{
                left: -25,
                right: 10,
                top: 10,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e4e2e9"
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip />

              <Bar
                dataKey="total"
                name="Hallazgos"
                fill="#d91578"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-card min-w-0">
        <h2 className="font-semibold">
          Estado de atención
        </h2>

        <div className="h-48">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <PieChart>
              <Pie
                data={statusData}
                dataKey="total"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
                stroke="none"
                isAnimationActive={false}
              />

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex flex-wrap justify-center gap-4 text-xs text-muted">
          {statusData.map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-2"
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: item.fill,
                }}
              />

              {item.name}: <strong>{item.total}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}