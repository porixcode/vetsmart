import { subDays, format } from "date-fns"
import { es } from "date-fns/locale"

// ─── Daily attendance (30 days current + 30 days previous, deterministic) ───
function dailySeries(seed: number, length: number, base: number, variance: number): number[] {
  const out: number[] = []
  let v = base
  for (let i = 0; i < length; i++) {
    const delta = ((seed * (i + 1) * 7919) % (variance * 2 + 1)) - variance
    v = Math.max(1, v + delta)
    out.push(Math.round(v))
  }
  return out
}

const DAYS = 30
const today = new Date()

const currentSeries = dailySeries(3, DAYS, 10, 4)
const previousSeries = dailySeries(7, DAYS, 8, 3)

export const dailyAttendance = Array.from({ length: DAYS }, (_, i) => ({
  date: format(subDays(today, DAYS - 1 - i), "d MMM", { locale: es }),
  actual: currentSeries[i],
  anterior: previousSeries[i],
}))

// ─── Service distribution ───────────────────────────────────────────────────
export const serviceDistribution = [
  { name: "Consulta",       value: 112, color: "#3B82F6" },
  { name: "Vacunación",     value: 68,  color: "#10B981" },
  { name: "Cirugía",        value: 29,  color: "#EF4444" },
  { name: "Estética",       value: 45,  color: "#EC4899" },
  { name: "Urgencia",       value: 18,  color: "#F59E0B" },
  { name: "Control",        value: 15,  color: "#6366F1" },
]
export const totalServices = serviceDistribution.reduce((s, d) => s + d.value, 0)

// ─── Top breeds ─────────────────────────────────────────────────────────────
export const topBreeds = [
  { breed: "Criollo / Mestizo", count: 78 },
  { breed: "Golden Retriever",  count: 32 },
  { breed: "Schnauzer",         count: 28 },
  { breed: "Pitbull Terrier",   count: 24 },
  { breed: "Labrador Retriever",count: 21 },
  { breed: "Poodle Toy",        count: 19 },
  { breed: "Bulldog Francés",   count: 16 },
  { breed: "Yorkshire Terrier", count: 14 },
  { breed: "Pastor Alemán",     count: 12 },
  { breed: "Persa",             count: 10 },
]

// ─── Vet performance ─────────────────────────────────────────────────────────
export const vetPerformance = [
  {
    id: "vet-1",
    name: "Dra. Marly Jara",
    specialty: "Medicina General",
    color: "#3B82F6",
    atenciones: 98,
    pacientesUnicos: 74,
    ingresos: 4_254_600,
    tiempoPromedio: 28,
    rating: 4.9,
  },
  {
    id: "vet-2",
    name: "Dr. Carlos Mendoza",
    specialty: "Cirugía",
    color: "#10B981",
    atenciones: 62,
    pacientesUnicos: 50,
    ingresos: 5_890_000,
    tiempoPromedio: 55,
    rating: 4.8,
  },
  {
    id: "vet-3",
    name: "Dra. Ana Rodríguez",
    specialty: "Dermatología",
    color: "#F59E0B",
    atenciones: 81,
    pacientesUnicos: 58,
    ingresos: 2_916_000,
    tiempoPromedio: 32,
    rating: 4.7,
  },
  {
    id: "vet-4",
    name: "Dr. Luis Pérez",
    specialty: "Cardiología",
    color: "#8B5CF6",
    atenciones: 46,
    pacientesUnicos: 38,
    ingresos: 3_220_000,
    tiempoPromedio: 42,
    rating: 4.6,
  },
]

// ─── Return rate breakdown ───────────────────────────────────────────────────
export const returnRate = {
  overall: 68,
  breakdown: [
    { label: "1 visita",    pct: 32 },
    { label: "2–3 visitas", pct: 41 },
    { label: "4+ visitas",  pct: 27 },
  ],
}

// ─── Demand heatmap (hour × weekday) ────────────────────────────────────────
// Rows: hours 7–18 (12 rows); Cols: Mon–Sun (7 cols)
// Values are appointment counts (deterministic)
const BASE_HEAT: number[][] = [
  // L   M   X   J   V   S   D
  [ 2,  3,  2,  3,  2,  1,  0],  // 07:00
  [ 5,  7,  6,  7,  5,  3,  1],  // 08:00
  [ 8, 12, 10, 12,  9,  6,  2],  // 09:00
  [10, 14, 12, 14, 11,  8,  3],  // 10:00
  [11, 15, 13, 15, 12,  7,  2],  // 11:00
  [ 6,  8,  7,  8,  7,  5,  1],  // 12:00
  [ 4,  5,  4,  5,  4,  3,  0],  // 13:00
  [ 9, 11, 10, 11,  9,  6,  2],  // 14:00
  [10, 12, 11, 12, 10,  7,  2],  // 15:00
  [ 8,  9,  8,  9,  8,  5,  1],  // 16:00
  [ 5,  6,  5,  6,  5,  3,  0],  // 17:00
  [ 2,  3,  2,  3,  2,  1,  0],  // 18:00
]

export const HEATMAP_HOURS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
export const HEATMAP_DAYS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
export const heatmapData   = BASE_HEAT
export const heatmapMax    = 15  // for color scaling

// ─── Cohort (month of first visit vs months retained) ───────────────────────
export const cohortData = [
  { month: "Nov 2024", m0: 100, m1: 72, m2: 61, m3: 54, m4: 49, m5: 45 },
  { month: "Dic 2024", m0: 100, m1: 68, m2: 57, m3: 51, m4: 46, m5: null },
  { month: "Ene 2025", m0: 100, m1: 74, m2: 63, m3: 58, m4: null, m5: null },
  { month: "Feb 2025", m0: 100, m1: 71, m2: 60, m3: null, m4: null, m5: null },
  { month: "Mar 2025", m0: 100, m1: 69, m2: null, m3: null, m4: null, m5: null },
  { month: "Abr 2025", m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null },
]
export const cohortColumns = ["Mes 0", "Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5"]

