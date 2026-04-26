import { AppShell } from "@/components/layout/app-shell"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

export default function PacientesLoading() {
  return (
    <AppShell>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="space-y-1">
            <div className="h-6 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-8 w-36 rounded bg-muted animate-pulse" />
        </div>
        <div className="px-6 space-y-3">
          <div className="h-8 w-full rounded bg-muted animate-pulse" />
          <div className="flex gap-2">
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton rows={8} />
      </div>
    </AppShell>
  )
}
