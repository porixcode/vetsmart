import { notFound } from "next/navigation"
import { getPatientDetail } from "@/lib/queries/patients"
import { PatientDetailClient } from "./patient-detail-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params
  const bundle = await getPatientDetail(id)
  if (!bundle) notFound()

  return <PatientDetailClient bundle={bundle} />
}
