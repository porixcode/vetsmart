"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search, Download, Plus, ChevronDown, Calendar, LayoutList, Clock,
  Paperclip, X, AlertCircle,
} from "lucide-react"
import type { ClinicalRecordView, ClinicalRecordSearch } from "@/lib/types/clinical-records-view"
import { ATTENTION_CONFIG, STATUS_CONFIG, DEFAULT_SEARCH } from "@/lib/types/clinical-records-view"
import { ATTENTION_TYPES, RECORD_STATUSES } from "@/lib/validators/clinical-records"
import { anularClinicalRecord } from "@/lib/actions/clinical-records"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RecordsTable } from "@/components/clinical/records-table"
import { RecordsTimeline } from "@/components/clinical/records-timeline"
import { RecordDetailDrawer } from "@/components/clinical/record-detail-drawer"
import { NewGlobalRecordModal } from "@/components/clinical/new-global-record-modal"
import { downloadCSV } from "@/lib/csv-utils"
import { cn } from "@/lib/utils"

type ViewMode = "tabla" | "linea-de-tiempo"

const RANGE_PRESETS = [
  { label: "Últimos 7 días",   days: 7 },
  { label: "Últimos 30 días",  days: 30 },
  { label: "Últimos 90 días",  days: 90 },
  { label: "Este año",         days: 365 },
]

interface PatientBrief {
  id: string; name: string; species: string; breed: string
}

interface HistorialClinicoClientProps {
  initialRecords: ClinicalRecordView[]
  totalCount:     number
  patients:       PatientBrief[]
  initialSearch:  ClinicalRecordSearch
}

