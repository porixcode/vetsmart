"use client"

import * as React from "react"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { updatePatient, type PatientActionState } from "@/lib/actions/patients"
import type { Patient } from "@/lib/types/patient-view"
import type { OwnerOption } from "@/lib/queries/patients"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

interface EditPatientModalProps {
  open:    boolean
  onOpenChange: (open: boolean) => void
  onSuccess?:   () => void
  patient: Patient
}

const speciesOptions = ["Canino", "Felino", "Ave", "Roedor", "Reptil", "Otro"]

const breedsBySpecies: Record<string, string[]> = {
  Canino: ["Golden Retriever", "Labrador", "Bulldog Francés", "Pastor Alemán", "Beagle", "Husky Siberiano", "Poodle", "Rottweiler", "Doberman", "Cocker Spaniel", "Schnauzer", "Mestizo", "Otro"],
  Felino: ["Persa", "Siamés", "Angora", "British Shorthair", "Bengalí", "Maine Coon", "Ragdoll", "Mestizo", "Otro"],
  Ave:    ["Loro Amazona", "Cacatúa", "Canario", "Periquito", "Agaporni", "Otro"],
  Roedor: ["Hámster Sirio", "Hámster Ruso", "Cobaya", "Conejo", "Chinchilla", "Otro"],
  Reptil: ["Gecko Leopardo", "Iguana", "Tortuga", "Serpiente", "Otro"],
  Otro:   ["Otro"],
}

const INITIAL_STATE: PatientActionState = {}

export function EditPatientModal({ open, onOpenChange, onSuccess, patient }: EditPatientModalProps) {
  const [species, setSpecies] = React.useState<string>(patient.species)
  const [breed, setBreed]     = React.useState(patient.breed)
  const [sex, setSex]         = React.useState<string>(patient.sex)
  const [state, formAction, pending] = useActionState(updatePatient, INITIAL_STATE)

  React.useEffect(() => { setBreed("") }, [species])

  const successHandled = React.useRef(false)
  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      if (successHandled.current) return
      successHandled.current = true
      onSuccess?.()
    }
    if (state && !("ok" in state)) {
      successHandled.current = false
    }
  }, [state, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
          <DialogDescription>
            Actualiza la información de {patient.name}
          </DialogDescription>
        </DialogHeader>

        {state && "ok" in state && !state.ok && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={patient.id} />
          <input type="hidden" name="species" value={species} />
          <input type="hidden" name="breed"   value={breed} />
          <input type="hidden" name="sex"     value={sex} />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Información del paciente</h3>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                  <Input id="name" name="name" defaultValue={patient.name} required />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="species-select">Especie *</FieldLabel>
                  <Select value={species} onValueChange={setSpecies} required>
                    <SelectTrigger id="species-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {speciesOptions.map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="breed-select">Raza *</FieldLabel>
                  <Select value={breed} onValueChange={setBreed} disabled={!species} required>
                    <SelectTrigger id="breed-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {species && breedsBySpecies[species]?.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel>Sexo *</FieldLabel>
                  <RadioGroup value={sex} onValueChange={setSex} className="flex gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Macho" id="male" />
                      <Label htmlFor="male" className="font-normal">Macho</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Hembra" id="female" />
                      <Label htmlFor="female" className="font-normal">Hembra</Label>
                    </div>
                  </RadioGroup>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
                  <Input id="birthDate" name="birthDate" type="date" defaultValue={patient.birthDate ? new Date(patient.birthDate).toISOString().split("T")[0] : ""} />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="weight">Peso (kg)</FieldLabel>
                  <Input id="weight" name="weight" type="number" step="0.1" defaultValue={patient.weight || ""} />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="color">Color</FieldLabel>
                  <Input id="color" name="color" defaultValue={patient.color} />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="microchip">Microchip</FieldLabel>
                  <Input id="microchip" name="microchip" defaultValue={patient.microchip ?? ""} />
                </Field>
              </FieldGroup>

              <FieldGroup className="col-span-2">
                <Field className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FieldLabel htmlFor="neutered" className="mb-0">Esterilizado/Castrado</FieldLabel>
                    <p className="text-xs text-muted-foreground">El paciente ha sido esterilizado o castrado</p>
                  </div>
                  <Switch id="neutered" name="neutered" value="on" defaultChecked={patient.neutered} />
                </Field>
              </FieldGroup>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Información médica</h3>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="allergies">Alergias conocidas</FieldLabel>
                <Input id="allergies" name="allergies" defaultValue={patient.allergies?.join(", ") ?? ""} placeholder="Separar por comas" />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="conditions">Condiciones preexistentes</FieldLabel>
                <Textarea id="conditions" name="conditions" defaultValue={patient.preexistingConditions?.join(", ") ?? ""} rows={2} />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="observations">Observaciones</FieldLabel>
                <Textarea id="observations" name="observations" defaultValue={patient.notes ?? ""} rows={2} />
              </Field>
            </FieldGroup>
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
