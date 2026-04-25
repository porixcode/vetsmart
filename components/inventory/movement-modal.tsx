"use client"

import * as React from "react"
import { AlertTriangle, Loader2, Search } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  registerStockMovementAction,
  searchProductsAction,
} from "@/lib/actions/inventory"
import type { ProductView, MovementTypeLabel, MovementReasonLabel } from "@/lib/types/inventory-view"

interface MovementModalProps {
  open:            boolean
  onOpenChange:    (open: boolean) => void
  type:            MovementTypeLabel
  initialProduct?: ProductView
  onSuccess?:      () => void
}

const REASONS_BY_TYPE: Record<MovementTypeLabel, MovementReasonLabel[]> = {
  Salida:  ["Cita", "Cirugía", "Venta directa", "Daño", "Vencimiento", "Otro"],
  Entrada: ["Compra", "Otro"],
}

export function MovementModal({
  open,
  onOpenChange,
  type,
  initialProduct,
  onSuccess,
}: MovementModalProps) {
  const [selectedProduct, setSelectedProduct] = React.useState<ProductView | null>(null)
  const [productSearch,   setProductSearch]   = React.useState("")
  const [searchResults,   setSearchResults]   = React.useState<ProductView[]>([])
  const [showResults,     setShowResults]     = React.useState(false)
  const [isSearching,     setIsSearching]     = React.useState(false)

  const [quantity,  setQuantity]  = React.useState("")
  const [reason,    setReason]    = React.useState<MovementReasonLabel | "">("")
  const [reference, setReference] = React.useState("")
  const [notes,     setNotes]     = React.useState("")

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error,        setError]        = React.useState<string | null>(null)

  // Reset all state when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedProduct(initialProduct ?? null)
      setProductSearch("")
      setSearchResults([])
      setShowResults(false)
      setQuantity("")
      setReason("")
      setReference("")
      setNotes("")
      setError(null)
    }
  }, [open, initialProduct])

  // Debounced product search
  React.useEffect(() => {
    if (selectedProduct || productSearch.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchProductsAction(productSearch)
        setSearchResults(results)
        setShowResults(true)
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch, selectedProduct])

  const qty        = parseInt(quantity) || 0
  const stockAfter = selectedProduct
    ? type === "Salida"
      ? selectedProduct.currentStock - qty
      : selectedProduct.currentStock + qty
    : 0

  const stockWarning = selectedProduct && type === "Salida" && qty > 0 &&
    stockAfter <= selectedProduct.minimumStock && stockAfter >= 0

  const stockError = selectedProduct && type === "Salida" && qty > selectedProduct.currentStock

  const canSubmit = !isSubmitting && selectedProduct && qty > 0 && reason && !stockError

  const showReference = reason === "Cita" || reason === "Cirugía"

  async function handleSubmit() {
    if (!canSubmit || !selectedProduct || !reason) return
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await registerStockMovementAction(
        selectedProduct.id,
        type,
        reason,
        qty,
        showReference && reference.trim() ? reference.trim() : null,
        notes.trim() || null,
      )
      if (result.ok) {
        onOpenChange(false)
        onSuccess?.()
      } else if ("error" in result) {
        setError(result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            Registrar {type === "Entrada" ? "entrada" : "salida"} de stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Product */}
          <div className="space-y-2">
            <Label>Producto</Label>
            {selectedProduct ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct.code} · Stock actual:{" "}
                    <span className="font-medium tabular-nums">
                      {selectedProduct.currentStock} {selectedProduct.unit}
                    </span>
                  </p>
                  {selectedProduct.lots.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Lote próximo a vencer: {selectedProduct.lots[0].lotNumber}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" strokeWidth={1.5} />
                )}
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={productSearch}
                  className="pl-9"
                  onChange={e => setProductSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                />
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          setSelectedProduct(p)
                          setProductSearch("")
                          setShowResults(false)
                        }}
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.code} · {p.brand ?? "—"}
                          </p>
                        </div>
                        <span className={`ml-3 shrink-0 text-xs font-medium tabular-nums ${
                          p.currentStock <= p.minimumStock ? "text-amber-600" : "text-muted-foreground"
                        }`}>
                          {p.currentStock} {p.unit}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="1"
              max={type === "Salida" ? selectedProduct?.currentStock : undefined}
              placeholder="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className={stockError ? "border-destructive" : ""}
            />
            {stockError && (
              <p className="text-xs text-destructive">
                Stock insuficiente. Disponible: {selectedProduct?.currentStock}{" "}
                {selectedProduct?.unit}
              </p>
            )}
            {selectedProduct && qty > 0 && !stockError && (
              <p className="text-xs text-muted-foreground tabular-nums">
                Stock resultante: {stockAfter} {selectedProduct.unit}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Motivo</Label>
            <Select
              value={reason}
              onValueChange={v => { setReason(v as MovementReasonLabel); setReference("") }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar motivo" />
              </SelectTrigger>
              <SelectContent>
                {REASONS_BY_TYPE[type].map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          {showReference && (
            <div className="space-y-2">
              <Label>{reason === "Cita" ? "N° de cita" : "N° de cirugía"}</Label>
              <Input
                placeholder={reason === "Cita" ? "CIT-00000" : "CIR-00000"}
                value={reference}
                onChange={e => setReference(e.target.value)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Textarea
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Stock warning */}
          {stockWarning && !stockError && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="font-medium">Stock bajo el mínimo</p>
                <p className="text-xs">
                  Después de este movimiento el stock ({stockAfter}) quedará por debajo del mínimo
                  ({selectedProduct?.minimumStock} {selectedProduct?.unit}).
                </p>
              </div>
            </div>
          )}

          {/* Server error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" strokeWidth={1.5} />}
            Registrar {type === "Entrada" ? "entrada" : "salida"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
