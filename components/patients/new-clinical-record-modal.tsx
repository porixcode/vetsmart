'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { AlertCircle, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import { createClinicalRecord, type ClinicalRecordActionState } from '@/lib/actions/clinical-records'
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
import { Badge } from '@/components/ui/badge'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'

interface NewClinicalRecordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
  patientId: string
}

interface UploadedFile {
  id: string
  name: string
  url: string
  size: string
  type: string
}

const INITIAL_STATE: ClinicalRecordActionState = {}

export function NewClinicalRecordModal({ open, onOpenChange, patientName, patientId }: NewClinicalRecordModalProps) {
  const [veterinarianId, setVeterinarianId] = React.useState('')
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [state, formAction, pending] = useActionState(createClinicalRecord, INITIAL_STATE)

  const successHandled = React.useRef(false)
  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      if (successHandled.current) return
      successHandled.current = true
      setUploadedFiles([])
      onOpenChange(false)
    }
    if (state && !("ok" in state)) {
      successHandled.current = false
    }
  }, [state, onOpenChange])

  React.useEffect(() => {
    if (!open) {
      setUploadedFiles([])
      setVeterinarianId('')
    }
  }, [open])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        formData.append('files', file)
      }
      formData.append('patientId', patientId)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.files) {
        setUploadedFiles(prev => [...prev, ...data.files])
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const fileIcon = (type: string) => {
    if (type === 'IMAGEN' || type === 'image') return <ImageIcon className="size-4" strokeWidth={1.5} />
    return <FileText className="size-4" strokeWidth={1.5} />
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

        {state && "ok" in state && !state.ok && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="patientId" value={patientId} />
          <input type="hidden" name="veterinarianId" value={veterinarianId} />
          <input type="hidden" name="documentIds" value={uploadedFiles.map(f => f.id).join(',')} />

          <div className="grid gap-4 md:grid-cols-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="date">Fecha *</FieldLabel>
                <Input
                  id="date"
                  name="date"
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
                  name="time"
                  type="time"
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="vet">Veterinario *</FieldLabel>
                <Select value={veterinarianId} onValueChange={setVeterinarianId} required>
                  <SelectTrigger id="vet">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Yo mismo</SelectItem>
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
                name="visitReason"
                placeholder="Ej: Control post-quirúrgico, Vacunación, Consulta general..."
                required
              />
            </Field>
          </FieldGroup>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notas SOAP</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="subjective">Subjetivo</FieldLabel>
                  <Textarea
                    id="subjective"
                    name="subjective"
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
                    name="objective"
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
                    name="analysis"
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
                    name="plan"
                    placeholder="Plan de tratamiento, recomendaciones..."
                    rows={4}
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Diagnóstico y tratamiento</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="diagnosis">Diagnóstico</FieldLabel>
                  <Input
                    id="diagnosis"
                    name="diagnosis"
                    placeholder="Diagnóstico principal"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="diagnosisCode">Código CIE-10</FieldLabel>
                  <Input
                    id="diagnosisCode"
                    name="diagnosisCode"
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
                  name="treatment"
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
                  name="nextControl"
                  type="date"
                />
              </Field>
            </FieldGroup>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Archivos adjuntos</h3>

            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="mr-2 size-4" strokeWidth={1.5} />
                {uploading ? 'Subiendo...' : 'Adjuntar archivos'}
              </Button>
              <span className="text-xs text-muted-foreground">
                PDF, imágenes, documentos hasta 10MB
              </span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <Badge key={file.id} variant="secondary" className="gap-1.5 py-1 pl-2 pr-1">
                    {fileIcon(file.type)}
                    <span className="max-w-[160px] truncate text-xs">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" strokeWidth={2} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || uploading}>
              {pending ? "Guardando…" : "Guardar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
