"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { NewAppointmentModal, type AppointmentPatientOption } from "@/components/appointments/new-appointment-modal"
import type { VeterinarianView, ServiceOption } from "@/lib/types/appointment-view"
import { fetchAppointmentModalData, fetchPatientForAppointment } from "@/lib/actions/appointment-modal-data"

interface AppointmentModalContextValue {
  /** Abre el modal. Si se pasa patientId, lo pre-selecciona. */
  open:    (opts?: { patientId?: string; date?: Date; vetId?: string }) => void
  /** Indica si el provider está disponible (para guardas). */
  enabled: boolean
}

const AppointmentModalContext = React.createContext<AppointmentModalContextValue | null>(null)

export function useAppointmentModal(): AppointmentModalContextValue {
  const ctx = React.useContext(AppointmentModalContext)
  if (!ctx) {
    return {
      enabled: false,
      open:    () => console.warn("AppointmentModalProvider no montado"),
    }
  }
  return ctx
}

export function AppointmentModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isOpen, setIsOpen]                         = React.useState(false)
  const [isLoading, setIsLoading]                   = React.useState(false)
  const [data, setData]                             = React.useState<{ veterinarians: VeterinarianView[]; services: ServiceOption[] } | null>(null)
  const [initialPatient, setInitialPatient]         = React.useState<AppointmentPatientOption | null>(null)
  const [initialDate, setInitialDate]               = React.useState<Date | undefined>(undefined)
  const [initialVetId, setInitialVetId]             = React.useState<string | undefined>(undefined)

  const open = React.useCallback(
    async (opts?: { patientId?: string; date?: Date; vetId?: string }) => {
      setIsLoading(true)
      try {
        // Lazy-load vets/services on first open (cached afterwards)
        let payload = data
        if (!payload) {
          payload = await fetchAppointmentModalData()
          setData(payload)
        }

        // Resolve initial patient if provided
        if (opts?.patientId) {
          const patient = await fetchPatientForAppointment(opts.patientId)
          setInitialPatient(patient)
        } else {
          setInitialPatient(null)
        }
        setInitialDate(opts?.date)
        setInitialVetId(opts?.vetId)
        setIsOpen(true)
      } catch (err) {
        console.error("[AppointmentModalProvider] open failed:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [data],
  )

  const handleSuccess = React.useCallback(() => {
    setIsOpen(false)
    setInitialPatient(null)
    router.refresh()
  }, [router])

  return (
    <AppointmentModalContext.Provider value={{ open, enabled: true }}>
      {children}
      {data && (
        <NewAppointmentModal
          open={isOpen}
          onOpenChange={setIsOpen}
          onSuccess={handleSuccess}
          initialPatient={initialPatient}
          initialDate={initialDate}
          initialVetId={initialVetId}
          veterinarians={data.veterinarians}
          services={data.services}
        />
      )}
      {isLoading && (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
          <div className="rounded-md bg-background border border-border px-4 py-2 text-sm shadow-lg">
            Cargando…
          </div>
        </div>
      )}
    </AppointmentModalContext.Provider>
  )
}
