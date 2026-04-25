"use server"

import { listVeterinarians, listServiceOptions, searchPatientsForAppointment } from "@/lib/queries/appointments"
import { prisma } from "@/lib/prisma"
import { formatAge } from "@/lib/utils/dates"
import { SPECIES_TO_ICON } from "@/lib/validators/appointments"

export async function fetchAppointmentModalData() {
  const [veterinarians, services] = await Promise.all([
    listVeterinarians(),
    listServiceOptions(),
  ])
  return { veterinarians, services }
}

export async function fetchPatientForAppointment(id: string) {
  const p = await prisma.patient.findFirst({
    where:   { id, deletedAt: null },
    include: { owner: true },
  })
  if (!p) return null
  return {
    id:      p.id,
    name:    p.name,
    breed:   p.breed,
    species: SPECIES_TO_ICON[p.species],
    age:     formatAge(p.birthDate),
    weight:  p.weight != null ? `${p.weight} kg` : "—",
    ownerId: p.ownerId,
    owner: {
      id:    p.owner.id,
      name:  p.owner.name,
      phone: p.owner.phone,
      email: p.owner.email ?? "",
    },
  }
}

export async function searchPatientsAction(query: string) {
  return searchPatientsForAppointment(query)
}
