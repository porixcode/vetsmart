import "server-only"

import { subDays } from "date-fns"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  CATEGORY_ENUM_TO_LABEL,
  STATUS_ENUM_TO_LABEL,
  MOVEMENT_TYPE_ENUM_TO_LABEL,
  MOVEMENT_REASON_ENUM_TO_LABEL,
  CATEGORY_LABEL_TO_ENUM,
  STATUS_LABEL_TO_ENUM,
  type InventorySearch,
} from "@/lib/validators/inventory"
import type {
  ProductView,
  LotView,
  MovementView,
  SupplierView,
  StockPoint,
  InventoryStats,
  ProductCategoryLabel,
  ProductStatusLabel,
  MovementTypeLabel,
  MovementReasonLabel,
} from "@/lib/types/inventory-view"

const productInclude = {
  lots: {
    orderBy: { expiryDate: "asc" as const },
    include: { supplier: { select: { name: true } } },
  },
  movements: {
    orderBy: { createdAt: "asc" as const },
    include: { performedBy: { select: { name: true } } },
  },
  suppliers: {
    include: { supplier: true },
  },
} satisfies Prisma.ProductInclude

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>

function buildStockHistory(movements: ProductRow["movements"], currentStock: number): StockPoint[] {
  const today = new Date()
  const windowStart = subDays(today, 90)

  const inWindow = movements.filter(m => m.createdAt >= windowStart)

  if (inWindow.length === 0) {
    return [
      { date: windowStart, stock: currentStock },
      { date: today, stock: currentStock },
    ]
  }

  const points: StockPoint[] = [
    { date: windowStart, stock: inWindow[0].stockBefore },
  ]
  for (const m of inWindow) {
    points.push({ date: m.createdAt, stock: m.stockAfter })
  }
  points.push({ date: today, stock: currentStock })
  return points
}

function mapProduct(p: ProductRow): ProductView {
  const lots: LotView[] = p.lots.map(l => ({
    id:           l.id,
    lotNumber:    l.lotNumber,
    quantity:     l.quantity,
    expiryDate:   l.expiryDate,
    purchaseDate: l.purchaseDate,
    supplierName: l.supplier?.name ?? null,
  }))

  const movementsSorted = [...p.movements].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
  const movements: MovementView[] = movementsSorted.map(m => ({
    id:          m.id,
    type:        MOVEMENT_TYPE_ENUM_TO_LABEL[m.type] as MovementTypeLabel,
    reason:      MOVEMENT_REASON_ENUM_TO_LABEL[m.reason] as MovementReasonLabel,
    quantity:    m.quantity,
    stockBefore: m.stockBefore,
    stockAfter:  m.stockAfter,
    reference:   m.reference,
    notes:       m.notes,
    performedBy: m.performedBy.name,
    date:        m.createdAt,
  }))

  const suppliers: SupplierView[] = p.suppliers.map(ps => ({
    id:               ps.supplier.id,
    name:             ps.supplier.name,
    contact:          ps.supplier.contact,
    phone:            ps.supplier.phone,
    email:            ps.supplier.email,
    unitPrice:        ps.unitPrice,
    lastPurchaseDate: ps.lastPurchaseDate,
  }))

  return {
    id:                   p.id,
    code:                 p.code,
    name:                 p.name,
    category:             CATEGORY_ENUM_TO_LABEL[p.category] as ProductCategoryLabel,
    brand:                p.brand,
    unit:                 p.unit,
    currentStock:         p.currentStock,
    minimumStock:         p.minimumStock,
    reorderQuantity:      p.reorderQuantity,
    purchasePrice:        p.purchasePrice,
    salePrice:            p.salePrice,
    location:             p.location,
    requiresPrescription: p.requiresPrescription,
    controlled:           p.controlled,
    invima:               p.invima,
    status:               STATUS_ENUM_TO_LABEL[p.status] as ProductStatusLabel,
    lots,
    movements,
    suppliers,
    stockHistory:  buildStockHistory(p.movements, p.currentStock),
    lastMovement:  movementsSorted[0]?.createdAt ?? null,
  }
}

function buildWhere(search: InventorySearch): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { deletedAt: null }

  if (search.q.trim()) {
    const q = search.q.trim()
    where.OR = [
      { name:  { contains: q, mode: "insensitive" } },
      { code:  { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ]
  }

  if (search.categories.length > 0) {
    const enums = search.categories
      .map(c => CATEGORY_LABEL_TO_ENUM[c])
      .filter((v): v is NonNullable<typeof v> => !!v)
    if (enums.length > 0) where.category = { in: enums }
  }

  if (search.statuses.length > 0) {
    const enums = search.statuses
      .map(s => STATUS_LABEL_TO_ENUM[s])
      .filter((v): v is NonNullable<typeof v> => !!v)
    if (enums.length > 0) where.status = { in: enums }
  }

  return where
}

export async function listProducts(search: InventorySearch): Promise<ProductView[]> {
  const where = buildWhere(search)
  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: [{ name: "asc" }],
  })
  return products.map(mapProduct)
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const [total, lowStock, outOfStock, rows] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, status: "STOCK_BAJO" } }),
    prisma.product.count({ where: { deletedAt: null, status: "AGOTADO" } }),
    prisma.product.findMany({
      where:  { deletedAt: null },
      select: { currentStock: true, purchasePrice: true },
    }),
  ])
  const totalValue = rows.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0)
  return { total, lowStock, outOfStock, totalValue }
}

export async function searchProductsForModal(q: string): Promise<ProductView[]> {
  if (!q || q.trim().length < 2) return []
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: q.trim(), mode: "insensitive" } },
        { code: { contains: q.trim(), mode: "insensitive" } },
      ],
    },
    include: productInclude,
    take: 8,
  })
  return products.map(mapProduct)
}
