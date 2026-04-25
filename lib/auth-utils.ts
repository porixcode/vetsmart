import "server-only"

import { redirect } from "next/navigation"
import type { Role } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "./prisma"

/** Devuelve el User completo desde DB, o null si no hay sesión activa. */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.user.findUnique({
    where: { id: session.user.id, deletedAt: null },
  })
}

/** Devuelve la sesión. Si no hay sesión, redirige a /login con callbackUrl. */
export async function requireAuth(callbackUrl?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    const target = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login"
    redirect(target)
  }
  return session.user
}

/** Exige que la sesión tenga uno de los roles indicados. Throw si no. */
export async function requireRole(...roles: Role[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: se requiere uno de [${roles.join(", ")}]`)
  }
  return user
}
