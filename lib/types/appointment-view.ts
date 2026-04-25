/**
 * View-models + constantes UI para el módulo Citas.
 *
 * Los componentes fueron construidos con labels lowercase ("consulta", "programada").
 * Los queries traducen enums Prisma (CONSULTA, PROGRAMADA) a estas formas.
 */

export type ServiceTypeLabel =
  | "consulta"
  | "vacunacion"
  | "cirugia"
  | "estetica"
  | "urgencia"
  | "control"

export type AppointmentStatusLabel =
  | "programada"
  | "confirmada"
  | "en_curso"
  | "completada"
  | "cancelada"
  | "no_asistio"

export type AppointmentPatientSpecies = "perro" | "gato" | "ave" | "otro"

export interface VeterinarianView {
  id:        string
  name:      string
  avatar:    string
  specialty: string
  color:     string
}

export interface AppointmentPatientView {
  id:                     string
  name:                   string
  species:                AppointmentPatientSpecies
  breed:                  string
  age:                    string        // "3 años" / "4 meses"
  weight:                 string        // "28 kg"
  avatar:                 string
  hasOverdueVaccines?:    boolean
  overdueVaccineDays?:    number
}

export interface AppointmentOwnerView {
  id:    string
  name:  string
  phone: string
  email: string
}

export interface ReminderView {
  type:   "whatsapp" | "email" | "sms"
  sentAt: Date
  status: "enviado" | "confirmado" | "fallido"
}

export interface Appointment {
  id:            string
  patient:       AppointmentPatientView
  owner:         AppointmentOwnerView
  veterinarian:  VeterinarianView
  service:       ServiceTypeLabel
  status:        AppointmentStatusLabel
  date:          Date
  duration:      number     // minutos
  room?:         string
  reason?:       string
  internalNotes?: string
  reminders:     ReminderView[]
}

export interface ServiceOption {
  id:       string
  code:     string
  name:     string
  duration: number
  price:    number
}

/* ---------- Constantes UI (no dependen de DB) ---------- */

export const serviceLabels: Record<ServiceTypeLabel, string> = {
  consulta:   "Consulta",
  vacunacion: "Vacunación",
  cirugia:    "Cirugía",
  estetica:   "Estética",
  urgencia:   "Urgencia",
  control:    "Control",
}

export const serviceColors: Record<ServiceTypeLabel, string> = {
  consulta:   "#3B82F6",
  vacunacion: "#10B981",
  cirugia:    "#EF4444",
  estetica:   "#EC4899",
  urgencia:   "#F59E0B",
  control:    "#6366F1",
}

export const statusConfig: Record<AppointmentStatusLabel, {
  label:     string
  color:     string
  bgColor:   string
  textColor: string
}> = {
  programada:  { label: "Programada", color: "#6B7280", bgColor: "bg-gray-100", textColor: "text-gray-700" },
  confirmada:  { label: "Confirmada", color: "#3B82F6", bgColor: "bg-blue-50",  textColor: "text-blue-700" },
  en_curso:    { label: "En curso",   color: "#F59E0B", bgColor: "bg-amber-50", textColor: "text-amber-700" },
  completada:  { label: "Completada", color: "#10B981", bgColor: "bg-green-50", textColor: "text-green-700" },
  cancelada:   { label: "Cancelada",  color: "#6B7280", bgColor: "bg-gray-100", textColor: "text-gray-500 line-through" },
  no_asistio:  { label: "No asistió", color: "#EF4444", bgColor: "bg-red-50",   textColor: "text-red-700" },
}
