import { z } from "zod"
import { AttentionType, RecordStatus } from "@prisma/client"

export const ATTENTION_LABEL_TO_ENUM: Record<string, AttentionType> = {
  Consulta: "CONSULTA",
  Vacunacion: "VACUNACION",
  Cirugia: "CIRUGIA",
  Control: "CONTROL",
  Urgencia: "URGENCIA",
  Examen: "EXAMEN",
  Desparasitacion: "DESPARASITACION",
  Hospitalizacion: "HOSPITALIZACION",
}
export const ATTENTION_ENUM_TO_LABEL: Record<AttentionType, string> = {
  CONSULTA: "Consulta",
  VACUNACION: "Vacunacion",
  CIRUGIA: "Cirugia",
  CONTROL: "Control",
  URGENCIA: "Urgencia",
  EXAMEN: "Examen",
  DESPARASITACION: "Desparasitacion",
  HOSPITALIZACION: "Hospitalizacion",
}

export const RECORD_STATUS_LABEL_TO_ENUM: Record<string, RecordStatus> = {
  Borrador: "BORRADOR",
  Finalizado: "FINALIZADO",
  Firmado: "FIRMADO",
  Anulado: "ANULADO",
}
export const RECORD_STATUS_ENUM_TO_LABEL: Record<RecordStatus, string> = {
  BORRADOR: "Borrador",
  FINALIZADO: "Finalizado",
  FIRMADO: "Firmado",
  ANULADO: "Anulado",
}

export const CreateClinicalRecordSchema = z.object({
  patientId:      z.string().min(1, "Paciente requerido"),
  veterinarianId: z.string().min(1, "Veterinario requerido"),
  date:           z.coerce.date({ errorMap: () => ({ message: "Fecha inválida" }) }),
  time:           z.string().optional(),
  visitReason:    z.string().trim().min(1, "Motivo de consulta requerido"),
  subjective:     z.string().trim().optional().transform(v => v || undefined),
  objective:      z.string().trim().optional().transform(v => v || undefined),
  analysis:       z.string().trim().optional().transform(v => v || undefined),
  plan:           z.string().trim().optional().transform(v => v || undefined),
  diagnosis:      z.string().trim().optional().transform(v => v || undefined),
  diagnosisCode:  z.string().trim().optional().transform(v => v || undefined),
  treatment:      z.string().trim().optional().transform(v => v || undefined),
  nextControl:    z.coerce.date().optional().nullable().transform(v => v ?? undefined),
})

export type CreateClinicalRecordInput = z.infer<typeof CreateClinicalRecordSchema>

export const ClinicalRecordSearchSchema = z.object({
  q:              z.string().optional().default(""),
  veterinarianId: z.string().optional().default(""),
  type:           z.string().optional().default(""),
  species:        z.string().optional().default(""),
  status:         z.string().optional().default(""),
  hasAttachments: z.coerce.boolean().optional().default(false),
  hasFollowUp:    z.coerce.boolean().optional().default(false),
  dateRange:      z.coerce.number().optional().default(90),
  page:           z.coerce.number().int().positive().optional().default(1),
  pageSize:       z.coerce.number().int().positive().max(100).optional().default(50),
})
export type ClinicalRecordSearch = z.infer<typeof ClinicalRecordSearchSchema>

export const ATTENTION_TYPES = Object.keys(ATTENTION_LABEL_TO_ENUM)
export const RECORD_STATUSES = Object.keys(RECORD_STATUS_LABEL_TO_ENUM)
