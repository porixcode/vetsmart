"use client"

import * as React from "react"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { createUser, type UserActionState } from "@/lib/actions/users"
import { ROLE_LABEL_TO_ENUM, ROLES } from "@/lib/types/users-view"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

interface NewUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (temporaryPassword: string) => void
}

const INITIAL_STATE: UserActionState = {}

export function NewUserModal({ open, onOpenChange, onSuccess }: NewUserModalProps) {
  const [state, formAction, pending] = useActionState(createUser, INITIAL_STATE)

  const successHandled = React.useRef(false)
  React.useEffect(() => {
    if (state && "ok" in state && state.ok && "temporaryPassword" in state && state.temporaryPassword) {
      if (successHandled.current) return
      successHandled.current = true
      onSuccess?.(state.temporaryPassword)
    }
    if (state && "ok" in state && state.ok && !("temporaryPassword" in state)) {
      if (successHandled.current) return
      successHandled.current = true
      onOpenChange(false)
    }
    if (state && !("ok" in state)) {
      successHandled.current = false
    }
  }, [state, onSuccess, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>Crea una cuenta para un nuevo usuario del sistema</DialogDescription>
        </DialogHeader>

        {state && "ok" in state && !state.ok && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Datos del usuario</h3>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre completo *</FieldLabel>
                  <Input id="name" name="name" placeholder="Nombre" required />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                  <Input id="phone" name="phone" placeholder="+57 300 123 4567" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cedula">Cédula</FieldLabel>
                  <Input id="cedula" name="cedula" placeholder="Número de identificación" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="role">Rol *</FieldLabel>
                  <Select name="role" required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Información personal</h3>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
                  <Input id="birthDate" name="birthDate" type="date" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="gender">Género</FieldLabel>
                  <Select name="gender">
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
                  <Input id="address" name="address" placeholder="Dirección completa" />
                </Field>
              </FieldGroup>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Datos profesionales (solo veterinarios)</h3>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cedulaProfesional">Cédula profesional</FieldLabel>
                  <Input id="cedulaProfesional" name="cedulaProfesional" placeholder="Ej: MV-12345" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="specialty">Especialidad</FieldLabel>
                  <Input id="specialty" name="specialty" placeholder="Ej: Cirugía" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="universidad">Universidad</FieldLabel>
                  <Input id="universidad" name="universidad" placeholder="Universidad" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="graduationYear">Año de graduación</FieldLabel>
                  <Input id="graduationYear" name="graduationYear" type="number" placeholder="2015" />
                </Field>
              </FieldGroup>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando…" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
