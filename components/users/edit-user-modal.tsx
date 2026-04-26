"use client"

import * as React from "react"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { updateUser, type UserActionState } from "@/lib/actions/users"
import type { UserView } from "@/lib/types/users-view"
import { ROLES, STATUSES, STATUS_CONFIG } from "@/lib/types/users-view"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  user: UserView | null
}

const INITIAL_STATE: UserActionState = {}

export function EditUserModal({ open, onOpenChange, onSuccess, user }: EditUserModalProps) {
  const [state, formAction, pending] = useActionState(updateUser, INITIAL_STATE)

  const successHandled = React.useRef(false)
  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      if (successHandled.current) return
      successHandled.current = true
      onSuccess?.()
      onOpenChange(false)
    }
    if (state && !("ok" in state)) {
      successHandled.current = false
    }
  }, [state, onSuccess, onOpenChange])

  if (!user) return null

  const formatDate = (d: Date | null | undefined) => {
    if (!d) return ""
    try { return d.toISOString().split("T")[0] } catch { return "" }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Actualizar información de {user.name}</DialogDescription>
        </DialogHeader>

        {state && "ok" in state && !state.ok && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={user.id} />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Datos del usuario</h3>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                  <Input id="name" name="name" defaultValue={user.name} required />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input id="email" name="email" type="email" defaultValue={user.email} required />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                  <Input id="phone" name="phone" defaultValue={user.phone} />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cedula">Cédula</FieldLabel>
                  <Input id="cedula" name="cedula" defaultValue={user.cedula} />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="role-edit">Rol</FieldLabel>
                  <Select name="role" defaultValue={user.role}>
                    <SelectTrigger id="role-edit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="status-edit">Estado</FieldLabel>
                  <Select name="status" defaultValue={user.status}>
                    <SelectTrigger id="status-edit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => {
                        const cfg = STATUS_CONFIG[s]
                        return (
                          <SelectItem key={s} value={s}>
                            <div className="flex items-center gap-2">
                              <span className={cn("size-2 rounded-full", cfg.dot)} />
                              {s}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Datos profesionales</h3>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cedulaProfesional">Cédula profesional</FieldLabel>
                  <Input id="cedulaProfesional" name="cedulaProfesional" defaultValue={user.cedulaProfesional ?? ""} />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="specialty">Especialidad</FieldLabel>
                  <Input id="specialty" name="specialty" defaultValue={user.specialty ?? ""} />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="universidad">Universidad</FieldLabel>
                  <Input id="universidad" name="universidad" defaultValue={user.universidad ?? ""} />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="graduationYear">Año</FieldLabel>
                  <Input id="graduationYear" name="graduationYear" type="number" defaultValue={user.graduationYear?.toString() ?? ""} />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="birthDate">Fecha nac.</FieldLabel>
                  <Input id="birthDate" name="birthDate" type="date" defaultValue={formatDate(user.birthDate)} />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="gender">Género</FieldLabel>
                  <Select name="gender" defaultValue={user.gender === "MASCULINO" ? "Masculino" : user.gender === "FEMENINO" ? "Femenino" : ""}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel htmlFor="address">Dirección</FieldLabel>
                  <Input id="address" name="address" defaultValue={user.address ?? ""} />
                </Field>
              </FieldGroup>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
