"use client"

import * as React from "react"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { createPatient, type PatientActionState } from "@/lib/actions/patients"
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

interface NewPatientModalProps {
  open:           boolean
  onOpenChange:   (open: boolean) => void
  onSuccess?:     () => void
  owners?:        OwnerOption[]
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

export function NewPatientModal({ open, onOpenChange, onSuccess, owners = [] }: NewPatientModalProps) {
  const [species, setSpecies]     = React.useState("")
  const [breed, setBreed]         = React.useState("")
  const [sex, setSex]             = React.useState("Macho")
  const [isNewOwner, setIsNewOwner] = React.useState(false)
  const [ownerId, setOwnerId]     = React.useState("")
  const [state, formAction, pending] = useActionState(createPatient, INITIAL_STATE)

  // Reset breed when species changes
  React.useEffect(() => { setBreed("") }, [species])

  // On success: close + notify + reset
  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      onSuccess?.()
      setSpecies("")
      setBreed("")
      setSex("Macho")
      setIsNewOwner(false)
      setOwnerId("")
    }
  }, [state, onSuccess])

  const fieldError = (name: string): string | undefined => {
    if (!state || !("ok" in state) || state.ok) return undefined
    return state.fieldErrors?.[name]?.[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo paciente</DialogTitle>
          <DialogDescription>
            Registra un nuevo paciente en el sistema. Completa la información requerida.
          </DialogDescription>
        </DialogHeader>

        {state && "ok" in state && !state.ok && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="ownerMode" value={isNewOwner ? "new" : "existing"} />
          <input type="hidden" name="species"   value={species} />
          <input type="hidden" name="breed"     value={breed} />
          <input type="hidden" name="sex"       value={sex} />
          <input type="hidden" name="ownerId"   value={ownerId} />

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Información del paciente</h3>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                  <Input id="name" name="name" placeholder="Nombre del paciente" required />
                  {fieldError("name") && <p className="text-xs text-red-600 mt-1">{fieldError("name")}</p>}
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="species-select">Especie *</FieldLabel>
                  <Select value={species} onValueChange={setSpecies} required>
                    <SelectTrigger id="species-select">
                      <SelectValue placeholder="Seleccionar especie" />
                    </SelectTrigger>
                    <SelectContent>
                      {speciesOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("species") && <p className="text-xs text-red-600 mt-1">{fieldError("species")}</p>}
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="breed-select">Raza *</FieldLabel>
                  <Select value={breed} onValueChange={setBreed} disabled={!species} required>
                    <SelectTrigger id="breed-select">
                      <SelectValue placeholder={species ? "Seleccionar raza" : "Primero seleccione especie"} />
                    </SelectTrigger>
                    <SelectContent>
                      {species && breedsBySpecies[species]?.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("breed") && <p className="text-xs text-red-600 mt-1">{fieldError("breed")}</p>}
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
                  <Input id="birthDate" name="birthDate" type="date" />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="weight">Peso (kg)</FieldLabel>
                  <Input id="weight" name="weight" type="number" step="0.1" placeholder="0.0" />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="color">Color</FieldLabel>
                  <Input id="color" name="color" placeholder="Color del pelaje/plumas" />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="microchip">Microchip</FieldLabel>
                  <Input id="microchip" name="microchip" placeholder="Número de microchip" />
                </Field>
              </FieldGroup>

              <FieldGroup className="col-span-2">
                <Field className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FieldLabel htmlFor="neutered" className="mb-0">Esterilizado/Castrado</FieldLabel>
                    <p className="text-xs text-muted-foreground">El paciente ha sido esterilizado o castrado</p>
                  </div>
                  <Switch id="neutered" name="neutered" value="on" />
                </Field>
              </FieldGroup>
            </div>
          </div>

          <Separator />

          {/* Owner Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Información del dueño</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="newOwner" className="text-xs text-muted-foreground">Nuevo dueño</Label>
                <Switch id="newOwner" checked={isNewOwner} onCheckedChange={setIsNewOwner} />
              </div>
            </div>

            {!isNewOwner ? (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ownerSelect">Dueño existente *</FieldLabel>
                  <Select value={ownerId} onValueChange={setOwnerId} required>
                    <SelectTrigger id="ownerSelect">
                      <SelectValue placeholder={owners.length > 0 ? "Seleccionar dueño" : "No hay dueños registrados — crea uno nuevo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                          {o.documentId && <span className="text-muted-foreground text-xs ml-2">({o.documentId})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("ownerId") && <p className="text-xs text-red-600 mt-1">{fieldError("ownerId")}</p>}
                </Field>
              </FieldGroup>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="ownerName">Nombre completo *</FieldLabel>
                    <Input id="ownerName" name="ownerName" placeholder="Nombre del dueño" required={isNewOwner} />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="ownerDocument">Documento *</FieldLabel>
                    <Input id="ownerDocument" name="ownerDocument" placeholder="Cédula o NIT" required={isNewOwner} />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="ownerPhone">Teléfono *</FieldLabel>
                    <Input id="ownerPhone" name="ownerPhone" type="tel" placeholder="+57 300 123 4567" required={isNewOwner} />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="ownerEmail">Correo electrónico</FieldLabel>
                    <Input id="ownerEmail" name="ownerEmail" type="email" placeholder="correo@ejemplo.com" />
                  </Field>
                </FieldGroup>

                <FieldGroup className="col-span-2">
                  <Field>
                    <FieldLabel htmlFor="ownerAddress">Dirección</FieldLabel>
                    <Input id="ownerAddress" name="ownerAddress" placeholder="Dirección completa" />
                  </Field>
                </FieldGroup>
              </div>
            )}
          </div>

          <Separator />

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Información médica inicial</h3>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="allergies">Alergias conocidas</FieldLabel>
                <Input id="allergies" name="allergies" placeholder="Ej: Pollo, Penicilina (separar por comas)" />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="conditions">Condiciones preexistentes</FieldLabel>
                <Textarea
                  id="conditions"
                  name="conditions"
                  placeholder="Describa cualquier condición médica preexistente"
                  rows={2}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="observations">Observaciones adicionales</FieldLabel>
                <Textarea
                  id="observations"
                  name="observations"
                  placeholder="Notas adicionales sobre el paciente"
                  rows={2}
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando…" : "Crear paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
