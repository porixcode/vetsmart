"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import {
  StockMovementSchema,
  MOVEMENT_TYPE_LABEL_TO_ENUM,
  MOVEMENT_REASON_LABEL_TO_ENUM,
} from "@/lib/validators/inventory"
import { searchProductsForModal } from "@/lib/queries/inventory"
import type { ProductView } from "@/lib/types/inventory-view"
import type { ProductStatus } from "@prisma/client"

export type InventoryActionState =
  | { ok: false; error: string }
  | { ok: true;  id: string }
  | Record<string, never>

function computeStatus(stock: number, minimum: number): ProductStatus {
  if (stock === 0)         return "AGOTADO"
  if (stock <= minimum)    return "STOCK_BAJO"
  return "ACTIVO"
}

export async function registerStockMovementAction(
  productId: string,
  typeLabel: string,
  reasonLabel: string,
  quantity: number,
  reference: string | null,
  notes: string | null,
): Promise<InventoryActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO", "RECEPCIONISTA")

  const parsed = StockMovementSchema.safeParse({
    productId,
    type:      MOVEMENT_TYPE_LABEL_TO_ENUM[typeLabel]   ?? typeLabel,
    reason:    MOVEMENT_REASON_LABEL_TO_ENUM[reasonLabel] ?? reasonLabel,
    quantity,
    reference,
    notes,
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: issue?.message ?? "Datos inválidos" }
  }

  const input = parsed.data

  try {
    const movement = await prisma.$transaction(async tx => {
      const product = await tx.product.findFirst({
        where:  { id: input.productId, deletedAt: null },
        select: { currentStock: true, minimumStock: true, name: true },
      })
      if (!product) throw new Error("Producto no encontrado")

      const stockBefore = product.currentStock
      let   stockAfter: number

      if (input.type === "SALIDA") {
        if (input.quantity > stockBefore) {
          throw new Error(`Stock insuficiente. Disponible: ${stockBefore}`)
        }
        stockAfter = stockBefore - input.quantity
      } else {
        stockAfter = stockBefore + input.quantity
      }

      const mov = await tx.stockMovement.create({
        data: {
          productId:    input.productId,
          type:         input.type,
          reason:       input.reason,
          quantity:     input.quantity,
          stockBefore,
          stockAfter,
          reference:    input.reference,
          notes:        input.notes,
          performedById: user.id,
        },
      })

      await tx.product.update({
        where: { id: input.productId },
        data: {
          currentStock: stockAfter,
          status:       computeStatus(stockAfter, product.minimumStock),
        },
      })

      await tx.auditLog.create({
        data: {
          userId:      user.id,
          actionType:  "UPDATE",
          module:      "Inventario",
          targetId:    input.productId,
          description: `${input.type === "ENTRADA" ? "Entrada" : "Salida"} de ${input.quantity} × ${product.name}. Stock: ${stockBefore} → ${stockAfter}`,
        },
      })

      return mov
    })

    revalidatePath("/inventario")
    return { ok: true, id: movement.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: msg }
  }
}

export async function searchProductsAction(q: string): Promise<ProductView[]> {
  await requireRole("ADMIN", "VETERINARIO", "RECEPCIONISTA")
  return searchProductsForModal(q)
}
