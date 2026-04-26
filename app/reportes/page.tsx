import { AppShell } from "@/components/layout/app-shell"
import { getReportsData } from "@/lib/queries/reports"
import { ReportesClient } from "./reportes-client"

export const dynamic = "force-dynamic"

export default async function ReportesPage() {
  const data = await getReportsData(30)

  return (
    <AppShell>
      <ReportesClient data={data} />
    </AppShell>
  )
}
