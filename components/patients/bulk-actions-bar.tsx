'use client'

import { X, UserPlus, Bell, Download, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkActionsBarProps {
  selectedCount: number
  onClear: () => void
  onAssignVet: () => void
  onSendReminder: () => void
  onExport: () => void
  onArchive: () => void
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  onAssignVet,
  onSendReminder,
  onExport,
  onArchive,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="animate-in slide-in-from-top-2 flex items-center justify-between border-b bg-muted/50 px-6 py-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-7" onClick={onClear}>
          <X className="size-4" strokeWidth={1.5} />
        </Button>
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'paciente seleccionado' : 'pacientes seleccionados'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onAssignVet}>
          <UserPlus className="mr-2 size-4" strokeWidth={1.5} />
          Asignar veterinario
        </Button>
        <Button variant="ghost" size="sm" onClick={onSendReminder}>
          <Bell className="mr-2 size-4" strokeWidth={1.5} />
          Enviar recordatorio
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          <Download className="mr-2 size-4" strokeWidth={1.5} />
          Exportar selección
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onArchive}>
          <Archive className="mr-2 size-4" strokeWidth={1.5} />
          Archivar
        </Button>
      </div>
    </div>
  )
}
