"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LogIn, LogOut, Plus, Pencil, Trash2, Eye, Download, ChevronDown } from "lucide-react"
import type { AuditLogEntry } from "@/lib/types/users-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface AuditTabProps {
  auditLog?: AuditLogEntry[]
}

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  LOGIN:  LogIn,
  LOGOUT: LogOut,
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  ARCHIVE: Eye,
  RESTORE: Download,
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN:  "text-emerald-500 bg-emerald-50",
  LOGOUT: "text-gray-500 bg-gray-100",
  CREATE: "text-blue-500 bg-blue-50",
  UPDATE: "text-amber-500 bg-amber-50",
  DELETE: "text-red-500 bg-red-50",
  ARCHIVE: "text-muted-foreground bg-muted",
  RESTORE: "text-violet-500 bg-violet-50",
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN:"Acceso", LOGOUT:"Cierre sesión", CREATE:"Creación", UPDATE:"Edición",
  DELETE:"Eliminación", ARCHIVE:"Archivo", RESTORE:"Restauración",
}

const ALL_TYPES = ["LOGIN","LOGOUT","CREATE","UPDATE","DELETE","ARCHIVE","RESTORE"]

export function AuditTab({ auditLog = [] }: AuditTabProps) {
  const [search, setSearch] = React.useState("")
  const [selTypes, setSelTypes] = React.useState<string[]>([])

  const sorted = React.useMemo(() =>
    [...auditLog].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [auditLog]
  )

  const toggleType = (t: string) => setSelTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])

  const filtered = sorted.filter(entry => {
    if (selTypes.length > 0 && !selTypes.includes(entry.actionType)) return false
    if (search) {
      const q = search.toLowerCase()
      if (!entry.userName?.toLowerCase().includes(q) && !entry.description.toLowerCase().includes(q) && !entry.module.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <Input
          placeholder="Buscar en auditoría..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="h-8 text-sm max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              Tipo de acción
              {selTypes.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selTypes.length}</span>}
              <ChevronDown className="size-3" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ALL_TYPES.map(t => (
              <DropdownMenuCheckboxItem key={t} checked={selTypes.includes(t)} onCheckedChange={() => toggleType(t)}>
                {ACTION_LABELS[t] ?? t}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} eventos</div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-2">
          {filtered.map(entry => {
            const Icon = ACTION_ICONS[entry.actionType] ?? LogIn
            const initials = entry.userName?.split(" ").slice(0, 2).map(w => w[0]).join("") ?? "??"
            return (
              <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3">
                <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs mt-0.5", ACTION_COLORS[entry.actionType] ?? "bg-muted")}>
                  <Icon className="size-3.5" strokeWidth={1.5} />
                </div>

                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-white text-[9px] font-bold mt-0.5"
                  style={{ background: entry.userColor ?? "#6B7280" }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">{entry.userName ?? "Usuario eliminado"}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{entry.module}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {entry.ip ?? ""}{entry.ip && entry.device ? " · " : ""}{entry.device ?? ""}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[11px] font-medium tabular-nums">
                    {format(entry.createdAt, "d MMM, HH:mm", { locale: es })}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{ACTION_LABELS[entry.actionType] ?? entry.actionType}</p>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">No se encontraron eventos con esos filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
