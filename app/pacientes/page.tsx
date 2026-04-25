import { listPatients, getPatientStats, listActiveVeterinarianNames, listOwners } from "@/lib/queries/patients"
import { PatientSearchSchema } from "@/lib/validators/patients"
import { PatientsPageClient } from "./patients-page-client"

interface Props {
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function PacientesPage({ searchParams }: Props) {
  const sp = await (searchParams ?? Promise.resolve({}))
  const flat: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    flat[k] = Array.isArray(v) ? v[0] : v
  }

  const search = PatientSearchSchema.parse(flat)
  const [patients, stats, vetNames, owners] = await Promise.all([
    listPatients(search),
    getPatientStats(),
    listActiveVeterinarianNames(),
    listOwners(),
  ])

  return (
    <PatientsPageClient
      initialPatients={patients}
      stats={stats}
      vetNames={vetNames}
      owners={owners}
    />
  )
}
