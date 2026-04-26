import { AppShell } from "@/components/layout/app-shell"
import { KPILoadingSkeleton } from "@/components/ui/loading-skeleton"

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <div className="space-y-1">
          <div className="h-7 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded bg-muted animate-pulse" />
        </div>
        <KPILoadingSkeleton />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="h-80 rounded-lg border bg-muted animate-pulse" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <div className="h-48 rounded-lg border bg-muted animate-pulse" />
            <div className="h-48 rounded-lg border bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
