"use server"

import { AuthError } from "next-auth"
import { z } from "zod"
import { signIn } from "@/auth"

const LoginSchema = z.object({
  email:    z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export type LoginState = { error?: string }

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = Object.fromEntries(formData)
  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await signIn("credentials", {
      email:      parsed.data.email,
      password:   parsed.data.password,
      redirectTo: typeof raw.callbackUrl === "string" && raw.callbackUrl ? raw.callbackUrl : "/",
    })
    return {}
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Credenciales inválidas" }
    }
    // Next redirect throws internally — propagar para que la navegación ocurra
    throw err
  }
}
