'use client'

import * as React from 'react'
import { Search, ChevronDown, LayoutGrid, LayoutList, Columns3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PatientFiltersProps {
  searchQuery: string
  onExport?: () => void
  onSearchChange: (value: string) => void
  viewMode: "table" | "cards"
  onViewModeChange: (mode: "table" | "cards") => void
  filters: {
    species: string
    breed: string
    status: string
    lastVisit: string
    vet: string
  }
  onFiltersChange: (filters: PatientFiltersProps["filters"]) => void
  visibleColumns: string[]
  onVisibleColumnsChange: (columns: string[]) => void
  vetNames?: string[]
}

const speciesOptions   = ["Todas", "Canino", "Felino", "Ave", "Roedor", "Reptil", "Otro"]
const statusOptions    = ["Todos", "Activos", "Inactivos", "En tratamiento"]
const lastVisitOptions = ["Cualquier fecha", "Última semana", "Último mes", "Últimos 3 meses", "Más de 3 meses"]

const allColumns = [
  { id: 'patient', label: 'Paciente' },
  { id: 'owner', label: 'Dueño' },
  { id: 'age', label: 'Edad' },
  { id: 'lastVisit', label: 'Última visita' },
  { id: 'nextAppointment', label: 'Próxima cita' },
  { id: 'status', label: 'Estado' },
]

export function PatientFilters({
  searchQuery, onSearchChange, viewMode, onViewModeChange,
  filters, onFiltersChange, visibleColumns, onVisibleColumnsChange, vetNames,
  onExport,
}: PatientFiltersProps) {
  const vetOptions = ["Todos", ...(vetNames ?? [])]
  const updateFilter = (key: keyof typeof filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleColumn = (columnId: string) => {
    if (visibleColumns.includes(columnId)) {
      onVisibleColumnsChange(visibleColumns.filter(c => c !== columnId))
    } else {
      onVisibleColumnsChange([...visibleColumns, columnId])
    }
  }

  return (
    <div className="sticky top-14 z-10 flex flex-col gap-3 border-b bg-background px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Buscar por nombre, dueño, documento, raza..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 ${viewMode === 'table' ? 'bg-background shadow-sm' : ''}`}
            onClick={() => onViewModeChange('table')}
          >
            <LayoutList className="size-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 ${viewMode === 'cards' ? 'bg-background shadow-sm' : ''}`}
            onClick={() => onViewModeChange('cards')}
          >
            <LayoutGrid className="size-4" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Columns Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Columns3 className="mr-2 size-4" strokeWidth={1.5} />
              Columnas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {allColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumns.includes(column.id)}
                onCheckedChange={() => toggleColumn(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export */}
        <Button variant="outline" size="sm" className="h-9" onClick={onExport}>
          <Download className="mr-2 size-4" strokeWidth={1.5} />
          Exportar
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          label="Especie"
          value={filters.species}
          options={speciesOptions}
          onChange={(value) => updateFilter('species', value)}
        />
        <FilterChip
          label="Estado"
          value={filters.status}
          options={statusOptions}
          onChange={(value) => updateFilter('status', value)}
        />
        <FilterChip
          label="Última visita"
          value={filters.lastVisit}
          options={lastVisitOptions}
          onChange={(value) => updateFilter('lastVisit', value)}
        />
        <FilterChip
          label="Veterinario"
          value={filters.vet}
          options={vetOptions}
          onChange={(value) => updateFilter('vet', value)}
        />
      </div>
    </div>
  )
}

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs font-normal">
          {label}: <span className="ml-1 font-medium">{value}</span>
          <ChevronDown className="ml-1 size-3" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={value === option}
            onCheckedChange={() => onChange(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
