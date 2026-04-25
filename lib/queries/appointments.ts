import "server-only"

import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  SERVICE_ENUM_TO_LABEL,
  STATUS_ENUM_TO_LABEL,
  SPECIES_TO_ICON,
} from "@/lib/validators/appointments"
import { formatAge } from "@/lib/utils/dates"
import type {
  Appointment as AppointmentView,
  VeterinarianView,
  AppointmentPatientView,
  AppointmentOwnerView,
  ServiceOption,
} from "@/lib/types/appointment-view"

const appointmentInclude = {
  patient: {
    include: {
      owner: true,
    },
  },
  veterinarian: {
    select: {
      id:        true,
      name:      true,
      image:     true,
      specialty: true,
      color:     true,
    },
  },
  room:    { select: { id: true, name: true } },
  service: { select: { id: true, name: true, duration: true } },
  reminders: {
    orderBy: { sentAt: "desc" },
  },
} satisfies Prisma.AppointmentInclude

type AppointmentRow = Prisma.AppointmentGetPayload<{ include: typeof appointmentInclude }>

function mapVet(v: AppointmentRow["veterinarian"]): VeterinarianView {
  return {
    id:        v.id,
    name:      v.name,
    avatar:    v.image ?? "",
    specialty: v.specialty ?? "Medicina General",
    color:     v.color ?? "#3B82F6",
  }
}

function mapPatient(p: AppointmentRow["patient"]): AppointmentPatientView {
  return {
    id:      p.id,
    name:    p.name,
    species: SPECIES_TO_ICON[p.species],
    breed:   p.breed,
    age:     formatAge(p.birthDate),
    weight:  p.weight != null ? `${p.weight} kg` : "—",
    avatar:  "",
  }
}

function mapOwner(o: AppointmentRow["patient"]["owner"]): AppointmentOwnerView {
  return {
    id:    o.id,
    name:  o.name,
    phone: o.phone,
    email: o.email ?? "",
  }
}

function mapAppointment(a: AppointmentRow): AppointmentView {
  return {
    id:           a.id,
    patient:      mapPatient(a.patient),
    owner:        mapOwner(a.patient.owner),
    veterinarian: mapVet(a.veterinarian),
    service:      SERVICE_ENUM_TO_LABEL[a.serviceType],
    status:       STATUS_ENUM_TO_LABEL[a.status],
    date:         a.startsAt,
    duration:     a.duration,
    room:         a.room?.name,
    reason:       a.reason ?? undefined,
    internalNotes: a.internalNotes ?? undefined,
    reminders:    a.reminders.map(r => ({
      type:   r.channel === "WHATSAPP" ? "whatsapp" : r.channel === "EMAIL" ? "email" : "sms",
      sentAt: r.sentAt,
      status: r.status === "CONFIRMADO" ? "confirmado" : r.status === "FALLIDO" ? "fallido" : "enviado",
    })),
  }
}

export async function listAppointmentsInRange(from: Date, to: Date): Promise<AppointmentView[]> {
  const rows = await prisma.appointment.findMany({
    where:   {
      deletedAt: null,
      startsAt:  { gte: from, lte: to },
    },
    include: appointmentInclude,
    orderBy: { startsAt: "asc" },
  })
  return rows.map(mapAppointment)
}

export async function getAppointmentById(id: string): Promise<AppointmentView | null> {
  const row = await prisma.appointment.findFirst({
    where:   { id, deletedAt: null },
    include: appointmentInclude,
  })
  return row ? mapAppointment(row) : null
}

export async function getAppointmentStats(): Promise<{ today: number; thisWeek: number }> {
  const now       = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay   = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  // Lunes como inicio de semana
  const dayOfWeek = now.getDay() || 7        // domingo → 7
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const [today, thisWeek] = await Promise.all([
    prisma.appointment.count({
      where: { deletedAt: null, startsAt: { gte: startOfDay, lt: endOfDay } },
    }),
    prisma.appointment.count({
      where: { deletedAt: null, startsAt: { gte: startOfWeek, lt: endOfWeek } },
    }),
  ])

  return { today, thisWeek }
}

export async function listVeterinarians(): Promise<VeterinarianView[]> {
  const vets = await prisma.user.findMany({
    where:   { role: "VETERINARIO", status: "ACTIVE", deletedAt: null },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, image: true, specialty: true, color: true },
  })
  return vets.map(v => ({
    id:        v.id,
    name:      v.name,
    avatar:    v.image ?? "",
    specialty: v.specialty ?? "Medicina General",
    color:     v.color ?? "#3B82F6",
  }))
}

export async function listServiceOptions(): Promise<ServiceOption[]> {
  const services = await prisma.service.findMany({
    where:   { deletedAt: null, status: "ACTIVO" },
    orderBy: { name: "asc" },
    select:  { id: true, code: true, name: true, duration: true, price: true },
  })
  return services
}

/** Busca pacientes por nombre/dueño/raza para el autocomplete del modal. */
export async function searchPatientsForAppointment(q: string) {
  if (!q.trim()) return []
  const patients = await prisma.patient.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name:  { contains: q, mode: "insensitive" } },
        { breed: { contains: q, mode: "insensitive" } },
        { owner: { OR: [
          { name:       { contains: q, mode: "insensitive" } },
          { documentId: { contains: q, mode: "insensitive" } },
        ] } },
      ],
    },
    include: { owner: true },
    take:    10,
  })
  return patients.map(p => ({
    id:      p.id,
    name:    p.name,
    breed:   p.breed,
    species: SPECIES_TO_ICON[p.species],
    age:     formatAge(p.birthDate),
    weight:  p.weight != null ? `${p.weight} kg` : "—",
    ownerId: p.ownerId,
    owner: {
      id:    p.owner.id,
      name:  p.owner.name,
      phone: p.owner.phone,
      email: p.owner.email ?? "",
    },
  }))
}

/** Devuelve citas del vet que se solapan con [start, end), excluyendo `excludeId`. */
export async function findVetConflicts(
  veterinarianId: string,
  start: Date,
  end: Date,
  excludeId?: string,
) {
  const overlapping = await prisma.appointment.findMany({
    where: {
      deletedAt:      null,
      veterinarianId,
      id:             excludeId ? { not: excludeId } : undefined,
      status:         { notIn: ["CANCELADA", "NO_ASISTIO"] },
      // overlap test: existing.start < new.end AND existing.end > new.start
      startsAt: { lt: end },
    },
    select: { id: true, startsAt: true, duration: true, patient: { select: { name: true } } },
  })
  return overlapping.filter(a => {
    const aEnd = new Date(a.startsAt.getTime() + a.duration * 60000)
    return aEnd > start
  })
}
