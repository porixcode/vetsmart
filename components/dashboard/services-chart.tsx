"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const servicesData = [
  { name: "Consulta general", count: 45 },
  { name: "Vacunación", count: 38 },
  { name: "Desparasitación", count: 24 },
  { name: "Estética", count: 18 },
  { name: "Cirugía menor", count: 12 },
  { name: "Urgencias", count: 8 },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { name: string } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-sm border border-border bg-card px-3 py-2">
        <p className="text-xs text-text-muted">{payload[0].payload.name}</p>
        <p className="text-sm font-semibold tabular-nums text-text-primary">
          {payload[0].value} atenciones
        </p>
      </div>
    )
  }
  return null
}

export function ServicesChart() {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
          Atenciones por servicio
        </h3>
        <p className="mt-1 text-xs text-text-muted">Últimos 30 días</p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={servicesData}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#71717A" }}
              className="tabular-nums"
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#52525B" }}
              width={120}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#F5F5F5" }}
            />
            <Bar
              dataKey="count"
              fill="#2563EB"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
