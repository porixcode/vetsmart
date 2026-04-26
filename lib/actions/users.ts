"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { CreateUserSchema, UpdateUserSchema, ResetPasswordSchema } from "@/lib/validators/users"

export type UserActionState =
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  | { ok: true; id: string }
  | { ok: true; temporaryPassword: string }
  | Record<string, never>

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key)
  if (typeof v !== "string") return undefined
  const s = v.trim()
  return s.length > 0 ? s : undefined
}

export async function createUser(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const user = await requireRole("ADMIN")

  const raw = {
    name:    str(formData, "name"),
    email:   str(formData, "email"),
    phone:   str(formData, "phone"),
    cedula:  str(formData, "cedula"),
    role:    str(formData, "role"),
    specialty:         str(formData, "specialty"),
    cedulaProfesional: str(formData, "cedulaProfesional"),
    universidad:       str(formData, "universidad"),
    graduationYear:    str(formData, "graduationYear"),
    birthDate:         str(formData, "birthDate"),
    gender:            str(formData, "gender"),
    address:           str(formData, "address"),
    color:             str(formData, "color"),
  }

  const parsed = CreateUserSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      error: `${issue?.path?.join(".") ?? "campo"}: ${issue?.message}`,
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const input = parsed.data

  try {
    const temporaryPassword = randomBytes(12).toString("base64url").slice(0, 16)
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)

    const created = await prisma.user.create({
      data: {
        ...input,
        passwordHash,
        createdById: user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "CREATE",
        module:      "Usuarios",
        targetId:    created.id,
        description: `Creó usuario ${created.name} (${input.role})`,
        ip:          null,
        device:      null,
      },
    })

    revalidatePath("/usuarios")
    return { ok: true, id: created.id, temporaryPassword }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo crear el usuario: ${msg}` }
  }
}

export async function updateUser(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await requireRole("ADMIN")

  const id = str(formData, "id")
  if (!id) return { ok: false, error: "ID de usuario requerido" }

  const raw = {
    id,
    name:    str(formData, "name"),
    email:   str(formData, "email"),
    phone:   str(formData, "phone"),
    cedula:  str(formData, "cedula"),
    role:    str(formData, "role"),
    specialty:         str(formData, "specialty"),
    cedulaProfesional: str(formData, "cedulaProfesional"),
    universidad:       str(formData, "universidad"),
    graduationYear:    str(formData, "graduationYear"),
    birthDate:         str(formData, "birthDate"),
    gender:            str(formData, "gender"),
    address:           str(formData, "address"),
    color:             str(formData, "color"),
    status:            str(formData, "status"),
  }

  const parsed = UpdateUserSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: `${issue?.path?.join(".") ?? "campo"}: ${issue?.message}` }
  }

  const { id: _, ...data } = parsed.data

  try {
    const updated = await prisma.user.update({
      where: { id, deletedAt: null },
      data,
    })

    await prisma.auditLog.create({
      data: {
        userId:      actor.id,
        actionType:  "UPDATE",
        module:      "Usuarios",
        targetId:    updated.id,
        description: `Actualizó usuario ${updated.name}`,
      },
    })

    revalidatePath("/usuarios")
    return { ok: true, id: updated.id }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo actualizar: ${msg}` }
  }
}

export async function deleteUser(id: string): Promise<UserActionState> {
  const actor = await requireRole("ADMIN")

  try {
    const deleted = await prisma.user.update({
      where: { id, deletedAt: null },
      data:  { deletedAt: new Date(), status: "INACTIVE" },
    })

    await prisma.auditLog.create({
      data: {
        userId:      actor.id,
        actionType:  "DELETE",
        module:      "Usuarios",
        targetId:    deleted.id,
        description: `Eliminó usuario ${deleted.name}`,
      },
    })

    revalidatePath("/usuarios")
    return { ok: true, id: deleted.id }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo eliminar: ${msg}` }
  }
}

export async function updateUserStatus(
  id: string,
  status: string,
): Promise<UserActionState> {
  const actor = await requireRole("ADMIN")

  try {
    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"] as const
    if (!validStatuses.includes(status as typeof validStatuses[number])) {
      return { ok: false, error: `Estado inválido: ${status}` }
    }

    const updated = await prisma.user.update({
      where: { id, deletedAt: null },
      data:  { status: status as any },
    })

    const actionVerb = status === "SUSPENDED" ? "Suspendió" : status === "ACTIVE" ? "Activó" : "Cambió estado a"

    await prisma.auditLog.create({
      data: {
        userId:      actor.id,
        actionType:  "UPDATE",
        module:      "Usuarios",
        targetId:    updated.id,
        description: `${actionVerb} usuario ${updated.name}`,
      },
    })

    revalidatePath("/usuarios")
    return { ok: true, id: updated.id }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo cambiar estado: ${msg}` }
  }
}

export async function resetPassword(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await requireRole("ADMIN")

  const userId = str(formData, "userId")
  if (!userId) return { ok: false, error: "ID de usuario requerido" }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    })
    if (!target) return { ok: false, error: "Usuario no encontrado" }

    const temporaryPassword = randomBytes(12).toString("base64url").slice(0, 16)
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data:  { passwordHash },
    })

    await prisma.auditLog.create({
      data: {
        userId:      actor.id,
        actionType:  "UPDATE",
        module:      "Usuarios",
        targetId:    userId,
        description: `Reseteó contraseña de ${target.name}`,
      },
    })

    revalidatePath("/usuarios")
    return { ok: true, id: userId, temporaryPassword }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: `No se pudo resetear la contraseña: ${msg}` }
  }
}
