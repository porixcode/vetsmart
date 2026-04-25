"use client"

import { FileText, AlertTriangle, Edit, UserPlus, Calendar, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  icon: React.ElementType
  iconColor: string
  description: React.ReactNode
  timestamp: string
}

const activities: Activity[] = [
  {
    id: "1",
    icon: FileText,
    iconColor: "text-primary",
    description: (
      <>
        <span className="font-medium">Dra. Patricia</span> registró nueva consulta para{" "}
        <span className="font-medium">Max García</span>
      </>
    ),
    timestamp: "hace 5 min",
  },
  {
    id: "2",
    icon: AlertTriangle,
    iconColor: "text-warning",
    description: (
      <>
        <span className="font-medium">Sistema:</span> Stock crítico detectado en{" "}
        <span className="font-medium">Vacuna Antirrábica</span>
      </>
    ),
    timestamp: "hace 12 min",
  },
  {
    id: "3",
    icon: Edit,
    iconColor: "text-accent",
    description: (
      <>
        <span className="font-medium">Edwin Ospina</span> actualizó historial de{" "}
        <span className="font-medium">Luna Pérez</span>
      </>
    ),
    timestamp: "hace 23 min",
  },
  {
    id: "4",
    icon: UserPlus,
    iconColor: "text-success",
    description: (
      <>
        <span className="font-medium">Dra. Marly Jara</span> registró nuevo paciente{" "}
        <span className="font-medium">Coco Hernández</span>
      </>
    ),
    timestamp: "hace 45 min",
  },
  {
    id: "5",
    icon: Calendar,
    iconColor: "text-primary",
    description: (
      <>
        <span className="font-medium">María Torres</span> agendó cita para{" "}
        <span className="font-medium">Simba Gómez</span>
      </>
    ),
    timestamp: "hace 1 hora",
  },
  {
    id: "6",
    icon: Package,
    iconColor: "text-text-secondary",
    description: (
      <>
        <span className="font-medium">Sistema:</span> Reabastecimiento de{" "}
        <span className="font-medium">Jeringa 5ml</span> completado
      </>
    ),
    timestamp: "hace 2 horas",
  },
]

export function RecentActivity() {
  return (
    <div className="rounded-md border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
          Actividad reciente
        </h3>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-4">
            <div
              className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-background-muted",
                activity.iconColor
              )}
            >
              <activity.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary leading-relaxed">
                {activity.description}
              </p>
              <p className="mt-1 text-xs text-text-muted">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <button className="text-xs font-medium text-primary transition-colors duration-150 hover:text-primary-hover">
          Ver todo
        </button>
      </div>
    </div>
  )
}
