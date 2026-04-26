import { ATTENTION_ENUM_TO_LABEL, RECORD_STATUS_ENUM_TO_LABEL } from "@/lib/validators/clinical-records"
import type { AttentionType, RecordStatus } from "@prisma/client"

export type AttentionLabel = keyof typeof ATTENTION_ENUM_TO_LABEL extends never ? string : (typeof ATTENTION_ENUM_TO_LABEL)[AttentionType]
export type StatusLabel = keyof typeof RECORD_STATUS_ENUM_TO_LABEL extends never ? string : (typeof RECORD_STATUS_ENUM_TO_LABEL)[RecordStatus]

export interface RecordPatientView {
  id:     string
  name:   string
  species: string
  breed: string
  color:  string
}

export interface RecordOwnerView {
  name: string
}

export interface RecordVetView {
  id:       string
  name:     string
  lastName: string
  color:    string
}

export interface RecordDiagnosisView {
  cie10:       string
  description: string
}

export interface RecordMedicationView {
  name:      string
  dose:      string
  frequency: string | null
  duration:  string | null
}

export interface RecordProcedureView {
  code: string
  name: string
}

export interface RecordFileView {
  name: string
  type: string
  url:  string
  size: string | null
}

export interface RecordVitalsView {
  temperature: number | null
  heartRate:   number | null
  respRate:    number | null
  weight:      number | null
  mucous:      string | null
}

export interface ClinicalRecordView {
  id:            string
  patientId:     string
  date:          Date
  type:          string
  status:        string
  visitReason:   string
  patient:       RecordPatientView
  owner:         RecordOwnerView
  veterinarian:  RecordVetView
  soap: {
    subjective: string
    objective:  string
    analysis:   string
    plan:       string
  }
  vitals:        RecordVitalsView | null
  diagnoses:     RecordDiagnosisView[]
  medications:   RecordMedicationView[]
  procedures:    RecordProcedureView[]
  files:         RecordFileView[]
  attachments:   number
  followUp:      boolean
  nextControl:   Date | null
  duration:      number | null
  room:          string | null
  appointmentId: string | null
}

export interface ClinicalRecordSearch {
  q:               string
  veterinarianId:  string
  type:            string
  species:         string
  status:          string
  hasAttachments:  boolean
  hasFollowUp:     boolean
  dateRange:       number
  page:            number
  pageSize:        number
}

export const ATTENTION_CONFIG: Record<string, { dot: string; bg: string; text: string }> = {
  Consulta:        { dot: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700" },
  Vacunacion:      { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  Cirugia:         { dot: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700" },
  Control:         { dot: "bg-amber-500",  bg: "bg-amber-50",  text: "text-amber-700" },
  Urgencia:        { dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  Examen:          { dot: "bg-cyan-500",   bg: "bg-cyan-50",   text: "text-cyan-700" },
  Desparasitacion: { dot: "bg-teal-500",   bg: "bg-teal-50",   text: "text-teal-700" },
  Hospitalizacion: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
}

export const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string }> = {
  Borrador:  { dot: "bg-gray-400",  bg: "bg-gray-100", text: "text-gray-600" },
  Finalizado: { dot: "bg-blue-500",  bg: "bg-blue-50",  text: "text-blue-700" },
  Firmado:   { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  Anulado:   { dot: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700" },
}

export const DEFAULT_SEARCH: ClinicalRecordSearch = {
  q: "",
  veterinarianId: "",
  type: "",
  species: "",
  status: "",
  hasAttachments: false,
  hasFollowUp: false,
  dateRange: 90,
  page: 1,
  pageSize: 50,
}
