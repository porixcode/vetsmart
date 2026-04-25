"use client"

import * as React from "react"
import { AlertTriangle, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { products, type Product, type MovementType, type MovementReason } from "@/lib/data/inventory"

interface MovementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: MovementType
  initialProductId?: string
}

const REASONS_BY_TYPE: Record<MovementType, MovementReason[]> = {
  Salida: ["Cita", "Cirugía", "Venta directa", "Daño", "Vencimiento", "Otro"],
  Entrada: ["Compra", "Otro"],
}

export function MovementModal({ open, onOpenChange, type, initialProductId }: MovementModalProps) {
  const [productSearch, setProductSearch] = React.useState("")
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    initialProductId ? products.find(p => p.id === initialProductId) ?? null : null
  )
  const [showProductList, setShowProductList] = React.useState(false)
  const [quantity, setQuantity] = React.useState("")
  const [reason, setReason] = React.useState<MovementReason | "">("")
  const [reference, setReference] = React.useState("")
  const [notes, setNotes] = React.useState("")

  const filteredProducts = productSearch.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearch.toLowerCase())
      ).slice(0, 6)
    : []

  const qty = parseInt(quantity) || 0
  const stockAfter = selectedProduct
    ? type === "Salida"
      ? selectedProduct.currentStock - qty
      : selectedProduct.currentStock + qty
    : 0

  const stockWarning = selectedProduct &&
    type === "Salida" &&
    qty > 0 &&
    stockAfter <= selectedProduct.minimumStock

  const stockError = selectedProduct &&
    type === "Salida" &&
    qty > selectedProduct.currentStock

  const canSubmit = selectedProduct && qty > 0 && reason && !stockError

  const showReference = reason === "Cita" || reason === "Cirugía"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            Registrar {type === "Entrada" ? "entrada" : "salida"} de stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Product search */}
          <div className="space-y-2">
            <Label>Producto</Label>
            {selectedProduct ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct.code} · Stock actual: <span className="font-medium tabular-nums">{selectedProduct.currentStock} {selectedProduct.unit}</span>
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
                  onClick={() => { setSelectedProduct(null); setProductSearch("") }}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={productSearch}
                  className="pl-9"
                  onChange={e => { setProductSearch(e.target.value); setShowProductList(true) }}
                  onFocus={() => setShowProductList(true)}
                />
                {showProductList && filteredProducts.length > 0 && (
                  <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                    {filteredProducts.map(p => (
                      <button
                        key={p.id}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => { setSelectedProduct(p); setProductSearch(""); setShowProductList(false) }}
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.code} · {p.brand}</p>
                        </div>
                        <span className={`ml-3 shrink-0 text-xs font-medium tabular-nums ${p.currentStock <= p.minimumStock ? "text-amber-600" : "text-muted-foreground"}`}>
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
                Stock insuficiente. Disponible: {selectedProduct?.currentStock} {selectedProduct?.unit}
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
            <Select value={reason} onValueChange={v => { setReason(v as MovementReason); setReference("") }}>
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

          {/* Reference (depends on reason) */}
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
                  Después de este movimiento el stock ({stockAfter}) quedará por debajo del mínimo ({selectedProduct?.minimumStock} {selectedProduct?.unit}).
                  Considere generar una orden de compra.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={() => onOpenChange(false)}>
            Registrar {type === "Entrada" ? "entrada" : "salida"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
