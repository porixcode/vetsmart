"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { CreatePatientSchema } from "@/lib/validators/patients"

export type PatientActionState =
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  | { ok: true;  id: string }
  | Record<string, never>

/** Devuelve string trim no vacío, o undefined. Maneja null/""/whitespace. */
function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key)
  if (typeof v !== "string") return undefined
  const s = v.trim()
  return s.length > 0 ? s : undefined
}

export async function createPatient(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO", "RECEPCIONISTA")

  const ownerMode = str(formData, "ownerMode") === "new" ? "new" : "existing"

  const raw = {
    name:      str(formData, "name"),
    species:   str(formData, "species"),
    breed:     str(formData, "breed"),
    sex:       str(formData, "sex"),
    birthDate: str(formData, "birthDate"),
    weight:    str(formData, "weight"),
    color:     str(formData, "color"),
    microchip: str(formData, "microchip"),
    neutered:  str(formData, "neutered") === "on" || str(formData, "neutered") === "true",
    allergies:             str(formData, "allergies"),
    preexistingConditions: str(formData, "conditions"),
    notes:                 str(formData, "observations"),
    ownerMode,
    ownerId:   str(formData, "ownerId"),
    owner: ownerMode === "new"
      ? {
          name:       str(formData, "ownerName")     ?? "",
          documentId: str(formData, "ownerDocument") ?? "",
          phone:      str(formData, "ownerPhone")    ?? "",
          email:      str(formData, "ownerEmail")    ?? "",
          address:    str(formData, "ownerAddress")  ?? "",
        }
      : undefined,
  }

  const parsed = CreatePatientSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const fieldPath = issue?.path?.join(".") ?? "campo"
    const msg = issue?.message ?? "Datos inválidos"
    return {
      ok:          false,
      error:       `${fieldPath}: ${msg}`,
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }
  const input = parsed.data

  try {
    const patient = await prisma.$transaction(async tx => {
      let ownerId = input.ownerId
      if (input.ownerMode === "new" && input.owner) {
        const existing = await tx.owner.findFirst({
          where: { documentId: input.owner.documentId, deletedAt: null },
        })
        if (existing) {
          ownerId = existing.id
        } else {
          const newOwner = await tx.owner.create({
            data: {
              name:       input.owner.name,
              documentId: input.owner.documentId,
              phone:      input.owner.phone,
              email:      input.owner.email ?? null,
              address:    input.owner.address ?? null,
            },
          })
          ownerId = newOwner.id
        }
      }
      if (!ownerId) throw new Error("No se pudo determinar el dueño")

      const created = await tx.patient.create({
        data: {
          name:      input.name,
          species:   input.species,
          breed:     input.breed,
          sex:       input.sex,
          birthDate: input.birthDate ?? new Date(),
          weight:    input.weight ?? null,
          color:     input.color ?? null,
          microchip: input.microchip ?? null,
          neutered:  input.neutered ?? false,
          allergies:             input.allergies ?? [],
          preexistingConditions: input.preexistingConditions ?? [],
          notes:                 input.notes ?? null,
          ownerId,
        },
      })

      await tx.auditLog.create({
        data: {
          userId:      user.id,
          actionType:  "CREATE",
          module:      "Pacientes",
          targetId:    created.id,
          description: `Registró paciente ${created.name}`,
        },
      })

      return created
    })

    revalidatePath("/pacientes")
    return { ok: true, id: patient.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo crear el paciente: ${msg}` }
  }
}

export async function archivePatient(id: string): Promise<PatientActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")
  try {
    const patient = await prisma.patient.update({
      where: { id, deletedAt: null },
      data:  { deletedAt: new Date() },
    })
    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "ARCHIVE",
        module:      "Pacientes",
        targetId:    patient.id,
        description: `Archivó paciente ${patient.name}`,
      },
    })
    revalidatePath("/pacientes")
    revalidatePath(`/pacientes/${id}`)
    return { ok: true, id: patient.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo archivar: ${msg}` }
  }
}

export async function restorePatient(id: string): Promise<PatientActionState> {
  const user = await requireRole("ADMIN")
  try {
    const patient = await prisma.patient.update({
      where: { id },
      data:  { deletedAt: null },
    })
    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "RESTORE",
        module:      "Pacientes",
        targetId:    patient.id,
        description: `Restauró paciente ${patient.name}`,
      },
    })
    revalidatePath("/pacientes")
    return { ok: true, id: patient.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo restaurar: ${msg}` }
  }
}
