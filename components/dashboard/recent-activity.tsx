"use client"

import { FileText, AlertTriangle, Edit, UserPlus, Calendar, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  actionType: string
  module: string
  description: string
  createdAt: Date
  user: { name: string } | null
}

interface RecentActivityProps {
  activities?: Activity[]
}

const iconMap: Record<string, React.ElementType> = {
  CREATE: UserPlus,
  UPDATE: Edit,
  DELETE: FileText,
  ARCHIVE: FileText,
  LOGIN: Calendar,
  EXPORT: Package,
}

const iconColorMap: Record<string, string> = {
  CREATE: "text-success",
  UPDATE: "text-accent",
  DELETE: "text-danger",
  ARCHIVE: "text-warning",
  LOGIN: "text-primary",
  EXPORT: "text-text-secondary",
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "hace un momento"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? "s" : ""}`
  const days = Math.floor(hours / 24)
  return `hace ${days} día${days > 1 ? "s" : ""}`
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
          Actividad reciente
        </h3>
      </div>

      <div className="divide-y divide-border">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No hay actividad reciente
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = iconMap[activity.actionType] ?? FileText
            const iconColor = iconColorMap[activity.actionType] ?? "text-text-secondary"
            const userName = activity.user?.name ?? "Sistema"
            return (
              <div key={activity.id} className="flex items-start gap-3 p-4">
                <div
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-background-muted",
                    iconColor
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    <span className="font-medium">{userName}</span>{" "}
                    {activity.description}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {timeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-border p-4">
        <button className="text-xs font-medium text-primary transition-colors duration-150 hover:text-primary-hover">
          Ver todo
        </button>
      </div>
    </div>
  )
}
