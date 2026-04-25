import { AppShell } from "@/components/layout/app-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { AgendaToday } from "@/components/dashboard/agenda-today"
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts"
import { UpcomingVaccines } from "@/components/dashboard/upcoming-vaccines"
import { ServicesChart } from "@/components/dashboard/services-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"

const kpiData = [
  {
    label: "Citas hoy",
    value: "8",
    delta: "+12% vs ayer",
    deltaType: "positive" as const,
    sparklineData: [4, 6, 5, 8, 7, 6, 8],
  },
  {
    label: "Pacientes activos",
    value: "247",
    delta: "+3 nuevos esta semana",
    deltaType: "positive" as const,
    sparklineData: [230, 235, 238, 242, 244, 245, 247],
  },
  {
    label: "Stock crítico",
    value: "4",
    delta: "productos",
    deltaType: "warning" as const,
    sparklineData: [2, 3, 2, 4, 3, 4, 4],
  },
  {
    label: "Ingresos del mes",
    value: "$4.280.000",
    delta: "+18% vs mes anterior",
    deltaType: "positive" as const,
    sparklineData: [3200000, 3500000, 3800000, 4000000, 4100000, 4200000, 4280000],
  },
]

export default function DashboardPage() {
  return (
    <AppShell breadcrumb="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader />

        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaType={kpi.deltaType}
              sparklineData={kpi.sparklineData}
            />
          ))}
        </div>

        {/* Row 2: Agenda + Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Agenda - 8 columns */}
          <div className="lg:col-span-8">
            <AgendaToday />
          </div>

          {/* Sidebar Cards - 4 columns */}
          <div className="space-y-6 lg:col-span-4">
            <InventoryAlerts />
            <UpcomingVaccines />
          </div>
        </div>

        {/* Row 3: Services Chart (Full Width) */}
        <ServicesChart />

        {/* Row 4: Activity + Occupancy */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity />
          <OccupancyChart />
        </div>
      </div>
    </AppShell>
  )
}
