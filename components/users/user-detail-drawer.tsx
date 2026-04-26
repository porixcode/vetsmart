"use client"

import * as React from "react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  X, Copy, Mail, Phone, ShieldCheck, ShieldOff, Check, LogIn, LogOut,
  Plus, Pencil, Trash2, Eye, Download, Monitor, Smartphone, Tablet, MapPin,
} from "lucide-react"
import type { UserView, AuditLogEntry, UserRoleLabel } from "@/lib/types/users-view"
import { ROLE_CONFIG, STATUS_CONFIG, ALL_PERMISSIONS, PERMISSIONS_BY_ROLE } from "@/lib/types/users-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UserDetailDrawerProps {
  user: UserView | null
  isOpen: boolean
  onClose: () => void
  onEdit: (user: UserView) => void
  onDelete: (user: UserView) => void
  onStatusToggle: (user: UserView) => void
  onResetPassword: (user: UserView) => void
}

type DrawerTab = "info" | "permisos" | "actividad" | "sesiones"

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="size-4" strokeWidth={1.5} />
  if (type === "tablet") return <Tablet className="size-4" strokeWidth={1.5} />
  return <Monitor className="size-4" strokeWidth={1.5} />
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button onClick={copy} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="size-3 text-emerald-500" strokeWidth={2} /> : <Copy className="size-3" strokeWidth={1.5} />}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b border-border last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xs font-medium">{value}</dd>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-5 first:mt-0">
      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h5>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export function UserDetailDrawer({ user, isOpen, onClose, onEdit, onDelete, onStatusToggle, onResetPassword }: UserDetailDrawerProps) {
  const [tab, setTab] = React.useState<DrawerTab>("info")

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  React.useEffect(() => { if (isOpen) setTab("info") }, [isOpen, user?.id])

  if (!user) return null

  const rc = ROLE_CONFIG[user.role]
  const sc = STATUS_CONFIG[user.status]
  const initials = user.name.split(" ").slice(0, 2).map(w => w[0]).join("")
  const perms = PERMISSIONS_BY_ROLE[user.role]

  const genderLabel = user.gender === "MASCULINO" ? "Masculino" : user.gender === "FEMENINO" ? "Femenino" : null

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-[560px] max-w-full flex-col bg-background border-l border-border shadow-xl transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="border-b border-border px-5 py-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-full text-white text-xl font-bold"
                style={{ background: user.color }}
              >
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", rc.bg, rc.text)}>{user.role}</span>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", sc.bg, sc.text)}>
                    <span className={cn("size-1.5 rounded-full", sc.dot)} />{user.status}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="size-3.5" strokeWidth={1.5} />
              <span>{user.email}</span>
              <CopyButton value={user.email} />
            </div>
            <div className="flex items-center gap-1">
              <Phone className="size-3.5" strokeWidth={1.5} />
              <span>{user.phone}</span>
              <CopyButton value={user.phone} />
            </div>
          </div>

          <div className="flex border-b -mb-4 -mx-5 px-5">
            {(["info","permisos","actividad","sesiones"] as DrawerTab[]).map(t => {
              const labels: Record<DrawerTab, string> = { info:"Información", permisos:"Permisos", actividad:"Actividad", sesiones:"Sesiones" }
              return (
                <button key={t} onClick={() => setTab(t)} className={cn(
                  "px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                  tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}>
                  {labels[t]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "info" && (
            <div className="p-5 space-y-1">
              <SectionHeader title="Datos personales" />
              <dl>
                <InfoRow label="Nombre completo" value={user.name} />
                <InfoRow label="Cédula" value={<span className="font-mono">{user.cedula || "—"}</span>} />
                <InfoRow label="Fecha de nacimiento" value={user.birthDate ? format(user.birthDate, "d 'de' MMMM 'de' yyyy", { locale: es }) : "—"} />
                <InfoRow label="Género" value={genderLabel ?? "—"} />
                <InfoRow label="Teléfono" value={<span className="flex items-center gap-1">{user.phone}<CopyButton value={user.phone} /></span>} />
                <InfoRow label="Dirección" value={user.address ?? "—"} />
              </dl>

              {user.role === "Veterinario" && (
                <>
                  <SectionHeader title="Datos profesionales" />
                  <dl>
                    <InfoRow label="Cédula profesional" value={<span className="font-mono">{user.cedulaProfesional ?? "—"}</span>} />
                    <InfoRow label="Universidad" value={user.universidad ?? "—"} />
                    <InfoRow label="Año de graduación" value={user.graduationYear?.toString() ?? "—"} />
                    <InfoRow label="Especialidad" value={user.specialty ?? "—"} />
                  </dl>
                </>
              )}

              <SectionHeader title="Datos del sistema" />
              <dl>
                <InfoRow label="Cuenta creada" value={format(user.createdAt, "d MMM yyyy", { locale: es })} />
                <InfoRow label="Creado por" value={user.createdByName ?? "Sistema"} />
                <InfoRow label="Último acceso" value={user.status === "Pendiente" || !user.lastActivityAt ? "Sin acceso" : formatDistanceToNow(user.lastActivityAt, { locale: es, addSuffix: true })} />
                <InfoRow label="IP último acceso" value={<span className="font-mono text-[11px]">{user.lastIp ?? "—"}</span>} />
                <InfoRow label="Autenticación 2FA" value={
                  user.twoFactorEnabled
                    ? <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck className="size-3.5" strokeWidth={1.5} />Habilitada</span>
                    : <span className="flex items-center gap-1 text-muted-foreground"><ShieldOff className="size-3.5" strokeWidth={1.5} />Deshabilitada</span>
                } />
              </dl>
            </div>
          )}

          {tab === "permisos" && (
            <div className="p-5">
              <div className={cn("rounded-lg p-3 mb-4", rc.bg)}>
                <p className={cn("text-xs font-semibold", rc.text)}>{user.role}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rc.description}</p>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Permisos efectivos</p>
              <div className="space-y-4">
                {Object.entries(ALL_PERMISSIONS).map(([module, actions]) => {
                  const granted = perms[module] ?? []
                  return (
                    <div key={module}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground mb-1.5">{module}</p>
                      <div className="rounded-lg border border-border bg-background overflow-hidden">
                        {actions.map((action, i) => (
                          <div key={action} className={cn("flex items-center justify-between px-3 py-2", i < actions.length - 1 && "border-b border-border/50")}>
                            <span className="text-xs text-muted-foreground capitalize">{action}</span>
                            {granted.includes(action)
                              ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><Check className="size-3" strokeWidth={2} />Permitido</span>
                              : <span className="text-[10px] text-muted-foreground/50">—</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === "actividad" && (
            <ActivityTabContent userId={user.id} />
          )}

          {tab === "sesiones" && (
            <SessionsTabContent userId={user.id} />
          )}
        </div>

        <div className="border-t border-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="sm"
              className="h-8 text-xs text-destructive hover:bg-destructive/5"
              onClick={() => onStatusToggle(user)}
            >
              {user.status === "Activo" ? "Suspender" : "Activar"}
            </Button>
            <Button
              variant="ghost" size="sm"
              className="h-8 text-xs text-destructive hover:bg-destructive/5"
              onClick={() => onDelete(user)}
            >
              Eliminar
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" className="h-8 text-xs"
              onClick={() => onResetPassword(user)}
            >
              Resetear contraseña
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => { onEdit(user); onClose() }}>
              Editar usuario
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function ActivityTabContent({ userId }: { userId: string }) {
  const [activity, setActivity] = React.useState<AuditLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/users/${userId}/activity`)
      .then(r => r.json())
      .then(data => setActivity(data.map((e: any) => ({ ...e, createdAt: new Date(e.createdAt) }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="p-5 text-center text-sm text-muted-foreground">Cargando...</div>

  if (activity.length === 0) {
    return (
      <div className="p-5 text-center text-muted-foreground text-sm">Sin actividad registrada.</div>
    )
  }

  const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    LOGIN: LogIn, LOGOUT: LogOut, CREATE: Plus, UPDATE: Pencil, DELETE: Trash2, ARCHIVE: Eye, RESTORE: Download,
  }
  const ACTION_COLORS: Record<string, string> = {
    LOGIN:"text-emerald-500 bg-emerald-50", LOGOUT:"text-gray-500 bg-gray-100",
    CREATE:"text-blue-500 bg-blue-50", UPDATE:"text-amber-500 bg-amber-50",
    DELETE:"text-red-500 bg-red-50", ARCHIVE:"text-muted-foreground bg-muted", RESTORE:"text-violet-500 bg-violet-50",
  }

  return (
    <div className="p-5 space-y-2">
      {activity.map(entry => {
        const Icon = ACTION_ICONS[entry.actionType] ?? LogIn
        return (
          <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
            <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5", ACTION_COLORS[entry.actionType] ?? "bg-muted")}>
              <Icon className="size-3" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs">{entry.description}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{entry.ip ?? ""}{entry.ip && entry.device ? " · " : ""}{entry.device ?? ""}</p>
            </div>
            <p className="text-[10px] text-muted-foreground tabular-nums shrink-0">
              {format(entry.createdAt, "d MMM, HH:mm", { locale: es })}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function SessionsTabContent({ userId }: { userId: string }) {
  const [sessions, setSessions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/users/${userId}/sessions`)
      .then(r => r.json())
      .then(data => setSessions(data.map((s: any) => ({ ...s, startedAt: new Date(s.startedAt), lastActivity: new Date(s.lastActivity) }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="p-5 text-center text-sm text-muted-foreground">Cargando...</div>

  if (sessions.length === 0) {
    return (
      <div className="p-5 text-center text-muted-foreground text-sm">Sin sesiones activas.</div>
    )
  }

  return (
    <div className="p-5 space-y-2">
      {sessions.map(s => (
        <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <DeviceIcon type={s.deviceType} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">{s.browser ?? "Navegador desconocido"}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
              <MapPin className="size-2.5" strokeWidth={1.5} />
              {s.ip ?? "—"}{s.city ? ` · ${s.city}` : ""}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Desde {format(s.startedAt, "d MMM, HH:mm", { locale: es })}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/5 shrink-0">
            Cerrar
          </Button>
        </div>
      ))}
    </div>
  )
}
