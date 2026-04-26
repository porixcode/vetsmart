"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell } from "lucide-react"

interface VaccineReminder {
  id: string
  patient: { id: string; name: string }
  vaccineName: string
  dateDue: Date | null
}

interface UpcomingVaccinesProps {
  reminders?: VaccineReminder[]
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

function daysUntil(d: Date | null): number {
  if (!d) return 999
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

export function UpcomingVaccines({ reminders = [] }: UpcomingVaccinesProps) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
          Próximas vacunas
        </h3>
      </div>

      <div className="divide-y divide-border">
        {reminders.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No hay vacunas próximas
          </div>
        ) : (
          reminders.map((reminder) => {
            const days = daysUntil(reminder.dateDue)
            return (
              <div
                key={reminder.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {getInitials(reminder.patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {reminder.patient.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {reminder.vaccineName} · en {days} días
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-sm px-2 text-xs text-text-secondary hover:bg-background-muted hover:text-text-primary transition-colors duration-150 flex-shrink-0"
                >
                  <Bell className="h-3 w-3" strokeWidth={1.5} />
                  <span>Notificar</span>
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
