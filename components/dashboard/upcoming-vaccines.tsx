"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell } from "lucide-react"

interface VaccineReminder {
  id: string
  patientName: string
  initials: string
  vaccineName: string
  daysUntilDue: number
}

const vaccineReminders: VaccineReminder[] = [
  {
    id: "1",
    patientName: "Coco Hernández",
    initials: "CH",
    vaccineName: "Vacuna Quíntuple",
    daysUntilDue: 3,
  },
  {
    id: "2",
    patientName: "Simba Gómez",
    initials: "SG",
    vaccineName: "Antirrábica",
    daysUntilDue: 5,
  },
  {
    id: "3",
    patientName: "Pelusa Vargas",
    initials: "PV",
    vaccineName: "Parvovirus",
    daysUntilDue: 6,
  },
  {
    id: "4",
    patientName: "Rocky Díaz",
    initials: "RD",
    vaccineName: "Leptospirosis",
    daysUntilDue: 7,
  },
]

export function UpcomingVaccines() {
  return (
    <div className="rounded-md border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
          Próximas vacunas
        </h3>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {vaccineReminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between gap-3 p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {reminder.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {reminder.patientName}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {reminder.vaccineName} · en {reminder.daysUntilDue} días
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
        ))}
      </div>
    </div>
  )
}
