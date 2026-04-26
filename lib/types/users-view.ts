import type { Role, UserStatus } from "@prisma/client"

export type UserRoleLabel = "Administrador" | "Veterinario" | "Recepcionista"
export type UserStatusLabel = "Activo" | "Inactivo" | "Suspendido" | "Pendiente"

export const ROLE_LABEL_TO_ENUM: Record<UserRoleLabel, Role> = {
  Administrador: "ADMIN",
  Veterinario: "VETERINARIO",
  Recepcionista: "RECEPCIONISTA",
}
export const ROLE_ENUM_TO_LABEL: Record<Role, UserRoleLabel> = {
  ADMIN: "Administrador",
  VETERINARIO: "Veterinario",
  RECEPCIONISTA: "Recepcionista",
}

export const STATUS_LABEL_TO_ENUM: Record<UserStatusLabel, UserStatus> = {
  Activo: "ACTIVE",
  Inactivo: "INACTIVE",
  Suspendido: "SUSPENDED",
  Pendiente: "PENDING",
}
export const STATUS_ENUM_TO_LABEL: Record<UserStatus, UserStatusLabel> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
  PENDING: "Pendiente",
}

export const ROLE_CONFIG: Record<UserRoleLabel, { color: string; bg: string; text: string; description: string }> = {
  Administrador: {
    color: "#8B5CF6", bg: "bg-violet-50", text: "text-violet-700",
    description: "Acceso total al sistema. Puede gestionar usuarios, configuración global y ver todos los módulos.",
  },
  Veterinario: {
    color: "#3B82F6", bg: "bg-blue-50", text: "text-blue-700",
    description: "Acceso clínico completo. Puede gestionar pacientes, crear y firmar historiales y manejar citas.",
  },
  Recepcionista: {
    color: "#14B8A6", bg: "bg-teal-50", text: "text-teal-700",
    description: "Acceso de recepción. Gestiona citas, registra pacientes y accede al inventario de forma limitada.",
  },
}

export const STATUS_CONFIG: Record<UserStatusLabel, { bg: string; text: string; dot: string }> = {
  Activo:     { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Inactivo:   { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400" },
  Suspendido: { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-500" },
  Pendiente:  { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500" },
}

export const ALL_PERMISSIONS: Record<string, string[]> = {
  Pacientes:         ["ver", "crear", "editar", "eliminar", "exportar"],
  Citas:             ["ver", "crear", "editar", "cancelar", "reagendar"],
  "Historial Clínico": ["ver propios", "ver todos", "crear", "editar", "firmar", "anular"],
  Inventario:        ["ver", "movimientos", "editar", "configurar"],
  Reportes:          ["ver básicos", "ver todos", "generar", "exportar", "programar"],
  Usuarios:          ["ver", "crear", "editar", "suspender", "eliminar", "cambiar roles"],
  Configuración:     ["ver", "editar"],
}

export const PERMISSIONS_BY_ROLE: Record<UserRoleLabel, Record<string, string[]>> = {
  Administrador: {
    Pacientes:         ["ver","crear","editar","eliminar","exportar"],
    Citas:             ["ver","crear","editar","cancelar","reagendar"],
    "Historial Clínico": ["ver propios","ver todos","crear","editar","firmar","anular"],
    Inventario:        ["ver","movimientos","editar","configurar"],
    Reportes:          ["ver básicos","ver todos","generar","exportar","programar"],
    Usuarios:          ["ver","crear","editar","suspender","eliminar","cambiar roles"],
    Configuración:     ["ver","editar"],
  },
  Veterinario: {
    Pacientes:         ["ver","crear","editar"],
    Citas:             ["ver","crear","editar","cancelar","reagendar"],
    "Historial Clínico": ["ver propios","ver todos","crear","editar","firmar"],
    Inventario:        ["ver","movimientos"],
    Reportes:          ["ver básicos","ver todos","generar"],
    Usuarios:          [],
    Configuración:     ["ver"],
  },
  Recepcionista: {
    Pacientes:         ["ver","crear"],
    Citas:             ["ver","crear","editar","cancelar","reagendar"],
    "Historial Clínico": ["ver propios"],
    Inventario:        ["ver"],
    Reportes:          ["ver básicos"],
    Usuarios:          [],
    Configuración:     [],
  },
}

export interface UserView {
  id:                string
  name:              string
  email:             string
  role:              UserRoleLabel
  status:            UserStatusLabel
  phone:             string
  cedula:            string
  specialty:         string | null
  cedulaProfesional: string | null
  universidad:       string | null
  graduationYear:    number | null
  color:             string
  twoFactorEnabled:  boolean
  lastActivityAt:    Date | null
  lastIp:            string | null
  birthDate:         Date | null
  gender:            string | null
  address:           string | null
  createdAt:         Date
  createdByName:     string | null
}

export interface AuditLogEntry {
  id:          string
  userId:      string | null
  userName:    string | null
  userColor:   string | null
  actionType:  string
  module:      string
  description: string
  ip:          string | null
  device:      string | null
  createdAt:   Date
}

export interface ActiveSessionView {
  id:           string
  userId:       string
  userName:     string
  userRole:     string
  userColor:    string
  deviceType:   string | null
  browser:      string | null
  ip:           string | null
  city:         string | null
  startedAt:    Date
  lastActivity: Date
}

export const ROLES: UserRoleLabel[] = ["Administrador", "Veterinario", "Recepcionista"]
export const STATUSES: UserStatusLabel[] = ["Activo", "Inactivo", "Suspendido", "Pendiente"]
