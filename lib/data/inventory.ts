import { subDays, addDays } from "date-fns"

export type ProductCategory =
  | "Medicamentos"
  | "Vacunas"
  | "Antiparasitarios"
  | "Alimentos"
  | "Accesorios"
  | "Instrumental"
  | "Consumibles"

export type ProductStatus = "Activo" | "Agotado" | "Stock bajo" | "Descontinuado"

export type MovementType = "Entrada" | "Salida"

export type MovementReason =
  | "Cita"
  | "Cirugía"
  | "Venta directa"
  | "Daño"
  | "Vencimiento"
  | "Compra"
  | "Otro"

export interface Lot {
  id: string
  lotNumber: string
  quantity: number
  expiryDate: Date
  purchaseDate: Date
  supplier: string
}

export interface StockPoint {
  date: Date
  stock: number
}

export interface Movement {
  id: string
  type: MovementType
  reason: MovementReason
  quantity: number
  date: Date
  reference?: string
  notes?: string
  performedBy: string
  stockBefore: number
  stockAfter: number
}

export interface ProductSupplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  unitPrice: number
  lastPurchaseDate?: Date
}

export interface Product {
  id: string
  name: string
  code: string
  category: ProductCategory
  brand: string
  unit: string
  currentStock: number
  minimumStock: number
  reorderQuantity: number
  status: ProductStatus
  purchasePrice: number
  salePrice: number
  location: string
  requiresPrescription: boolean
  controlled: boolean
  invima?: string
  lots: Lot[]
  suppliers: ProductSupplier[]
  movements: Movement[]
  stockHistory: StockPoint[]
  lastMovement?: Date
}

const today = new Date()

function makeHistory(startStock: number, days = 90): StockPoint[] {
  const points: StockPoint[] = []
  let stock = startStock + Math.floor(Math.random() * 20) + 10
  for (let i = days; i >= 0; i--) {
    const delta = Math.floor(Math.random() * 5) - 2
    stock = Math.max(0, stock + delta)
    points.push({ date: subDays(today, i), stock })
  }
  return points
}

