"use client"

import * as React from "react"
import {
  CalendarDays, Package, Stethoscope, Users, DollarSign, Syringe, XCircle, Truck,
  FileText, Download, Plus, ChevronRight, Clock, Filter, Mail, Share2,
} from "lucide-react"
import { reportTemplates } from "@/lib/data/reports"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  CalendarDays, Package, Stethoscope, Users, DollarSign, Syringe, XCircle, Truck,
}

const FORMAT_OPTIONS = ["PDF", "Excel (.xlsx)", "CSV", "Google Sheets"]
const PERIOD_OPTIONS = [
  "Últimos 7 días",
  "Últimos 30 días",
  "Este mes",
  "Mes anterior",
  "Últimos 3 meses",
  "Últimos 6 meses",
  "Este año",
  "Rango personalizado",
]

const SECTION_OPTIONS: Record<string, string[]> = {
  t1: ["Resumen de citas", "Tasa de cancelación", "No-asistencias", "Por veterinario", "Por servicio"],
  t2: ["Stock actual", "Movimientos", "Productos críticos", "Vencimientos próximos", "Valor total"],
  t3: ["Resumen por vet", "Atenciones detalladas", "Ingresos por vet", "Calificaciones", "Tiempo promedio"],
  t4: ["Nuevos vs recurrentes", "Cohorte de retención", "Frecuencia de visitas", "Churn rate"],
  t5: ["Ingresos totales", "Costos operativos", "Margen bruto", "Comparativo anterior", "Proyección"],
  t6: ["Vacunas aplicadas", "Desparasitaciones", "Alertas vencimiento", "Cumplimiento por especie"],
  t7: ["Tasa de cancelación", "Motivos", "Patrones horarios", "Impacto económico"],
  t8: ["Órdenes de compra", "Proveedores activos", "Comparativo precios", "Evaluación proveedor"],
}

export function GeneratorTab() {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)
  const [reportName, setReportName] = React.useState("")
  const [period, setPeriod] = React.useState("")
  const [format, setFormat] = React.useState("")
  const [selectedSections, setSelectedSections] = React.useState<string[]>([])
  const [scheduleEnabled, setScheduleEnabled] = React.useState(false)

  const template = reportTemplates.find(t => t.id === selectedTemplate)

  const handleSelectTemplate = (id: string) => {
    const t = reportTemplates.find(r => r.id === id)
    setSelectedTemplate(id)
    setReportName(t?.name ?? "")
    setSelectedSections(SECTION_OPTIONS[id] ?? [])
    setPeriod("")
    setFormat("")
  }

  const toggleSection = (s: string) =>
    setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const canGenerate = selectedTemplate && period && format && selectedSections.length > 0

  return (
    <div className="flex h-full min-h-0 divide-x divide-border overflow-hidden">

      {/* Left panel — template list */}
      <div className="w-72 shrink-0 flex flex-col overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Plantillas de reportes</p>
          <p className="text-xs text-muted-foreground mt-0.5">Selecciona una para configurar</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {reportTemplates.map(t => {
            const Icon = ICON_MAP[t.icon] ?? FileText
            const isSelected = selectedTemplate === t.id
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-3 text-left transition-colors",
                  isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted border border-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="size-3.5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-xs font-medium leading-tight", isSelected && "text-primary")}>{t.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight line-clamp-2">{t.desc}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="size-2.5" strokeWidth={1.5} />
                      <span>Último: {t.lastRun}</span>
                    </div>
                  </div>
                  {isSelected && <ChevronRight className="ml-auto size-3.5 shrink-0 text-primary" strokeWidth={1.5} />}
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-t border-border p-3">
          <Button variant="outline" className="w-full h-8 text-xs" size="sm">
            <Plus className="mr-2 size-3.5" strokeWidth={1.5} />
            Reporte personalizado
          </Button>
        </div>
      </div>

      {/* Right panel — builder */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!selectedTemplate ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium">Selecciona una plantilla</p>
              <p className="text-xs text-muted-foreground mt-1">
                Elige una plantilla del panel izquierdo para configurar y generar un reporte
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Builder header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <div className="flex items-center gap-2">
                {template && (() => {
                  const Icon = ICON_MAP[template.icon] ?? FileText
                  return <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                })()}
                <p className="text-sm font-medium">{template?.name}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {template?.lastRun}
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Report name */}
              <div className="space-y-2">
                <Label className="text-xs">Nombre del reporte</Label>
                <Input
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Nombre para identificar el reporte..."
                />
              </div>

              {/* Period + Format */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Período</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIOD_OPTIONS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Formato de exportación</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Secciones incluidas</Label>
                  <button
                    onClick={() => {
                      const all = SECTION_OPTIONS[selectedTemplate] ?? []
                      setSelectedSections(selectedSections.length === all.length ? [] : all)
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedSections.length === (SECTION_OPTIONS[selectedTemplate] ?? []).length
                      ? "Deseleccionar todo"
                      : "Seleccionar todo"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(SECTION_OPTIONS[selectedTemplate] ?? []).map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSection(s)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-left transition-colors",
                        selectedSections.includes(s)
                          ? "border-primary/30 bg-primary/5 text-primary"
                          : "border-border hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "size-3.5 rounded-sm border shrink-0 flex items-center justify-center",
                        selectedSections.includes(s) ? "border-primary bg-primary" : "border-border"
                      )}>
                        {selectedSections.includes(s) && (
                          <svg viewBox="0 0 8 8" className="size-2 text-primary-foreground" fill="currentColor">
                            <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5">
                  <Filter className="size-3" strokeWidth={1.5} />
                  Filtros adicionales
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Los filtros avanzados (por veterinario, especie, servicio) están disponibles en el plan Pro.
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs font-medium">Programar envío automático</p>
                      <p className="text-xs text-muted-foreground">Recibe este reporte por email de forma periódica</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setScheduleEnabled(!scheduleEnabled)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                      scheduleEnabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
                      scheduleEnabled ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>
                {scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Frecuencia</Label>
                      <Select>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Destinatario</Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" strokeWidth={1.5} />
                        <Input className="h-7 text-xs pl-7" placeholder="correo@clinica.com" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <Share2 className="size-3.5" strokeWidth={1.5} />
                Compartir configuración
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!canGenerate}>
                  Vista previa
                </Button>
                <Button size="sm" className="h-8 text-xs gap-1.5" disabled={!canGenerate}>
                  <Download className="size-3.5" strokeWidth={1.5} />
                  Generar reporte
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
