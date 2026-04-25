"use client"

import { Check, ChevronDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Appointment {
  id: string
  time: string
  patientName: string
  breed: string
  service: string
  veterinarian: string
  status: "completed" | "in-progress" | "pending"
  color: string
}

const appointments: Appointment[] = [
  {
    id: "1",
    time: "08:00",
    patientName: "Max García",
    breed: "Golden Retriever",
    service: "Vacunación",
    veterinarian: "Dra. Marly Jara",
    status: "completed",
    color: "#2563EB",
  },
  {
    id: "2",
    time: "09:00",
    patientName: "Luna Pérez",
    breed: "Schnauzer Miniatura",
    service: "Control general",
    veterinarian: "Dr. Edwin Ospina",
    status: "completed",
    color: "#10B981",
  },
  {
    id: "3",
    time: "10:30",
    patientName: "Rocco Ramírez",
    breed: "Pitbull",
    service: "Desparasitación",
    veterinarian: "Dra. Marly Jara",
    status: "in-progress",
    color: "#2563EB",
  },
  {
    id: "4",
    time: "11:30",
    patientName: "Toby Rodríguez",
    breed: "Pastor Alemán",
    service: "Cirugía menor",
    veterinarian: "Dra. Patricia Ortiz",
    status: "pending",
    color: "#F59E0B",
  },
  {
    id: "5",
    time: "14:00",
    patientName: "Mía López",
    breed: "Yorkshire Terrier",
    service: "Estética",
    veterinarian: "Dr. Edwin Ospina",
    status: "pending",
    color: "#10B981",
  },
  {
    id: "6",
    time: "15:30",
    patientName: "Bruno Martínez",
    breed: "Bulldog Francés",
    service: "Consulta general",
    veterinarian: "Dra. Marly Jara",
    status: "pending",
    color: "#2563EB",
  },
]

const statusStyles = {
  completed: "bg-background-muted text-text-muted line-through",
  "in-progress": "bg-primary/5 border-primary/20",
  pending: "bg-card",
}

export function AgendaToday() {
  return (
    <div className="rounded-md border border-border bg-card">
      {/* Header */}
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

      {/* Timeline */}
      <div className="divide-y divide-border">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className={cn(
              "flex items-center gap-4 p-4 transition-colors duration-150",
              statusStyles[appointment.status]
            )}
          >
            {/* Time */}
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

            {/* Color indicator */}
            <div
              className="h-10 w-0.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: appointment.color }}
            />

            {/* Content */}
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

            {/* Status indicator */}
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
        ))}
      </div>
    </div>
  )
}
