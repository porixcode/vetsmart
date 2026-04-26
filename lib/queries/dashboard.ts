import "server-only"

import { prisma } from "@/lib/prisma"
import { ATTENTION_ENUM_TO_LABEL } from "@/lib/validators/clinical-records"

export async function getDashboardKpis() {
  const now        = new Date()
  const firstOfMon = new Date(now.getFullYear(), now.getMonth(), 1)
  const today      = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow   = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    appointmentsToday,
    activePatients,
    newThisMonth,
    criticalStock,
    completedThisMonth,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { startsAt: { gte: today, lt: tomorrow }, deletedAt: null, status: { not: "CANCELADA" } },
    }),
    prisma.patient.count({
      where: { deletedAt: null, status: { in: ["ACTIVO", "EN_TRATAMIENTO"] } },
    }),
    prisma.patient.count({
      where: { deletedAt: null, createdAt: { gte: firstOfMon } },
    }),
    prisma.product.count({
      where: { deletedAt: null, status: { in: ["STOCK_BAJO", "AGOTADO"] } },
    }),
    prisma.appointment.count({
      where: { startsAt: { gte: firstOfMon }, deletedAt: null, status: "COMPLETADA" },
    }),
  ])

  return [
    {
      label: "Citas hoy",
      value: String(appointmentsToday),
      delta: "programadas hoy",
      deltaType: "neutral" as const,
    },
    {
      label: "Pacientes activos",
      value: String(activePatients),
      delta: `+${newThisMonth} nuevos este mes`,
      deltaType: "positive" as const,
    },
    {
      label: "Stock crítico",
      value: String(criticalStock),
      delta: "productos",
      deltaType: "warning" as const,
    },
    {
      label: "Atenciones del mes",
      value: String(completedThisMonth),
      delta: "completadas",
      deltaType: "positive" as const,
    },
  ]
}

export async function getDashboardAppointmentsToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const appointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: today, lt: tomorrow }, deletedAt: null },
    orderBy: { startsAt: "asc" },
    include: {
      patient:      { select: { id: true, name: true, breed: true } },
      veterinarian: { select: { id: true, name: true } },
      service:      { select: { name: true } },
    },
  })

  const colors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"]

  return appointments.map((a, i) => ({
    id:           a.id,
    time:         a.startsAt.toTimeString().slice(0, 5),
    patientName:  a.patient.name,
    breed:        a.patient.breed,
    service:      a.service?.name ?? "Consulta",
    veterinarian: a.veterinarian.name,
    status:       a.status === "COMPLETADA" ? "completed" as const
                : a.status === "EN_CURSO"   ? "in-progress" as const
                : "pending" as const,
    color: colors[i % colors.length],
  }))
}

export async function getDashboardInventoryAlerts() {
  return prisma.product.findMany({
    where: { deletedAt: null, status: { in: ["STOCK_BAJO", "AGOTADO"] } },
    orderBy: { currentStock: "asc" },
    take: 4,
    select: {
      id: true,
      name: true,
      currentStock: true,
      minimumStock: true,
    },
  })
}

export async function getDashboardUpcomingVaccines() {
  const now = new Date()
  const nextTwoWeeks = new Date(now)
  nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14)

  return prisma.vaccination.findMany({
    where: {
      dateDue: { gte: now, lte: nextTwoWeeks },
      status: { in: ["PENDIENTE", "APLICADA"] },
      patient: { deletedAt: null },
    },
    orderBy: { dateDue: "asc" },
    take: 4,
    include: {
      patient: { select: { id: true, name: true } },
    },
  })
}

export async function getDashboardRecentActivity() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      user: { select: { name: true } },
    },
  })
}

export async function getDashboardServicesChart() {
  const firstOfMonth = new Date()
  firstOfMonth.setDate(1)
  firstOfMonth.setHours(0, 0, 0, 0)

  const records = await prisma.clinicalRecord.findMany({
    where: { date: { gte: firstOfMonth }, deletedAt: null },
    select: { type: true },
  })

  const counts: Record<string, number> = {}
  for (const r of records) {
    const label = ATTENTION_ENUM_TO_LABEL[r.type] ?? r.type
    counts[label] = (counts[label] || 0) + 1
  }

  const labelMap: Record<string, string> = {
    Consulta: "Consulta general",
    Vacunacion: "Vacunación",
    Cirugia: "Cirugía menor",
    Control: "Control general",
    Urgencia: "Urgencias",
    Examen: "Exámenes",
    Desparasitacion: "Desparasitación",
    Hospitalizacion: "Hospitalización",
  }

  return Object.entries(counts).map(([key, count]) => ({
    name: labelMap[key] ?? key,
    count,
  }))
}

export async function getDashboardStats() {
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dailyCounts: { day: string; current: number; previous: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    const dayEnd = new Date(day)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const prevDay = new Date(day)
    prevDay.setDate(prevDay.getDate() - 7)
    const prevDayEnd = new Date(prevDay)
    prevDayEnd.setDate(prevDayEnd.getDate() + 1)

    const [current, previous] = await Promise.all([
      prisma.appointment.count({
        where: { startsAt: { gte: day, lt: dayEnd }, deletedAt: null, status: { not: "CANCELADA" } },
      }),
      prisma.appointment.count({
        where: { startsAt: { gte: prevDay, lt: prevDayEnd }, deletedAt: null, status: { not: "CANCELADA" } },
      }),
    ])

    const maxSlots = 10
    dailyCounts.push({
      day: ["D", "L", "M", "M", "J", "V", "S"][i],
      current: Math.min(Math.round((current / maxSlots) * 100), 100),
      previous: Math.min(Math.round((previous / maxSlots) * 100), 100),
    })
  }

  return dailyCounts
}