export const products: Product[] = [
  {
    id: "PRD-001",
    name: "Vacuna Antirrábica Nobivac",
    code: "VAC-001",
    category: "Vacunas",
    brand: "MSD Animal Health",
    unit: "dosis",
    currentStock: 3,
    minimumStock: 10,
    reorderQuantity: 30,
    status: "Stock bajo",
    purchasePrice: 18500,
    salePrice: 35000,
    location: "Refrigerador A",
    requiresPrescription: false,
    controlled: false,
    invima: "2019M-0012345",
    lots: [
      { id: "L001", lotNumber: "NR240115", quantity: 3, expiryDate: addDays(today, 180), purchaseDate: subDays(today, 90), supplier: "Dromedario Vet" },
    ],
    suppliers: [
      { id: "S1", name: "Dromedario Vet S.A.S", contact: "Andrés Muñoz", phone: "+57 1 234 5678", email: "ventas@dromedario.com.co", unitPrice: 18500, lastPurchaseDate: subDays(today, 90) },
      { id: "S2", name: "Veterquímica", contact: "Sandra López", phone: "+57 1 345 6789", email: "comercial@veterquimica.com", unitPrice: 19200 },
    ],
    movements: [
      { id: "M1", type: "Salida", reason: "Cita", quantity: 2, date: subDays(today, 3), reference: "CIT-00234", performedBy: "Dra. Marly Jara", stockBefore: 5, stockAfter: 3 },
      { id: "M2", type: "Entrada", reason: "Compra", quantity: 20, date: subDays(today, 30), performedBy: "Administración", stockBefore: 1, stockAfter: 21 },
      { id: "M3", type: "Salida", reason: "Cita", quantity: 5, date: subDays(today, 15), reference: "CIT-00198", performedBy: "Dr. Carlos Mendoza", stockBefore: 21, stockAfter: 16 },
      { id: "M4", type: "Salida", reason: "Venta directa", quantity: 3, date: subDays(today, 10), performedBy: "Recepción", stockBefore: 16, stockAfter: 13 },
      { id: "M5", type: "Salida", reason: "Cita", quantity: 10, date: subDays(today, 5), reference: "CIT-00220", performedBy: "Dra. Ana Rodríguez", stockBefore: 13, stockAfter: 3 },
    ],
    stockHistory: makeHistory(3),
    lastMovement: subDays(today, 3),
  },
  {
    id: "PRD-002",
    name: "Vacuna Séxtuple Vanguard Plus 5",
    code: "VAC-002",
    category: "Vacunas",
    brand: "Zoetis",
    unit: "dosis",
    currentStock: 22,
    minimumStock: 15,
    reorderQuantity: 40,
    status: "Activo",
    purchasePrice: 22000,
    salePrice: 42000,
    location: "Refrigerador A",
    requiresPrescription: false,
    controlled: false,
    invima: "2020M-0034512",
    lots: [
      { id: "L002", lotNumber: "VP240301", quantity: 12, expiryDate: addDays(today, 240), purchaseDate: subDays(today, 45), supplier: "Zoetis Colombia" },
      { id: "L003", lotNumber: "VP240201", quantity: 10, expiryDate: addDays(today, 140), purchaseDate: subDays(today, 85), supplier: "Zoetis Colombia" },
    ],
    suppliers: [
      { id: "S3", name: "Zoetis Colombia S.A.S", contact: "Ricardo Fuentes", phone: "+57 1 456 7890", email: "colomventas@zoetis.com", unitPrice: 22000, lastPurchaseDate: subDays(today, 45) },
    ],
    movements: [
      { id: "M6", type: "Entrada", reason: "Compra", quantity: 40, date: subDays(today, 45), performedBy: "Administración", stockBefore: 5, stockAfter: 45 },
      { id: "M7", type: "Salida", reason: "Cita", quantity: 8, date: subDays(today, 20), reference: "CIT-00205", performedBy: "Dra. Marly Jara", stockBefore: 45, stockAfter: 37 },
      { id: "M8", type: "Salida", reason: "Cita", quantity: 15, date: subDays(today, 8), reference: "CIT-00215", performedBy: "Dr. Luis Pérez", stockBefore: 37, stockAfter: 22 },
    ],
    stockHistory: makeHistory(22),
    lastMovement: subDays(today, 8),
  },
  {
    id: "PRD-003",
    name: "Bravecto Masticable 20-40 kg",
    code: "ANT-001",
    category: "Antiparasitarios",
    brand: "MSD Animal Health",
    unit: "tableta",
    currentStock: 2,
    minimumStock: 8,
    reorderQuantity: 20,
    status: "Stock bajo",
    purchasePrice: 82000,
    salePrice: 145000,
    location: "Bodega A - Estante 2",
    requiresPrescription: false,
    controlled: false,
    invima: "2018M-0056789",
    lots: [
      { id: "L004", lotNumber: "BRV240101", quantity: 2, expiryDate: addDays(today, 365), purchaseDate: subDays(today, 60), supplier: "Dromedario Vet" },
    ],
    suppliers: [
      { id: "S1", name: "Dromedario Vet S.A.S", contact: "Andrés Muñoz", phone: "+57 1 234 5678", email: "ventas@dromedario.com.co", unitPrice: 82000, lastPurchaseDate: subDays(today, 60) },
    ],
    movements: [
      { id: "M9", type: "Entrada", reason: "Compra", quantity: 20, date: subDays(today, 60), performedBy: "Administración", stockBefore: 0, stockAfter: 20 },
      { id: "M10", type: "Salida", reason: "Venta directa", quantity: 18, date: subDays(today, 14), performedBy: "Recepción", stockBefore: 20, stockAfter: 2 },
    ],
    stockHistory: makeHistory(2),
    lastMovement: subDays(today, 14),
  },
  {
    id: "PRD-004",
    name: "Amoxicilina 250 mg/5 ml Suspensión",
    code: "MED-001",
    category: "Medicamentos",
    brand: "Genfar",
    unit: "frasco",
    currentStock: 18,
    minimumStock: 10,
    reorderQuantity: 25,
    status: "Activo",
    purchasePrice: 12500,
    salePrice: 22000,
    location: "Bodega A - Estante 1",
    requiresPrescription: true,
    controlled: false,
    invima: "2017M-0078901",
    lots: [
      { id: "L005", lotNumber: "AMX240215", quantity: 18, expiryDate: addDays(today, 300), purchaseDate: subDays(today, 20), supplier: "Distribuciones Farma" },
    ],
    suppliers: [
      { id: "S4", name: "Distribuciones Farma Ltda", contact: "Paula Herrera", phone: "+57 1 567 8901", email: "pedidos@distfarma.co", unitPrice: 12500, lastPurchaseDate: subDays(today, 20) },
    ],
    movements: [
      { id: "M11", type: "Entrada", reason: "Compra", quantity: 25, date: subDays(today, 20), performedBy: "Administración", stockBefore: 2, stockAfter: 27 },
      { id: "M12", type: "Salida", reason: "Cita", quantity: 9, date: subDays(today, 6), reference: "CIT-00228", performedBy: "Dra. Marly Jara", stockBefore: 27, stockAfter: 18 },
    ],
    stockHistory: makeHistory(18),
    lastMovement: subDays(today, 6),
  },
  {
    id: "PRD-005",
    name: "Meloxicam 1.5 mg/ml Inyectable",
    code: "MED-002",
    category: "Medicamentos",
    brand: "Boehringer Ingelheim",
    unit: "frasco 20ml",
    currentStock: 7,
    minimumStock: 5,
    reorderQuantity: 15,
    status: "Activo",
    purchasePrice: 38000,
    salePrice: 68000,
    location: "Refrigerador B",
    requiresPrescription: true,
    controlled: false,
    invima: "2019M-0091234",
    lots: [
      { id: "L006", lotNumber: "MEL240112", quantity: 7, expiryDate: addDays(today, 200), purchaseDate: subDays(today, 35), supplier: "Veterquímica" },
    ],
    suppliers: [
      { id: "S2", name: "Veterquímica", contact: "Sandra López", phone: "+57 1 345 6789", email: "comercial@veterquimica.com", unitPrice: 38000, lastPurchaseDate: subDays(today, 35) },
    ],
    movements: [
      { id: "M13", type: "Entrada", reason: "Compra", quantity: 15, date: subDays(today, 35), performedBy: "Administración", stockBefore: 1, stockAfter: 16 },
      { id: "M14", type: "Salida", reason: "Cirugía", quantity: 9, date: subDays(today, 12), reference: "CIR-00045", performedBy: "Dr. Carlos Mendoza", stockBefore: 16, stockAfter: 7 },
    ],
    stockHistory: makeHistory(7),
    lastMovement: subDays(today, 12),
  },
  {
    id: "PRD-006",
    name: "Tramadol Clorhidrato 50 mg",
    code: "MED-003",
    category: "Medicamentos",
    brand: "Laboratorios Liomont",
    unit: "caja x30",
    currentStock: 4,
    minimumStock: 5,
    reorderQuantity: 10,
    status: "Stock bajo",
    purchasePrice: 55000,
    salePrice: 95000,
    location: "Caja fuerte - Controlados",
    requiresPrescription: true,
    controlled: true,
    invima: "2016M-0045678",
    lots: [
      { id: "L007", lotNumber: "TRM240105", quantity: 4, expiryDate: addDays(today, 420), purchaseDate: subDays(today, 50), supplier: "Distribuciones Farma" },
    ],
    suppliers: [
      { id: "S4", name: "Distribuciones Farma Ltda", contact: "Paula Herrera", phone: "+57 1 567 8901", email: "pedidos@distfarma.co", unitPrice: 55000, lastPurchaseDate: subDays(today, 50) },
    ],
    movements: [
      { id: "M15", type: "Entrada", reason: "Compra", quantity: 10, date: subDays(today, 50), performedBy: "Administración", stockBefore: 0, stockAfter: 10 },
      { id: "M16", type: "Salida", reason: "Cirugía", quantity: 6, date: subDays(today, 18), reference: "CIR-00041", performedBy: "Dr. Carlos Mendoza", stockBefore: 10, stockAfter: 4 },
    ],
    stockHistory: makeHistory(4),
    lastMovement: subDays(today, 18),
  },
  {
    id: "PRD-007",
    name: "Suero Fisiológico NaCl 0.9% 250ml",
    code: "CON-001",
    category: "Consumibles",
    brand: "Baxter",
    unit: "bolsa",
    currentStock: 0,
    minimumStock: 15,
    reorderQuantity: 50,
    status: "Agotado",
    purchasePrice: 8500,
    salePrice: 16000,
    location: "Bodega B - Estante 1",
    requiresPrescription: false,
    controlled: false,
    invima: "2015M-0023456",
    lots: [],
    suppliers: [
      { id: "S5", name: "Medisalud Colombia", contact: "Jorge Patiño", phone: "+57 1 678 9012", email: "info@medisalud.com.co", unitPrice: 8500, lastPurchaseDate: subDays(today, 75) },
    ],
    movements: [
      { id: "M17", type: "Entrada", reason: "Compra", quantity: 50, date: subDays(today, 75), performedBy: "Administración", stockBefore: 0, stockAfter: 50 },
      { id: "M18", type: "Salida", reason: "Cirugía", quantity: 50, date: subDays(today, 2), reference: "CIR-00048", performedBy: "Dr. Carlos Mendoza", stockBefore: 50, stockAfter: 0 },
    ],
    stockHistory: makeHistory(0),
    lastMovement: subDays(today, 2),
  },
  {
    id: "PRD-008",
    name: "Jeringa Desechable 5ml c/aguja",
    code: "CON-002",
    category: "Consumibles",
    brand: "BD Plastipak",
    unit: "caja x100",
    currentStock: 15,
    minimumStock: 50,
    reorderQuantity: 100,
    status: "Stock bajo",
    purchasePrice: 28000,
    salePrice: 45000,
    location: "Bodega A - Estante 3",
    requiresPrescription: false,
    controlled: false,
    lots: [
      { id: "L008", lotNumber: "BD240201", quantity: 15, expiryDate: addDays(today, 730), purchaseDate: subDays(today, 40), supplier: "Medisalud Colombia" },
    ],
    suppliers: [
      { id: "S5", name: "Medisalud Colombia", contact: "Jorge Patiño", phone: "+57 1 678 9012", email: "info@medisalud.com.co", unitPrice: 28000, lastPurchaseDate: subDays(today, 40) },
    ],
    movements: [
      { id: "M19", type: "Entrada", reason: "Compra", quantity: 100, date: subDays(today, 40), performedBy: "Administración", stockBefore: 0, stockAfter: 100 },
      { id: "M20", type: "Salida", reason: "Cita", quantity: 85, date: subDays(today, 5), performedBy: "Recepción", stockBefore: 100, stockAfter: 15 },
    ],
    stockHistory: makeHistory(15),
    lastMovement: subDays(today, 5),
  },
  {
    id: "PRD-009",
    name: "Frontline Spray 250ml",
    code: "ANT-002",
    category: "Antiparasitarios",
    brand: "Boehringer Ingelheim",
    unit: "frasco",
    currentStock: 9,
    minimumStock: 5,
    reorderQuantity: 12,
    status: "Activo",
    purchasePrice: 45000,
    salePrice: 79000,
    location: "Bodega A - Estante 2",
    requiresPrescription: false,
    controlled: false,
    invima: "2018M-0067890",
    lots: [
      { id: "L009", lotNumber: "FRN240215", quantity: 9, expiryDate: addDays(today, 540), purchaseDate: subDays(today, 25), supplier: "Veterquímica" },
    ],
    suppliers: [
      { id: "S2", name: "Veterquímica", contact: "Sandra López", phone: "+57 1 345 6789", email: "comercial@veterquimica.com", unitPrice: 45000, lastPurchaseDate: subDays(today, 25) },
    ],
    movements: [
      { id: "M21", type: "Entrada", reason: "Compra", quantity: 12, date: subDays(today, 25), performedBy: "Administración", stockBefore: 2, stockAfter: 14 },
      { id: "M22", type: "Salida", reason: "Venta directa", quantity: 5, date: subDays(today, 7), performedBy: "Recepción", stockBefore: 14, stockAfter: 9 },
    ],
    stockHistory: makeHistory(9),
    lastMovement: subDays(today, 7),
  },
  {
    id: "PRD-010",
    name: "Dexametasona 4mg/ml Inyectable",
    code: "MED-004",
    category: "Medicamentos",
    brand: "Pfizer Animal Health",
    unit: "frasco 10ml",
    currentStock: 11,
    minimumStock: 6,
    reorderQuantity: 18,
    status: "Activo",
    purchasePrice: 24000,
    salePrice: 42000,
    location: "Refrigerador B",
    requiresPrescription: true,
    controlled: false,
    invima: "2017M-0089012",
    lots: [
      { id: "L010", lotNumber: "DEX240220", quantity: 11, expiryDate: addDays(today, 310), purchaseDate: subDays(today, 15), supplier: "Dromedario Vet" },
    ],
    suppliers: [
      { id: "S1", name: "Dromedario Vet S.A.S", contact: "Andrés Muñoz", phone: "+57 1 234 5678", email: "ventas@dromedario.com.co", unitPrice: 24000, lastPurchaseDate: subDays(today, 15) },
    ],
    movements: [
      { id: "M23", type: "Entrada", reason: "Compra", quantity: 18, date: subDays(today, 15), performedBy: "Administración", stockBefore: 3, stockAfter: 21 },
      { id: "M24", type: "Salida", reason: "Cirugía", quantity: 10, date: subDays(today, 4), reference: "CIR-00049", performedBy: "Dr. Carlos Mendoza", stockBefore: 21, stockAfter: 11 },
    ],
    stockHistory: makeHistory(11),
    lastMovement: subDays(today, 4),
  },
  {
    id: "PRD-011",
    name: "Guantes de Látex Talla M",
    code: "CON-003",
    category: "Consumibles",
    brand: "Ansell",
    unit: "caja x100",
    currentStock: 6,
    minimumStock: 4,
    reorderQuantity: 10,
    status: "Activo",
    purchasePrice: 35000,
    salePrice: 58000,
    location: "Bodega A - Estante 3",
    requiresPrescription: false,
    controlled: false,
    lots: [
      { id: "L011", lotNumber: "GL240310", quantity: 6, expiryDate: addDays(today, 1095), purchaseDate: subDays(today, 10), supplier: "Medisalud Colombia" },
    ],
    suppliers: [
      { id: "S5", name: "Medisalud Colombia", contact: "Jorge Patiño", phone: "+57 1 678 9012", email: "info@medisalud.com.co", unitPrice: 35000, lastPurchaseDate: subDays(today, 10) },
    ],
    movements: [
      { id: "M25", type: "Entrada", reason: "Compra", quantity: 10, date: subDays(today, 10), performedBy: "Administración", stockBefore: 1, stockAfter: 11 },
      { id: "M26", type: "Salida", reason: "Cita", quantity: 5, date: subDays(today, 2), performedBy: "Recepción", stockBefore: 11, stockAfter: 6 },
    ],
    stockHistory: makeHistory(6),
    lastMovement: subDays(today, 2),
  },
  {
    id: "PRD-012",
    name: "Hill's Prescription Diet k/d 4kg",
    code: "ALI-001",
    category: "Alimentos",
    brand: "Hill's Pet Nutrition",
    unit: "bolsa",
    currentStock: 5,
    minimumStock: 3,
    reorderQuantity: 10,
    status: "Activo",
    purchasePrice: 98000,
    salePrice: 168000,
    location: "Bodega B - Estante 2",
    requiresPrescription: false,
    controlled: false,
    lots: [
      { id: "L012", lotNumber: "HLS240301", quantity: 5, expiryDate: addDays(today, 365), purchaseDate: subDays(today, 20), supplier: "Distribuidora Mascotas" },
    ],
    suppliers: [
      { id: "S6", name: "Distribuidora Mascotas SAS", contact: "Camila Torres", phone: "+57 1 789 0123", email: "comercial@distmascotas.co", unitPrice: 98000, lastPurchaseDate: subDays(today, 20) },
    ],
    movements: [
      { id: "M27", type: "Entrada", reason: "Compra", quantity: 10, date: subDays(today, 20), performedBy: "Administración", stockBefore: 0, stockAfter: 10 },
      { id: "M28", type: "Salida", reason: "Venta directa", quantity: 5, date: subDays(today, 5), performedBy: "Recepción", stockBefore: 10, stockAfter: 5 },
    ],
    stockHistory: makeHistory(5),
    lastMovement: subDays(today, 5),
  },
]

export const categoryColors: Record<ProductCategory, { bg: string; text: string }> = {
  Medicamentos: { bg: "bg-blue-50", text: "text-blue-700" },
  Vacunas: { bg: "bg-green-50", text: "text-green-700" },
  Antiparasitarios: { bg: "bg-purple-50", text: "text-purple-700" },
  Alimentos: { bg: "bg-amber-50", text: "text-amber-700" },
  Accesorios: { bg: "bg-pink-50", text: "text-pink-700" },
  Instrumental: { bg: "bg-gray-100", text: "text-gray-700" },
  Consumibles: { bg: "bg-cyan-50", text: "text-cyan-700" },
}

export const statusConfig: Record<ProductStatus, { bg: string; text: string; dot: string }> = {
  Activo: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  "Stock bajo": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Agotado: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  Descontinuado: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getLowStockProducts(): Product[] {
  return products.filter(p => p.currentStock <= p.minimumStock && p.status !== "Descontinuado")
}

export function getInventoryStats() {
  const total = products.length
  const lowStock = products.filter(p => p.status === "Stock bajo").length
  const outOfStock = products.filter(p => p.status === "Agotado").length
  const totalValue = products.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0)
  return { total, lowStock, outOfStock, totalValue }
}
