'use client'

import * as React from 'react'
import { Plus, Paperclip } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'

interface NewClinicalRecordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
}

const veterinarians = [
  { id: '1', name: 'Dra. Marly Jara' },
  { id: '2', name: 'Dr. Roberto Méndez' },
]

export function NewClinicalRecordModal({ open, onOpenChange, patientName }: NewClinicalRecordModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    onOpenChange(false)
  }

  const handleSaveAndNew = () => {
    // Save and reset form for new entry
    // For now, just close
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo registro clínico</DialogTitle>
          <DialogDescription>
            Agregar un nuevo registro clínico para {patientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="date">Fecha *</FieldLabel>
                <Input 
                  id="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required 
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="time">Hora *</FieldLabel>
                <Input 
                  id="time" 
                  type="time" 
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                  required 
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="vet">Veterinario *</FieldLabel>
                <Select required>
                  <SelectTrigger id="vet">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {veterinarians.map((vet) => (
                      <SelectItem key={vet.id} value={vet.id}>
                        {vet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="visitReason">Motivo de consulta *</FieldLabel>
              <Input 
                id="visitReason" 
                placeholder="Ej: Control post-quirúrgico, Vacunación, Consulta general..." 
                required 
              />
            </Field>
          </FieldGroup>

          <Separator />

          {/* SOAP Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notas SOAP</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="subjective">Subjetivo</FieldLabel>
                  <Textarea 
                    id="subjective" 
                    placeholder="Historia clínica, lo que reporta el propietario..."
                    rows={4}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="objective">Objetivo</FieldLabel>
                  <Textarea 
                    id="objective" 
                    placeholder="Hallazgos del examen físico, signos vitales..."
                    rows={4}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="analysis">Análisis</FieldLabel>
                  <Textarea 
                    id="analysis" 
                    placeholder="Interpretación de hallazgos, diagnóstico diferencial..."
                    rows={4}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="plan">Plan</FieldLabel>
                  <Textarea 
                    id="plan" 
                    placeholder="Plan de tratamiento, recomendaciones..."
                    rows={4}
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>

          <Separator />

          {/* Diagnosis & Treatment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Diagnóstico y tratamiento</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="diagnosis">Diagnóstico</FieldLabel>
                  <Input 
                    id="diagnosis" 
                    placeholder="Diagnóstico principal" 
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="diagnosisCode">Código CIE-10</FieldLabel>
                  <Input 
                    id="diagnosisCode" 
                    placeholder="Ej: Z09.9" 
                  />
                </Field>
              </FieldGroup>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="treatment">Tratamiento prescrito</FieldLabel>
                <Textarea 
                  id="treatment" 
                  placeholder="Medicamentos, dosis, frecuencia, duración..."
                  rows={3}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nextControl">Próximo control</FieldLabel>
                <Input 
                  id="nextControl" 
                  type="date" 
                />
              </Field>
            </FieldGroup>
          </div>

          <Separator />

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Archivos adjuntos</h3>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline">
                <Paperclip className="mr-2 size-4" strokeWidth={1.5} />
                Adjuntar archivos
              </Button>
              <span className="text-xs text-muted-foreground">
                PDF, imágenes, documentos hasta 10MB
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="outline" onClick={handleSaveAndNew}>
              <Plus className="mr-2 size-4" strokeWidth={1.5} />
              Guardar y nuevo
            </Button>
            <Button type="submit">
              Guardar registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
