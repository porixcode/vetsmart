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
import { CreateProductSchema, UpdateProductSchema } from "@/lib/validators/inventory"
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

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key)
  if (typeof v !== "string") return undefined
  const s = v.trim()
  return s.length > 0 ? s : undefined
}

export async function createProduct(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")

  const raw = {
    code:          str(formData, "code"),
    name:          str(formData, "name"),
    category:      str(formData, "category"),
    brand:         str(formData, "brand"),
    unit:          str(formData, "unit"),
    purchasePrice: str(formData, "purchasePrice"),
    salePrice:     str(formData, "salePrice"),
    currentStock:  str(formData, "currentStock"),
    minimumStock:  str(formData, "minimumStock"),
  }

  const parsed = CreateProductSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: `${issue?.path?.join(".") ?? "campo"}: ${issue?.message}` }
  }

  const input = parsed.data

  try {
    const product = await prisma.product.create({
      data: input,
    })

    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "CREATE",
        module:      "Inventario",
        targetId:    product.id,
        description: `Creó producto ${product.name} (${product.code})`,
      },
    })

    revalidatePath("/inventario")
    return { ok: true, id: product.id }
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { ok: false, error: `Ya existe un producto con el código "${input.code}"` }
    }
    return { ok: false, error: `No se pudo crear: ${err?.message ?? "Error desconocido"}` }
  }
}

export async function updateProduct(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")

  const id = str(formData, "id")
  if (!id) return { ok: false, error: "ID requerido" }

  const raw = {
    id,
    code:          str(formData, "code"),
    name:          str(formData, "name"),
    category:      str(formData, "category"),
    brand:         str(formData, "brand"),
    unit:          str(formData, "unit"),
    purchasePrice: str(formData, "purchasePrice"),
    salePrice:     str(formData, "salePrice"),
    currentStock:  str(formData, "currentStock"),
    minimumStock:  str(formData, "minimumStock"),
  }

  const parsed = UpdateProductSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: `${issue?.path?.join(".") ?? "campo"}: ${issue?.message}` }
  }

  const { id: _, ...data } = parsed.data

  try {
    const product = await prisma.product.update({
      where: { id, deletedAt: null },
      data,
    })

    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "UPDATE",
        module:      "Inventario",
        targetId:    product.id,
        description: `Actualizó producto ${product.name}`,
      },
    })

    revalidatePath("/inventario")
    return { ok: true, id: product.id }
  } catch (err: any) {
    return { ok: false, error: `No se pudo actualizar: ${err?.message ?? "Error desconocido"}` }
  }
}

export async function deleteProduct(id: string): Promise<InventoryActionState> {
  const user = await requireRole("ADMIN", "VETERINARIO")
  try {
    const product = await prisma.product.update({
      where: { id, deletedAt: null },
      data:  { deletedAt: new Date(), status: "DESCONTINUADO" },
    })
    await prisma.auditLog.create({
      data: {
        userId: user.id, actionType: "DELETE", module: "Inventario",
        targetId: product.id, description: `Eliminó producto ${product.name}`,
      },
    })
    revalidatePath("/inventario")
    return { ok: true, id: product.id }
  } catch (err: any) {
    return { ok: false, error: `No se pudo eliminar: ${err?.message ?? "Error desconocido"}` }
  }
}

export async function exportProducts(ids?: string[]): Promise<{ ok: true; csv: string } | { ok: false; error: string }> {
  try {
    const where: Record<string, unknown> = { deletedAt: null }
    if (ids && ids.length > 0) where.id = { in: ids }

    const products = await prisma.product.findMany({ where, orderBy: { name: "asc" } })
    const header = ["Código","Nombre","Categoría","Marca","Unidad","Stock actual","Stock mínimo","Precio compra","Precio venta","Estado"]
    const rows = products.map(p => [
      p.code, p.name,
      p.category, p.brand ?? "", p.unit,
      String(p.currentStock), String(p.minimumStock),
      String(p.purchasePrice), String(p.salePrice),
      p.status,
    ])
    const csv = [header, ...rows].map(line => line.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    return { ok: true, csv: "\uFEFF" + csv }
  } catch (err) {
    return { ok: false, error: `Error al exportar: ${err instanceof Error ? err.message : "Error"}` }
  }
}

export async function importProducts(csv: string): Promise<{ ok: true; count: number } | { ok: false; error: string; row?: number }> {
  await requireRole("ADMIN", "VETERINARIO")
  try {
    const lines = csv.split("\n").filter(l => l.trim())
    if (lines.length < 2) return { ok: false, error: "CSV vacío o sin datos" }

    const colMap: Record<string, number> = {}
    lines[0].split(",").forEach((h, i) => { colMap[h.replace(/"/g, "").trim()] = i })
    if (!("Nombre" in colMap)) return { ok: false, error: `Columna "Nombre" no encontrada` }

    let count = 0
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map(v => v.replace(/^"|"$/g, "").trim())
      const name = vals[colMap["Nombre"]] ?? ""
      const code = vals[colMap["Código"]] ?? `IMP-${Date.now()}-${i}`
      if (!name) continue

      const catLabel = vals[colMap["Categoría"]] ?? "Medicamentos"
      const category = catLabel === "Medicamentos" ? "MEDICAMENTOS" as const
        : catLabel === "Vacunas" ? "VACUNAS" as const
        : catLabel === "Antiparasitarios" ? "ANTIPARASITARIOS" as const
        : catLabel === "Alimentos" ? "ALIMENTOS" as const
        : catLabel === "Accesorios" ? "ACCESORIOS" as const
        : catLabel === "Instrumental" ? "INSTRUMENTAL" as const
        : "CONSUMIBLES" as const

      const statusLabel = vals[colMap["Estado"]] ?? "Activo"
      const status = statusLabel === "Activo" ? "ACTIVO" as const
        : statusLabel === "Stock bajo" ? "STOCK_BAJO" as const
        : statusLabel === "Agotado" ? "AGOTADO" as const
        : "ACTIVO" as const

      try {
        await (prisma.product.create as any)({
          data: {
            code,
            name,
            category,
            brand: vals[colMap["Marca"]] ?? null,
            unit: vals[colMap["Unidad"]] ?? "unidad",
            currentStock: Number(vals[colMap["Stock actual"]]) || 0,
            minimumStock: Number(vals[colMap["Stock mínimo"]]) || 0,
            purchasePrice: Number(vals[colMap["Precio compra"]]) || 0,
            salePrice: Number(vals[colMap["Precio venta"]]) || 0,
            status,
          },
        })
        count++
      } catch { continue }
    }

    revalidatePath("/inventario")
    return { ok: true, count }
  } catch (err) {
    return { ok: false, error: `Error al importar: ${err instanceof Error ? err.message : "Error"}` }
  }
}
