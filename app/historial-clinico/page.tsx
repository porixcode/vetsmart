import { getClinicalRecordsList } from "@/lib/queries/clinical-records"
import { ClinicalRecordSearchSchema } from "@/lib/validators/clinical-records"
import { AppShell } from "@/components/layout/app-shell"
import { HistorialClinicoClient } from "./historial-clinico-client"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HistorialClinicoPage({ searchParams }: Props) {
  const sp = await searchParams
  const flat: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    flat[k] = Array.isArray(v) ? v[0] : v ?? ""
  }

  const search = ClinicalRecordSearchSchema.parse(flat)
  const { records, total } = await getClinicalRecordsList(search)

  return (
    <AppShell>
      <HistorialClinicoClient
        initialRecords={records}
        totalCount={total}
        initialSearch={search}
      />
    </AppShell>
  )
}
