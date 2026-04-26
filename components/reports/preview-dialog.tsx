"use client"

import * as React from "react"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PreviewDialogProps {
  open: boolean
  onClose: () => void
  title: string
  sections: string[]
  onGenerate: () => void
}

export function PreviewDialog({ open, onClose, title, sections, onGenerate }: PreviewDialogProps) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="mx-auto w-full max-w-2xl rounded-lg border bg-background shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Vista previa del reporte</p>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sección</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Contenido</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s, i) => (
                  <tr key={i} className={cn("border-b", i % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                    <td className="px-3 py-2 font-medium">{s}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      Datos del período seleccionado — {s.toLowerCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[10px] text-muted-foreground text-center">
              Esta es una vista previa. Los datos reales se incluirán al generar el archivo.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onClose}>
              Cerrar
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={onGenerate}>
              <Download className="size-3.5" strokeWidth={1.5} />
              Generar y descargar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
