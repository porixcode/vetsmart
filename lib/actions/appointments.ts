"use server"

import { revalidatePath } from "next/cache"
import type { AppointmentStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import {
  CreateAppointmentSchema,
  UpdateStatusSchema,
  RescheduleSchema,
  STATUS_LABEL_TO_ENUM,
} from "@/lib/validators/appointments"
import { findVetConflicts } from "@/lib/queries/appointments"

export type AppointmentActionState =
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  | { ok: true;  id: string }
  | Record<string, never>

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key)
  if (typeof v !== "string") return undefined
  const s = v.trim()
  return s.length > 0 ? s : undefined
}

export async function createAppointment(
  _prev: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO", "RECEPCIONISTA")

  const raw = {
    patientId:      str(formData, "patientId"),
    veterinarianId: str(formData, "veterinarianId"),
    serviceId:      str(formData, "serviceId"),
    serviceType:    str(formData, "serviceType"),
    startsAt:       str(formData, "startsAt"),
    duration:       str(formData, "duration") ?? "30",
    reason:         str(formData, "reason"),
    internalNotes:  str(formData, "internalNotes"),
    roomId:         str(formData, "roomId"),
  }

  const parsed = CreateAppointmentSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok:          false,
      error:       `${issue?.path?.join(".") ?? "campo"}: ${issue?.message ?? "Datos inválidos"}`,
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }
  const input = parsed.data

  // Verify patient exists + get ownerId
  const patient = await prisma.patient.findFirst({
    where:  { id: input.patientId, deletedAt: null },
    select: { id: true, ownerId: true, name: true },
  })
  if (!patient) return { ok: false, error: "Paciente no encontrado" }

  // Conflict check
  const endsAt = new Date(input.startsAt.getTime() + input.duration * 60000)
  const conflicts = await findVetConflicts(input.veterinarianId, input.startsAt, endsAt)
  if (conflicts.length > 0) {
    return {
      ok:    false,
      error: `Conflicto de horario: el veterinario ya tiene ${conflicts.length} cita(s) en ese rango`,
    }
  }

  try {
    const appointment = await prisma.$transaction(async tx => {
      const created = await tx.appointment.create({
        data: {
          patientId:      input.patientId,
          ownerId:        patient.ownerId,
          veterinarianId: input.veterinarianId,
          serviceId:      input.serviceId ?? null,
          serviceType:    input.serviceType,
          startsAt:       input.startsAt,
          duration:       input.duration,
          reason:         input.reason ?? null,
          internalNotes:  input.internalNotes ?? null,
          roomId:         input.roomId ?? null,
        },
      })
      await tx.auditLog.create({
        data: {
          userId:      user.id,
          actionType:  "CREATE",
          module:      "Citas",
          targetId:    created.id,
          description: `Agendó cita para ${patient.name}`,
        },
      })
      return created
    })

    revalidatePath("/citas")
    return { ok: true, id: appointment.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo agendar la cita: ${msg}` }
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus | string,
): Promise<AppointmentActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO", "RECEPCIONISTA")

  // Accept both label ("confirmada") and enum ("CONFIRMADA")
  const statusEnum = typeof status === "string" && STATUS_LABEL_TO_ENUM[status as keyof typeof STATUS_LABEL_TO_ENUM]
    ? STATUS_LABEL_TO_ENUM[status as keyof typeof STATUS_LABEL_TO_ENUM]
    : (status as AppointmentStatus)

  const parsed = UpdateStatusSchema.safeParse({ id, status: statusEnum })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Estado inválido" }
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id, deletedAt: null },
      data:  { status: parsed.data.status },
      select: { id: true, patient: { select: { name: true } } },
    })
    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "UPDATE",
        module:      "Citas",
        targetId:    id,
        description: `Cambió estado de cita (${updated.patient.name}) a ${parsed.data.status}`,
      },
    })
    revalidatePath("/citas")
    return { ok: true, id: updated.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo actualizar: ${msg}` }
  }
}

export async function cancelAppointment(id: string): Promise<AppointmentActionState> {
  return updateAppointmentStatus(id, "CANCELADA")
}

export async function rescheduleAppointment(
  id: string,
  startsAt: Date | string,
  duration?: number,
): Promise<AppointmentActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO", "RECEPCIONISTA")

  const parsed = RescheduleSchema.safeParse({ id, startsAt, duration })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  }
  const { startsAt: start, duration: newDur } = parsed.data

  const current = await prisma.appointment.findFirst({
    where:  { id, deletedAt: null },
    select: { id: true, veterinarianId: true, duration: true, patient: { select: { name: true } } },
  })
  if (!current) return { ok: false, error: "Cita no encontrada" }

  const dur = newDur ?? current.duration
  const end = new Date(start.getTime() + dur * 60000)
  const conflicts = await findVetConflicts(current.veterinarianId, start, end, id)
  if (conflicts.length > 0) {
    return { ok: false, error: `Conflicto de horario: ya hay ${conflicts.length} cita(s) en ese rango` }
  }

  try {
    await prisma.appointment.update({
      where: { id },
      data:  { startsAt: start, duration: dur },
    })
    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "UPDATE",
        module:      "Citas",
        targetId:    id,
        description: `Reagendó cita de ${current.patient.name}`,
      },
    })
    revalidatePath("/citas")
    return { ok: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo reagendar: ${msg}` }
  }
}