export function HistorialClinicoClient({ initialRecords, totalCount, patients }: HistorialClinicoClientProps) {
  const router = useRouter()
  const [records, setRecords] = React.useState(initialRecords)
  React.useEffect(() => { setRecords(initialRecords) }, [initialRecords])

  const [view, setView] = React.useState<ViewMode>("tabla")
  const [search, setSearch] = React.useState("")
  const [rangeDays, setRangeDays] = React.useState(90)
  const [selTypes, setSelTypes]           = React.useState<string[]>([])
  const [selStatuses, setSelStatuses]     = React.useState<string[]>([])
  const [filterAttachments, setFilterAttachments] = React.useState(false)
  const [filterFollowUp, setFilterFollowUp]       = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)
  const [drawerRecord, setDrawerRecord] = React.useState<ClinicalRecordView | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isNewOpen, setIsNewOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const rangeLabel = RANGE_PRESETS.find(p => p.days === rangeDays)?.label ?? `Últimos ${rangeDays} días`
  const rangeStart = subDays(new Date(), rangeDays)

  const filtered = React.useMemo(() => {
    return records.filter(r => {
      if (r.date < rangeStart) return false
      if (search) {
        const q = search.toLowerCase()
        const hit =
          r.patient.name.toLowerCase().includes(q) ||
          r.owner.name.toLowerCase().includes(q) ||
          r.visitReason.toLowerCase().includes(q) ||
          r.diagnoses.some(d => d.cie10.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) ||
          r.medications.some(m => m.name.toLowerCase().includes(q))
        if (!hit) return false
      }
      if (selTypes.length > 0 && !selTypes.includes(r.type)) return false
      if (selStatuses.length > 0 && !selStatuses.includes(r.status)) return false
      if (filterAttachments && r.attachments === 0) return false
      if (filterFollowUp && !r.followUp) return false
      return true
    })
  }, [records, search, rangeStart, selTypes, selStatuses, filterAttachments, filterFollowUp])

  React.useEffect(() => { setPage(1) }, [filtered.length])

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleAll = () =>
    setSelectedIds(prev =>
      filtered.every(r => prev.has(r.id))
        ? new Set([...prev].filter(id => !filtered.some(r => r.id === id)))
        : new Set([...prev, ...filtered.map(r => r.id)])
    )
  const toggleType   = (t: string) => setSelTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  const toggleStatus = (s: string) => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const openDrawer = (r: ClinicalRecordView) => { setDrawerRecord(r); setIsDrawerOpen(true) }

  const handleAnular = async (r: ClinicalRecordView) => {
    if (!confirm(`¿Anular registro de ${r.patient.name} del ${format(r.date, "d/M/yyyy")}?`)) return
    setError(null)
    const result = await anularClinicalRecord(r.id)
    if (result.ok) {
      setRecords(prev => prev.map(rec => rec.id === r.id ? { ...rec, status: "Anulado" } : rec))
      router.refresh()
    } else {
      setError(result.error ?? "Error al anular")
    }
  }

  const handleDownloadRecord = (r: ClinicalRecordView) => {
    const lines = [
      ["Paciente", "Fecha", "Tipo", "Estado", "Motivo", "Diagnóstico", "Veterinario"],
      [r.patient.name, format(r.date, "yyyy-MM-dd HH:mm"), r.type, r.status, r.visitReason, r.diagnoses[0]?.description ?? "", r.veterinarian.name],
    ]
    downloadCSV(lines, `registro-${r.id.slice(0, 8)}.csv`)
  }

  const handleExportSelected = () => {
    const selected = records.filter(r => selectedIds.has(r.id))
    if (selected.length === 0) return
    const lines = [
      ["Paciente", "Fecha", "Tipo", "Estado", "Motivo", "Diagnóstico", "Veterinario"],
      ...selected.map(r => [r.patient.name, format(r.date, "yyyy-MM-dd HH:mm"), r.type, r.status, r.visitReason, r.diagnoses[0]?.description ?? "", r.veterinarian.name]),
    ]
    downloadCSV(lines, `historial-clinico-export-${Date.now()}.csv`)
  }

  const activeChips: Array<{ label: string; onRemove: () => void }> = [
    ...selTypes.map(t => ({ label: t, onRemove: () => toggleType(t) })),
    ...selStatuses.map(s => ({ label: s, onRemove: () => toggleStatus(s) })),
    ...(filterAttachments ? [{ label: "Con adjuntos", onRemove: () => setFilterAttachments(false) }] : []),
    ...(filterFollowUp    ? [{ label: "Con seguimiento", onRemove: () => setFilterFollowUp(false) }]  : []),
  ]
  const clearAll = () => {
    setSelTypes([]); setSelStatuses([])
    setFilterAttachments(false); setFilterFollowUp(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Historial Clínico</h1>
          <p className="text-sm text-muted-foreground">
            Registro consolidado de atenciones médicas — {totalCount.toLocaleString("es-CO")} registros totales
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={handleExportSelected}>
              <Download className="size-3.5" strokeWidth={1.5} />
              <span className="text-xs">Exportar ({selectedIds.size})</span>
            </Button>
          )}
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setIsNewOpen(true)}>
            <Plus className="size-3.5" strokeWidth={1.5} />
            <span className="text-xs">Nuevo registro</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-6 py-2 text-xs text-red-700">
          <AlertCircle className="size-3.5" strokeWidth={1.5} />
          {error}
          <button className="ml-auto font-semibold" onClick={() => setError(null)}>X</button>
        </div>
      )}

      <div className="border-b bg-background px-6 py-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Buscar por paciente, dueño, diagnóstico, medicamento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 shrink-0">
                <Calendar className="size-3.5" strokeWidth={1.5} />
                <span className="text-xs">{rangeLabel}</span>
                <ChevronDown className="size-3" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {RANGE_PRESETS.map(p => (
                <DropdownMenuItem key={p.days} onClick={() => setRangeDays(p.days)} className={cn(rangeDays === p.days && "font-semibold")}>
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                Tipo{selTypes.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selTypes.length}</span>}
                <ChevronDown className="size-3" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {ATTENTION_TYPES.map(t => {
                const tc = ATTENTION_CONFIG[t]
                return (
                  <DropdownMenuCheckboxItem key={t} checked={selTypes.includes(t)} onCheckedChange={() => toggleType(t)}>
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", tc?.dot ?? "bg-gray-400")} />
                      {t}
                    </div>
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                Estado{selStatuses.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selStatuses.length}</span>}
                <ChevronDown className="size-3" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {RECORD_STATUSES.map(s => {
                const sc = STATUS_CONFIG[s]
                return (
                  <DropdownMenuCheckboxItem key={s} checked={selStatuses.includes(s)} onCheckedChange={() => toggleStatus(s)}>
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", sc?.dot ?? "bg-gray-400")} />
                      {s}
                    </div>
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setFilterAttachments(!filterAttachments)}
            className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors h-7", filterAttachments ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:text-foreground")}
          >
            <Paperclip className="size-3" strokeWidth={1.5} />
            Con adjuntos
          </button>
          <button
            onClick={() => setFilterFollowUp(!filterFollowUp)}
            className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors h-7", filterFollowUp ? "border-amber-300 bg-amber-50 text-amber-700" : "border-border text-muted-foreground hover:text-foreground")}
          >
            <Clock className="size-3" strokeWidth={1.5} />
            Seguimiento pendiente
          </button>

          <div className="ml-auto text-xs text-muted-foreground tabular-nums">
            {filtered.length} de {totalCount} registros
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeChips.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs">
                {chip.label}
                <button onClick={chip.onRemove} className="text-muted-foreground hover:text-foreground">
                  <X className="size-3" strokeWidth={1.5} />
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="text-xs text-primary hover:underline">Limpiar todos</button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex items-center justify-end gap-2 border-b px-6 py-2">
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button onClick={() => setView("tabla")} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors", view === "tabla" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
              <LayoutList className="size-3.5" strokeWidth={1.5} />
              Tabla
            </button>
            <button onClick={() => setView("linea-de-tiempo")} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-l border-border", view === "linea-de-tiempo" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
              <Clock className="size-3.5" strokeWidth={1.5} />
              Línea de tiempo
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          {view === "tabla" ? (
            <RecordsTable
              records={filtered}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleAll={toggleAll}
              onRowClick={openDrawer}
              onAnular={handleAnular}
              onDownload={handleDownloadRecord}
              page={page}
              pageSize={50}
              totalCount={filtered.length}
              onPageChange={setPage}
            />
          ) : (
            <RecordsTimeline records={filtered} onRecordClick={openDrawer} />
          )}
        </div>
      </div>

      <RecordDetailDrawer
        record={drawerRecord}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <NewGlobalRecordModal
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        patients={patients}
      />
    </div>
  )
}


