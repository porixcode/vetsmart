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

export const InventorySearchSchema = z.object({
  q:          z.string().optional().default(""),
  categories: z.array(z.string()).optional().default([]),
  statuses:   z.array(z.string()).optional().default([]),
})
export type InventorySearch = z.infer<typeof InventorySearchSchema>
