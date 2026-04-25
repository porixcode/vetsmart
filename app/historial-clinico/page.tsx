"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search, Download, Plus, ChevronDown, Calendar, LayoutList, Clock,
  Paperclip, X,
} from "lucide-react"
import {
  clinicalRecords, RECORD_VETS, ATTENTION_TYPES, RECORD_STATUSES, SPECIES_LIST,
  TOTAL_RECORDS, recordTypeConfig, recordStatusConfig,
  type AttentionType, type RecordStatus, type Species, type ClinicalRecord,
} from "@/lib/data/clinical-records"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RecordsTable } from "@/components/clinical/records-table"
import { RecordsTimeline } from "@/components/clinical/records-timeline"
import { RecordDetailDrawer } from "@/components/clinical/record-detail-drawer"
import { cn } from "@/lib/utils"

type ViewMode = "tabla" | "linea-de-tiempo"

const PAGE_SIZE = 50
const today = new Date(2026, 3, 22)

const RANGE_PRESETS = [
  { label: "Últimos 7 días",   days: 7 },
  { label: "Últimos 30 días",  days: 30 },
  { label: "Últimos 90 días",  days: 90 },
  { label: "Este año",         days: 365 },
]

export default function HistorialClinicoPage() {
  const [view, setView] = React.useState<ViewMode>("tabla")
  const [search, setSearch] = React.useState("")
  const [rangeDays, setRangeDays] = React.useState(90)

  // Chip filters
  const [selVets, setSelVets]             = React.useState<string[]>([])
  const [selTypes, setSelTypes]           = React.useState<AttentionType[]>([])
  const [selSpecies, setSelSpecies]       = React.useState<Species[]>([])
  const [selStatuses, setSelStatuses]     = React.useState<RecordStatus[]>([])
  const [filterAttachments, setFilterAttachments] = React.useState(false)
  const [filterFollowUp, setFilterFollowUp]       = React.useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)

  // Drawer
  const [drawerRecord, setDrawerRecord] = React.useState<ClinicalRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const rangeStart = subDays(today, rangeDays - 1)
  const rangeLabel = RANGE_PRESETS.find(p => p.days === rangeDays)?.label ?? `Últimos ${rangeDays} días`

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return clinicalRecords.filter(r => {
      if (r.date < rangeStart) return false
      if (search) {
        const q = search.toLowerCase()
        const hit =
          r.patient.name.toLowerCase().includes(q) ||
          r.owner.name.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.diagnoses.some(d => d.cie10.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) ||
          r.medications.some(m => m.name.toLowerCase().includes(q))
        if (!hit) return false
      }
      if (selVets.length > 0 && !selVets.includes(r.veterinarian.id)) return false
      if (selTypes.length > 0 && !selTypes.includes(r.type)) return false
      if (selSpecies.length > 0 && !selSpecies.includes(r.patient.species)) return false
      if (selStatuses.length > 0 && !selStatuses.includes(r.status)) return false
      if (filterAttachments && r.attachments === 0) return false
      if (filterFollowUp && !r.followUp) return false
      return true
    })
  }, [search, rangeDays, selVets, selTypes, selSpecies, selStatuses, filterAttachments, filterFollowUp])

  // Reset page when filters change
  React.useEffect(() => { setPage(1) }, [filtered.length])

  const pagedRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleAll = () =>
    setSelectedIds(prev =>
      pagedRecords.every(r => prev.has(r.id))
        ? new Set([...prev].filter(id => !pagedRecords.some(r => r.id === id)))
        : new Set([...prev, ...pagedRecords.map(r => r.id)])
    )

  // ── Filter toggle helpers ─────────────────────────────────────────────────
  const toggleVet    = (id: string)          => setSelVets(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleType   = (t: AttentionType)    => setSelTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  const toggleSp     = (s: Species)          => setSelSpecies(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  const toggleStatus = (s: RecordStatus)     => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const openDrawer = (r: ClinicalRecord) => { setDrawerRecord(r); setIsDrawerOpen(true) }

  // ── Active filter chips ───────────────────────────────────────────────────
  const activeChips: Array<{ label: string; onRemove: () => void }> = [
    ...selVets.map(id => ({
      label: RECORD_VETS.find(v => v.id === id)?.lastName ?? id,
      onRemove: () => toggleVet(id),
    })),
    ...selTypes.map(t => ({ label: t, onRemove: () => toggleType(t) })),
    ...selSpecies.map(s => ({ label: s, onRemove: () => toggleSp(s) })),
    ...selStatuses.map(s => ({ label: s, onRemove: () => toggleStatus(s) })),
    ...(filterAttachments ? [{ label: "Con adjuntos", onRemove: () => setFilterAttachments(false) }] : []),
    ...(filterFollowUp    ? [{ label: "Con seguimiento", onRemove: () => setFilterFollowUp(false) }]  : []),
  ]

  const clearAll = () => {
    setSelVets([]); setSelTypes([]); setSelSpecies([]); setSelStatuses([])
    setFilterAttachments(false); setFilterFollowUp(false)
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Historial Clínico</h1>
            <p className="text-sm text-muted-foreground">
              Registro consolidado de atenciones médicas — {TOTAL_RECORDS.toLocaleString("es-CO")} registros totales
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" disabled={selectedIds.size === 0}>
              <Download className="size-3.5" strokeWidth={1.5} />
              <span className="text-xs">Exportar selección{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}</span>
            </Button>
            <Button size="sm" className="h-8 gap-1.5">
              <Plus className="size-3.5" strokeWidth={1.5} />
              <span className="text-xs">Nuevo registro</span>
            </Button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="border-b bg-background px-6 py-3 space-y-2.5">
          {/* Row 1: Search + Date range */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                placeholder="Buscar por paciente, dueño, diagnóstico CIE-10, medicamento..."
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
                  <DropdownMenuItem
                    key={p.days}
                    onClick={() => setRangeDays(p.days)}
                    className={cn(rangeDays === p.days && "font-semibold")}
                  >
                    {p.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: Chip filters */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Veterinario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  Veterinario
                  {selVets.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selVets.length}</span>}
                  <ChevronDown className="size-3" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {RECORD_VETS.map(v => (
                  <DropdownMenuCheckboxItem
                    key={v.id}
                    checked={selVets.includes(v.id)}
                    onCheckedChange={() => toggleVet(v.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: v.color }}>
                        {v.lastName[0]}
                      </div>
                      {v.name}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tipo de atención */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  Tipo
                  {selTypes.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selTypes.length}</span>}
                  <ChevronDown className="size-3" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {ATTENTION_TYPES.map(t => {
                  const tc = recordTypeConfig[t]
                  return (
                    <DropdownMenuCheckboxItem key={t} checked={selTypes.includes(t)} onCheckedChange={() => toggleType(t)}>
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", tc.dot)} />
                        {t}
                      </div>
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Especie */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  Especie
                  {selSpecies.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selSpecies.length}</span>}
                  <ChevronDown className="size-3" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {SPECIES_LIST.map(s => (
                  <DropdownMenuCheckboxItem key={s} checked={selSpecies.includes(s)} onCheckedChange={() => toggleSp(s)}>
                    {s}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Estado */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  Estado
                  {selStatuses.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selStatuses.length}</span>}
                  <ChevronDown className="size-3" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {RECORD_STATUSES.map(s => {
                  const sc = recordStatusConfig[s]
                  return (
                    <DropdownMenuCheckboxItem key={s} checked={selStatuses.includes(s)} onCheckedChange={() => toggleStatus(s)}>
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", sc.dot)} />
                        {s}
                      </div>
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle: Adjuntos */}
            <button
              onClick={() => setFilterAttachments(!filterAttachments)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors h-7",
                filterAttachments
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Paperclip className="size-3" strokeWidth={1.5} />
              Con adjuntos
            </button>

            {/* Toggle: Seguimiento */}
            <button
              onClick={() => setFilterFollowUp(!filterFollowUp)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors h-7",
                filterFollowUp
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="size-3" strokeWidth={1.5} />
              Seguimiento pendiente
            </button>

            <div className="ml-auto text-xs text-muted-foreground tabular-nums">
              {filtered.length} de {clinicalRecords.length} registros
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {activeChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs"
                >
                  {chip.label}
                  <button onClick={chip.onRemove} className="text-muted-foreground hover:text-foreground">
                    <X className="size-3" strokeWidth={1.5} />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-primary hover:underline">
                Limpiar todos
              </button>
            </div>
          )}
        </div>

        {/* ── Content area ── */}
        <div className="flex flex-1 flex-col min-h-0">
          {/* View toggle */}
          <div className="flex items-center justify-end gap-2 border-b px-6 py-2">
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setView("tabla")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors",
                  view === "tabla" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutList className="size-3.5" strokeWidth={1.5} />
                Tabla
              </button>
              <button
                onClick={() => setView("linea-de-tiempo")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-l border-border",
                  view === "linea-de-tiempo" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="size-3.5" strokeWidth={1.5} />
                Línea de tiempo
              </button>
            </div>
          </div>

          {/* View content */}
          <div className="flex-1 min-h-0 overflow-auto">
            {view === "tabla" ? (
              <RecordsTable
                records={pagedRecords}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
                onRowClick={openDrawer}
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={TOTAL_RECORDS}
                onPageChange={setPage}
              />
            ) : (
              <RecordsTimeline
                records={filtered}
                onRecordClick={openDrawer}
              />
            )}
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      <RecordDetailDrawer
        record={drawerRecord}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </AppShell>
  )
}
