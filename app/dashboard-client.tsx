"use client"

import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { AgendaToday } from "@/components/dashboard/agenda-today"
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts"
import { UpcomingVaccines } from "@/components/dashboard/upcoming-vaccines"
import { ServicesChart } from "@/components/dashboard/services-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { downloadCSV } from "@/lib/csv-utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const CURRENCY = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })

export function DashboardClient({ data }: { data: any }) {
  const router = useRouter()

  const { kpiData, appointments, inventoryAlerts, upcomingVaccines, servicesData, recentActivity, occupancyData } = data

  const handleExport = () => {
    const lines = [
      ["Métrica", "Valor", "Detalle"],
      ...kpiData.map((k: any) => [k.label, k.value, k.delta]),
      [],
      ["Citas de hoy"],
      ["Hora", "Paciente", "Servicio", "Veterinario", "Estado"],
      ...appointments.map((a: any) => [a.time, a.patientName, a.service, a.veterinarian, a.status]),
      [],
      ["Alertas de inventario"],
      ["Producto", "Stock", "Mínimo"],
      ...inventoryAlerts.map((i: any) => [i.name, String(i.currentStock), String(i.minimumStock)]),
      [],
      ["Próximas vacunas"],
      ["Paciente", "Vacuna"],
      ...upcomingVaccines.map((v: any) => [v.patient.name, v.vaccineName]),
    ]
    downloadCSV(lines, `dashboard-${format(new Date(), "yyyy-MM-dd", { locale: es })}.csv`)
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        appointmentsToday={appointments.length}
        onExport={handleExport}
        onRefresh={() => router.refresh()}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi: any) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AgendaToday appointments={appointments} />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <InventoryAlerts items={inventoryAlerts} />
          <UpcomingVaccines reminders={upcomingVaccines} />
        </div>
      </div>

      <ServicesChart data={servicesData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity activities={recentActivity} />
        <OccupancyChart data={occupancyData} />
      </div>
    </div>
  )
}
