"use client"

import * as React from "react"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { createClinicalRecord, type ClinicalRecordActionState } from "@/lib/actions/clinical-records"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

interface PatientBrief {
  id: string; name: string; species: string; breed: string
}

interface NewGlobalRecordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientBrief[]
}

const INITIAL_STATE: ClinicalRecordActionState = {}

export function NewGlobalRecordModal({ open, onOpenChange, patients }: NewGlobalRecordModalProps) {
  const [patientId, setPatientId] = React.useState("")
  const [state, formAction, pending] = useActionState(createClinicalRecord, INITIAL_STATE)

  const successHandled = React.useRef(false)
  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      if (successHandled.current) return
      successHandled.current = true
      setPatientId("")
      onOpenChange(false)
    }
    if (state && !("ok" in state)) {
      successHandled.current = false
    }
  }, [state, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo registro clínico</DialogTitle>
          <DialogDescription>Agregar atención médica a un paciente</DialogDescription>
        </DialogHeader>

        {state && "ok" in state && !state.ok && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="patientId" value={patientId} />
          <input type="hidden" name="veterinarianId" value="self" />

          <div className="grid gap-4 md:grid-cols-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="patient">Paciente *</FieldLabel>
                <Select value={patientId} onValueChange={setPatientId} required>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.breed})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="date">Fecha</FieldLabel>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="time">Hora</FieldLabel>
                <Input id="time" name="time" type="time" defaultValue={new Date().toTimeString().slice(0, 5)} />
              </Field>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="visitReason">Motivo de consulta *</FieldLabel>
              <Input id="visitReason" name="visitReason" placeholder="Motivo de la atención" required />
            </Field>
          </FieldGroup>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="subjective">Subjetivo</FieldLabel>
                <Textarea id="subjective" name="subjective" rows={3} placeholder="Historia, síntomas..." />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="objective">Objetivo</FieldLabel>
                <Textarea id="objective" name="objective" rows={3} placeholder="Hallazgos físicos..." />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="analysis">Análisis</FieldLabel>
                <Textarea id="analysis" name="analysis" rows={3} placeholder="Diagnóstico diferencial..." />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="plan">Plan</FieldLabel>
                <Textarea id="plan" name="plan" rows={3} placeholder="Tratamiento, recomendaciones..." />
              </Field>
            </FieldGroup>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="diagnosis">Diagnóstico</FieldLabel>
                <Input id="diagnosis" name="diagnosis" placeholder="Diagnóstico principal" />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="diagnosisCode">Código CIE-10</FieldLabel>
                <Input id="diagnosisCode" name="diagnosisCode" placeholder="Ej: Z09.9" />
              </Field>
            </FieldGroup>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="treatment">Tratamiento</FieldLabel>
              <Textarea id="treatment" name="treatment" rows={2} placeholder="Medicación, dosis..." />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nextControl">Próximo control</FieldLabel>
              <Input id="nextControl" name="nextControl" type="date" />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !patientId}>
              {pending ? "Guardando…" : "Guardar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
