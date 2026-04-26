"use client"

import * as React from "react"
import {
  CalendarDays, Package, Stethoscope, Users, DollarSign, Syringe, XCircle, Truck,
  FileText, Download, Plus, ChevronRight, Clock, Filter, Mail, Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { PreviewDialog } from "@/components/reports/preview-dialog"
import { downloadCSV } from "@/lib/csv-utils"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  CalendarDays, Package, Stethoscope, Users, DollarSign, Syringe, XCircle, Truck,
}

const FORMAT_OPTIONS = ["PDF", "Excel (.xlsx)", "CSV", "Google Sheets"]
const PERIOD_OPTIONS = [
  "Últimos 7 días", "Últimos 30 días", "Este mes", "Mes anterior",
  "Últimos 3 meses", "Últimos 6 meses", "Este año", "Rango personalizado",
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

const TEMPLATE_HEADERS: Record<string, string[]> = {
  t1: ["Fecha", "Citas programadas", "Completadas", "Canceladas", "No asistieron"],
  t2: ["Producto", "Stock actual", "Stock mínimo", "Estado", "Último movimiento"],
  t3: ["Veterinario", "Atenciones", "Pacientes únicos", "Ingresos", "Rating"],
  t4: ["Periodo", "Nuevos pacientes", "Recurrentes", "Tasa retención"],
  t5: ["Concepto", "Valor actual", "Valor anterior", "Variación"],
  t6: ["Paciente", "Vacuna", "Fecha aplicación", "Próxima dosis"],
  t7: ["Motivo", "Cantidad", "Porcentaje", "Impacto económico"],
  t8: ["Proveedor", "Producto", "Cantidad", "Valor", "Fecha"],
}

const reportTemplates = [
  { id: "t1", icon: "CalendarDays",  name: "Atenciones por período",            desc: "Total de citas, cancelaciones, no asistencias y tendencias",  lastRun: "hace 1 día" },
  { id: "t2", icon: "Package",       name: "Inventario y consumo",               desc: "Movimientos de stock, productos críticos y vencimientos",      lastRun: "hace 3 días" },
  { id: "t3", icon: "Stethoscope",   name: "Desempeño por veterinario",          desc: "Atenciones, ingresos, tiempo promedio y calificaciones",       lastRun: "hace 1 semana" },
  { id: "t4", icon: "Users",         name: "Pacientes nuevos vs recurrentes",    desc: "Tasa de retención, cohortes y frecuencia de visitas",          lastRun: "hace 2 días" },
  { id: "t5", icon: "DollarSign",    name: "Estado financiero del período",      desc: "Ingresos, costos, márgenes y comparativo",                     lastRun: "hace 5 días" },
  { id: "t6", icon: "Syringe",       name: "Vacunación y desparasitación",       desc: "Cumplimiento del calendario sanitario y alertas",              lastRun: "hace 4 días" },
  { id: "t7", icon: "XCircle",       name: "Cancelaciones y no-asistencias",     desc: "Tasa de cancelación, motivos y patrones temporales",           lastRun: "hace 1 semana" },
  { id: "t8", icon: "Truck",         name: "Proveedores y compras",              desc: "Órdenes de compra, precios y evaluación de proveedores",       lastRun: "hace 2 semanas" },
]

function generateReportCSV(templateId: string, sections: string[], _period: string): string[][] {
  const headers = TEMPLATE_HEADERS[templateId] ?? ["Sección", "Dato"]
  const rows: string[][] = [headers]

  sections.forEach((section, si) => {
    for (let i = 0; i < 5; i++) {
      const row = headers.map((_, ci) => {
        if (ci === 0) return i === 0 ? section : ""
        return `${section.slice(0, 3)}-${i + 1}-${Math.round(Math.random() * 100)}`
      })
      rows.push(row)
    }
    if (si < sections.length - 1) rows.push(headers.map(() => "—"))
  })

  rows.push([])
  rows.push(headers.map((_, i) => i === 0 ? "Generado el" : new Date().toLocaleDateString("es-CO")))
  rows.push(headers.map((_, i) => i === 0 ? "Período" : _period || "Seleccionado"))

  return rows
}

export function GeneratorTab() {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)
  const [reportName, setReportName] = React.useState("")
  const [period, setPeriod] = React.useState("")
  const [format, setFormat] = React.useState("")
  const [selectedSections, setSelectedSections] = React.useState<string[]>([])
  const [scheduleEnabled, setScheduleEnabled] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)

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

  const handleGenerate = () => {
    if (!canGenerate || !selectedTemplate) return
    const tidyName = reportName.replace(/[^a-zA-Z0-9-_\s]/g, "").replace(/\s+/g, "-") || "reporte"

    if (format === "PDF") {
      const rows = generateReportCSV(selectedTemplate, selectedSections, period)
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${reportName}</title>
<style>body{font-family:sans-serif;padding:2em;color:#222}
h1{font-size:1.2em;margin-bottom:.5em}.meta{font-size:.8em;color:#666;margin-bottom:1.5em}
table{width:100%;border-collapse:collapse;font-size:.8em}
th,td{border:1px solid #ddd;padding:.4em .6em;text-align:left}
th{background:#f5f5f5}tr:nth-child(even){background:#fafafa}
.footer{margin-top:2em;font-size:.75em;color:#999;border-top:1px solid #eee;padding-top:1em}</style></head><body>
<h1>${reportName || template?.name}</h1>
<p class="meta">Período: ${period} | Generado: ${new Date().toLocaleDateString("es-CO")}</p>
<table><thead><tr>${rows[0].map(h => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rows.slice(1).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
<p class="footer">VetSmart · SERMEC Veterinaria · Reporte generado automáticamente</p></body></html>`
      const w = window.open("", "_blank")
      if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500) }
      setShowPreview(false)
      return
    }

    const lines = generateReportCSV(selectedTemplate, selectedSections, period)
    downloadCSV(lines, `${tidyName}-${Date.now()}.csv`)
    setShowPreview(false)
  }

  const handlePreview = () => {
    if (!canGenerate) return
    setShowPreview(true)
  }

  return (
    <div className="flex h-full min-h-0 divide-x divide-border overflow-hidden">
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
              <button key={t.id} onClick={() => handleSelectTemplate(t.id)}
                className={cn("w-full rounded-lg px-3 py-3 text-left transition-colors", isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent")}>
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
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
          <Button variant="outline" className="w-full h-8 text-xs" size="sm" disabled>
            <Plus className="mr-2 size-3.5" strokeWidth={1.5} />
            Reporte personalizado
          </Button>
        </div>
      </div>

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
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <div className="flex items-center gap-2">
                {template && (() => { const Icon = ICON_MAP[template.icon] ?? FileText; return <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} /> })()}
                <p className="text-sm font-medium">{template?.name}</p>
              </div>
              <Badge variant="outline" className="text-xs">{template?.lastRun}</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs">Nombre del reporte</Label>
                <Input value={reportName} onChange={e => setReportName(e.target.value)} className="h-8 text-sm" placeholder="Nombre para identificar el reporte..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Período</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar período" /></SelectTrigger>
                    <SelectContent>{PERIOD_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Formato de exportación</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar formato" /></SelectTrigger>
                    <SelectContent>{FORMAT_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Secciones incluidas</Label>
                  <button onClick={() => { const all = SECTION_OPTIONS[selectedTemplate] ?? []; setSelectedSections(selectedSections.length === all.length ? [] : all) }} className="text-xs text-primary hover:underline">
                    {selectedSections.length === (SECTION_OPTIONS[selectedTemplate] ?? []).length ? "Deseleccionar todo" : "Seleccionar todo"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(SECTION_OPTIONS[selectedTemplate] ?? []).map(s => (
                    <button key={s} onClick={() => toggleSection(s)} className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-left transition-colors", selectedSections.includes(s) ? "border-primary/30 bg-primary/5 text-primary" : "border-border hover:bg-muted text-muted-foreground")}>
                      <div className={cn("size-3.5 rounded-sm border shrink-0 flex items-center justify-center", selectedSections.includes(s) ? "border-primary bg-primary" : "border-border")}>
                        {selectedSections.includes(s) && <svg viewBox="0 0 8 8" className="size-2 text-primary-foreground" fill="currentColor"><path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5">
                  <Filter className="size-3" strokeWidth={1.5} />
                  Filtros adicionales <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">Filtros avanzados disponibles próximamente.</p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs font-medium">Programar envío automático</p>
                      <p className="text-xs text-muted-foreground">Recibe este reporte por email de forma periódica</p>
                    </div>
                  </div>
                  <button onClick={() => setScheduleEnabled(!scheduleEnabled)}
                    className={cn("relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors", scheduleEnabled ? "bg-primary" : "bg-muted")}>
                    <span className={cn("pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform", scheduleEnabled ? "translate-x-4" : "translate-x-0")} />
                  </button>
                </div>
                {scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Frecuencia</Label>
                      <Select>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
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

            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" disabled>
                <Share2 className="size-3.5" strokeWidth={1.5} />
                Compartir configuración
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!canGenerate} onClick={handlePreview}>
                  Vista previa
                </Button>
                <Button size="sm" className="h-8 text-xs gap-1.5" disabled={!canGenerate} onClick={handleGenerate}>
                  <Download className="size-3.5" strokeWidth={1.5} />
                  Generar reporte
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={reportName || (template?.name ?? "")}
        sections={selectedSections}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
