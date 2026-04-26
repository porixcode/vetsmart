import { AppShell } from "@/components/layout/app-shell"

export default function PacienteDetailLoading() {
  return (
    <AppShell>
      <div className="flex h-full">
        <div className="w-80 shrink-0 border-r p-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="size-24 rounded-full bg-muted animate-pulse" />
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-muted animate-pulse" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-64 rounded bg-muted animate-pulse" />
          <div className="h-10 w-96 rounded bg-muted animate-pulse" />
          <div className="h-64 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    </AppShell>
  )
}
