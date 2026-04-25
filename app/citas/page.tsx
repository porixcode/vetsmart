import { addDays, startOfMonth, subMonths } from "date-fns"
import {
  listAppointmentsInRange,
  listVeterinarians,
  listServiceOptions,
  getAppointmentStats,
} from "@/lib/queries/appointments"
import { CitasPageClient } from "./citas-page-client"

export const dynamic = "force-dynamic"

export default async function CitasPage() {
  // Pre-cargamos un rango amplio (mes anterior + 60 días adelante) para que las
  // navegaciones día/semana/mes/lista no requieran refetch en F5.2.
  const now   = new Date()
  const from  = startOfMonth(subMonths(now, 1))
  const to    = addDays(now, 60)

  const [appointments, vets, services, stats] = await Promise.all([
    listAppointmentsInRange(from, to),
    listVeterinarians(),
    listServiceOptions(),
    getAppointmentStats(),
  ])

  return (
    <CitasPageClient
      initialAppointments={appointments}
      veterinarians={vets}
      services={services}
      stats={stats}
    />
  )
}
