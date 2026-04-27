"use client"

import * as React from "react"
import { useActionState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { User, Shield, Bell, AlertCircle, CheckCircle2 } from "lucide-react"
import { ROLE_ENUM_TO_LABEL, STATUS_ENUM_TO_LABEL, STATUS_CONFIG } from "@/lib/types/users-view"
import { updateOwnProfile, cambiarPassword, type ProfileActionState } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface PerfilClientProps {
  user: any
}

const INITIAL_STATE: ProfileActionState = {}

export function PerfilClient({ user }: PerfilClientProps) {
  const [tab, setTab] = React.useState<"perfil" | "seguridad" | "notificaciones">("perfil")
  const [profileState, profileAction, profilePending] = useActionState(updateOwnProfile, INITIAL_STATE)
  const [passwordState, passwordAction, passwordPending] = useActionState(cambiarPassword, INITIAL_STATE)

  const roleLabel = ROLE_ENUM_TO_LABEL[user.role as keyof typeof ROLE_ENUM_TO_LABEL] ?? user.role
  const statusLabel = STATUS_ENUM_TO_LABEL[user.status as keyof typeof STATUS_ENUM_TO_LABEL] ?? user.status
  const statusCfg = STATUS_CONFIG[statusLabel as keyof typeof STATUS_CONFIG] ?? { dot: "bg-gray-400" }
  const initials = user.name?.split(" ").filter((_: string, i: number) => i < 2).map((w: string) => w[0]).join("") ?? "??"

  const formatDate = (d: Date | null | undefined) => {
    if (!d) return ""
    try { return d.toISOString().split("T")[0] } catch { return "" }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Administra tu información personal y preferencias</p>
      </div>

      <div className="flex border-b px-6">
        {([["perfil", "Información personal", User], ["seguridad", "Seguridad", Shield], ["notificaciones", "Notificaciones", Bell]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="size-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "perfil" && (
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
              <div className="flex size-16 items-center justify-center rounded-full text-white text-xl font-bold" style={{ background: user.color ?? "#6B7280" }}>
                {initials}
              </div>
              <div>
                <p className="text-base font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{roleLabel}</span>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", statusCfg.bg ?? "bg-gray-100", statusCfg.text ?? "text-gray-600")}>
                    <span className={cn("size-1.5 rounded-full", statusCfg.dot)} />
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            {profileState && "ok" in profileState && !profileState.ok && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{profileState.error}</span>
              </div>
            )}
            {profileState && "ok" in profileState && profileState.ok && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle2 className="size-4" strokeWidth={1.5} />
                Perfil actualizado correctamente
              </div>
            )}

            <form action={profileAction} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Datos personales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Nombre completo</Label>
                    <Input name="name" defaultValue={user.name ?? ""} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Correo electrónico</Label>
                    <Input value={user.email ?? ""} disabled className="h-9 text-sm text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Teléfono</Label>
                    <Input name="phone" defaultValue={user.phone ?? ""} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cédula</Label>
                    <Input value={user.cedula ?? ""} disabled className="h-9 text-sm text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Fecha de nacimiento</Label>
                    <Input name="birthDate" type="date" defaultValue={formatDate(user.birthDate)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Género</Label>
                    <Select name="gender" defaultValue={user.gender === "MASCULINO" ? "Masculino" : user.gender === "FEMENINO" ? "Femenino" : ""}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">Dirección</Label>
                    <Input name="address" defaultValue={user.address ?? ""} className="h-9 text-sm" />
                  </div>
                </div>
              </div>

              <Separator />

              {user.specialty && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Datos profesionales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Especialidad</Label>
                      <Input value={user.specialty ?? ""} disabled className="h-9 text-sm text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Universidad</Label>
                      <Input value={user.universidad ?? ""} disabled className="h-9 text-sm text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={profilePending} size="sm" className="h-9">
                  {profilePending ? "Guardando…" : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {tab === "seguridad" && (
          <div className="max-w-2xl space-y-6">
            {passwordState && "ok" in passwordState && !passwordState.ok && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{passwordState.error}</span>
              </div>
            )}
            {passwordState && "ok" in passwordState && passwordState.ok && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle2 className="size-4" strokeWidth={1.5} />
                Contraseña actualizada correctamente
              </div>
            )}

            <form action={passwordAction} className="space-y-4">
              <h3 className="text-sm font-medium">Cambiar contraseña</h3>
              <div className="space-y-3 max-w-sm">
                <div className="space-y-2">
                  <Label className="text-xs">Contraseña actual</Label>
                  <Input name="currentPassword" type="password" className="h-9 text-sm" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Nueva contraseña</Label>
                  <Input name="newPassword" type="password" className="h-9 text-sm" required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Confirmar nueva contraseña</Label>
                  <Input name="confirmPassword" type="password" className="h-9 text-sm" required />
                </div>
              </div>
              <Button type="submit" disabled={passwordPending} size="sm" className="h-9">
                {passwordPending ? "Cambiando…" : "Cambiar contraseña"}
              </Button>
            </form>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Autenticación de dos factores</h3>
              <div className="flex items-center justify-between rounded-lg border p-3 max-w-sm">
                <div>
                  <p className="text-sm font-medium">2FA</p>
                  <p className="text-xs text-muted-foreground">Protege tu cuenta con verificación adicional</p>
                </div>
                <Switch disabled checked={user.twoFactorEnabled} />
              </div>
              <p className="text-xs text-muted-foreground">Próximamente disponible.</p>
            </div>
          </div>
        )}

        {tab === "notificaciones" && (
          <div className="max-w-2xl space-y-6">
            <form action={profileAction} className="space-y-4">
              <h3 className="text-sm font-medium">Preferencias de notificación</h3>
              {[
                { key: "notifyEmail", label: "Notificaciones por email", desc: "Recibir alertas e información importante" },
                { key: "notifySms", label: "Notificaciones por SMS", desc: "Recordatorios de citas y mensajes urgentes" },
                { key: "notifyPush", label: "Notificaciones push", desc: "Notificaciones en el navegador" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch name={key} defaultChecked={(user as any)[key] ?? false} />
                </div>
              ))}
              <div className="flex justify-end">
                <Button type="submit" disabled={profilePending} size="sm" className="h-9">
                  {profilePending ? "Guardando…" : "Guardar preferencias"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
