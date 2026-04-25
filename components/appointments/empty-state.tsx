"use client"

import { Calendar, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type: "no-appointments" | "no-results"
  onAction?: () => void
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  if (type === "no-appointments") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background py-16 px-4">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No hay citas programadas para hoy</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Comienza agendando la primera cita del día
        </p>
        <Button onClick={onAction}>
          Agendar primera cita
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background py-16 px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Ningún resultado con estos filtros</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-sm">
        Intenta ajustar los filtros para ver más resultados
      </p>
      <Button variant="outline" onClick={onAction}>
        <X className="h-4 w-4 mr-2" />
        Limpiar filtros
      </Button>
    </div>
  )
}
