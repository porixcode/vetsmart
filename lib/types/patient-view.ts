/**
 * View-models para la UI de Pacientes.
 *
 * La UI fue construida contra strings humanos ("Canino", "Activo", "Macho").
 * Los queries Prisma traducen los enums de DB (CANINO, ACTIVO, MACHO) a estas
 * formas antes de entregar datos a los componentes, para no tener que rehacer
 * toda la UI.
 */

export type SpeciesLabel = "Canino" | "Felino" | "Ave" | "Roedor" | "Reptil" | "Otro"
export type SexLabel     = "Macho" | "Hembra"
export type StatusLabel  = "Activo" | "Inactivo" | "En tratamiento"

export interface OwnerView {
  id:         string
  name:       string
  phone:      string
  email:      string
  address:    string
  documentId: string
}

export interface Patient {
  id:                     string
  name:                   string
  species:                SpeciesLabel
  breed:                  string
  sex:                    SexLabel
  birthDate:              Date
  weight:                 number
  color:                  string
  neutered:               boolean
  microchip?:             string
  status:                 StatusLabel
  owner:                  OwnerView
  assignedVet?:           string
  lastVisit?:             Date
  nextAppointment?:       { date: Date; service: string }
  allergies:              string[]
  preexistingConditions:  string[]
  notes?:                 string
}

/* ---------- Tipos de bundle del detalle (usados por tabs) ----------
 * Se preservan los contratos de los componentes. Los queries de los módulos
 * Historial/Vacunas/... los alimentarán con datos reales en sus respectivas
 * fases; en F5.1 (Pacientes) vienen con arreglos vacíos.
 */

export interface ClinicalRecord {
  id:            string
  patientId:     string
  date:          Date
  veterinarian:  string
  visitReason:   string
  soap: {
    subjective: string
    objective:  string
    analysis:   string
    plan:       string
  }
  diagnosis?:     string
  diagnosisCode?: string
  treatment?:     string
  nextControl?:   Date
  attachments?:   string[]
}

export interface Vaccination {
  id:          string
  patientId:   string
  vaccineName: string
  lab:         string
  dateApplied: Date
  dateDue?:    Date
  appliedBy:   string
  lotNumber:   string
  status:      "Aplicada" | "Pendiente" | "Vencida"
}

export interface Deworming {
  id:                  string
  patientId:           string
  product:             string
  dose:                string
  weightAtApplication: number
  dateApplied:         Date
  nextDue?:            Date
  appliedBy:           string
}

export interface Document {
  id:         string
  patientId:  string
  name:       string
  type:       "PDF" | "Imagen" | "Laboratorio" | "Radiografía" | "Receta" | "Consentimiento" | "Otro"
  category:   "Exámenes" | "Radiografías" | "Recetas" | "Consentimientos" | "Otros"
  uploadDate: Date
  size:       string
  url:        string
}

export interface Note {
  id:        string
  patientId: string
  content:   string
  author:    string
  createdAt: Date
  pinned:    boolean
}

export interface TimelineEvent {
  id:           string
  patientId:    string
  type:         "Consulta" | "Vacuna" | "Desparasitación" | "Cirugía" | "Examen"
  date:         Date
  title:        string
  description:  string
  veterinarian: string
  recordId?:    string
}

export interface PatientDetailBundle {
  patient:         Patient
  clinicalRecords: ClinicalRecord[]
  vaccinations:    Vaccination[]
  dewormings:      Deworming[]
  documents:       Document[]
  notes:           Note[]
  timeline:        TimelineEvent[]
}
