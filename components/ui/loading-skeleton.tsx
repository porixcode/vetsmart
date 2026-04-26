export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function KPILoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          <div className="h-8 w-16 rounded bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}
