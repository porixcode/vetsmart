export type UserRole   = "Administrador" | "Veterinario" | "Recepcionista"
export type UserStatus = "Activo" | "Inactivo" | "Suspendido" | "Pendiente"
export type ActionType = "login" | "logout" | "create" | "update" | "delete" | "view" | "export"
export type DeviceType = "desktop" | "mobile" | "tablet"

export interface SystemUser {
  id: string
  name: string
  email: string
  phone: string
  cedula: string
  role: UserRole
  specialty?: string
  cedulaProfesional?: string
  universidad?: string
  graduationYear?: number
  status: UserStatus
  color: string
  twoFactorEnabled: boolean
  lastActivity: Date
  lastIp: string
  createdAt: Date
  createdBy: string
  birthDate: Date
  gender: "Masculino" | "Femenino"
  address: string
  language: string
  timezone: string
  notifications: { email: boolean; sms: boolean; push: boolean }
}

export interface ActivityEntry {
  id: string
  userId: string
  type: ActionType
  description: string
  module: string
  timestamp: Date
  ip: string
  device: string
}

export interface ActiveSession {
  id: string
  userId: string
  deviceType: DeviceType
  browser: string
  ip: string
  city: string
  startedAt: Date
  lastActivity: Date
  isCurrent: boolean
}

// ─── Role config ──────────────────────────────────────────────────────────────
export const roleConfig: Record<UserRole, { color: string; bg: string; text: string; description: string }> = {
  "Administrador": {
    color: "#8B5CF6", bg: "bg-violet-50", text: "text-violet-700",
    description: "Acceso total al sistema. Puede gestionar usuarios, configuración global, roles y ver todos los reportes y módulos.",
  },
  "Veterinario": {
    color: "#3B82F6", bg: "bg-blue-50", text: "text-blue-700",
    description: "Acceso clínico completo. Puede gestionar pacientes, crear y firmar historiales, manejar citas y ver reportes clínicos.",
  },
  "Recepcionista": {
    color: "#14B8A6", bg: "bg-teal-50", text: "text-teal-700",
    description: "Acceso de recepción. Gestiona citas, registra pacientes nuevos, accede a inventario de forma limitada.",
  },
}

