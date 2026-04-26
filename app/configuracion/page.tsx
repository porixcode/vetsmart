import { getConfigJSON } from "@/lib/queries/config"
import { AppShell } from "@/components/layout/app-shell"
import { ConfiguracionClient } from "./configuracion-client"

export const dynamic = "force-dynamic"

export default async function ConfiguracionPage() {
  const [clinicInfo, schedule] = await Promise.all([
    getConfigJSON<any>("clinic_info", {}),
    getConfigJSON<any>("schedule", {}),
  ])

  return (
    <AppShell>
      <ConfiguracionClient clinicInfo={clinicInfo} schedule={schedule} />
    </AppShell>
  )
}
