"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

export type ProfileActionState =
  | { ok: false; error: string }
  | { ok: true }
  | Record<string, never>

export async function updateOwnProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const sessionUser = await requireAuth()

  const name     = formData.get("name") as string
  const phone    = formData.get("phone") as string
  const address  = formData.get("address") as string
  const birthStr = formData.get("birthDate") as string
  const gender   = formData.get("gender") as string
  const notifyEmail = formData.get("notifyEmail") === "on"
  const notifySms   = formData.get("notifySms") === "on"
  const notifyPush  = formData.get("notifyPush") === "on"

  if (!name?.trim()) return { ok: false, error: "El nombre es requerido" }

  try {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        birthDate: birthStr ? new Date(birthStr) : null,
        gender: gender === "Masculino" ? "MASCULINO" : gender === "Femenino" ? "FEMENINO" : null,
        notifyEmail,
        notifySms,
        notifyPush,
      },
    })

    revalidatePath("/perfil")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: `Error al actualizar: ${err instanceof Error ? err.message : "Error"}` }
  }
}

export async function cambiarPassword(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const sessionUser = await requireAuth()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword     = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, error: "Todos los campos son requeridos" }
  }

  if (newPassword.length < 6) {
    return { ok: false, error: "La nueva contraseña debe tener al menos 6 caracteres" }
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "Las contraseñas nuevas no coinciden" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { passwordHash: true },
    })

    if (!user) return { ok: false, error: "Usuario no encontrado" }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return { ok: false, error: "La contraseña actual es incorrecta" }

    const newHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { passwordHash: newHash },
    })

    return { ok: true }
  } catch (err) {
    return { ok: false, error: `Error al cambiar contraseña: ${err instanceof Error ? err.message : "Error"}` }
  }
}