export const statusConfig: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  "Activo":                 { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Inactivo":               { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400" },
  "Suspendido":             { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-500" },
  "Pendiente":              { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500" },
}

// ─── Permissions matrix ───────────────────────────────────────────────────────
export const ALL_PERMISSIONS: Record<string, string[]> = {
  "Pacientes":         ["ver", "crear", "editar", "eliminar", "exportar"],
  "Citas":             ["ver", "crear", "editar", "cancelar", "reagendar"],
  "Historial Clínico": ["ver propios", "ver todos", "crear", "editar", "firmar", "anular"],
  "Inventario":        ["ver", "movimientos", "editar", "configurar"],
  "Reportes":          ["ver básicos", "ver todos", "generar", "exportar", "programar"],
  "Usuarios":          ["ver", "crear", "editar", "suspender", "eliminar", "cambiar roles"],
  "Configuración":     ["ver", "editar"],
}

export const PERMISSIONS_BY_ROLE: Record<UserRole, Record<string, string[]>> = {
  "Administrador": {
    "Pacientes":         ["ver","crear","editar","eliminar","exportar"],
    "Citas":             ["ver","crear","editar","cancelar","reagendar"],
    "Historial Clínico": ["ver propios","ver todos","crear","editar","firmar","anular"],
    "Inventario":        ["ver","movimientos","editar","configurar"],
    "Reportes":          ["ver básicos","ver todos","generar","exportar","programar"],
    "Usuarios":          ["ver","crear","editar","suspender","eliminar","cambiar roles"],
    "Configuración":     ["ver","editar"],
  },
  "Veterinario": {
    "Pacientes":         ["ver","crear","editar"],
    "Citas":             ["ver","crear","editar","cancelar","reagendar"],
    "Historial Clínico": ["ver propios","ver todos","crear","editar","firmar"],
    "Inventario":        ["ver","movimientos"],
    "Reportes":          ["ver básicos","ver todos","generar"],
    "Usuarios":          [],
    "Configuración":     ["ver"],
  },
  "Recepcionista": {
    "Pacientes":         ["ver","crear"],
    "Citas":             ["ver","crear","editar","cancelar","reagendar"],
    "Historial Clínico": ["ver propios"],
    "Inventario":        ["ver"],
    "Reportes":          ["ver básicos"],
    "Usuarios":          [],
    "Configuración":     [],
  },
}

// ─── Date helper ──────────────────────────────────────────────────────────────
function ago(daysAgo: number, h = 10, m = 0): Date {
  const d = new Date(2026, 3, 22, h, m)
  d.setDate(d.getDate() - daysAgo)
  return d
}

// ─── Mock users ───────────────────────────────────────────────────────────────
export const systemUsers: SystemUser[] = [
  // ─ Admins ─
  {
    id:"u1", name:"Lucía Fernández", email:"lucia.fernandez@sermec.com", phone:"310-555-0201",
    cedula:"52.341.876", role:"Administrador", color:"#8B5CF6",
    status:"Activo", twoFactorEnabled:true,
    lastActivity:ago(0,8,30), lastIp:"192.168.1.10", createdAt:ago(730), createdBy:"Sistema",
    birthDate:new Date(1988,4,14), gender:"Femenino", address:"Cra. 7 #45-12, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:true,push:true},
  },
  {
    id:"u2", name:"Andrés Morales", email:"andres.morales@sermec.com", phone:"315-555-0202",
    cedula:"79.821.453", role:"Administrador", color:"#7C3AED",
    status:"Activo", twoFactorEnabled:true,
    lastActivity:ago(1,17,45), lastIp:"192.168.1.12", createdAt:ago(700), createdBy:"Lucía Fernández",
    birthDate:new Date(1985,9,3), gender:"Masculino", address:"Cll. 100 #15-32, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:false,push:true},
  },
  // ─ Vets ─
  {
    id:"u3", name:"Marly Jara", email:"marly.jara@sermec.com", phone:"321-555-0203",
    cedula:"52.847.391", role:"Veterinario", color:"#3B82F6",
    specialty:"Medicina General", cedulaProfesional:"MV-14823", universidad:"Universidad Nacional de Colombia", graduationYear:2012,
    status:"Activo", twoFactorEnabled:true,
    lastActivity:ago(0,9,15), lastIp:"192.168.1.21", createdAt:ago(600), createdBy:"Lucía Fernández",
    birthDate:new Date(1986,1,20), gender:"Femenino", address:"Cra. 15 #82-44, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:true,push:false},
  },
  {
    id:"u4", name:"Carlos Mendoza", email:"carlos.mendoza@sermec.com", phone:"317-555-0204",
    cedula:"79.234.812", role:"Veterinario", color:"#2563EB",
    specialty:"Cirugía", cedulaProfesional:"MV-09547", universidad:"Universidad de Antioquia", graduationYear:2008,
    status:"Activo", twoFactorEnabled:false,
    lastActivity:ago(0,11,0), lastIp:"192.168.1.22", createdAt:ago(580), createdBy:"Lucía Fernández",
    birthDate:new Date(1981,6,7), gender:"Masculino", address:"Cll. 50 #28-10, Medellín",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:false,push:false},
  },
  {
    id:"u5", name:"Ana Rodríguez", email:"ana.rodriguez@sermec.com", phone:"312-555-0205",
    cedula:"63.419.287", role:"Veterinario", color:"#1D4ED8",
    specialty:"Dermatología", cedulaProfesional:"MV-22184", universidad:"Universidad CES", graduationYear:2015,
    status:"Activo", twoFactorEnabled:true,
    lastActivity:ago(0,14,30), lastIp:"192.168.1.23", createdAt:ago(520), createdBy:"Andrés Morales",
    birthDate:new Date(1990,2,15), gender:"Femenino", address:"Av. El Poblado #5-32, Medellín",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:true,push:true},
  },
  {
    id:"u6", name:"Luis Pérez", email:"luis.perez@sermec.com", phone:"318-555-0206",
    cedula:"80.157.634", role:"Veterinario", color:"#1E40AF",
    specialty:"Cardiología", cedulaProfesional:"MV-31042", universidad:"Universidad de La Salle", graduationYear:2010,
    status:"Activo", twoFactorEnabled:false,
    lastActivity:ago(2,16,20), lastIp:"192.168.1.24", createdAt:ago(480), createdBy:"Lucía Fernández",
    birthDate:new Date(1983,11,22), gender:"Masculino", address:"Cra. 4 #72-18, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:false,push:true},
  },
  {
    id:"u7", name:"Valentina Castro", email:"valentina.castro@sermec.com", phone:"311-555-0207",
    cedula:"55.213.897", role:"Veterinario", color:"#3B82F6",
    specialty:"Oncología", cedulaProfesional:"MV-44219", universidad:"Universidad Javeriana", graduationYear:2018,
    status:"Pendiente", twoFactorEnabled:false,
    lastActivity:ago(14,9,0), lastIp:"—", createdAt:ago(14), createdBy:"Andrés Morales",
    birthDate:new Date(1993,7,30), gender:"Femenino", address:"Cll. 93 #11-28, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:false,push:false},
  },
  {
    id:"u8", name:"Mauricio Salazar", email:"mauricio.salazar@sermec.com", phone:"314-555-0208",
    cedula:"71.892.341", role:"Veterinario", color:"#6B7280",
    specialty:"Medicina General", cedulaProfesional:"MV-17654", universidad:"Universidad Udca", graduationYear:2009,
    status:"Suspendido", twoFactorEnabled:false,
    lastActivity:ago(45,11,0), lastIp:"192.168.1.31", createdAt:ago(400), createdBy:"Lucía Fernández",
    birthDate:new Date(1984,3,18), gender:"Masculino", address:"Cll. 26 #38-55, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:false,sms:false,push:false},
  },
  // ─ Recepcionistas ─
  {
    id:"u9", name:"Sandra Gutiérrez", email:"sandra.gutierrez@sermec.com", phone:"320-555-0209",
    cedula:"52.784.126", role:"Recepcionista", color:"#14B8A6",
    status:"Activo", twoFactorEnabled:false,
    lastActivity:ago(0,8,0), lastIp:"192.168.1.41", createdAt:ago(550), createdBy:"Andrés Morales",
    birthDate:new Date(1991,5,12), gender:"Femenino", address:"Cra. 30 #17-21, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:true,push:true},
  },
  {
    id:"u10", name:"Felipe Torres", email:"felipe.torres@sermec.com", phone:"316-555-0210",
    cedula:"80.341.892", role:"Recepcionista", color:"#0D9488",
    status:"Activo", twoFactorEnabled:false,
    lastActivity:ago(0,8,5), lastIp:"192.168.1.42", createdAt:ago(500), createdBy:"Andrés Morales",
    birthDate:new Date(1994,10,8), gender:"Masculino", address:"Cll. 80 #60-14, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:false,push:false},
  },
  {
    id:"u11", name:"María Ospina", email:"maria.ospina@sermec.com", phone:"319-555-0211",
    cedula:"43.218.764", role:"Recepcionista", color:"#14B8A6",
    status:"Activo", twoFactorEnabled:false,
    lastActivity:ago(1,17,30), lastIp:"192.168.1.43", createdAt:ago(420), createdBy:"Lucía Fernández",
    birthDate:new Date(1992,8,25), gender:"Femenino", address:"Cra. 43A #10-50, Medellín",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:true,push:false},
  },
  {
    id:"u12", name:"Jorge Ríos", email:"jorge.rios@sermec.com", phone:"313-555-0212",
    cedula:"91.234.587", role:"Recepcionista", color:"#6B7280",
    status:"Inactivo", twoFactorEnabled:false,
    lastActivity:ago(90,14,0), lastIp:"192.168.1.44", createdAt:ago(380), createdBy:"Andrés Morales",
    birthDate:new Date(1989,0,17), gender:"Masculino", address:"Cll. 34 #25-08, Cali",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:false,sms:false,push:false},
  },
  {
    id:"u13", name:"Diana Acosta", email:"diana.acosta@sermec.com", phone:"322-555-0213",
    cedula:"52.198.431", role:"Recepcionista", color:"#14B8A6",
    status:"Activo", twoFactorEnabled:false,
    lastActivity:ago(0,9,30), lastIp:"192.168.1.45", createdAt:ago(310), createdBy:"Lucía Fernández",
    birthDate:new Date(1995,3,6), gender:"Femenino", address:"Cra. 7 #12-34, Bogotá",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:false,push:true},
  },
  {
    id:"u14", name:"Ricardo Vargas", email:"ricardo.vargas@sermec.com", phone:"308-555-0214",
    cedula:"79.567.321", role:"Recepcionista", color:"#0F766E",
    status:"Activo", twoFactorEnabled:true,
    lastActivity:ago(3,11,15), lastIp:"192.168.1.46", createdAt:ago(260), createdBy:"Andrés Morales",
    birthDate:new Date(1987,6,29), gender:"Masculino", address:"Av. 6N #28-41, Cali",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:true,push:false},
  },
  {
    id:"u15", name:"Paola Jiménez", email:"paola.jimenez@sermec.com", phone:"323-555-0215",
    cedula:"55.432.198", role:"Recepcionista", color:"#14B8A6",
    status:"Pendiente", twoFactorEnabled:false,
    lastActivity:ago(7,0,0), lastIp:"—", createdAt:ago(7), createdBy:"Lucía Fernández",
    birthDate:new Date(1998,1,11), gender:"Femenino", address:"Cll. 53 #45-78, Barranquilla",
    language:"Español", timezone:"America/Bogota",
    notifications:{email:true,sms:false,push:false},
  },
]

