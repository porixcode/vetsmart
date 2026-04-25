"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Paperclip, Calendar, MoreHorizontal } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  type ClinicalRecord, recordTypeConfig, recordStatusConfig,
} from "@/lib/data/clinical-records"
import { cn } from "@/lib/utils"

interface RecordsTableProps {
  records: ClinicalRecord[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  onRowClick: (record: ClinicalRecord) => void
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

function PatientAvatar({ color, name }: { color: string; name: string }) {
  return (
    <div
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-semibold"
      style={{ background: color }}
    >
      {name[0]}
    </div>
  )
}

function VetAvatar({ color, lastName }: { color: string; lastName: string }) {
  return (
    <div
      className="flex size-6 shrink-0 items-center justify-center rounded-full text-white text-[9px] font-semibold"
      style={{ background: color }}
    >
      {lastName[0]}
    </div>
  )
}

export function RecordsTable({
  records, selectedIds, onToggleSelect, onToggleAll,
  onRowClick, page, pageSize, totalCount, onPageChange,
}: RecordsTableProps) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)
  const totalPages = Math.ceil(totalCount / pageSize)
  const allSelected = records.length > 0 && records.every(r => selectedIds.has(r.id))

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-10 pl-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="rounded border-border"
                />
              </TableHead>
              <TableHead className="whitespace-nowrap">Fecha / Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Dueño</TableHead>
              <TableHead>Veterinario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="max-w-[200px]">Motivo</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Adj.</TableHead>
              <TableHead className="whitespace-nowrap">Seguimiento</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map(r => {
              const tc = recordTypeConfig[r.type]
              const sc = recordStatusConfig[r.status]
              const isSelected = selectedIds.has(r.id)
              return (
                <TableRow
                  key={r.id}
                  className={cn("cursor-pointer", isSelected && "bg-primary/5")}
                  onClick={() => onRowClick(r)}
                >
                  <TableCell className="pl-4" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(r.id)}
                      className="rounded border-border"
                    />
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <p className="text-xs font-medium tabular-nums">
                      {format(r.date, "d MMM yyyy", { locale: es })}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {format(r.date, "HH:mm")}
                    </p>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PatientAvatar color={r.patient.color} name={r.patient.name} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{r.patient.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{r.patient.breed}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {r.owner.name}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <VetAvatar color={r.veterinarian.color} lastName={r.veterinarian.lastName} />
                      <span className="text-xs whitespace-nowrap">{r.veterinarian.lastName}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
                      tc.bg, tc.text
                    )}>
                      <span className={cn("size-1.5 rounded-full shrink-0", tc.dot)} />
                      {r.type}
                    </span>
                  </TableCell>

                  <TableCell className="max-w-[200px]">
                    <p className="text-xs truncate" title={r.reason}>{r.reason}</p>
                  </TableCell>

                  <TableCell>
                    {r.diagnoses.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5">
                          {r.diagnoses[0].cie10}
                        </span>
                        <span className="text-[11px] truncate max-w-[100px]" title={r.diagnoses[0].description}>
                          {r.diagnoses[0].description}
                        </span>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>

                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
                      sc.bg, sc.text
                    )}>
                      <span className={cn("size-1.5 rounded-full shrink-0", sc.dot)} />
                      {r.status}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    {r.attachments > 0 ? (
                      <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
                        <Paperclip className="size-3.5" strokeWidth={1.5} />
                        <span className="text-[11px]">{r.attachments}</span>
                      </div>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>

                  <TableCell>
                    {r.followUp ? (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Calendar className="size-3.5 shrink-0" strokeWidth={1.5} />
                        <span className="text-[11px] tabular-nums whitespace-nowrap">
                          {format(r.followUp, "d MMM", { locale: es })}
                        </span>
                      </div>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>

                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" strokeWidth={1.5} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRowClick(r)}>Ver completo</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Imprimir</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar para nuevo registro</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Anular</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">No se encontraron registros con esos filtros.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-6 py-3">
        <p className="text-sm text-muted-foreground">
          Mostrando {start}–{end} de {totalCount.toLocaleString("es-CO")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm" className="h-7 text-xs"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Pág. {page} de {totalPages}
          </span>
          <Button
            variant="outline" size="sm" className="h-7 text-xs"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
