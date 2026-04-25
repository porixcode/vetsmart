"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface InventoryItem {
  id: string
  name: string
  currentStock: number
  minimumStock: number
}

const lowStockItems: InventoryItem[] = [
  { id: "1", name: "Vacuna Antirrábica", currentStock: 3, minimumStock: 10 },
  { id: "2", name: "Antiparasitario Bravecto 20kg", currentStock: 2, minimumStock: 8 },
  { id: "3", name: "Jeringa 5ml", currentStock: 15, minimumStock: 50 },
  { id: "4", name: "Suero fisiológico", currentStock: 4, minimumStock: 15 },
]

export function InventoryAlerts() {
  return (
    <div className="rounded-md border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-lg font-semibold tracking-tight-custom text-text-primary">
          Alertas de inventario
        </h3>
        <Badge
          variant="secondary"
          className="rounded-sm bg-warning/10 text-warning text-xs font-medium"
        >
          {lowStockItems.length}
        </Badge>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {lowStockItems.map((item) => {
          const percentage = (item.currentStock / item.minimumStock) * 100
          return (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-text-muted tabular-nums">
                    {item.currentStock} / {item.minimumStock} unidades
                  </p>
                  <Progress
                    value={percentage}
                    className="mt-2 h-1.5 bg-background-muted [&>div]:bg-danger"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-sm px-2 text-xs text-text-secondary hover:bg-background-muted hover:text-text-primary transition-colors duration-150"
                >
                  Reabastecer
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
