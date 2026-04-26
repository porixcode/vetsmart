"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Eye, Paperclip, Clock, MoreHorizontal, Download } from "lucide-react"
import type { ClinicalRecordView } from "@/lib/types/clinical-records-view"
import { ATTENTION_CONFIG, STATUS_CONFIG } from "@/lib/types/clinical-records-view"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface RecordsTableProps {
  records:        ClinicalRecordView[]
  selectedIds:    Set<string>
  onToggleSelect: (id: string) => void
  onToggleAll:    () => void
  onRowClick:     (record: ClinicalRecordView) => void
  onAnular:       (record: ClinicalRecordView) => void
  onDownload:     (record: ClinicalRecordView) => void
  page:           number
  pageSize:       number
  totalCount:     number
  onPageChange:   (page: number) => void
}

export function RecordsTable({
  records, selectedIds, onToggleSelect, onToggleAll, onRowClick,
  onAnular, onDownload,
  page, pageSize, totalCount, onPageChange,
}: RecordsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={records.length > 0 && records.every(r => selectedIds.has(r.id))}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead className="w-28">Fecha/Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Dueño</TableHead>
              <TableHead>Veterinario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-10 text-center" title="Adjuntos">
                <Paperclip className="size-3.5 mx-auto" strokeWidth={1.5} />
              </TableHead>
              <TableHead className="w-10 text-center" title="Seguimiento">
                <Clock className="size-3.5 mx-auto" strokeWidth={1.5} />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-12 text-sm text-muted-foreground">
                  No se encontraron registros clínicos
                </TableCell>
              </TableRow>
            ) : (
              records.map(r => {
                const tc = ATTENTION_CONFIG[r.type] ?? { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" }
                const sc = STATUS_CONFIG[r.status] ?? { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" }
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => onRowClick(r)}>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => onToggleSelect(r.id)} />
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      <span className="tabular-nums">{format(r.date, "d MMM", { locale: es })}</span>
                      <br />
                      <span className="text-muted-foreground">{format(r.date, "HH:mm", { locale: es })}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-6 shrink-0 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ background: r.patient.color }}
                        >
                          {r.patient.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{r.patient.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.patient.breed}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.owner.name}</TableCell>
                    <TableCell className="text-xs">{r.veterinarian.lastName}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", tc.bg, tc.text)}>
                        <span className={cn("size-1.5 rounded-full", tc.dot)} />
                        {r.type}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <p className="truncate text-xs">{r.visitReason}</p>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <p className="truncate text-xs text-muted-foreground">
                        {r.diagnoses[0]?.cie10 ?? "—"}
                        {r.diagnoses[0] && <span className="ml-1">· {r.diagnoses[0].description}</span>}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", sc.bg, sc.text)}>
                        <span className={cn("size-1.5 rounded-full", sc.dot)} />
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{r.attachments > 0 && <Paperclip className="size-3.5 inline text-muted-foreground" strokeWidth={1.5} />}</TableCell>
                    <TableCell className="text-center">{r.followUp && <Clock className="size-3.5 inline text-amber-500" strokeWidth={1.5} />}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <MoreHorizontal className="size-4" strokeWidth={1.5} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onRowClick(r)}>
                            <Eye className="mr-2 size-3.5" strokeWidth={1.5} />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload(r)}>
                            <Download className="mr-2 size-3.5" strokeWidth={1.5} />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => onAnular(r)}>Anular</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-xs text-muted-foreground">
            {records.length} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" className="h-7 text-xs"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page} / {totalPages}
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
      )}
    </div>
  )
}