// ─── Diagnoses ───────────────────────────────────────────────────────────────
export const diagnoses = [
  { cie10: "L30.9",  descripcion: "Dermatitis inespecífica",               casos: 38, pct: 13.2, edadProm: 4.2, tratamiento: "Corticosteroides tópicos", costoPromedio: 85_000,  tendencia: [3,4,5,6,5,7,8] },
  { cie10: "K29.7",  descripcion: "Gastritis aguda",                        casos: 31, pct: 10.8, edadProm: 5.8, tratamiento: "Omeprazol + dieta blanda",  costoPromedio: 72_000,  tendencia: [4,3,5,4,6,5,4] },
  { cie10: "B88.0",  descripcion: "Parasitosis externa (pulgas/garrapatas)", casos: 28, pct: 9.7,  edadProm: 3.1, tratamiento: "Antiparasitario tópico",    costoPromedio: 95_000,  tendencia: [2,3,3,5,6,7,6] },
  { cie10: "J06.9",  descripcion: "Infección respiratoria superior",         casos: 24, pct: 8.4,  edadProm: 2.7, tratamiento: "Amoxicilina 250mg",         costoPromedio: 68_000,  tendencia: [5,6,4,3,4,3,4] },
  { cie10: "M79.3",  descripcion: "Displasia de cadera",                     casos: 19, pct: 6.6,  edadProm: 7.4, tratamiento: "Meloxicam + fisioterapia",   costoPromedio: 185_000, tendencia: [2,2,3,2,3,3,4] },
  { cie10: "N39.0",  descripcion: "Infección tracto urinario",               casos: 17, pct: 5.9,  edadProm: 6.1, tratamiento: "Enrofloxacina 10 días",      costoPromedio: 78_000,  tendencia: [3,2,3,4,3,2,3] },
  { cie10: "H60.3",  descripcion: "Otitis externa",                          casos: 16, pct: 5.6,  edadProm: 4.5, tratamiento: "Otomax gotas",               costoPromedio: 55_000,  tendencia: [2,3,2,3,2,3,2] },
  { cie10: "E11.9",  descripcion: "Diabetes mellitus tipo II",                casos: 12, pct: 4.2,  edadProm: 9.2, tratamiento: "Insulina + dieta",           costoPromedio: 245_000, tendencia: [1,2,1,2,2,2,2] },
  { cie10: "K56.6",  descripcion: "Obstrucción intestinal parcial",           casos: 9,  pct: 3.1,  edadProm: 3.8, tratamiento: "Cirugía / enema",            costoPromedio: 680_000, tendencia: [1,1,2,1,1,2,1] },
  { cie10: "C80.1",  descripcion: "Neoplasia maligna sin especificar",        casos: 7,  pct: 2.4,  edadProm: 10.3,tratamiento: "Cirugía + quimioterapia",    costoPromedio: 1_250_000,tendencia:[1,1,1,1,1,1,2] },
]

// ─── KPI summary ─────────────────────────────────────────────────────────────
export const kpiSummary = {
  totalAtenciones:   { value: 287,          prev: 256, unit: "",       sparkline: [8,9,11,10,12,10,11,9,10,12,11,13] },
  pacientesUnicos:   { value: 198,          prev: 183, unit: "",       sparkline: [6,7,8,7,9,8,9,7,8,9,10,11] },
  ingresosBrutos:    { value: 12_450_000,   prev: 10_550_000, unit: "COP", sparkline: [380000,420000,410000,450000,430000,460000,440000,470000,450000,480000,490000,500000] },
  ticketPromedio:    { value: 43_380,       prev: 40_935, unit: "COP", sparkline: [38000,39000,40000,39500,41000,40500,42000,41500,43000,42500,44000,43380] },
}

// ─── Report templates ────────────────────────────────────────────────────────
export const reportTemplates = [
  { id: "t1", icon: "CalendarDays",  name: "Atenciones por período",            desc: "Total de citas, cancelaciones, no asistencias y tendencias",  lastRun: "hace 1 día" },
  { id: "t2", icon: "Package",       name: "Inventario y consumo",               desc: "Movimientos de stock, productos críticos y vencimientos",      lastRun: "hace 3 días" },
  { id: "t3", icon: "Stethoscope",   name: "Desempeño por veterinario",          desc: "Atenciones, ingresos, tiempo promedio y calificaciones",       lastRun: "hace 1 semana" },
  { id: "t4", icon: "Users",         name: "Pacientes nuevos vs recurrentes",    desc: "Tasa de retención, cohortes y frecuencia de visitas",          lastRun: "hace 2 días" },
  { id: "t5", icon: "DollarSign",    name: "Estado financiero del período",      desc: "Ingresos, costos, márgenes y comparación vs período anterior", lastRun: "hace 5 días" },
  { id: "t6", icon: "Syringe",       name: "Vacunación y desparasitación",       desc: "Cumplimiento del calendario sanitario y alertas de vencimiento",lastRun: "hace 4 días" },
  { id: "t7", icon: "XCircle",       name: "Cancelaciones y no-asistencias",     desc: "Tasa de cancelación, motivos y patrones temporales",           lastRun: "hace 1 semana" },
  { id: "t8", icon: "Truck",         name: "Proveedores y compras",              desc: "Órdenes de compra, precios y evaluación de proveedores",       lastRun: "hace 2 semanas" },
]
