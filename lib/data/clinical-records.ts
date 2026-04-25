export type AttentionType =
  | "Consulta general" | "Vacunación" | "Desparasitación" | "Cirugía"
  | "Examen" | "Urgencia" | "Control" | "Estética"

export type RecordStatus = "Borrador" | "Finalizado" | "Firmado" | "Anulado"
export type Species = "Canino" | "Felino" | "Otro"

export interface RecordPatient {
  id: string; name: string; species: Species; breed: string; color: string
}
export interface RecordOwner { name: string; phone: string }
export interface RecordVet {
  id: string; name: string; lastName: string; specialty: string; cedula: string; color: string
}
export interface DiagnosisEntry { cie10: string; description: string }
export interface Medication {
  name: string; dosage: string; frequency: string; duration: string
  route: string; notes: string; stockAvailable: number | null
}
export interface RecordProcedure { code: string; name: string }
export interface RecordFile { name: string; type: "pdf" | "image" | "lab"; size: string; date: Date }
export interface Vitals {
  weight: number; temp: number; heartRate: number; respRate: number; mucosas: string; tllc: string
}
export interface ClinicalRecord {
  id: string
  date: Date
  patient: RecordPatient
  owner: RecordOwner
  veterinarian: RecordVet
  type: AttentionType
  reason: string
  diagnoses: DiagnosisEntry[]
  status: RecordStatus
  attachments: number
  followUp: Date | null
  duration: number
  room: string
  appointmentId: string | null
  vitals: Vitals
  soap: { subjective: string; objective: string; analysis: string; plan: string }
  medications: Medication[]
  procedures: RecordProcedure[]
  files: RecordFile[]
  nextControl: Date | null
}

