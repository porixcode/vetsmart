"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { CreateClinicalRecordSchema } from "@/lib/validators/clinical-records"

export type ClinicalRecordActionState =
  | { ok: false; error: string }
  | { ok: true; id: string }
  | Record<string, never>

export async function createClinicalRecord(
  _prev: ClinicalRecordActionState,
  formData: FormData,
): Promise<ClinicalRecordActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")

  const raw = {
    patientId:      formData.get("patientId") as string,
    veterinarianId: formData.get("veterinarianId") as string,
    date:           formData.get("date") as string,
    time:           formData.get("time") as string,
    visitReason:    formData.get("visitReason") as string,
    subjective:     formData.get("subjective") as string,
    objective:      formData.get("objective") as string,
    analysis:       formData.get("analysis") as string,
    plan:           formData.get("plan") as string,
    diagnosis:      formData.get("diagnosis") as string,
    diagnosisCode:  formData.get("diagnosisCode") as string,
    treatment:      formData.get("treatment") as string,
    nextControl:    formData.get("nextControl") as string,
  }

  const parsed = CreateClinicalRecordSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: `${issue?.path?.join(".") ?? ""}: ${issue?.message}` }
  }

  const input = parsed.data

  try {
    const veterinarianId = input.veterinarianId === "self" || !input.veterinarianId
      ? user.id
      : input.veterinarianId

    const date = input.date
    if (input.time) {
      const [h, m] = input.time.split(":").map(Number)
      date.setHours(h, m, 0, 0)
    }

    const record = await prisma.clinicalRecord.create({
      data: {
        patientId:      input.patientId,
        veterinarianId,
        createdById:    user.id,
        date,
        visitReason:    input.visitReason,
        subjective:     input.subjective ?? null,
        objective:      input.objective ?? null,
        analysis:       input.analysis ?? null,
        plan:           input.plan ?? null,
        treatment:      input.treatment ?? null,
        nextControl:    input.nextControl ?? null,
        diagnoses: input.diagnosis
          ? { create: { cie10: input.diagnosisCode ?? "", description: input.diagnosis } }
          : undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "CREATE",
        module:      "Historial Clínico",
        targetId:    record.id,
        description: `Registró consulta para paciente ${record.patientId}`,
      },
    })

    revalidatePath(`/pacientes/${input.patientId}`)
    revalidatePath("/pacientes")
    return { ok: true, id: record.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo crear el registro: ${msg}` }
  }
}

export async function anularClinicalRecord(id: string): Promise<ClinicalRecordActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")
  try {
    await prisma.clinicalRecord.update({
      where: { id, deletedAt: null },
      data: { status: "ANULADO" },
    })
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: "UPDATE",
        module: "Historial Clínico",
        targetId: id,
        description: "Anuló registro clínico",
      },
    })
    revalidatePath("/historial-clinico")
    return { ok: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo anular: ${msg}` }
  }
}

export async function finalizarClinicalRecord(id: string): Promise<ClinicalRecordActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")
  try {
    const record = await prisma.clinicalRecord.findUnique({ where: { id, deletedAt: null } })
    if (!record) return { ok: false, error: "Registro no encontrado" }
    if (record.status !== "BORRADOR") return { ok: false, error: "Solo se puede finalizar un registro en estado Borrador" }

    await prisma.clinicalRecord.update({
      where: { id },
      data: { status: "FINALIZADO" },
    })
    await prisma.auditLog.create({
      data: {
        userId: user.id, actionType: "UPDATE", module: "Historial Clínico",
        targetId: id, description: "Finalizó registro clínico",
      },
    })
    revalidatePath("/historial-clinico")
    revalidatePath(`/pacientes/${record.patientId}`)
    return { ok: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo finalizar: ${msg}` }
  }
}

export async function firmarClinicalRecord(id: string): Promise<ClinicalRecordActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")
  try {
    const record = await prisma.clinicalRecord.findUnique({ where: { id, deletedAt: null } })
    if (!record) return { ok: false, error: "Registro no encontrado" }
    if (record.status !== "FINALIZADO") return { ok: false, error: "Solo se puede firmar un registro en estado Finalizado" }

    const hash = `firma-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    await prisma.clinicalRecord.update({
      where: { id },
      data: { status: "FIRMADO", signatureHash: hash, signedAt: new Date(), signedById: user.id },
    })
    await prisma.auditLog.create({
      data: {
        userId: user.id, actionType: "SIGN", module: "Historial Clínico",
        targetId: id, description: `Firmó registro clínico digitalmente`,
      },
    })
    revalidatePath("/historial-clinico")
    revalidatePath(`/pacientes/${record.patientId}`)
    return { ok: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo firmar: ${msg}` }
  }
}
