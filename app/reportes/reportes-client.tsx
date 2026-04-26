"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { Download, RefreshCw, BarChart2, FileText, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AnalyticsTab } from "@/components/reports/analytics-tab"
import { GeneratorTab } from "@/components/reports/generator-tab"
import { downloadCSV } from "@/lib/csv-utils"
import { cn } from "@/lib/utils"

type Tab = "analytics" | "generator"

export function ReportesClient({ data }: { data: any }) {
  const [tab, setTab] = React.useState<Tab>("analytics")
  const [rangeDays, setRangeDays] = React.useState(30)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const today = new Date()
  const rangeStart = subDays(today, rangeDays - 1)
  const rangeLabel = `${format(rangeStart, "d MMM", { locale: es })} – ${format(today, "d MMM yyyy", { locale: es })}`

  const RANGE_PRESETS = [
    { label: "Últimos 7 días",   days: 7 },
    { label: "Últimos 30 días",  days: 30 },
    { label: "Últimos 90 días",  days: 90 },
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 800)
  }

  const handleExport = () => {
    if (!data) return
    const { kpiSummary } = data
    const lines = [
      ["Métrica", "Valor", "Período anterior", "Variación"],
      ["Total atenciones", String(kpiSummary.totalAtenciones.value), String(kpiSummary.totalAtenciones.prev),
        `${((kpiSummary.totalAtenciones.value - kpiSummary.totalAtenciones.prev) / Math.max(1, kpiSummary.totalAtenciones.prev) * 100).toFixed(1)}%`],
      ["Pacientes únicos", String(kpiSummary.pacientesUnicos.value), String(kpiSummary.pacientesUnicos.prev),
        `${((kpiSummary.pacientesUnicos.value - kpiSummary.pacientesUnicos.prev) / Math.max(1, kpiSummary.pacientesUnicos.prev) * 100).toFixed(1)}%`],
      ["Ingresos brutos", String(kpiSummary.ingresosBrutos.value), String(kpiSummary.ingresosBrutos.prev),
        `${((kpiSummary.ingresosBrutos.value - kpiSummary.ingresosBrutos.prev) / Math.max(1, kpiSummary.ingresosBrutos.prev) * 100).toFixed(1)}%`],
      ["Ticket promedio", String(kpiSummary.ticketPromedio.value), String(kpiSummary.ticketPromedio.prev),
        `${((kpiSummary.ticketPromedio.value - kpiSummary.ticketPromedio.prev) / Math.max(1, kpiSummary.ticketPromedio.prev) * 100).toFixed(1)}%`],
    ]
    downloadCSV(lines, `dashboard-${today.toISOString().split("T")[0]}.csv`)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Análisis y generación de reportes · {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Calendar className="size-3.5" strokeWidth={1.5} />
                <span className="text-xs">{RANGE_PRESETS.find(p => p.days === rangeDays)?.label ?? `Últimos ${rangeDays} días`}</span>
                <ChevronDown className="size-3" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {RANGE_PRESETS.map(p => (
                <DropdownMenuItem key={p.days} onClick={() => setRangeDays(p.days)} className={cn(rangeDays === p.days && "font-medium")}>
                  {p.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Rango personalizado (próximamente)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-8" onClick={handleRefresh}>
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} strokeWidth={1.5} />
          </Button>
          <Button size="sm" className="h-8 gap-1.5" onClick={handleExport}>
            <Download className="size-3.5" strokeWidth={1.5} />
            <span className="text-xs">Exportar</span>
          </Button>
        </div>
      </div>

      <div className="flex border-b">
        <button onClick={() => setTab("analytics")} className={cn("flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px", tab === "analytics" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <BarChart2 className="size-4" strokeWidth={1.5} />
          Analytics
        </button>
        <button onClick={() => setTab("generator")} className={cn("flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px", tab === "generator" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <FileText className="size-4" strokeWidth={1.5} />
          Generador de reportes
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "analytics"
          ? <AnalyticsTab data={data} />
          : <GeneratorTab />
        }
      </div>
    </div>
  )
}
