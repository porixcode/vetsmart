'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MoreHorizontal, ArrowUpDown, Calendar, Pencil, Eye, Archive } from 'lucide-react'
import { useTransition } from "react"
import type { Patient } from "@/lib/types/patient-view"
import { formatAge, formatRelativeDate } from "@/lib/utils/dates"
import { archivePatient } from "@/lib/actions/patients"
import { useAppointmentModal } from "@/components/providers/appointment-modal-provider"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PatientTableProps {
  patients: Patient[]
  visibleColumns: string[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  sortConfig: { key: string; direction: "asc" | "desc" } | null
  onSort: (key: string) => void
  onArchive?: () => void
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Activo': 'default',
  'Inactivo': 'secondary',
  'En tratamiento': 'outline',
}

const speciesEmoji: Record<string, string> = {
  'Canino': '🐕',
  'Felino': '🐈',
  'Ave': '🦜',
  'Roedor': '🐹',
  'Reptil': '🦎',
  'Otro': '🐾',
}

export function PatientTable({
  patients,
  visibleColumns,
  selectedIds,
  onSelectionChange,
  sortConfig,
  onSort,
  onArchive,
}: PatientTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { open: openAppointmentModal } = useAppointmentModal()

  const handleArchive = (patientId: string) => {
    startTransition(async () => {
      await archivePatient(patientId)
      onArchive?.()
    })
  }

  const handleScheduleAppointment = (patientId: string) => {
    openAppointmentModal({ patientId })
  }

  const allSelected = patients.length > 0 && selectedIds.length === patients.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < patients.length

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(patients.map(p => p.id))
    }
  }

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const handleRowClick = (e: React.MouseEvent, patientId: string) => {
    // Don't navigate if clicking on checkbox, dropdown, or button
    const target = e.target as HTMLElement
    if (
      target.closest('[role="checkbox"]') ||
      target.closest('[data-radix-dropdown-menu-trigger]') ||
      target.closest('button')
    ) {
      return
    }
    router.push(`/pacientes/${patientId}`)
  }

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => onSort(column)}
    >
      {label}
      <ArrowUpDown className="ml-1 size-3" strokeWidth={1.5} />
    </Button>
  )

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as unknown as HTMLInputElement).indeterminate = someSelected
                  }
                }}
                onCheckedChange={toggleAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            {visibleColumns.includes('patient') && (
              <TableHead><SortableHeader column="name" label="Paciente" /></TableHead>
            )}
            {visibleColumns.includes('owner') && (
              <TableHead><SortableHeader column="owner" label="Dueño" /></TableHead>
            )}
            {visibleColumns.includes('age') && (
              <TableHead><SortableHeader column="age" label="Edad" /></TableHead>
            )}
            {visibleColumns.includes('lastVisit') && (
              <TableHead><SortableHeader column="lastVisit" label="Última visita" /></TableHead>
            )}
            {visibleColumns.includes('nextAppointment') && (
              <TableHead>Próxima cita</TableHead>
            )}
            {visibleColumns.includes('status') && (
              <TableHead>Estado</TableHead>
            )}
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="cursor-pointer"
              data-state={selectedIds.includes(patient.id) ? 'selected' : undefined}
              onClick={(e) => handleRowClick(e, patient.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(patient.id)}
                  onCheckedChange={() => toggleOne(patient.id)}
                  aria-label={`Seleccionar ${patient.name}`}
                />
              </TableCell>

              {visibleColumns.includes('patient') && (
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-medium">
                        {patient.name}
                        <span className="text-xs">{speciesEmoji[patient.species]}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{patient.breed}</div>
                    </div>
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('owner') && (
                <TableCell>
                  <div>
                    <div className="font-medium">{patient.owner.name}</div>
                    <div className="text-xs text-muted-foreground">{patient.owner.phone}</div>
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('age') && (
                <TableCell className="text-muted-foreground">
                  {formatAge(patient.birthDate)}
                </TableCell>
              )}

              {visibleColumns.includes('lastVisit') && (
                <TableCell>
                  {patient.lastVisit ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground">
                          {formatRelativeDate(patient.lastVisit)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(patient.lastVisit, "d 'de' MMMM, yyyy", { locale: es })}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {visibleColumns.includes('nextAppointment') && (
                <TableCell>
                  {patient.nextAppointment ? (
                    <div>
                      <div className="text-sm">
                        {format(patient.nextAppointment.date, "d MMM", { locale: es })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {patient.nextAppointment.service}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {visibleColumns.includes('status') && (
                <TableCell>
                  <Badge variant={statusVariants[patient.status] || 'default'}>
                    {patient.status}
                  </Badge>
                </TableCell>
              )}

              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" strokeWidth={1.5} />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/pacientes/${patient.id}`)}>
                      <Eye className="mr-2 size-4" strokeWidth={1.5} />
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 size-4" strokeWidth={1.5} />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleScheduleAppointment(patient.id)}>
                      <Calendar className="mr-2 size-4" strokeWidth={1.5} />
                      Agendar cita
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={isPending}
                      onClick={() => handleArchive(patient.id)}
                    >
                      <Archive className="mr-2 size-4" strokeWidth={1.5} />
                      Archivar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
