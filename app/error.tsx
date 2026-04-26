"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm text-center space-y-4">
        <AlertTriangle className="mx-auto size-12 text-destructive" strokeWidth={1.5} />
        <h1 className="text-lg font-semibold">Algo salió mal</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "Ocurrió un error inesperado. Intenta de nuevo."}
        </p>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="size-4" strokeWidth={1.5} />
          Reintentar
        </Button>
      </div>
    </div>
  )
}
