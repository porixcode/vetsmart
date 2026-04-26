import "server-only"

import { prisma } from "@/lib/prisma"
import { ATTENTION_ENUM_TO_LABEL, RECORD_STATUS_ENUM_TO_LABEL } from "@/lib/validators/clinical-records"
import type { ClinicalRecord } from "@/lib/types/patient-view"

function mapRecord(r: NonNullable<Awaited<ReturnType<typeof getPatientRecordsRaw>>>[number]): ClinicalRecord {
  return {
    id:            r.id,
    patientId:     r.patientId,
    date:          r.date,
    veterinarian:  r.veterinarian.name,
    visitReason:   r.visitReason,
    soap: {
      subjective: r.subjective ?? "",
      objective:  r.objective ?? "",
      analysis:   r.analysis ?? "",
      plan:       r.plan ?? "",
    },
    diagnosis:     r.diagnoses[0]?.description ?? undefined,
    diagnosisCode: r.diagnoses[0]?.cie10 ?? undefined,
    treatment:     r.treatment ?? undefined,
    nextControl:   r.nextControl ?? undefined,
    attachments:   r.attachments.map(a => a.url),
  }
}

async function getPatientRecordsRaw(patientId: string) {
  return prisma.clinicalRecord.findMany({
    where: { patientId, deletedAt: null },
    orderBy: { date: "desc" },
    include: {
      veterinarian: { select: { name: true } },
      diagnoses:    { select: { cie10: true, description: true } },
      attachments:  { select: { url: true }, take: 5 },
    },
  })
}

export async function getPatientClinicalRecords(patientId: string): Promise<ClinicalRecord[]> {
  const records = await getPatientRecordsRaw(patientId)
  return records.map(mapRecord)
}

export async function getDashboardAppointmentsToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: today, lt: tomorrow },
      deletedAt: null,
    },
    orderBy: { startsAt: "asc" },
    include: {
      patient:      { select: { id: true, name: true, breed: true, species: true } },
      veterinarian: { select: { id: true, name: true } },
      service:      { select: { name: true } },
    },
  })

  return appointments.map(a => ({
    id:         a.id,
    time:       a.startsAt.toTimeString().slice(0, 5),
    patientName: a.patient.name,
    breed:      a.patient.breed,
    service:    a.service?.name ?? "Consulta",
    veterinarian: a.veterinarian.name,
    status:     a.status === "COMPLETADA" ? "completed" as const
              : a.status === "EN_CURSO"   ? "in-progress" as const
              : "pending" as const,
    color:      ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"][Math.floor(Math.random() * 5)],
  }))
}

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
    monthlyIncome,
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

  return {
    appointmentsToday,
    activePatients,
    newThisMonth,
    criticalStock,
    monthlyIncome: monthlyIncome * 80000,
  }
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
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 14)

  return prisma.vaccination.findMany({
    where: {
      dateDue: { gte: now, lte: nextWeek },
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
    CONSULTA: "Consulta general",
    VACUNACION: "Vacunación",
    CIRUGIA: "Cirugía menor",
    CONTROL: "Control general",
    URGENCIA: "Urgencias",
    EXAMEN: "Exámenes",
    DESPARASITACION: "Desparasitación",
    HOSPITALIZACION: "Hospitalización",
  }

  return Object.entries(counts).map(([key, count]) => ({
    name: labelMap[key] ?? key,
    count,
  }))
}