// ─── Activity log ──────────────────────────────────────────────────────────────
export const activityLog: ActivityEntry[] = [
  { id:"a1",  userId:"u3", type:"create", module:"Historial Clínico", description:"Creó historial clínico para Max (Golden Retriever)",         timestamp:ago(0,9,20),  ip:"192.168.1.21", device:"Chrome / Windows" },
  { id:"a2",  userId:"u9", type:"create", module:"Citas",             description:"Registró nueva cita para Luna Persa — Dra. Jara",              timestamp:ago(0,8,10),  ip:"192.168.1.41", device:"Chrome / Windows" },
  { id:"a3",  userId:"u1", type:"login",  module:"Sistema",           description:"Inicio de sesión exitoso",                                    timestamp:ago(0,8,0),   ip:"192.168.1.10", device:"Firefox / macOS" },
  { id:"a4",  userId:"u4", type:"update", module:"Historial Clínico", description:"Editó historial quirúrgico de Rocky Bulldog",                  timestamp:ago(0,10,45), ip:"192.168.1.22", device:"Chrome / Windows" },
  { id:"a5",  userId:"u10",type:"create", module:"Pacientes",         description:"Registró nuevo paciente: Coco Schnauzer — Lucía Vargas",       timestamp:ago(0,8,30),  ip:"192.168.1.42", device:"Edge / Windows" },
  { id:"a6",  userId:"u5", type:"view",   module:"Reportes",          description:"Consultó reporte de diagnósticos del mes de abril",             timestamp:ago(0,14,35), ip:"192.168.1.23", device:"Chrome / macOS" },
  { id:"a7",  userId:"u6", type:"update", module:"Citas",             description:"Reagendó cita de Thor — Pastor Alemán al 25 de abril",          timestamp:ago(1,16,10), ip:"192.168.1.24", device:"Safari / iOS" },
  { id:"a8",  userId:"u2", type:"create", module:"Usuarios",          description:"Creó cuenta de usuario para Valentina Castro",                  timestamp:ago(14,9,0),  ip:"192.168.1.12", device:"Chrome / Windows" },
  { id:"a9",  userId:"u3", type:"export", module:"Reportes",          description:"Exportó informe de atenciones del período Mar-Abr 2026",        timestamp:ago(1,11,30), ip:"192.168.1.21", device:"Chrome / Windows" },
  { id:"a10", userId:"u13",type:"update", module:"Citas",             description:"Canceló cita de Bella — Labrador (solicitud del propietario)",  timestamp:ago(1,10,0),  ip:"192.168.1.45", device:"Chrome / Android" },
  { id:"a11", userId:"u1", type:"update", module:"Usuarios",          description:"Suspendió cuenta de Mauricio Salazar",                          timestamp:ago(45,14,0), ip:"192.168.1.10", device:"Firefox / macOS" },
  { id:"a12", userId:"u4", type:"create", module:"Historial Clínico", description:"Firmó historial quirúrgico de Rocky Bulldog (CIR-00041)",       timestamp:ago(1,13,0),  ip:"192.168.1.22", device:"Chrome / Windows" },
  { id:"a13", userId:"u9", type:"view",   module:"Pacientes",         description:"Consultó ficha de paciente Simba Angora",                       timestamp:ago(2,10,30), ip:"192.168.1.41", device:"Chrome / Windows" },
  { id:"a14", userId:"u3", type:"update", module:"Pacientes",         description:"Actualizó peso y vacunas de Bella — Labrador Retriever",        timestamp:ago(2,9,0),   ip:"192.168.1.21", device:"Chrome / Windows" },
  { id:"a15", userId:"u2", type:"export", module:"Reportes",          description:"Exportó reporte financiero del período Q1 2026",                timestamp:ago(3,16,0),  ip:"192.168.1.12", device:"Chrome / Windows" },
  { id:"a16", userId:"u14",type:"login",  module:"Sistema",           description:"Inicio de sesión exitoso desde IP nueva",                      timestamp:ago(3,11,15), ip:"201.234.87.12",device:"Chrome / Windows" },
  { id:"a17", userId:"u5", type:"create", module:"Historial Clínico", description:"Creó plan de tratamiento dermatológico para Max",               timestamp:ago(3,15,0),  ip:"192.168.1.23", device:"Chrome / macOS" },
  { id:"a18", userId:"u1", type:"delete", module:"Usuarios",          description:"Eliminó usuario inactivo (cuenta de prueba)",                   timestamp:ago(7,11,0),  ip:"192.168.1.10", device:"Firefox / macOS" },
  { id:"a19", userId:"u6", type:"view",   module:"Historial Clínico", description:"Consultó historial completo de Lola Yorkshire Terrier",         timestamp:ago(5,14,30), ip:"192.168.1.24", device:"Safari / iOS" },
  { id:"a20", userId:"u9", type:"create", module:"Citas",             description:"Registró 4 citas para la semana del 27 de abril",               timestamp:ago(5,8,0),   ip:"192.168.1.41", device:"Chrome / Windows" },
]

