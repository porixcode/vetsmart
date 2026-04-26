import "server-only"

import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  SPECIES_LABEL_TO_ENUM,
  SPECIES_ENUM_TO_LABEL,
  SEX_ENUM_TO_LABEL,
  STATUS_LABEL_TO_ENUM,
  STATUS_ENUM_TO_LABEL,
  type PatientSearch,
} from "@/lib/validators/patients"
import type {
  Patient as PatientView,
  PatientDetailBundle,
  OwnerView,
  Document,
  TimelineEvent,
} from "@/lib/types/patient-view"

const patientInclude = {
  owner:       true,
  assignedVet: { select: { id: true, name: true } },
  appointments: {
    where:   { status: { in: ["PROGRAMADA", "CONFIRMADA"] }, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take:    1,
    include: { service: { select: { name: true } } },
  },
  clinicalRecords: {
    orderBy: { date: "desc" },
    take:    1,
    select:  { date: true },
  },
} satisfies Prisma.PatientInclude

type PatientRow = Prisma.PatientGetPayload<{ include: typeof patientInclude }>

function mapOwner(o: PatientRow["owner"]): OwnerView {
  return {
    id:         o.id,
    name:       o.name,
    phone:      o.phone,
    email:      o.email ?? "",
    address:    o.address ?? "",
    documentId: o.documentId ?? "",
  }
}

function mapPatient(p: PatientRow): PatientView {
  const nextAppt = p.appointments[0]
  const lastClin = p.clinicalRecords[0]?.date
  return {
    id:        p.id,
    name:      p.name,
    species:   SPECIES_ENUM_TO_LABEL[p.species],
    breed:     p.breed,
    sex:       SEX_ENUM_TO_LABEL[p.sex],
    birthDate: p.birthDate,
    weight:    p.weight ?? 0,
    color:     p.color ?? "",
    neutered:  p.neutered,
    microchip: p.microchip ?? undefined,
    status:    STATUS_ENUM_TO_LABEL[p.status],
    owner:     mapOwner(p.owner),
    assignedVet: p.assignedVet?.name ?? undefined,
    lastVisit:   lastClin ?? undefined,
    nextAppointment: nextAppt
      ? { date: nextAppt.startsAt, service: nextAppt.service?.name ?? "Consulta" }
      : undefined,
    allergies:             p.allergies,
    preexistingConditions: p.preexistingConditions,
    notes:                 p.notes ?? undefined,
  }
}

function buildWhere(search: PatientSearch): Prisma.PatientWhereInput {
  const where: Prisma.PatientWhereInput = { deletedAt: null }

  if (search.q.trim()) {
    const q = search.q.trim()
    where.OR = [
      { name:      { contains: q, mode: "insensitive" } },
      { breed:     { contains: q, mode: "insensitive" } },
      { id:        { contains: q, mode: "insensitive" } },
      { owner:     { OR: [
        { name:       { contains: q, mode: "insensitive" } },
        { documentId: { contains: q, mode: "insensitive" } },
      ] } },
    ]
  }

  if (search.species !== "Todas" && SPECIES_LABEL_TO_ENUM[search.species]) {
    where.species = SPECIES_LABEL_TO_ENUM[search.species]
  }

  if (search.status !== "Todos") {
    if (search.status === "Activos") {
      where.status = { in: ["ACTIVO", "EN_TRATAMIENTO"] }
    } else if (STATUS_LABEL_TO_ENUM[search.status]) {
      where.status = STATUS_LABEL_TO_ENUM[search.status]
    }
  }

  if (search.vet !== "Todos") {
    where.assignedVet = { name: search.vet }
  }

  return where
}

export async function listPatients(search: PatientSearch): Promise<PatientView[]> {
  const where = buildWhere(search)
  const patients = await prisma.patient.findMany({
    where,
    include: patientInclude,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take:    200,
  })
  return patients.map(mapPatient)
}

export async function getPatientStats() {
  const now        = new Date()
  const firstOfMon = new Date(now.getFullYear(), now.getMonth(), 1)

  const [active, newThisMonth, total] = await Promise.all([
    prisma.patient.count({
      where: { deletedAt: null, status: { in: ["ACTIVO", "EN_TRATAMIENTO"] } },
    }),
    prisma.patient.count({
      where: { deletedAt: null, createdAt: { gte: firstOfMon } },
    }),
    prisma.patient.count({ where: { deletedAt: null } }),
  ])

  return { active, newThisMonth, total }
}

export async function getPatientDetail(id: string): Promise<PatientDetailBundle | null> {
  const row = await prisma.patient.findFirst({
    where:   { id, deletedAt: null },
    include: patientInclude,
  })
  if (!row) return null

  const patient = mapPatient(row)

  const [clinicalRecords, vaccinations, dewormings, documents, notes] = await Promise.all([
    prisma.clinicalRecord.findMany({
      where: { patientId: id, deletedAt: null },
      orderBy: { date: "desc" },
      include: {
        veterinarian: { select: { name: true } },
        diagnoses:    { select: { cie10: true, description: true } },
        attachments:  { select: { url: true }, take: 5 },
      },
    }),
    prisma.vaccination.findMany({
      where: { patientId: id },
      orderBy: { dateApplied: "desc" },
    }),
    prisma.deworming.findMany({
      where: { patientId: id },
      orderBy: { dateApplied: "desc" },
    }),
    prisma.patientDocument.findMany({
      where: { patientId: id },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.patientNote.findMany({
      where: { patientId: id },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: { author: { select: { name: true } } },
    }),
  ])

  const timeline: TimelineEvent[] = [
    ...clinicalRecords.map(r => ({
      id: r.id,
      patientId: id,
      type: "Consulta" as const,
      date: r.date,
      title: r.visitReason,
      description: `${r.veterinarian.name} · ${r.diagnoses[0]?.description ?? "Sin diagnóstico"}`,
      veterinarian: r.veterinarian.name,
      recordId: r.id,
    })),
    ...vaccinations.map(v => ({
      id: v.id,
      patientId: id,
      type: "Vacuna" as const,
      date: v.dateApplied,
      title: v.vaccineName,
      description: `Lote: ${v.lotNumber ?? "N/A"}`,
      veterinarian: "",
    })),
    ...dewormings.map(d => ({
      id: d.id,
      patientId: id,
      type: "Desparasitación" as const,
      date: d.dateApplied,
      title: d.product,
      description: `Dosis: ${d.dose}`,
      veterinarian: "",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return {
    patient,
    clinicalRecords: clinicalRecords.map(r => ({
      id: r.id,
      patientId: r.patientId,
      date: r.date,
      veterinarian: r.veterinarian.name,
      visitReason: r.visitReason,
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
    })),
    vaccinations: vaccinations.map(v => ({
      id: v.id,
      patientId: v.patientId,
      vaccineName: v.vaccineName,
      lab: v.lab ?? "",
      dateApplied: v.dateApplied,
      dateDue: v.dateDue ?? undefined,
      appliedBy: "",
      lotNumber: v.lotNumber ?? "",
      status: v.status === "APLICADA" ? "Aplicada" as const : v.status === "PENDIENTE" ? "Pendiente" as const : "Vencida" as const,
    })),
    dewormings: dewormings.map(d => ({
      id: d.id,
      patientId: d.patientId,
      product: d.product,
      dose: d.dose,
      weightAtApplication: d.weightAtApplication ?? 0,
      dateApplied: d.dateApplied,
      nextDue: d.nextDue ?? undefined,
      appliedBy: "",
    })),
    documents: documents.map(d => ({
      id: d.id,
      patientId: d.patientId,
      name: d.name,
      type: (d.type === "PDF" ? "PDF" as const : d.type === "IMAGEN" ? "Imagen" as const : d.type === "LAB" ? "Laboratorio" as const : d.type === "RADIOGRAFIA" ? "Radiografía" as const : d.type === "RECETA" ? "Receta" as const : d.type === "CONSENTIMIENTO" ? "Consentimiento" as const : "Otro" as const),
      category: d.category as Document["category"],
      uploadDate: d.uploadedAt,
      size: d.size ?? "",
      url: d.url,
    })),
    notes: notes.map(n => ({
      id: n.id,
      patientId: n.patientId,
      content: n.content,
      author: n.author.name,
      createdAt: n.createdAt,
      pinned: n.pinned,
    })),
    timeline,
  }
}

export interface OwnerOption {
  id:         string
  name:       string
  documentId: string
  phone:      string
}

export async function listOwners(): Promise<OwnerOption[]> {
  const owners = await prisma.owner.findMany({
    where:   { deletedAt: null },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, documentId: true, phone: true },
  })
  return owners.map(o => ({
    id:         o.id,
    name:       o.name,
    documentId: o.documentId ?? "",
    phone:      o.phone,
  }))
}

export async function listActiveVeterinarianNames(): Promise<string[]> {
  const vets = await prisma.user.findMany({
    where:   { role: "VETERINARIO", status: "ACTIVE", deletedAt: null },
    orderBy: { name: "asc" },
    select:  { name: true },
  })
  return vets.map(v => v.name)
}

export async function searchOwners(q: string) {
  if (!q.trim()) return []
  const owners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name:       { contains: q, mode: "insensitive" } },
        { documentId: { contains: q, mode: "insensitive" } },
        { phone:      { contains: q, mode: "insensitive" } },
      ],
    },
    take:   10,
    select: { id: true, name: true, phone: true, documentId: true },
  })
  return owners
}
