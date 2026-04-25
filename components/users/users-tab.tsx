"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ShieldCheck, ShieldOff, MoreHorizontal, Search, ChevronDown, Upload, LayoutGrid, LayoutList } from "lucide-react"
import {
  systemUsers, roleConfig, statusConfig, ROLES, STATUSES,
  type SystemUser, type UserRole, type UserStatus,
} from "@/lib/data/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface UsersTabProps {
  onUserClick: (user: SystemUser) => void
}

function UserAvatar({ user, size = 32 }: { user: SystemUser; size?: number }) {
  const initials = user.name.split(" ").filter((_, i) => i < 2).map(w => w[0]).join("")
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.34, background: user.color }}
    >
      {initials}
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const c = roleConfig[role]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", c.bg, c.text)}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  const c = statusConfig[status]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", c.bg, c.text)}>
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {status}
    </span>
  )
}

export function UsersTab({ onUserClick }: UsersTabProps) {
  const [search, setSearch] = React.useState("")
  const [selRoles, setSelRoles]       = React.useState<UserRole[]>([])
  const [selStatuses, setSelStatuses] = React.useState<UserStatus[]>([])
  const [view, setView] = React.useState<"table" | "cards">("table")

  const toggleRole   = (r: UserRole)   => setSelRoles(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])
  const toggleStatus = (s: UserStatus) => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const filtered = React.useMemo(() => systemUsers.filter(u => {
    if (search) {
      const q = search.toLowerCase()
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.cedula.includes(q)) return false
    }
    if (selRoles.length > 0   && !selRoles.includes(u.role))     return false
    if (selStatuses.length > 0 && !selStatuses.includes(u.status)) return false
    return true
  }), [search, selRoles, selStatuses])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Filter bar */}
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Buscar por nombre, email, cédula..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              Rol
              {selRoles.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selRoles.length}</span>}
              <ChevronDown className="size-3" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ROLES.map(r => (
              <DropdownMenuCheckboxItem key={r} checked={selRoles.includes(r)} onCheckedChange={() => toggleRole(r)}>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: roleConfig[r].color }} />
                  {r}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              Estado
              {selStatuses.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selStatuses.length}</span>}
              <ChevronDown className="size-3" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUSES.map(s => (
              <DropdownMenuCheckboxItem key={s} checked={selStatuses.includes(s)} onCheckedChange={() => toggleStatus(s)}>
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", statusConfig[s].dot)} />
                  {s}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Upload className="size-3.5" strokeWidth={1.5} />
            Importar CSV
          </Button>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button onClick={() => setView("table")} className={cn("px-2.5 py-1.5 transition-colors", view === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
              <LayoutList className="size-3.5" strokeWidth={1.5} />
            </button>
            <button onClick={() => setView("cards")} className={cn("px-2.5 py-1.5 border-l border-border transition-colors", view === "cards" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
              <LayoutGrid className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === "table" ? (
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Cédula prof.</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Última actividad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">2FA</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} className="cursor-pointer" onClick={() => onUserClick(u)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} size={32} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {u.cedulaProfesional ?? "—"}
                  </TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.specialty ?? "—"}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground" title={u.lastActivity.toLocaleString("es-CO")}>
                      {u.status === "Pendiente" ? "Sin acceso" : formatDistanceToNow(u.lastActivity, { locale: es, addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-center">
                    {u.twoFactorEnabled
                      ? <ShieldCheck className="size-4 text-emerald-500 mx-auto" strokeWidth={1.5} />
                      : <ShieldOff className="size-4 text-muted-foreground mx-auto" strokeWidth={1.5} />}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" strokeWidth={1.5} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUserClick(u)}>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Resetear contraseña</DropdownMenuItem>
                        <DropdownMenuItem>Cambiar rol</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{u.status === "Activo" ? "Suspender" : "Activar"}</DropdownMenuItem>
                        <DropdownMenuItem>Ver auditoría</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(u => (
              <button
                key={u.id}
                onClick={() => onUserClick(u)}
                className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-4 hover:bg-muted/30 transition-colors text-center"
              >
                <UserAvatar user={u} size={48} />
                <div className="min-w-0 w-full">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <RoleBadge role={u.role} />
                  <StatusBadge status={u.status} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {u.status === "Pendiente" ? "Sin acceso" : formatDistanceToNow(u.lastActivity, { locale: es, addSuffix: true })}
                </p>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">No se encontraron usuarios con esos filtros.</p>
          </div>
        )}
      </div>

      <div className="border-t px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {systemUsers.length} usuarios
        </p>
      </div>
    </div>
  )
}
