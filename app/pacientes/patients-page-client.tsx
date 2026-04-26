"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload } from "lucide-react"
import type { Patient } from "@/lib/types/patient-view"
import type { OwnerOption } from "@/lib/queries/patients"
import { formatAge, formatRelativeDate } from "@/lib/utils/dates"
import { exportPatients, bulkArchivePatients } from "@/lib/actions/patients"
import { downloadCSV } from "@/lib/csv-utils"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { PatientFilters } from "@/components/patients/patient-filters"
import { PatientTable } from "@/components/patients/patient-table"
import { BulkActionsBar } from "@/components/patients/bulk-actions-bar"
import { NewPatientModal } from "@/components/patients/new-patient-modal"
import { ImportPatientModal } from "@/components/patients/import-patient-modal"

export { formatAge, formatRelativeDate }

interface PatientsPageClientProps {
  initialPatients: Patient[]
  stats: { active: number; newThisMonth: number; total: number }
  vetNames: string[]
  owners: OwnerOption[]
}

const DEFAULT_FILTERS = {
  species:   "Todas",
  breed:     "Todas",
  status:    "Activos",
  lastVisit: "Cualquier fecha",
  vet:       "Todos",
}

const DEFAULT_COLUMNS = ["patient", "owner", "age", "lastVisit", "nextAppointment", "status"]

export function PatientsPageClient({
  initialPatients,
  stats,
  vetNames,
  owners,
}: PatientsPageClientProps) {
  const router = useRouter()
  const [patients, setPatients] = React.useState(initialPatients)

  React.useEffect(() => { setPatients(initialPatients) }, [initialPatients])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode]       = React.useState<"table" | "cards">("table")
  const [filters, setFilters]         = React.useState(DEFAULT_FILTERS)
  const [visibleColumns, setVisibleColumns] = React.useState(DEFAULT_COLUMNS)
  const [selectedIds, setSelectedIds]       = React.useState<string[]>([])
  const [sortConfig, setSortConfig]         = React.useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [isNewPatientOpen, setIsNewPatientOpen] = React.useState(false)
  const [isImportOpen, setIsImportOpen] = React.useState(false)

  const filteredPatients = React.useMemo(() => {
    let result = [...patients]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.owner.name.toLowerCase().includes(q) ||
        p.owner.documentId.includes(q) ||
        p.id.toLowerCase().includes(q),
      )
    }

    if (filters.species !== "Todas") {
      result = result.filter(p => p.species === filters.species)
    }

    if (filters.status !== "Todos") {
      if (filters.status === "Activos") {
        result = result.filter(p => p.status === "Activo" || p.status === "En tratamiento")
      } else if (filters.status === "Inactivos") {
        result = result.filter(p => p.status === "Inactivo")
      } else if (filters.status === "En tratamiento") {
        result = result.filter(p => p.status === "En tratamiento")
      }
    }

    if (filters.lastVisit !== "Cualquier fecha") {
      const now = new Date()
      result = result.filter(p => {
        if (!p.lastVisit) return false
        const diffDays = Math.floor((now.getTime() - new Date(p.lastVisit).getTime()) / 86400000)
        switch (filters.lastVisit) {
          case "Última semana":    return diffDays <= 7
          case "Último mes":       return diffDays <= 30
          case "Últimos 3 meses":  return diffDays <= 90
          case "Más de 3 meses":   return diffDays > 90
          default: return true
        }
      })
    }

    if (filters.vet !== "Todos") {
      result = result.filter(p => p.assignedVet === filters.vet)
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let av: string | number = 0
        let bv: string | number = 0
        switch (sortConfig.key) {
          case "name":      av = a.name;            bv = b.name;            break
          case "owner":     av = a.owner.name;      bv = b.owner.name;      break
          case "age":       av = new Date(a.birthDate).getTime(); bv = new Date(b.birthDate).getTime(); break
          case "lastVisit": av = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
                            bv = b.lastVisit ? new Date(b.lastVisit).getTime() : 0; break
        }
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1
        if (av > bv) return sortConfig.direction === "asc" ?  1 : -1
        return 0
      })
    }

    return result
  }, [patients, searchQuery, filters, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    )
  }

  const handleCreateSuccess = () => {
    setIsNewPatientOpen(false)
    router.refresh()
  }

  const handleArchiveSuccess = () => {
    router.refresh()
  }

  const handleExportAll = async () => {
    const res = await exportPatients()
    if (res.ok) {
      const lines = res.csv.split("\n").filter(l => l.trim()).map(l => {
        const row: string[] = []; let cur = ""; let q = false
        for (const ch of l) {
          if (ch === '"') { q = !q; continue }
          if (ch === "," && !q) { row.push(cur); cur = ""; continue }
          cur += ch
        }
        row.push(cur)
        return row
      })
      downloadCSV(lines, `pacientes-${new Date().toISOString().split("T")[0]}.csv`)
    }
  }

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return
    const res = await exportPatients(selectedIds)
    if (res.ok) {
      const lines = res.csv.split("\n").filter(l => l.trim()).map(l => {
        const row: string[] = []; let cur = ""; let q = false
        for (const ch of l) {
          if (ch === '"') { q = !q; continue }
          if (ch === "," && !q) { row.push(cur); cur = ""; continue }
          cur += ch
        }
        row.push(cur)
        return row
      })
      downloadCSV(lines, `pacientes-seleccion-${new Date().toISOString().split("T")[0]}.csv`)
    }
  }

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return
    const res = await bulkArchivePatients(selectedIds)
    if (res.ok) {
      setSelectedIds([])
      router.refresh()
    }
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Pacientes</h1>
            <p className="text-sm text-muted-foreground">
              {stats.active} pacientes activos · {stats.newThisMonth} nuevos este mes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 size-4" strokeWidth={1.5} />
              Importar CSV
            </Button>
            <Button onClick={() => setIsNewPatientOpen(true)}>
              <Plus className="mr-2 size-4" strokeWidth={1.5} />
              Nuevo paciente
            </Button>
          </div>
        </div>

        <PatientFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFiltersChange={setFilters}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
          vetNames={vetNames}
          onExport={handleExportAll}
        />

        <BulkActionsBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onExport={handleExportSelected}
          onArchive={handleBulkArchive}
          onAssignVet={() => {}}
          onSendReminder={() => {}}
        />

        <div className="flex-1 overflow-auto px-6">
          <PatientTable
            patients={filteredPatients}
            visibleColumns={visibleColumns}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            sortConfig={sortConfig}
            onSort={handleSort}
            onArchive={handleArchiveSuccess}
          />
        </div>

        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-sm text-muted-foreground">
            Mostrando {Math.min(filteredPatients.length, 200)} de {filteredPatients.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Anterior</Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">1</Button>
            <Button variant="outline" size="sm" disabled>Siguiente</Button>
          </div>
        </div>
      </div>

      <NewPatientModal
        open={isNewPatientOpen}
        onOpenChange={setIsNewPatientOpen}
        onSuccess={handleCreateSuccess}
        owners={owners}
      />

      <ImportPatientModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => router.refresh()}
      />
    </AppShell>
  )
}