// ─── Config maps ──────────────────────────────────────────────────────────────
export const recordTypeConfig: Record<AttentionType, { bg: string; text: string; dot: string; border: string }> = {
  "Consulta general": { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    border: "border-l-blue-400" },
  "Vacunación":       { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-l-emerald-400" },
  "Desparasitación":  { bg: "bg-teal-50",    text: "text-teal-700",    dot: "bg-teal-500",    border: "border-l-teal-400" },
  "Cirugía":          { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-l-red-400" },
  "Examen":           { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  border: "border-l-violet-400" },
  "Urgencia":         { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   border: "border-l-amber-400" },
  "Control":          { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-500",  border: "border-l-indigo-400" },
  "Estética":         { bg: "bg-pink-50",    text: "text-pink-700",    dot: "bg-pink-500",    border: "border-l-pink-400" },
}

export const recordStatusConfig: Record<RecordStatus, { bg: string; text: string; dot: string }> = {
  "Borrador":   { bg: "bg-gray-100",    text: "text-gray-600",    dot: "bg-gray-400" },
  "Finalizado": { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  "Firmado":    { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "Anulado":    { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500" },
}

// ─── Static reference data ────────────────────────────────────────────────────
export const RECORD_VETS: RecordVet[] = [
  { id: "v1", name: "Dra. Marly Jara",    lastName: "Jara",      specialty: "Medicina General", cedula: "52.847.391", color: "#3B82F6" },
  { id: "v2", name: "Dr. Carlos Mendoza", lastName: "Mendoza",   specialty: "Cirugía",          cedula: "79.234.812", color: "#10B981" },
  { id: "v3", name: "Dra. Ana Rodríguez", lastName: "Rodríguez", specialty: "Dermatología",     cedula: "63.419.287", color: "#F59E0B" },
  { id: "v4", name: "Dr. Luis Pérez",     lastName: "Pérez",     specialty: "Cardiología",      cedula: "80.157.634", color: "#8B5CF6" },
]

const PATIENTS: Array<RecordPatient & { owner: RecordOwner }> = [
  { id:"p1",  name:"Max",   species:"Canino", breed:"Golden Retriever",   color:"#F59E0B", owner:{name:"Carlos Ruiz",      phone:"321-555-0101"} },
  { id:"p2",  name:"Luna",  species:"Felino", breed:"Persa",              color:"#8B5CF6", owner:{name:"María Torres",     phone:"321-555-0102"} },
  { id:"p3",  name:"Rocky", species:"Canino", breed:"Bulldog Francés",    color:"#EF4444", owner:{name:"Andrés López",     phone:"321-555-0103"} },
  { id:"p4",  name:"Bella", species:"Canino", breed:"Labrador Retriever", color:"#10B981", owner:{name:"Sandra Gómez",     phone:"321-555-0104"} },
  { id:"p5",  name:"Milo",  species:"Felino", breed:"Siamés",             color:"#6366F1", owner:{name:"Jorge Castillo",   phone:"321-555-0105"} },
  { id:"p6",  name:"Coco",  species:"Canino", breed:"Schnauzer",          color:"#14B8A6", owner:{name:"Lucía Vargas",     phone:"321-555-0106"} },
  { id:"p7",  name:"Nina",  species:"Canino", breed:"Poodle Toy",         color:"#EC4899", owner:{name:"Felipe Moreno",    phone:"321-555-0107"} },
  { id:"p8",  name:"Thor",  species:"Canino", breed:"Pastor Alemán",      color:"#3B82F6", owner:{name:"Diana Herrera",    phone:"321-555-0108"} },
  { id:"p9",  name:"Simba", species:"Felino", breed:"Angora",             color:"#F97316", owner:{name:"Roberto Silva",    phone:"321-555-0109"} },
  { id:"p10", name:"Lola",  species:"Canino", breed:"Yorkshire Terrier",  color:"#A855F7", owner:{name:"Valentina Cruz",   phone:"321-555-0110"} },
]

const VITALS: Vitals[] = [
  { weight:28.5, temp:38.7, heartRate:95,  respRate:22, mucosas:"Rosadas",    tllc:"< 2s" },
  { weight:4.2,  temp:38.9, heartRate:175, respRate:26, mucosas:"Rosadas",    tllc:"< 2s" },
  { weight:35.0, temp:38.5, heartRate:88,  respRate:18, mucosas:"Pálidas",    tllc:"2-3s" },
  { weight:8.5,  temp:38.6, heartRate:108, respRate:24, mucosas:"Rosadas",    tllc:"< 2s" },
]

const SOAPS = [
  {
    subjective: "Propietario refiere prurito intenso de 3 semanas, principalmente en zona ventral e inguinal. Sin cambios alimentarios recientes.",
    objective: "Eritema difuso en zona inguinal bilateral, hiperpigmentación en pliegues, otitis externa leve bilateral. Ganglios inguinales reactivos.",
    analysis: "Cuadro compatible con dermatitis alérgica de posible origen ambiental. Se descarta sarna por distribución y tipo de lesiones.",
    plan: "Corticosteroides tópicos + champú medicado. Dieta hipoalergénica por 8 semanas. Control en 2 semanas.",
  },
  {
    subjective: "Paciente trae vacuna de refuerzo anual. Sin signos clínicos actuales. Propietario refiere buen apetito y actividad normal.",
    objective: "Examen físico dentro de parámetros normales. Mucosas rosadas. Sin linfadenopatía. BCS 5/9.",
    analysis: "Paciente en buen estado general. Apto para vacunación.",
    plan: "Aplicación de vacuna múltiple + rabia. Desparasitación interna preventiva. Próximo refuerzo en 12 meses.",
  },
  {
    subjective: "Vómito y diarrea desde hace 48 horas, aproximadamente 4-5 episodios/día. Apetito reducido. Sin acceso a basura o tóxicos conocidos.",
    objective: "Deshidratación leve (7%). Dolor a la palpación abdominal media. Borborigmos aumentados. T: 39.2°C.",
    analysis: "Gastroenteritis aguda, posiblemente de origen dietético. Sin signos de obstrucción.",
    plan: "Fluidoterapia IV 24h. Omeprazol + metronidazol. Dieta bland 5 días. Control 72h.",
  },
  {
    subjective: "Control postoperatorio de cirugía de esterilización hace 10 días. Sin signos de complicación según propietario. Sutura íntegra.",
    objective: "Herida quirúrgica limpia, cicatrización por primera intención. Sin signos de infección. Movimiento y actitud normales.",
    analysis: "Evolución postoperatoria satisfactoria. Retiro de puntos al día 12.",
    plan: "Continuar antibiótico 3 días más. Retiro de puntos. Sin restricciones de actividad a partir de semana 3.",
  },
]

const SHARED_MEDS: Medication[][] = [
  [
    { name:"Betametasona tópica",    dosage:"Aplic. local",    frequency:"c/12h",    duration:"10 días", route:"Tópico", notes:"Capa delgada, evitar mucosas",     stockAvailable:24 },
    { name:"Clorexidina shampoo 4%", dosage:"Según necesidad", frequency:"3×/semana",duration:"4 semanas",route:"Tópico", notes:"Dejar actuar 5 min",              stockAvailable:8 },
  ],
  [
    { name:"Vacuna DA2PPL+R",        dosage:"1 dosis",         frequency:"Única",    duration:"—",       route:"SC",     notes:"Aplicar zona escapular derecha",   stockAvailable:42 },
    { name:"Milbemicina oxima",      dosage:"0.5 mg/kg",       frequency:"Única",    duration:"—",       route:"Oral",   notes:"Administrar con alimento",         stockAvailable:60 },
  ],
  [
    { name:"Omeprazol",              dosage:"20 mg",           frequency:"c/12h",    duration:"7 días",  route:"Oral",   notes:"30 min antes del alimento",        stockAvailable:145 },
    { name:"Metronidazol",           dosage:"15 mg/kg",        frequency:"c/12h",    duration:"5 días",  route:"Oral",   notes:"Con alimento, completar esquema",  stockAvailable:3 },
  ],
  [
    { name:"Amoxicilina+Clavulánico", dosage:"12.5 mg/kg",     frequency:"c/12h",   duration:"7 días",  route:"Oral",   notes:"Con alimento",                     stockAvailable:88 },
    { name:"Meloxicam",              dosage:"0.1 mg/kg",       frequency:"c/24h",    duration:"3 días",  route:"Oral",   notes:"Con alimento, no superar dosis",   stockAvailable:32 },
  ],
]

const SHARED_PROCS: RecordProcedure[][] = [
  [{ code:"DERM-01", name:"Limpieza auricular bilateral" }, { code:"DERM-02", name:"Raspado cutáneo diagnóstico" }],
  [{ code:"VAC-01",  name:"Aplicación vacuna múltiple" },   { code:"VAC-02",  name:"Aplicación vacuna antirrábica" }],
  [{ code:"GEN-01",  name:"Examen físico completo" },       { code:"LAB-01",  name:"Hemograma + química sanguínea" }],
  [{ code:"CIR-01",  name:"Ovariohisterectomía" },          { code:"ANE-01",  name:"Anestesia general inhalatoria" }],
]

function makeDate(daysAgo: number, h: number, m: number): Date {
  const d = new Date(2026, 3, 22, h, m, 0)
  d.setDate(d.getDate() - daysAgo)
  return d
}

function makeFollowUp(daysFromNow: number): Date {
  const d = new Date(2026, 3, 22, 10, 0, 0)
  d.setDate(d.getDate() + daysFromNow)
  return d
}

function makeFiles(patientName: string, type: "pdf" | "image" | "lab", daysAgo: number): RecordFile[] {
  if (type === "lab") return [
    { name:`Hemograma_${patientName}.pdf`,   type:"lab",   size:"0.8 MB", date:makeDate(daysAgo, 11, 0) },
    { name:`Bioquímica_${patientName}.pdf`,  type:"lab",   size:"0.6 MB", date:makeDate(daysAgo, 11, 5) },
  ]
  if (type === "image") return [
    { name:`Radiografía_${patientName}.jpg`, type:"image", size:"4.2 MB", date:makeDate(daysAgo, 10, 0) },
  ]
  return [
    { name:`Informe_${patientName}.pdf`,     type:"pdf",   size:"1.1 MB", date:makeDate(daysAgo, 12, 0) },
  ]
}

function record(
  id: string,
  daysAgo: number, h: number, m: number,
  pi: number, vi: number, // patient index, vet index
  type: AttentionType,
  reason: string,
  diagnoses: DiagnosisEntry[],
  status: RecordStatus,
  soapi: number, // soap index
  medi: number,  // meds index (-1 = none)
  proci: number, // procs index (-1 = none)
  filetype: "none" | "pdf" | "image" | "lab",
  followUpDays: number, // 0 = none
  room: string,
  appointmentId: string | null,
): ClinicalRecord {
  const p = PATIENTS[pi]
  const files = filetype !== "none" ? makeFiles(p.name, filetype, daysAgo) : []
  return {
    id,
    date: makeDate(daysAgo, h, m),
    patient: { id:p.id, name:p.name, species:p.species, breed:p.breed, color:p.color },
    owner: p.owner,
    veterinarian: RECORD_VETS[vi],
    type, reason, diagnoses, status,
    attachments: files.length,
    followUp: followUpDays > 0 ? makeFollowUp(followUpDays) : null,
    duration: [25, 35, 45, 60, 20, 55, 30, 40][soapi % 8],
    room,
    appointmentId,
    vitals: VITALS[pi % 4],
    soap: SOAPS[soapi % 4],
    medications: medi >= 0 ? SHARED_MEDS[medi] : [],
    procedures: proci >= 0 ? SHARED_PROCS[proci] : [],
    files,
    nextControl: followUpDays > 0 ? makeFollowUp(followUpDays) : null,
  }
}

export const clinicalRecords: ClinicalRecord[] = [
  record("hr-001",  0, 9,15,  0,0, "Consulta general", "Prurito intenso en zona ventral y orejas, segunda visita",          [{cie10:"L30.9",description:"Dermatitis inespecífica"}],            "Firmado",    0,0,0,"image",14,"Consultorio 1","CIT-00245"),
  record("hr-002",  0,11,30,  1,2, "Examen",            "Control anual + revisión dental preventiva",                        [{cie10:"Z00.0",description:"Examen médico general"}],              "Finalizado", 2,2,2,"lab",  0, "Consultorio 2","CIT-00246"),
  record("hr-003",  1,10, 0,  2,1, "Cirugía",           "Extracción de cuerpo extraño — trozo de hueso en esófago",          [{cie10:"T18.1",description:"Cuerpo extraño en esófago"}],          "Firmado",    3,3,3,"pdf",  7, "Quirófano 1", "CIT-00231"),
  record("hr-004",  2, 8,45,  3,0, "Vacunación",        "Vacuna múltiple anual DA2PPL + refuerzo antirrábico",               [{cie10:"Z23",  description:"Vacunación preventiva"}],              "Firmado",    1,1,1,"none", 0, "Consultorio 1","CIT-00219"),
  record("hr-005",  3,14, 0,  4,3, "Control",           "Seguimiento diabetes mellitus tipo II — ajuste de insulina",        [{cie10:"E11.9",description:"Diabetes mellitus tipo II"}],          "Finalizado", 2,3,2,"lab",  21,"Consultorio 3","CIT-00208"),
  record("hr-006",  4, 9,30,  5,0, "Consulta general",  "Vómito crónico + pérdida de peso progresiva de 6 semanas",          [{cie10:"K29.7",description:"Gastritis aguda"}],                   "Finalizado", 2,2,2,"lab",  10,"Consultorio 1","CIT-00199"),
  record("hr-007",  5,15,15,  6,2, "Estética",          "Baño medicado + corte de pelo raza + limpieza dental con ultrasonido",[{cie10:"Z41.1",description:"Procedimiento estético"}],           "Firmado",    1,3,0,"none", 0, "Estética 1",  null),
  record("hr-008",  5,20,30,  7,1, "Urgencia",          "Trauma por atropellamiento — evaluación y estabilización",          [{cie10:"S09.9",description:"Traumatismo craneoencefálico"},{cie10:"S29.9",description:"Traumatismo de tórax"}],"Firmado",3,3,3,"image",14,"Urgencias","CIT-URG-041"),
  record("hr-009",  6, 9, 0,  8,0, "Vacunación",        "Primera vacuna de la serie inicial — cachorro 8 semanas",           [{cie10:"Z23",  description:"Vacunación preventiva"}],              "Firmado",    1,1,1,"none", 28,"Consultorio 1","CIT-00185"),
  record("hr-010",  7,10,30,  9,3, "Control",           "Revisión cardiológica + ecocardiograma de seguimiento",             [{cie10:"I42.0",description:"Miocardiopatía dilatada"}],            "Firmado",    3,3,2,"lab",  30,"Consultorio 4","CIT-00174"),
  record("hr-011",  9,11, 0,  0,2, "Examen",            "Revisión dermatológica post-tratamiento — evaluación respuesta",    [{cie10:"L30.9",description:"Dermatitis inespecífica"}],            "Firmado",    0,0,0,"image",0, "Consultorio 2","CIT-00162"),
  record("hr-012", 11, 8, 0,  3,1, "Cirugía",           "Esterilización OVH electiva",                                      [{cie10:"Z30.2",description:"Esterilización"}],                    "Firmado",    3,3,3,"pdf",  10,"Quirófano 1","CIT-00151"),
  record("hr-013", 14, 9,30,  5,0, "Desparasitación",   "Desparasitación interna y externa programada trimestral",           [{cie10:"B88.0",description:"Parasitosis externa"}],               "Firmado",    1,1,1,"none", 0, "Consultorio 1","CIT-00139"),
  record("hr-014", 15,14, 0,  7,0, "Consulta general",  "Cojera miembro posterior derecho — evaluación ortopédica",          [{cie10:"M79.3",description:"Displasia de cadera"}],               "Finalizado", 2,3,2,"image",14,"Consultorio 1","CIT-00128"),
  record("hr-015", 17,10,30,  2,3, "Control",           "Control mensual displasia de cadera — ajuste analgesia",            [{cie10:"M79.3",description:"Displasia de cadera"}],               "Finalizado", 3,3,2,"none", 30,"Consultorio 4","CIT-00115"),
  record("hr-016", 19, 9, 0,  1,0, "Consulta general",  "Estornudos frecuentes y secreción nasal serosa bilateral",          [{cie10:"J06.9",description:"Infección respiratoria superior"}],   "Borrador",   2,2,2,"none", 7, "Consultorio 1","CIT-00102"),
  record("hr-017", 21,13, 0,  4,1, "Cirugía",           "Remoción de masa subcutánea región escapular — biopsia intraop",   [{cie10:"C80.1",description:"Neoplasia maligna sin especificar"}], "Firmado",    3,3,3,"pdf",  21,"Quirófano 1","CIT-00091"),
  record("hr-018", 23, 9,45,  6,0, "Vacunación",        "Refuerzo vacuna antirrábica trianual",                              [{cie10:"Z23",  description:"Vacunación preventiva"}],              "Firmado",    1,1,1,"none", 0, "Consultorio 1","CIT-00079"),
  record("hr-019", 25,11, 0,  8,3, "Examen",            "Evaluación cardiológica — soplo grado II detectado en control",     [{cie10:"I34.0",description:"Insuficiencia mitral"}],              "Finalizado", 3,3,2,"lab",  30,"Consultorio 4","CIT-00068"),
  record("hr-020", 27,15,30,  9,2, "Estética",          "Baño y corte de pelo + limpieza de orejas y corte de uñas",         [{cie10:"Z41.1",description:"Procedimiento estético"}],            "Firmado",    1,3,0,"none", 0, "Estética 1",  null),
  record("hr-021", 30, 9, 0,  0,0, "Control",           "Control dermatológico mensual — respuesta al tratamiento",          [{cie10:"L30.9",description:"Dermatitis inespecífica"}],            "Finalizado", 0,0,0,"none", 0, "Consultorio 1","CIT-00058"),
  record("hr-022", 33,10,15,  3,0, "Consulta general",  "Infección urinaria recurrente — tercer episodio en 6 meses",        [{cie10:"N39.0",description:"Infección tracto urinario"}],         "Firmado",    2,3,2,"lab",  14,"Consultorio 1","CIT-00047"),
  record("hr-023", 35,19,30,  5,1, "Urgencia",          "Convulsión tónico-clónica de 4 minutos — primera presentación",    [{cie10:"G40.9",description:"Epilepsia no especificada"}],          "Firmado",    3,3,3,"lab",  7, "Urgencias","CIT-URG-028"),
  record("hr-024", 38,11, 0,  7,2, "Examen",            "Examen dermatológico + toma de muestras para cultivo fúngico",      [{cie10:"B35.9",description:"Tiña no especificada"}],              "Firmado",    0,0,0,"lab",  14,"Consultorio 2","CIT-00036"),
  record("hr-025", 42, 9,30,  2,0, "Vacunación",        "Segunda dosis serie inicial + desparasitación",                     [{cie10:"Z23",  description:"Vacunación preventiva"}],              "Firmado",    1,1,1,"none", 28,"Consultorio 1","CIT-00025"),
  record("hr-026", 47,14, 0,  1,3, "Control",           "Control nefrológico — insuficiencia renal crónica estadio II",      [{cie10:"N18.2",description:"Enfermedad renal crónica estadio II"}],"Anulado",   2,-1,-1,"none",0, "Consultorio 4","CIT-00014"),
  record("hr-027", 52, 9, 0,  4,0, "Consulta general",  "Otitis externa bilateral — segunda consulta sin mejoría",           [{cie10:"H60.3",description:"Otitis externa"}],                    "Firmado",    2,2,2,"pdf",  14,"Consultorio 1","CIT-00003"),
  record("hr-028", 56,10,30,  6,1, "Desparasitación",   "Desparasitación integral + revisión general de salud",              [{cie10:"B88.0",description:"Parasitosis externa"}],               "Firmado",    1,1,1,"none", 0, "Consultorio 1",null),
  record("hr-029", 62, 9,15,  8,0, "Vacunación",        "Vacuna triple felina + leucemia felina",                            [{cie10:"Z23",  description:"Vacunación preventiva"}],              "Firmado",    1,1,1,"none", 0, "Consultorio 1",null),
  record("hr-030", 71,10, 0,  9,0, "Consulta general",  "Primera consulta — revisión general y plan sanitario",              [{cie10:"Z00.0",description:"Examen médico general"}],              "Firmado",    1,1,1,"none", 0, "Consultorio 1","CIT-00001"),
]

export const ATTENTION_TYPES: AttentionType[] = [
  "Consulta general","Vacunación","Desparasitación","Cirugía","Examen","Urgencia","Control","Estética"
]
export const RECORD_STATUSES: RecordStatus[] = ["Borrador","Finalizado","Firmado","Anulado"]
export const SPECIES_LIST: Species[] = ["Canino","Felino","Otro"]
export const TOTAL_RECORDS = 2847
