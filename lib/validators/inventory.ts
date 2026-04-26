import { z } from "zod"
import { ProductCategory, ProductStatus, MovementType, MovementReason } from "@prisma/client"

export const CATEGORY_LABEL_TO_ENUM: Record<string, ProductCategory> = {
  Medicamentos:     "MEDICAMENTOS",
  Vacunas:          "VACUNAS",
  Antiparasitarios: "ANTIPARASITARIOS",
  Alimentos:        "ALIMENTOS",
  Accesorios:       "ACCESORIOS",
  Instrumental:     "INSTRUMENTAL",
  Consumibles:      "CONSUMIBLES",
}
export const CATEGORY_ENUM_TO_LABEL: Record<ProductCategory, string> = {
  MEDICAMENTOS:     "Medicamentos",
  VACUNAS:          "Vacunas",
  ANTIPARASITARIOS: "Antiparasitarios",
  ALIMENTOS:        "Alimentos",
  ACCESORIOS:       "Accesorios",
  INSTRUMENTAL:     "Instrumental",
  CONSUMIBLES:      "Consumibles",
}

export const STATUS_LABEL_TO_ENUM: Record<string, ProductStatus> = {
  Activo:        "ACTIVO",
  Agotado:       "AGOTADO",
  "Stock bajo":  "STOCK_BAJO",
  Descontinuado: "DESCONTINUADO",
}
export const STATUS_ENUM_TO_LABEL: Record<ProductStatus, string> = {
  ACTIVO:        "Activo",
  AGOTADO:       "Agotado",
  STOCK_BAJO:    "Stock bajo",
  DESCONTINUADO: "Descontinuado",
}

export const MOVEMENT_TYPE_LABEL_TO_ENUM: Record<string, MovementType> = {
  Entrada: "ENTRADA",
  Salida:  "SALIDA",
}
export const MOVEMENT_TYPE_ENUM_TO_LABEL: Record<MovementType, string> = {
  ENTRADA: "Entrada",
  SALIDA:  "Salida",
}

export const MOVEMENT_REASON_LABEL_TO_ENUM: Record<string, MovementReason> = {
  Cita:            "CITA",
  Cirugía:         "CIRUGIA",
  "Venta directa": "VENTA_DIRECTA",
  Daño:            "DANO",
  Vencimiento:     "VENCIMIENTO",
  Compra:          "COMPRA",
  Otro:            "OTRO",
}
export const MOVEMENT_REASON_ENUM_TO_LABEL: Record<MovementReason, string> = {
  CITA:          "Cita",
  CIRUGIA:       "Cirugía",
  VENTA_DIRECTA: "Venta directa",
  DANO:          "Daño",
  VENCIMIENTO:   "Vencimiento",
  COMPRA:        "Compra",
  OTRO:          "Otro",
}

const movementTypeCoerce = z.preprocess(
  v => (typeof v === "string" && MOVEMENT_TYPE_LABEL_TO_ENUM[v]) ? MOVEMENT_TYPE_LABEL_TO_ENUM[v] : v,
  z.nativeEnum(MovementType, { errorMap: () => ({ message: "Tipo de movimiento inválido" }) }),
)
const movementReasonCoerce = z.preprocess(
  v => (typeof v === "string" && MOVEMENT_REASON_LABEL_TO_ENUM[v]) ? MOVEMENT_REASON_LABEL_TO_ENUM[v] : v,
  z.nativeEnum(MovementReason, { errorMap: () => ({ message: "Motivo inválido" }) }),
)

export const StockMovementSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  type:      movementTypeCoerce,
  reason:    movementReasonCoerce,
  quantity:  z.coerce.number().int().positive("Cantidad debe ser mayor a 0"),
  reference: z.string().trim().optional().transform(v => v || null),
  notes:     z.string().trim().optional().transform(v => v || null),
})
export type StockMovementInput = z.infer<typeof StockMovementSchema>

const categoryCoerce = z.preprocess(
  v => (typeof v === "string" && CATEGORY_LABEL_TO_ENUM[v]) ? CATEGORY_LABEL_TO_ENUM[v] : v,
  z.nativeEnum(ProductCategory, { errorMap: () => ({ message: "Categoría inválida" }) }),
)
const statusCoerce = z.preprocess(
  v => (typeof v === "string" && STATUS_LABEL_TO_ENUM[v]) ? STATUS_LABEL_TO_ENUM[v] : v,
  z.nativeEnum(ProductStatus, { errorMap: () => ({ message: "Estado inválido" }) }),
)

export const CreateProductSchema = z.object({
  code:          z.string().trim().min(1, "Código requerido"),
  name:          z.string().trim().min(1, "Nombre requerido"),
  category:      categoryCoerce,
  brand:         z.string().trim().optional().transform(v => v || null),
  unit:          z.string().trim().default("unidad"),
  purchasePrice: z.coerce.number().int().min(0).default(0),
  salePrice:     z.coerce.number().int().min(0).default(0),
  currentStock:  z.coerce.number().int().min(0).default(0),
  minimumStock:  z.coerce.number().int().min(0).default(0),
  status:        statusCoerce.optional().default("ACTIVO" as any),
})
export type CreateProductInput = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().min(1),
})
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

export const InventorySearchSchema = z.object({
  q:          z.string().optional().default(""),
  categories: z.array(z.string()).optional().default([]),
  statuses:   z.array(z.string()).optional().default([]),
})
export type InventorySearch = z.infer<typeof InventorySearchSchema>
