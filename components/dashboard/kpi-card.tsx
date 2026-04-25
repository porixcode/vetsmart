"use client"

import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface KPICardProps {
  label: string
  value: string
  delta?: string
  deltaType?: "positive" | "negative" | "warning" | "neutral"
  sparklineData?: number[]
}

export function KPICard({
  label,
  value,
  delta,
  deltaType = "neutral",
  sparklineData,
}: KPICardProps) {
  const deltaColors = {
    positive: "text-success",
    negative: "text-danger",
    warning: "text-warning",
    neutral: "text-text-muted",
  }

  const DeltaIcon = {
    positive: TrendingUp,
    negative: TrendingDown,
    warning: AlertTriangle,
    neutral: null,
  }[deltaType]

  const chartData = sparklineData?.map((value, index) => ({ value, index })) || []

  return (
    <div className="group rounded-md border border-border bg-card p-4 transition-all duration-150 hover:border-border-strong hover:shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-semibold tabular-nums tracking-tight-custom text-text-primary">
          {value}
        </p>
        {delta && (
          <div className={cn("flex items-center gap-1 text-xs", deltaColors[deltaType])}>
            {DeltaIcon && <DeltaIcon className="h-3 w-3" strokeWidth={1.5} />}
            <span>{delta}</span>
          </div>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={1.5}
                fill="url(#sparklineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
