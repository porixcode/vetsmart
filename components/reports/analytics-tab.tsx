"use client"

import * as React from "react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

const CURRENCY = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })

interface AnalyticsTabProps {
  data: any
}

function Sparkline({ data, color = "#3B82F6" }: { data: number[]; color?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const h = 32, w = 80
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function KpiCard({ label, value, prev, unit, sparkline, icon: Icon, color }: {
  label: string; value: number; prev: number; unit: string; sparkline: number[]
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; color: string
}) {
  const delta = prev > 0 ? ((value - prev) / prev) * 100 : 0
  const up = delta >= 0
  const formatted = unit === "COP" ? CURRENCY.format(value) : value.toLocaleString("es-CO")
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums leading-none">{formatted}</p>
        <div className="mt-1 flex items-center gap-1">
          {up ? <TrendingUp className="size-3 text-emerald-500" strokeWidth={1.5} /> : <TrendingDown className="size-3 text-red-500" strokeWidth={1.5} />}
          <span className={cn("text-xs font-medium", up ? "text-emerald-600" : "text-red-600")}>
            {up ? "+" : ""}{delta.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">vs período anterior</span>
        </div>
      </div>
      <Sparkline data={sparkline} color={color} />
    </div>
  )
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-3", className)}><h3 className="text-sm font-medium text-foreground">{title}</h3>{children}</div>
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const total = (payload as any).reduce((s: number, p: any) => s + p.value, 0)
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-sm text-xs">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ background: d.payload.color }} />
        <span className="font-medium">{d.name}</span>
        <span className="tabular-nums text-muted-foreground">{d.value} ({((d.value / total) * 100).toFixed(1)}%)</span>
      </div>
    </div>
  )
}

function TrendLine({ data }: { data: number[] }) {
  if (!data?.length) return null
  const min = Math.min(...data), max = Math.max(...data)
  const h = 20, w = 48
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h}>
      <polyline points={pts.join(" ")} fill="none" stroke="#3B82F6" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function AnalyticsTab({ data }: AnalyticsTabProps) {
  if (!data) return <div className="p-6 text-sm text-muted-foreground">Cargando datos...</div>

  const { dailyAttendance, serviceDistribution, topBreeds, vetPerformance, diagnoses, kpiSummary } = data
  const totalServices = serviceDistribution.reduce((s: number, d: any) => s + d.value, 0)

  return (
    <div className="space-y-8 p-6">
      <Section title="Resumen ejecutivo">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Total atenciones"   {...kpiSummary.totalAtenciones}   icon={Activity}   color="#3B82F6" />
          <KpiCard label="Pacientes únicos"   {...kpiSummary.pacientesUnicos}   icon={Users}      color="#10B981" />
          <KpiCard label="Ingresos brutos"    {...kpiSummary.ingresosBrutos}    icon={DollarSign} color="#8B5CF6" />
          <KpiCard label="Ticket promedio"    {...kpiSummary.ticketPromedio}    icon={RotateCcw}  color="#F59E0B" />
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Atenciones por día" className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyAttendance} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAnterior" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.10} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                  interval={Math.floor(dailyAttendance.length / 6)} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="anterior" name="Período anterior" stroke="#94A3B8" strokeWidth={1.5} fill="url(#gradAnterior)" dot={false} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="actual"   name="Período actual"   stroke="#3B82F6" strokeWidth={2} fill="url(#gradActual)" dot={false} />
                <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Distribución por servicio">
          <div className="rounded-lg border border-border bg-background p-4">
            {serviceDistribution.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">Sin datos</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      dataKey="value" nameKey="name" paddingAngle={2}>
                      {serviceDistribution.map((d: any) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {serviceDistribution.map((d: any) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="tabular-nums font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Top 10 razas atendidas" className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-background p-4">
            {topBreeds.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topBreeds} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="breed" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Atenciones" fill="#3B82F6" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>

        <Section title="Desempeño por veterinario" className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            {vetPerformance.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">Sin datos</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Veterinario</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Atenciones</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Ingresos</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">T. prom.</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {vetPerformance.map((v: any, i: number) => (
                    <tr key={v.id} className={cn("border-b border-border last:border-0", i % 2 !== 0 && "bg-muted/20")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ background: v.color }}>
                            {v.name.split(" ").filter((w: string) => /^[A-ZÁÉÍÓÚ]/.test(w)).slice(0, 2).map((w: string) => w[0]).join("")}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{v.name}</p>
                            <p className="text-xs text-muted-foreground">{v.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-xs">{v.atenciones}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-xs">{CURRENCY.format(v.ingresos)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-xs">{v.tiempoPromedio} min</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600">★ {v.rating}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Section>
      </div>

      <Section title="Diagnósticos más frecuentes">
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          {diagnoses.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">CIE-10</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Diagnóstico</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Casos</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.map((d: any, i: number) => (
                    <tr key={d.cie10} className={cn("border-b border-border last:border-0", i % 2 !== 0 && "bg-muted/20")}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.cie10}</td>
                      <td className="px-4 py-3 text-xs font-medium max-w-[200px]">
                        <span className="block truncate" title={d.descripcion}>{d.descripcion}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-xs font-semibold">{d.casos}</td>
                      <td className="px-4 py-3 flex justify-center"><TrendLine data={d.tendencia} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
