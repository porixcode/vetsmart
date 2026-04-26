"use client"

import { Check, ChevronDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface Appointment {
  id: string
  time: string
  patientName: string
  breed: string
  service: string
  veterinarian: string
  status: "completed" | "in-progress" | "pending"
  color: string
}

interface AgendaTodayProps {
  appointments?: Appointment[]
}

const statusStyles = {
  completed: "bg-background-muted text-text-muted line-through",
  "in-progress": "bg-primary/5 border-primary/20",
  pending: "bg-card",
}

export function AgendaToday({ appointments = [] }: AgendaTodayProps) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
          Agenda de hoy
        </h3>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-sm border border-border bg-background-subtle px-2.5 py-1.5 text-xs text-text-secondary transition-colors duration-150 hover:bg-background-muted">
            <span>Todos los veterinarios</span>
            <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <button className="flex items-center gap-1 text-xs font-medium text-primary transition-colors duration-150 hover:text-primary-hover">
            <span>Ver agenda completa</span>
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {appointments.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No hay citas programadas para hoy
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={cn(
                "flex items-center gap-4 p-4 transition-colors duration-150",
                statusStyles[appointment.status]
              )}
            >
              <div className="w-12 flex-shrink-0">
                <span
                  className={cn(
                    "text-sm tabular-nums font-medium",
                    appointment.status === "completed"
                      ? "text-text-muted"
                      : "text-text-secondary"
                  )}
                >
                  {appointment.time}
                </span>
              </div>

              <div
                className="h-10 w-0.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: appointment.color }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      appointment.status === "completed"
                        ? "text-text-muted"
                        : "text-text-primary"
                    )}
                  >
                    {appointment.patientName}
                  </span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted truncate">{appointment.breed}</span>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-1 rounded-sm bg-background-muted text-xs font-normal text-text-secondary"
                >
                  {appointment.service}
                </Badge>
              </div>

              <div className="flex-shrink-0">
                {appointment.status === "completed" && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                    <Check className="h-3 w-3 text-success" strokeWidth={2} />
                  </div>
                )}
                {appointment.status === "in-progress" && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
                    <span className="text-xs font-medium text-primary">En curso</span>
                  </div>
                )}
                {appointment.status === "pending" && (
                  <span className="h-2 w-2 rounded-full bg-text-muted/30" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
