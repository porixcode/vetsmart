import { AppShell } from "@/components/layout/app-shell"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

export default function UsuariosLoading() {
  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="space-y-1">
            <div className="h-6 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton rows={8} />
      </div>
    </AppShell>
  )
}
