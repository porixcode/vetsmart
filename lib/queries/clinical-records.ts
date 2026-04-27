import "server-only"

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { ATTENTION_ENUM_TO_LABEL, RECORD_STATUS_ENUM_TO_LABEL } from "@/lib/validators/clinical-records"
import type { ClinicalRecordSearch } from "@/lib/validators/clinical-records"
import type { ClinicalRecordView, RecordVetView } from "@/lib/types/clinical-records-view"
import type { ClinicalRecord } from "@/lib/types/patient-view"

type RawRecord = NonNullable<Awaited<ReturnType<typeof getPatientRecordsRaw>>>[number]

function mapRecordToPatientDetail(r: RawRecord): ClinicalRecord {
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
  return records.map(mapRecordToPatientDetail)
}

const listInclude = {
  patient: {
    select: {
      id: true, name: true, species: true, breed: true, color: true,
      owner: { select: { name: true } },
    },
  },
  veterinarian: {
    select: { id: true, name: true, color: true },
  },
  vitals: true,
  diagnoses: {
    select: { cie10: true, description: true },
  },
  medications: {
    select: { name: true, dose: true, frequency: true, duration: true },
  },
  procedures: {
    select: { code: true, name: true },
  },
  attachments: {
    select: { name: true, type: true, url: true, size: true },
  },
  signedBy: {
    select: { name: true },
  },
}

function mapListRecord(r: Record<string, any>): ClinicalRecordView {
  const typeLabel = ATTENTION_ENUM_TO_LABEL[r.type as keyof typeof ATTENTION_ENUM_TO_LABEL] ?? r.type
  const statusLabel = RECORD_STATUS_ENUM_TO_LABEL[r.status as keyof typeof RECORD_STATUS_ENUM_TO_LABEL] ?? r.status

  const vetName = r.veterinarian.name
  const vetNameParts = vetName.split(" ")
  const lastName = vetNameParts.length > 1 ? vetNameParts[vetNameParts.length - 1] : vetName

  return {
    id: r.id,
    patientId: r.patientId,
    date: r.date,
    type: typeLabel,
    status: statusLabel,
    visitReason: r.visitReason,
    patient: {
      id: r.patient.id,
      name: r.patient.name,
      species: r.patient.species,
      breed: r.patient.breed,
      color: r.patient.color ?? "#6B7280",
    },
    owner: {
      name: r.patient.owner?.name ?? "",
    },
    veterinarian: {
      id: r.veterinarian.id,
      name: vetName,
      lastName,
      color: r.veterinarian.color,
    },
    soap: {
      subjective: r.subjective ?? "",
      objective:  r.objective ?? "",
      analysis:   r.analysis ?? "",
      plan:       r.plan ?? "",
    },
    vitals: r.vitals ? {
      temperature: r.vitals.temperature,
      heartRate:   r.vitals.heartRate,
      respRate:    r.vitals.respRate,
      weight:      r.vitals.weight,
      mucous:      r.vitals.mucous,
    } : null,
    diagnoses: (r.diagnoses ?? []).map((d: any) => ({ cie10: d.cie10, description: d.description })),
    medications: (r.medications ?? []).map((m: any) => ({
      name: m.name, dose: m.dose,
      frequency: m.frequency, duration: m.duration,
    })),
    procedures: (r.procedures ?? []).map((p: any) => ({ code: p.code, name: p.name })),
    files: (r.attachments ?? []).map((a: any) => ({
      name: a.name, type: a.type, url: a.url, size: a.size,
    })),
    attachments: (r.attachments ?? []).length,
    followUp: r.nextControl != null,
    nextControl: r.nextControl,
    duration: null,
    room: null,
    appointmentId: r.appointmentId,
    signedBy: r.signedBy?.name ?? null,
    signedAt: r.signedAt ?? null,
  }
}

async function getRecordsListRaw(search: ClinicalRecordSearch) {
  const rangeStart = new Date()
  rangeStart.setDate(rangeStart.getDate() - search.dateRange)

  const where: Prisma.ClinicalRecordWhereInput = {
    deletedAt: null,
    date: { gte: rangeStart },
  }

  if (search.q) {
    const q = search.q
    where.OR = [
      { visitReason: { contains: q, mode: "insensitive" } },
      { patient: { name: { contains: q, mode: "insensitive" } } },
      { diagnoses: { some: { description: { contains: q, mode: "insensitive" } } } },
      { diagnoses: { some: { cie10: { contains: q, mode: "insensitive" } } } },
    ]
  }

  if (search.veterinarianId) {
    where.veterinarianId = search.veterinarianId
  }

  if (search.type) {
    const typeEnum = Object.entries(ATTENTION_ENUM_TO_LABEL)
      .find(([, v]) => v === search.type)?.[0]
    if (typeEnum) where.type = typeEnum as any
  }

  if (search.species) {
    where.patient = { ...(where.patient as any ?? {}), species: search.species }
  }

  if (search.status) {
    const statusEnum = Object.entries(RECORD_STATUS_ENUM_TO_LABEL)
      .find(([, v]) => v === search.status)?.[0]
    if (statusEnum) where.status = statusEnum as any
  }

  if (search.hasAttachments) {
    where.attachments = { some: {} }
  }

  if (search.hasFollowUp) {
    where.nextControl = { not: null }
  }

  const [records, total] = await Promise.all([
    prisma.clinicalRecord.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (search.page - 1) * search.pageSize,
      take: search.pageSize,
      include: listInclude,
    }),
    prisma.clinicalRecord.count({ where }),
  ])

  return { records, total }
}

export async function getClinicalRecordsList(search: ClinicalRecordSearch) {
  const { records, total } = await getRecordsListRaw(search)
  return {
    records: records.map(mapListRecord),
    total,
    page: search.page,
    pageSize: search.pageSize,
  }
}
