import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Iniciar sesión — VetSmart",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-muted px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-semibold tracking-tight">Vet</span>
          <span className="text-2xl font-semibold tracking-tight text-primary">Smart</span>
          <span className="size-2 rounded-full bg-primary" />
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <div className="mb-5 space-y-1 text-center">
            <h1 className="text-base font-semibold">Iniciar sesión</h1>
            <p className="text-xs text-text-muted">
              SERMEC Veterinaria — Ingresa con tus credenciales
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-[11px] text-text-muted">
            ¿Problemas para acceder? Contacta al administrador del sistema.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-text-muted/80">
          VetSmart v1.0.0 · © 2026 SERMEC Veterinaria
        </p>
      </div>
    </div>
  )
}
