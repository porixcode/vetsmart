import { AppShell } from "@/components/layout/app-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { AgendaToday } from "@/components/dashboard/agenda-today"
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts"
import { UpcomingVaccines } from "@/components/dashboard/upcoming-vaccines"
import { ServicesChart } from "@/components/dashboard/services-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import {
  getDashboardKpis,
  getDashboardAppointmentsToday,
  getDashboardInventoryAlerts,
  getDashboardUpcomingVaccines,
  getDashboardServicesChart,
  getDashboardRecentActivity,
  getDashboardStats,
} from "@/lib/queries/dashboard"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [
    kpiData,
    appointments,
    inventoryAlerts,
    upcomingVaccines,
    servicesData,
    recentActivity,
    occupancyData,
  ] = await Promise.all([
    getDashboardKpis(),
    getDashboardAppointmentsToday(),
    getDashboardInventoryAlerts(),
    getDashboardUpcomingVaccines(),
    getDashboardServicesChart(),
    getDashboardRecentActivity(),
    getDashboardStats(),
  ])

  return (
    <AppShell breadcrumb="Dashboard">
      <div className="space-y-6">
        <DashboardHeader appointmentsToday={appointments.length} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
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
    </AppShell>
  )
}
