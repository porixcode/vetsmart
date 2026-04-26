import "server-only"

import { prisma } from "@/lib/prisma"
import type { UserSearch } from "@/lib/validators/users"
import {
  ROLE_ENUM_TO_LABEL,
  STATUS_ENUM_TO_LABEL,
  type UserView,
  type AuditLogEntry,
  type ActiveSessionView,
} from "@/lib/types/users-view"

const userSelect = {
  id:                true,
  name:              true,
  email:             true,
  role:              true,
  status:            true,
  phone:             true,
  cedula:            true,
  specialty:         true,
  cedulaProfesional: true,
  universidad:       true,
  graduationYear:    true,
  color:             true,
  twoFactorEnabled:  true,
  lastActivityAt:    true,
  lastIp:            true,
  birthDate:         true,
  gender:            true,
  address:           true,
  createdAt:         true,
  createdBy:         { select: { name: true } },
} as const

type UserRow = Omit<Awaited<ReturnType<typeof getUserRaw>>[number], "createdBy"> & { createdBy: { name: string } | null }

function mapUser(u: UserRow): UserView {
  return {
    id:                u.id,
    name:              u.name,
    email:             u.email,
    role:              ROLE_ENUM_TO_LABEL[u.role],
    status:            STATUS_ENUM_TO_LABEL[u.status],
    phone:             u.phone ?? "",
    cedula:            u.cedula ?? "",
    specialty:         u.specialty,
    cedulaProfesional: u.cedulaProfesional,
    universidad:       u.universidad,
    graduationYear:    u.graduationYear,
    color:             u.color,
    twoFactorEnabled:  u.twoFactorEnabled,
    lastActivityAt:    u.lastActivityAt,
    lastIp:            u.lastIp ?? null,
    birthDate:         u.birthDate,
    gender:            u.gender,
    address:           u.address ?? null,
    createdAt:         u.createdAt,
    createdByName:     u.createdBy?.name ?? null,
  }
}

async function getUserRaw(search?: UserSearch) {
  const where: Record<string, unknown> = { deletedAt: null }

  if (search?.q) {
    const q = search.q
    where.OR = [
      { name:  { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { cedula: { contains: q, mode: "insensitive" } },
    ]
  }

  return prisma.user.findMany({
    where,
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: userSelect,
  })
}

export async function listUsers(search?: UserSearch): Promise<UserView[]> {
  const users = await getUserRaw(search)
  return users.map(u => mapUser(u as UserRow))
}

export async function getUserById(id: string): Promise<UserView | null> {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: userSelect,
  })
  if (!user) return null
  return mapUser(user as UserRow)
}

export async function getUserStats() {
  const [total, byRole, byStatus] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.groupBy({ by: ["role"], where: { deletedAt: null }, _count: true }),
    prisma.user.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
  ])

  return {
    total,
    byRole: Object.fromEntries(byRole.map(r => [r.role, r._count])),
    byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])),
  }
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, color: true } },
    },
  })

  return entries.map(e => ({
    id:          e.id,
    userId:      e.userId,
    userName:    e.user?.name ?? null,
    userColor:   e.user?.color ?? null,
    actionType:  e.actionType,
    module:      e.module,
    description: e.description,
    ip:          e.ip ?? null,
    device:      e.device ?? null,
    createdAt:   e.createdAt,
  }))
}

export async function getUserActivity(userId: string): Promise<AuditLogEntry[]> {
  const entries = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, color: true } },
    },
  })

  return entries.map(e => ({
    id:          e.id,
    userId:      e.userId,
    userName:    e.user?.name ?? null,
    userColor:   e.user?.color ?? null,
    actionType:  e.actionType,
    module:      e.module,
    description: e.description,
    ip:          e.ip ?? null,
    device:      e.device ?? null,
    createdAt:   e.createdAt,
  }))
}

export async function getActiveSessions(): Promise<ActiveSessionView[]> {
  const sessions = await prisma.session.findMany({
    where: { expires: { gt: new Date() } },
    orderBy: { lastActivity: "desc" },
    include: {
      user: { select: { name: true, role: true, color: true } },
    },
  })

  return sessions.map(s => ({
    id:           s.id,
    userId:       s.userId,
    userName:     s.user.name,
    userRole:     ROLE_ENUM_TO_LABEL[s.user.role],
    userColor:    s.user.color,
    deviceType:   s.deviceType,
    browser:      s.browser ?? null,
    ip:           s.ip ?? null,
    city:         s.city ?? null,
    startedAt:    s.lastActivity,
    lastActivity: s.lastActivity,
  }))
}

export async function getUserCountByRole() {
  const groups = await prisma.user.groupBy({
    by: ["role"],
    where: { deletedAt: null },
    _count: true,
  })
  return Object.fromEntries(groups.map(g => [g.role, g._count]))
}
