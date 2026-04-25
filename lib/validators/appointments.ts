import { z } from "zod"
import { ServiceType, AppointmentStatus, Species } from "@prisma/client"
import type { ServiceTypeLabel, AppointmentStatusLabel, AppointmentPatientSpecies } from "@/lib/types/appointment-view"

/* ---------- ServiceType mappings ---------- */
export const SERVICE_LABEL_TO_ENUM: Record<ServiceTypeLabel, ServiceType> = {
  consulta:   "CONSULTA",
  vacunacion: "VACUNACION",
  cirugia:    "CIRUGIA",
  estetica:   "ESTETICA",
  urgencia:   "URGENCIA",
  control:    "CONTROL",
}
export const SERVICE_ENUM_TO_LABEL: Record<ServiceType, ServiceTypeLabel> = {
  CONSULTA:   "consulta",
  VACUNACION: "vacunacion",
  CIRUGIA:    "cirugia",
  ESTETICA:   "estetica",
  URGENCIA:   "urgencia",
  CONTROL:    "control",
}

/* ---------- Status mappings ---------- */
export const STATUS_LABEL_TO_ENUM: Record<AppointmentStatusLabel, AppointmentStatus> = {
  programada:  "PROGRAMADA",
  confirmada:  "CONFIRMADA",
  en_curso:    "EN_CURSO",
  completada:  "COMPLETADA",
  cancelada:   "CANCELADA",
  no_asistio:  "NO_ASISTIO",
}
export const STATUS_ENUM_TO_LABEL: Record<AppointmentStatus, AppointmentStatusLabel> = {
  PROGRAMADA: "programada",
  CONFIRMADA: "confirmada",
  EN_CURSO:   "en_curso",
  COMPLETADA: "completada",
  CANCELADA:  "cancelada",
  NO_ASISTIO: "no_asistio",
}

/* ---------- Species icon map (citas usa "perro"/"gato"/...) ---------- */
export const SPECIES_TO_ICON: Record<Species, AppointmentPatientSpecies> = {
  CANINO: "perro",
  FELINO: "gato",
  AVE:    "ave",
  ROEDOR: "otro",
  REPTIL: "otro",
  OTRO:   "otro",
}

/* ---------- Zod coercions ---------- */
const serviceCoerce = z.preprocess(
  v => (typeof v === "string" && SERVICE_LABEL_TO_ENUM[v as ServiceTypeLabel]) ? SERVICE_LABEL_TO_ENUM[v as ServiceTypeLabel] : v,
  z.nativeEnum(ServiceType, { errorMap: () => ({ message: "Tipo de servicio inválido" }) }),
)

const statusCoerce = z.preprocess(
  v => (typeof v === "string" && STATUS_LABEL_TO_ENUM[v as AppointmentStatusLabel]) ? STATUS_LABEL_TO_ENUM[v as AppointmentStatusLabel] : v,
  z.nativeEnum(AppointmentStatus, { errorMap: () => ({ message: "Estado inválido" }) }),
)

export const CreateAppointmentSchema = z.object({
  patientId:      z.string().min(1, "Paciente requerido"),
  veterinarianId: z.string().min(1, "Veterinario requerido"),
  serviceId:      z.string().optional(),
  serviceType:    serviceCoerce,
  startsAt:       z.coerce.date({ errorMap: () => ({ message: "Fecha y hora inválidas" }) }),
  duration:       z.coerce.number().int().positive().max(480).default(30),
  reason:         z.string().trim().optional().transform(v => v || undefined),
  internalNotes:  z.string().trim().optional().transform(v => v || undefined),
  roomId:         z.string().optional(),
})
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>

export const UpdateStatusSchema = z.object({
  id:     z.string().min(1),
  status: statusCoerce,
})
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>

export const RescheduleSchema = z.object({
  id:       z.string().min(1),
  startsAt: z.coerce.date(),
  duration: z.coerce.number().int().positive().max(480).optional(),
})
export type RescheduleInput = z.infer<typeof RescheduleSchema>
