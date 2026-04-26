"use client"

import * as React from "react"
import { AlertCircle, Upload, Download, Check } from "lucide-react"
import { importPatients } from "@/lib/actions/patients"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ImportPatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const FORMAT_HEADER = ["Nombre","Especie","Raza","Sexo","Fecha Nacimiento","Peso (kg)","Color","Esterilizado","Microchip","Alergias","Condiciones","Notas","Propietario","Teléfono","Email","Cédula"]

export function ImportPatientModal({ open, onOpenChange, onSuccess }: ImportPatientModalProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    try {
      const text = await file.text()
      const res = await importPatients(text)
      if (res.ok) {
        setResult({ ok: true, message: `✅ ${res.count} pacientes importados correctamente.` })
        onSuccess?.()
        setTimeout(() => onOpenChange(false), 1500)
      } else {
        setResult({ ok: false, message: `❌ ${res.error}` })
      }
    } catch (err) {
      setResult({ ok: false, message: `❌ Error al leer archivo: ${err instanceof Error ? err.message : "Error"}` })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const example = [
      FORMAT_HEADER,
      ["Max","Canino","Golden Retriever","Macho","2020-03-15","32.5","Dorado","Sí","ABC123","Ninguna","Displasia cadera","","Juan Pérez","3001234567","juan@mail.com","1234567890"],
      ["Luna","Felino","Siamés","Hembra","2022-07-01","4.2","Crema","No","","","","","María García","3107654321","maria@mail.com","9876543210"],
    ]
    const csv = example.map(line => line.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "plantilla-pacientes.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar pacientes desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los datos de los pacientes. Usa la plantilla de ejemplo para asegurar el formato correcto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed p-4 text-center">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null) }} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 size-4" strokeWidth={1.5} />
              {file ? file.name : "Seleccionar archivo CSV"}
            </Button>
            {file && (
              <p className="mt-2 text-xs text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            )}
          </div>

          {result && (
            <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{result.message}</span>
            </div>
          )}

          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-xs font-medium">Formato CSV esperado:</p>
            <code className="block text-[10px] text-muted-foreground bg-muted rounded p-2 overflow-x-auto">
              {FORMAT_HEADER.join(",")}
            </code>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={downloadTemplate}>
              <Download className="size-3" strokeWidth={1.5} />
              Descargar plantilla
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Importando…" : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
