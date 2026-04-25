import { Construction } from "lucide-react"

interface SectionPlaceholderProps {
  title: string
  description?: string
}

export function SectionPlaceholder({ title, description }: SectionPlaceholderProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Construction className="size-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium">Sección en construcción</p>
          <p className="text-xs text-muted-foreground mt-1">
            Esta sección de configuración estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  )
}
