import { AppShell } from "@/components/layout/app-shell"
import { DashboardClient } from "./dashboard-client"
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
  const data = {
    kpiData:           await getDashboardKpis(),
    appointments:      await getDashboardAppointmentsToday(),
    inventoryAlerts:   await getDashboardInventoryAlerts(),
    upcomingVaccines:  await getDashboardUpcomingVaccines(),
    servicesData:      await getDashboardServicesChart(),
    recentActivity:    await getDashboardRecentActivity(),
    occupancyData:     await getDashboardStats(),
  }

  return (
    <AppShell breadcrumb="Dashboard">
      <DashboardClient data={data} />
    </AppShell>
  )
}
