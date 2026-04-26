"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface OccupancyData {
  day: string
  current: number
  previous: number
}

interface OccupancyChartProps {
  data?: OccupancyData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-sm border border-border bg-card px-3 py-2">
        <p className="text-xs text-text-muted mb-1">{label}</p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey}
            className="text-xs tabular-nums"
            style={{
              color: entry.dataKey === "current" ? "#2563EB" : "#71717A",
            }}
          >
            {entry.dataKey === "current" ? "Esta semana" : "Semana anterior"}:{" "}
            <span className="font-semibold">{entry.value}%</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function OccupancyChart({ data = [] }: OccupancyChartProps) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
            Tasa de ocupación semanal
          </h3>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs text-text-muted">Esta semana</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-text-muted/30" />
              <span className="text-xs text-text-muted">Semana anterior</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-48">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No hay datos disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#71717A" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#71717A" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={40}
                className="tabular-nums"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="#D4D4D8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#occupancyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
