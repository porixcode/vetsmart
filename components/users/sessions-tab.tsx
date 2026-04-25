"use client"

import * as React from "react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Monitor, Smartphone, Tablet, MapPin, LogOut } from "lucide-react"
import { activeSessions, getUserById, type DeviceType } from "@/lib/data/users"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function DeviceIcon({ type }: { type: DeviceType }) {
  if (type === "mobile")  return <Smartphone className="size-4 text-muted-foreground" strokeWidth={1.5} />
  if (type === "tablet")  return <Tablet      className="size-4 text-muted-foreground" strokeWidth={1.5} />
  return <Monitor className="size-4 text-muted-foreground" strokeWidth={1.5} />
}

export function SessionsTab() {
  const [sessions, setSessions] = React.useState(activeSessions)

  const revokeSession = (id: string) => setSessions(prev => prev.filter(s => s.id !== id))
  const revokeAll = () => setSessions([])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto p-6 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{sessions.length} sesiones activas</p>
          <p className="text-xs text-muted-foreground">En todos los dispositivos y usuarios del sistema</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={revokeAll}
          disabled={sessions.length === 0}
        >
          <LogOut className="mr-1.5 size-3.5" strokeWidth={1.5} />
          Cerrar todas las sesiones
        </Button>
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-muted-foreground">No hay sesiones activas en este momento.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          {sessions.map((s, i) => {
            const user = getUserById(s.userId)
            if (!user) return null
            const initials = user.name.split(" ").slice(0, 2).map(w => w[0]).join("")
            return (
              <div key={s.id} className={cn("flex items-center gap-4 px-4 py-3", i < sessions.length - 1 && "border-b border-border")}>
                {/* Device icon */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <DeviceIcon type={s.deviceType} />
                </div>

                {/* User */}
                <div className="flex items-center gap-2 w-44 shrink-0">
                  <div
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-white text-[9px] font-bold"
                    style={{ background: user.color }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.role}</p>
                  </div>
                </div>

                {/* Browser + IP */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{s.browser}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                    <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
                    <span className="text-[11px]">{s.ip} · {s.city}</span>
                  </div>
                </div>

                {/* Timing */}
                <div className="text-right shrink-0 hidden md:block">
                  <p className="text-xs text-muted-foreground">Inicio</p>
                  <p className="text-[11px] font-medium tabular-nums">
                    {format(s.startedAt, "d MMM, HH:mm", { locale: es })}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden lg:block">
                  <p className="text-xs text-muted-foreground">Últ. actividad</p>
                  <p className="text-[11px] tabular-nums">
                    {formatDistanceToNow(s.lastActivity, { locale: es, addSuffix: true })}
                  </p>
                </div>

                {/* Revoke */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:bg-destructive/5 shrink-0"
                  onClick={() => revokeSession(s.id)}
                >
                  Cerrar
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
