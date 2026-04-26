"use client"

import * as React from "react"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { updateProduct, type InventoryActionState } from "@/lib/actions/inventory"
import type { ProductView } from "@/lib/types/inventory-view"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  product: ProductView | null
}

const CATEGORIES = ["Medicamentos", "Vacunas", "Antiparasitarios", "Alimentos", "Accesorios", "Instrumental", "Consumibles"]
const UNITS = ["unidad", "ml", "mg", "tableta", "ampolla", "frasco", "caja", "bolsa", "kg", "litro"]
const INITIAL_STATE: InventoryActionState = {}

export function EditProductModal({ open, onOpenChange, onSuccess, product }: EditProductModalProps) {
  const [state, formAction, pending] = useActionState(updateProduct, INITIAL_STATE)

  const successHandled = React.useRef(false)
  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      if (successHandled.current) return
      successHandled.current = true
      onSuccess?.()
      onOpenChange(false)
    }
    if (state && !("ok" in state)) {
      successHandled.current = false
    }
  }, [state, onSuccess, onOpenChange])

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>Actualizar datos de {product.name}</DialogDescription>
        </DialogHeader>

        {state && "ok" in state && !state.ok && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="code">Código *</FieldLabel>
                <Input id="code" name="code" defaultValue={product.code} required />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                <Input id="name" name="name" defaultValue={product.name} required />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="category">Categoría</FieldLabel>
                <Select name="category" defaultValue={product.category}>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="brand">Marca</FieldLabel>
                <Input id="brand" name="brand" defaultValue={product.brand ?? ""} />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="unit">Unidad</FieldLabel>
                <Select name="unit" defaultValue={product.unit}>
                  <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="purchasePrice">Precio compra ($)</FieldLabel>
                <Input id="purchasePrice" name="purchasePrice" type="number" min="0" defaultValue={product.purchasePrice} />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="salePrice">Precio venta ($)</FieldLabel>
                <Input id="salePrice" name="salePrice" type="number" min="0" defaultValue={product.salePrice} />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentStock">Stock actual</FieldLabel>
                <Input id="currentStock" name="currentStock" type="number" min="0" defaultValue={product.currentStock} />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="minimumStock">Stock mínimo</FieldLabel>
                <Input id="minimumStock" name="minimumStock" type="number" min="0" defaultValue={product.minimumStock} />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
