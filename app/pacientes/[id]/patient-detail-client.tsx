"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import type { PatientDetailBundle, Note } from "@/lib/types/patient-view"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientDetailSidebar } from "@/components/patients/patient-detail-sidebar"
import { SummaryTab } from "@/components/patients/tabs/summary-tab"
import { ClinicalHistoryTab } from "@/components/patients/tabs/clinical-history-tab"
import { VaccinesTab } from "@/components/patients/tabs/vaccines-tab"
import { DewormingTab } from "@/components/patients/tabs/deworming-tab"
import { DocumentsTab } from "@/components/patients/tabs/documents-tab"
import { NotesTab } from "@/components/patients/tabs/notes-tab"
import { NewClinicalRecordModal } from "@/components/patients/new-clinical-record-modal"
import { archivePatient } from "@/lib/actions/patients"
import { useAppointmentModal } from "@/components/providers/appointment-modal-provider"

interface PatientDetailClientProps {
  bundle: PatientDetailBundle
}

export function PatientDetailClient({ bundle }: PatientDetailClientProps) {
  const router = useRouter()
  const { open: openAppointmentModal } = useAppointmentModal()
  const { patient, clinicalRecords, vaccinations, dewormings, documents, timeline } = bundle

  const [isNewRecordOpen, setIsNewRecordOpen] = React.useState(false)
  const [notes, setNotes] = React.useState<Note[]>(bundle.notes)

  const handleAddNote = (content: string) => {
    setNotes(prev => [{
      id:        `NOTE-${Date.now()}`,
      patientId: patient.id,
      content,
      author:    "Usuario actual",
      createdAt: new Date(),
      pinned:    false,
    }, ...prev])
  }

  const handleTogglePin = (noteId: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n))
  }

  const handleArchive = async () => {
    const result = await archivePatient(patient.id)
    if (result.ok) router.push("/pacientes")
  }

  return (
    <AppShell>
      <div className="flex h-full">
        <PatientDetailSidebar
          patient={patient}
          onNewAppointment={() => openAppointmentModal({ patientId: patient.id })}
          onAddRecord={() => setIsNewRecordOpen(true)}
          onEdit={() => {}}
          onArchive={handleArchive}
        />

        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-6 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => router.push("/pacientes")}
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
            </Button>
            <div>
              <h1 className="font-semibold">{patient.name}</h1>
              <p className="text-xs text-muted-foreground">{patient.breed} · {patient.id}</p>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="summary">
              <TabsList className="mb-6">
                <TabsTrigger value="summary">Resumen</TabsTrigger>
                <TabsTrigger value="history">Historial Clínico</TabsTrigger>
                <TabsTrigger value="vaccines">Vacunas</TabsTrigger>
                <TabsTrigger value="deworming">Desparasitaciones</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <SummaryTab
                  patient={patient}
                  timeline={timeline}
                  totalConsultations={clinicalRecords.length}
                />
              </TabsContent>

              <TabsContent value="history">
                <ClinicalHistoryTab
                  records={clinicalRecords}
                  onNewRecord={() => setIsNewRecordOpen(true)}
                />
              </TabsContent>

              <TabsContent value="vaccines">
                <VaccinesTab vaccinations={vaccinations} onNewVaccine={() => {}} />
              </TabsContent>

              <TabsContent value="deworming">
                <DewormingTab dewormings={dewormings} onNewDeworming={() => {}} />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsTab documents={documents} onUpload={() => {}} />
              </TabsContent>

              <TabsContent value="notes">
                <NotesTab
                  notes={notes}
                  onAddNote={handleAddNote}
                  onTogglePin={handleTogglePin}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <NewClinicalRecordModal
        open={isNewRecordOpen}
        onOpenChange={setIsNewRecordOpen}
        patientName={patient.name}
      />
    </AppShell>
  )
}