// ─── Active sessions ──────────────────────────────────────────────────────────
export const activeSessions: ActiveSession[] = [
  { id:"s1",  userId:"u1",  deviceType:"desktop", browser:"Firefox 124",      ip:"192.168.1.10", city:"Bogotá",       startedAt:ago(0,8,0),   lastActivity:ago(0,8,30),  isCurrent:false },
  { id:"s2",  userId:"u3",  deviceType:"desktop", browser:"Chrome 124",       ip:"192.168.1.21", city:"Bogotá",       startedAt:ago(0,8,50),  lastActivity:ago(0,9,20),  isCurrent:false },
  { id:"s3",  userId:"u4",  deviceType:"desktop", browser:"Chrome 124",       ip:"192.168.1.22", city:"Bogotá",       startedAt:ago(0,10,30), lastActivity:ago(0,11,0),  isCurrent:false },
  { id:"s4",  userId:"u5",  deviceType:"desktop", browser:"Chrome 124",       ip:"192.168.1.23", city:"Medellín",     startedAt:ago(0,14,0),  lastActivity:ago(0,14,35), isCurrent:false },
  { id:"s5",  userId:"u9",  deviceType:"desktop", browser:"Chrome 124",       ip:"192.168.1.41", city:"Bogotá",       startedAt:ago(0,7,55),  lastActivity:ago(0,8,10),  isCurrent:false },
  { id:"s6",  userId:"u10", deviceType:"desktop", browser:"Edge 124",         ip:"192.168.1.42", city:"Bogotá",       startedAt:ago(0,8,0),   lastActivity:ago(0,8,30),  isCurrent:false },
  { id:"s7",  userId:"u13", deviceType:"mobile",  browser:"Chrome Mobile",    ip:"192.168.1.45", city:"Bogotá",       startedAt:ago(0,9,25),  lastActivity:ago(0,9,30),  isCurrent:false },
  { id:"s8",  userId:"u6",  deviceType:"mobile",  browser:"Safari iOS",       ip:"192.168.1.24", city:"Bogotá",       startedAt:ago(1,15,50), lastActivity:ago(1,16,10), isCurrent:false },
  { id:"s9",  userId:"u14", deviceType:"desktop", browser:"Chrome 124",       ip:"201.234.87.12",city:"Cali",         startedAt:ago(3,11,10), lastActivity:ago(3,11,15), isCurrent:false },
  { id:"s10", userId:"u2",  deviceType:"desktop", browser:"Chrome 124",       ip:"192.168.1.12", city:"Bogotá",       startedAt:ago(1,17,40), lastActivity:ago(1,17,45), isCurrent:false },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getUserById(id: string): SystemUser | undefined {
  return systemUsers.find(u => u.id === id)
}

export function getUserActivity(userId: string): ActivityEntry[] {
  return activityLog.filter(a => a.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function getUserSessions(userId: string): ActiveSession[] {
  return activeSessions.filter(s => s.userId === userId)
}

export function getUserCountByRole(role: UserRole): number {
  return systemUsers.filter(u => u.role === role).length
}

export const ROLES: UserRole[] = ["Administrador", "Veterinario", "Recepcionista"]
export const STATUSES: UserStatus[] = ["Activo", "Inactivo", "Suspendido", "Pendiente"]
