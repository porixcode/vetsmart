export type ProductCategoryLabel =
  | "Medicamentos"
  | "Vacunas"
  | "Antiparasitarios"
  | "Alimentos"
  | "Accesorios"
  | "Instrumental"
  | "Consumibles"

export type ProductStatusLabel = "Activo" | "Agotado" | "Stock bajo" | "Descontinuado"
export type MovementTypeLabel = "Entrada" | "Salida"
export type MovementReasonLabel =
  | "Cita"
  | "Cirugía"
  | "Venta directa"
  | "Daño"
  | "Vencimiento"
  | "Compra"
  | "Otro"

export interface LotView {
  id:           string
  lotNumber:    string
  quantity:     number
  expiryDate:   Date
  purchaseDate: Date
  supplierName: string | null
}

export interface MovementView {
  id:          string
  type:        MovementTypeLabel
  reason:      MovementReasonLabel
  quantity:    number
  stockBefore: number
  stockAfter:  number
  reference:   string | null
  notes:       string | null
  performedBy: string
  date:        Date
}

export interface SupplierView {
  id:               string
  name:             string
  contact:          string | null
  phone:            string | null
  email:            string | null
  unitPrice:        number
  lastPurchaseDate: Date | null
}

export interface StockPoint {
  date:  Date
  stock: number
}

export interface ProductView {
  id:                   string
  code:                 string
  name:                 string
  category:             ProductCategoryLabel
  brand:                string | null
  unit:                 string
  currentStock:         number
  minimumStock:         number
  reorderQuantity:      number
  purchasePrice:        number
  salePrice:            number
  location:             string | null
  requiresPrescription: boolean
  controlled:           boolean
  invima:               string | null
  status:               ProductStatusLabel
  lots:                 LotView[]
  movements:            MovementView[]
  suppliers:            SupplierView[]
  stockHistory:         StockPoint[]
  lastMovement:         Date | null
}

export interface InventoryStats {
  total:      number
  lowStock:   number
  outOfStock: number
  totalValue: number
}

export const categoryColors: Record<ProductCategoryLabel, { bg: string; text: string }> = {
  Medicamentos:     { bg: "bg-blue-50",   text: "text-blue-700" },
  Vacunas:          { bg: "bg-green-50",  text: "text-green-700" },
  Antiparasitarios: { bg: "bg-purple-50", text: "text-purple-700" },
  Alimentos:        { bg: "bg-amber-50",  text: "text-amber-700" },
  Accesorios:       { bg: "bg-pink-50",   text: "text-pink-700" },
  Instrumental:     { bg: "bg-gray-100",  text: "text-gray-700" },
  Consumibles:      { bg: "bg-cyan-50",   text: "text-cyan-700" },
}

export const statusConfig: Record<ProductStatusLabel, { bg: string; text: string; dot: string }> = {
  Activo:        { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  "Stock bajo":  { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Agotado:       { bg: "bg-red-50",   text: "text-red-700",   dot: "bg-red-500" },
  Descontinuado: { bg: "bg-gray-100", text: "text-gray-500",  dot: "bg-gray-400" },
}
