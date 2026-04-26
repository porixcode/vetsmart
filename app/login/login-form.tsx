"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle, Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction, type LoginState } from "./actions"

const INITIAL: LoginState = {}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"
  const [state, formAction, pending] = useActionState(loginAction, INITIAL)

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs text-text-secondary">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@vetsmart.co"
          defaultValue=""
          required
          disabled={pending}
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs text-text-secondary">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          required
          disabled={pending}
          className="h-10"
        />
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="h-10 w-full gap-2 text-sm">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            Iniciando sesión…
          </>
        ) : (
          <>
            <LogIn className="size-4" strokeWidth={1.5} />
            Iniciar sesión
          </>
        )}
      </Button>
    </form>
  )
}
