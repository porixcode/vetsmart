"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { encode } from "@auth/core/jwt"

const LoginSchema = z.object({
  email:    z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export type LoginState = { error?: string; redirectTo?: string }

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = Object.fromEntries(formData)
  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.deletedAt || user.status !== "ACTIVE") {
    return { error: "Credenciales inválidas" }
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return { error: "Credenciales inválidas" }

  const jwt = await encode({
    secret: process.env.NEXTAUTH_SECRET!,
    salt:   "authjs.session-token",
    token: {
      id:    user.id,
      email: user.email,
      name:  user.name,
      image: user.image,
      role:  user.role,
      sub:   user.id,
      iat:   Math.floor(Date.now() / 1000),
      exp:   Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set("authjs.session-token", jwt, {
    path:     "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge:   30 * 24 * 60 * 60,
    secure:   process.env.NODE_ENV === "production",
  })

  Promise.all([
    prisma.user.update({ where: { id: user.id }, data: { lastActivityAt: new Date() } }),
    prisma.auditLog.create({
      data: { userId: user.id, actionType: "LOGIN" as any, module: "Sistema", description: "Inicio de sesión exitoso" },
    }),
  ]).catch(err => console.error("login audit error:", err))

  const callbackUrl = typeof raw.callbackUrl === "string" && raw.callbackUrl ? raw.callbackUrl : "/"
  return { redirectTo: callbackUrl }
}
