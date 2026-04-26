import { prisma } from "@/lib/prisma"

export interface CronResult {
  appointments: number
  vaccines:     number
  stock:        number
}

export async function runAll(): Promise<CronResult> {
  const [appointments, vaccines, stock] = await Promise.all([
    processAppointmentReminders(),
    processVaccineReminders(),
    processStockAlerts(),
  ])
  return { appointments, vaccines, stock }
}

async function processAppointmentReminders(): Promise<number> {
  const now   = new Date()
  const later = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt:    { gte: now, lte: later },
      status:      { not: "CANCELADA" },
      deletedAt:   null,
      reminders:   { none: {} },
    },
    include: {
      patient:      { select: { id: true, name: true } },
      veterinarian: { select: { id: true, name: true } },
      service:      { select: { name: true } },
    },
  })

  if (appointments.length === 0) return 0

  const notifications = appointments.map(a => ({
    userId:      null as string | null,
    patientId:   a.patient.id,
    appointmentId: a.id,
    channel:     "WHATSAPP" as const,
    subject:     "Recordatorio de cita — 24h",
    content: [
      `Recordatorio: cita mañana a las ${a.startsAt.toTimeString().slice(0, 5)}.`,
      `Paciente: ${a.patient.name}.`,
      a.service ? `Servicio: ${a.service.name}.` : "",
      `Veterinario: ${a.veterinarian.name}.`,
    ].filter(Boolean).join(" "),
    scheduledFor: a.startsAt,
  }))

  const reminders = appointments.map(a => ({
    appointmentId: a.id,
    channel: "WHATSAPP" as const,
  }))

  await prisma.$transaction([
    prisma.notification.createMany({ data: notifications }),
    prisma.appointmentReminder.createMany({ data: reminders }),
  ])

  return appointments.length
}

async function processVaccineReminders(): Promise<number> {
  const now   = new Date()
  const later = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const existing = await prisma.notification.findMany({
    where: { subject: "Recordatorio de vacuna", scheduledFor: { gte: now } },
    select: { patientId: true },
  })
  const existingPatientIds = new Set(existing.map(n => n.patientId))

  const vaccinations = await prisma.vaccination.findMany({
    where: {
      dateDue: { gte: now, lte: later },
      status:  { in: ["PENDIENTE", "APLICADA"] },
      patient: { deletedAt: null },
      patientId: { notIn: [...existingPatientIds].filter(Boolean) as string[] },
    },
    include: {
      patient: { select: { id: true, name: true } },
    },
  })

  if (vaccinations.length === 0) return 0

  const notifications = vaccinations.map(v => ({
    userId:    null as string | null,
    patientId: v.patient.id,
    channel:   "WHATSAPP" as const,
    subject:   "Recordatorio de vacuna",
    content:   `La vacuna ${v.vaccineName} de ${v.patient.name} requiere atención.${
      v.dateDue ? ` Vence el ${v.dateDue.toLocaleDateString("es-CO")}.` : ""
    }`,
    scheduledFor: v.dateDue ?? new Date(),
  }))

  await prisma.notification.createMany({ data: notifications })
  return vaccinations.length
}

async function processStockAlerts(): Promise<number> {
  const existing = await prisma.notification.findMany({
    where: { subject: "Alerta de inventario crítico", scheduledFor: { gte: new Date(Date.now() - 86400000) } },
    select: { content: true },
  })
  const existingContent = new Set(existing.map(n => n.content))

  const criticalProducts = await prisma.product.findMany({
    where:  { deletedAt: null, status: { in: ["AGOTADO", "STOCK_BAJO"] } },
    select: { id: true, name: true, status: true, currentStock: true, minimumStock: true },
  })

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null, status: "ACTIVE" },
    select: { id: true },
  })

  if (criticalProducts.length === 0 || admins.length === 0) return 0

  const notifications = criticalProducts.flatMap(p => {
    const content = `${p.name} — ${p.status === "AGOTADO" ? "AGOTADO" : "Stock bajo"} (${p.currentStock}/${p.minimumStock})`
    if (existingContent.has(content)) return []

    return admins.map(a => ({
      userId:    a.id,
      channel:   "EMAIL" as const,
      subject:   "Alerta de inventario crítico",
      content,
      scheduledFor: new Date(),
    }))
  })

  if (notifications.length === 0) return 0

  await prisma.notification.createMany({ data: notifications })
  return notifications.length
}
