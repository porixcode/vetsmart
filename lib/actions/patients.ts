"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { CreatePatientSchema, UpdatePatientSchema } from "@/lib/validators/patients"

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
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const field = Array.isArray(err.meta?.target) ? (err.meta.target as string[]).join(", ") : "campo"
        return { ok: false, error: `Ya existe un paciente con ese ${field} (debe ser único)` }
      }
    }
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

export async function updatePatient(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO", "RECEPCIONISTA")

  const id = str(formData, "id")
  if (!id) return { ok: false, error: "ID de paciente requerido" }

  const raw = {
    id,
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
    assignedVetId:            str(formData, "assignedVetId"),
  }

  const parsed = UpdatePatientSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok:          false,
      error:       `${issue?.path?.join(".") ?? "campo"}: ${issue?.message ?? "Datos inválidos"}`,
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const input = parsed.data

  try {
    const patient = await prisma.patient.update({
      where: { id, deletedAt: null },
      data: {
        name:      input.name,
        species:   input.species,
        breed:     input.breed,
        sex:       input.sex,
        birthDate: input.birthDate ?? undefined,
        weight:    input.weight ?? null,
        color:     input.color ?? null,
        microchip: input.microchip ?? null,
        neutered:  input.neutered ?? undefined,
        allergies:             input.allergies,
        preexistingConditions: input.preexistingConditions,
        notes:                 input.notes ?? null,
        assignedVetId:         input.assignedVetId ?? null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "UPDATE",
        module:      "Pacientes",
        targetId:    patient.id,
        description: `Actualizó paciente ${patient.name}`,
      },
    })

    revalidatePath("/pacientes")
    revalidatePath(`/pacientes/${id}`)
    return { ok: true, id: patient.id }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const field = Array.isArray(err.meta?.target) ? (err.meta.target as string[]).join(", ") : "campo"
        return { ok: false, error: `Ya existe un paciente con ese ${field} (debe ser único)` }
      }
    }
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo actualizar: ${msg}` }
  }
}

export async function exportPatients(
  ids?: string[],
): Promise<{ ok: true; csv: string } | { ok: false; error: string }> {
  try {
    const where: Record<string, unknown> = { deletedAt: null }
    if (ids && ids.length > 0) where.id = { in: ids }

    const patients = await prisma.patient.findMany({
      where,
      include: { owner: true },
      orderBy: { name: "asc" },
    })

    const header = ["Nombre","Especie","Raza","Sexo","Fecha Nacimiento","Peso (kg)","Color","Esterilizado","Microchip","Alergias","Condiciones","Notas","Propietario","Teléfono","Email","Cédula"]
    const rows = patients.map(p => [
      p.name,
      p.species,
      p.breed,
      p.sex,
      p.birthDate ? p.birthDate.toISOString().split("T")[0] : "",
      p.weight ? String(p.weight) : "",
      p.color ?? "",
      p.neutered ? "Sí" : "No",
      p.microchip ?? "",
      (p.allergies ?? []).join("; "),
      (p.preexistingConditions ?? []).join("; "),
      p.notes ?? "",
      p.owner?.name ?? "",
      p.owner?.phone ?? "",
      p.owner?.email ?? "",
      p.owner?.documentId ?? "",
    ])

    const csv = [header, ...rows].map(line =>
      line.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n")

    return { ok: true, csv: "\uFEFF" + csv }
  } catch (err) {
    return { ok: false, error: `Error al exportar: ${err instanceof Error ? err.message : "Error"}` }
  }
}

export async function importPatients(
  csv: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string; row?: number }> {
  const user = await requireRole("ADMIN", "VETERINARIO")

  try {
    const lines = csv.split("\n").filter(l => l.trim())
    if (lines.length < 2) return { ok: false, error: "CSV vacío o sin datos" }

    const header = parseCSVLine(lines[0])
    const colMap: Record<string, number> = {}
    header.forEach((h, i) => { colMap[h.trim()] = i })

    const required = ["Nombre"]
    for (const r of required) {
      if (!(r in colMap)) return { ok: false, error: `Columna requerida "${r}" no encontrada en el CSV. Columnas: ${header.join(", ")}` }
    }

    let count = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      if (row.length === 0 || row.every(c => !c.trim())) continue

      const name     = row[colMap["Nombre"]]?.trim() ?? ""
      const species  = row[colMap["Especie"]]?.trim() ?? "Canino"
      const breed    = row[colMap["Raza"]]?.trim() ?? "Mestizo"
      const sex      = row[colMap["Sexo"]]?.trim() ?? "Macho"
      const birthStr = row[colMap["Fecha Nacimiento"]]?.trim() ?? ""

      if (!name) { errors.push(`Fila ${i + 1}: Nombre vacío`); continue }

      const ownerDoc = row[colMap["Cédula"]]?.trim() ?? ""
      let ownerId: string | undefined

      if (ownerDoc) {
        let owner = await prisma.owner.findFirst({ where: { documentId: ownerDoc } })
        if (!owner) {
          owner = await prisma.owner.create({
            data: {
              name:       row[colMap["Propietario"]]?.trim() ?? name + " Dueño",
              documentId: ownerDoc,
              phone:      row[colMap["Teléfono"]]?.trim() ?? "",
              email:      row[colMap["Email"]]?.trim() ?? "",
            },
          })
        }
        ownerId = owner.id
      }

      try {
        const speciesEnum = species === "Felino" ? "FELINO" : species === "Canino" ? "CANINO" : "OTRO"
        const sexEnum = sex === "Hembra" ? "HEMBRA" : "MACHO"

        await (prisma.patient.create as any)({
          data: {
            name,
            species: speciesEnum,
            breed,
            sex: sexEnum,
            ...(birthStr ? { birthDate: new Date(birthStr) } : {}),
            ...(row[colMap["Peso (kg)"]] ? { weight: Number(row[colMap["Peso (kg)"]]) } : {}),
            color: row[colMap["Color"]]?.trim() || null,
            neutered: (row[colMap["Esterilizado"]]?.trim() ?? "") === "Sí",
            microchip: row[colMap["Microchip"]]?.trim() || null,
            allergies: row[colMap["Alergias"]]?.split(";").map(s => s.trim()).filter(Boolean) ?? [],
            preexistingConditions: row[colMap["Condiciones"]]?.split(";").map(s => s.trim()).filter(Boolean) ?? [],
            notes: row[colMap["Notas"]]?.trim() || null,
            ownerId: ownerId || undefined,
          },
        })

        count++
      } catch (err) {
        errors.push(`Fila ${i + 1} (${name}): ${err instanceof Error ? err.message : "Error"}`)
      }
    }

    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "CREATE",
        module:      "Pacientes",
        targetId:    `import-${Date.now()}`,
        description: `Importó ${count} pacientes desde CSV${errors.length > 0 ? ` (${errors.length} errores)` : ""}`,
      },
    })

    revalidatePath("/pacientes")
    return { ok: true, count }
  } catch (err) {
    return { ok: false, error: `Error al importar: ${err instanceof Error ? err.message : "Error"}` }
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'; i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current); current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export async function bulkArchivePatients(ids: string[]): Promise<PatientActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")
  try {
    await prisma.$transaction(
      ids.map(id =>
        prisma.patient.update({
          where: { id, deletedAt: null },
          data:  { deletedAt: new Date() },
        })
      )
    )
    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "ARCHIVE",
        module:      "Pacientes",
        targetId:    ids.join(","),
        description: `Archivó ${ids.length} pacientes en lote`,
      },
    })
    revalidatePath("/pacientes")
    return { ok: true, id: ids[0] }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudieron archivar: ${msg}` }
  }
}
