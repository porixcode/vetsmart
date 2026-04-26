"use client"

import * as React from "react"
import { AlertCircle, Upload, Download, X, FileText } from "lucide-react"
import { importProducts } from "@/lib/actions/inventory"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ImportProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const CSV_COLUMNS = [
  { field: "Código", req: false, desc: "Código único del producto" },
  { field: "Nombre", req: true, desc: "Nombre del producto" },
  { field: "Categoría", req: false, desc: "Medicamentos, Vacunas, Alimentos, etc." },
  { field: "Marca", req: false, desc: "Marca comercial" },
  { field: "Unidad", req: false, desc: "unidad, ml, mg, tableta, etc." },
  { field: "Stock actual", req: false, desc: "Cantidad en inventario" },
  { field: "Stock mínimo", req: false, desc: "Mínimo antes de alertar" },
  { field: "Precio compra", req: false, desc: "Precio de compra en COP" },
  { field: "Precio venta", req: false, desc: "Precio de venta en COP" },
  { field: "Estado", req: false, desc: "Activo, Stock bajo, Agotado, Descontinuado" },
]

export function ImportProductModal({ open, onOpenChange, onSuccess }: ImportProductModalProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleImport = async () => {
    if (!file) return
    setLoading(true); setResult(null)
    try {
      const text = await file.text()
      const res = await importProducts(text)
      if (res.ok) {
        setResult({ ok: true, message: `${res.count} productos importados correctamente.` })
        onSuccess?.(); setTimeout(() => onOpenChange(false), 1500)
      } else {
        setResult({ ok: false, message: res.error })
      }
    } catch (err) {
      setResult({ ok: false, message: `Error: ${err instanceof Error ? err.message : "Error"}` })
    } finally { setLoading(false) }
  }

  const downloadTemplate = () => {
    const header = CSV_COLUMNS.map(c => c.field)
    const rows = [
      header,
      ["MED-001","Amoxicilina 500mg","Medicamentos","Genfar","tableta","100","20","15000","25000","Activo"],
      ["VAC-002","Vacuna Triple Felina","Vacunas","Zoetis","dosis","50","10","35000","55000","Activo"],
    ]
    const csv = rows.map(line => line.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob); a.download = "plantilla-productos.csv"; a.click()
    URL.revokeObjectURL(a.href)
  }

  const clearFile = () => { setFile(null); setResult(null); if (fileRef.current) fileRef.current.value = "" }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar productos desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los datos de los productos. Solo la columna <strong>Nombre</strong> es obligatoria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border border-dashed p-4 text-center">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null) }} />
            {!file ? (
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-2 size-4" strokeWidth={1.5} />
                Seleccionar archivo CSV
              </Button>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="size-5 shrink-0 text-primary" strokeWidth={1.5} />
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => fileRef.current?.click()}>Cambiar</Button>
                  <button onClick={clearFile} className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"><X className="size-4" strokeWidth={1.5} /></button>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className={`flex items-start gap-2 border px-3 py-2 text-xs ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{result.message}</span>
            </div>
          )}

          <div className="border">
            <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
              <p className="text-xs font-medium">Columnas del CSV</p>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={downloadTemplate}>
                <Download className="size-3" strokeWidth={1.5} /> Plantilla
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y">
              {CSV_COLUMNS.map(col => (
                <div key={col.field} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                  <span className="font-medium min-w-[120px] shrink-0">{col.field}</span>
                  <span className="text-muted-foreground truncate">{col.desc}</span>
                  {col.req && <Badge variant="outline" className="text-[9px] h-4 ml-auto shrink-0">Requerido</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleImport} disabled={!file || loading} className="min-w-[100px]">
            {loading ? "Importando…" : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
