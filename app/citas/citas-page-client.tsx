"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { startOfWeek, isSameDay } from "date-fns"
import { Plus } from "lucide-react"
import { useTransition } from "react"
import type {
  Appointment,
  ServiceTypeLabel,
  AppointmentStatusLabel,
  VeterinarianView,
  ServiceOption,
} from "@/lib/types/appointment-view"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { AppointmentFilters, type ViewMode } from "@/components/appointments/appointment-filters"
import { AppointmentDetailDrawer } from "@/components/appointments/appointment-detail-drawer"
import { DayView } from "@/components/appointments/views/day-view"
import { WeekView } from "@/components/appointments/views/week-view"
import { MonthView } from "@/components/appointments/views/month-view"
import { ListView } from "@/components/appointments/views/list-view"
import { updateAppointmentStatus } from "@/lib/actions/appointments"
import { useAppointmentModal } from "@/components/providers/appointment-modal-provider"

interface CitasPageClientProps {
  initialAppointments: Appointment[]
  veterinarians:       VeterinarianView[]
  services:            ServiceOption[]
  stats:               { today: number; thisWeek: number }
}

export function CitasPageClient({
  initialAppointments,
  veterinarians,
  services: _services,  // Pre-fetcheados por RSC; el provider los re-fetchea (acceptable trade-off)
  stats,
}: CitasPageClientProps) {
  const router = useRouter()
  const { open: openAppointmentModal } = useAppointmentModal()
  const [appointments, setAppointments] = React.useState(initialAppointments)
  React.useEffect(() => { setAppointments(initialAppointments) }, [initialAppointments])

  const [view, setView]                       = React.useState<ViewMode>("dia")
  const [currentDate, setCurrentDate]         = React.useState(new Date())
  const [selectedVets, setSelectedVets]       = React.useState<string[]>([])
  const [selectedServices, setSelectedServices] = React.useState<ServiceTypeLabel[]>([])
  const [selectedStatuses, setSelectedStatuses] = React.useState<AppointmentStatusLabel[]>([])
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [isDrawerOpen, setIsDrawerOpen]       = React.useState(false)
  const [, startTransition]                   = useTransition()

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })

  const filteredAppointments = React.useMemo(() => {
    return appointments.filter(apt => {
      if (selectedVets.length     > 0 && !selectedVets.includes(apt.veterinarian.id)) return false
      if (selectedServices.length > 0 && !selectedServices.includes(apt.service))    return false
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(apt.status))     return false
      return true
    })
  }, [appointments, selectedVets, selectedServices, selectedStatuses])

  const viewAppointments = React.useMemo(() => {
    switch (view) {
      case "dia":
        return filteredAppointments.filter(apt => isSameDay(apt.date, currentDate))
      case "semana": {
        const end = new Date(weekStart)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59)
        return filteredAppointments.filter(apt => apt.date >= weekStart && apt.date <= end)
      }
      case "mes":
        return filteredAppointments.filter(apt =>
          apt.date.getMonth()    === currentDate.getMonth() &&
          apt.date.getFullYear() === currentDate.getFullYear(),
        )
      case "lista":
        return filteredAppointments
    }
  }, [filteredAppointments, view, currentDate, weekStart])

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setIsDrawerOpen(true)
  }

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    // Optimistic update
    setAppointments(prev =>
      prev.map(a => a.id === appointmentId ? { ...a, status: newStatus as AppointmentStatusLabel } : a),
    )
    setSelectedAppointment(prev =>
      prev?.id === appointmentId ? { ...prev, status: newStatus as AppointmentStatusLabel } : prev,
    )
    // Persist
    startTransition(async () => {
      const res = await updateAppointmentStatus(appointmentId, newStatus)
      if (!res || ("ok" in res && !res.ok)) {
        // Reload from server on failure
        router.refresh()
      }
    })
  }

  const handleSlotClick = (time: Date, vetId?: string) => {
    openAppointmentModal({ date: time, vetId })
  }

  const handleDateClick = (date: Date) => {
    setCurrentDate(date)
    setView("dia")
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        {/* Page header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Citas</h1>
            <p className="text-sm text-muted-foreground">
              {stats.today} citas hoy · {stats.thisWeek} esta semana
            </p>
          </div>
          <Button onClick={() => openAppointmentModal()}>
            <Plus className="mr-2 size-4" strokeWidth={1.5} />
            Nueva cita
          </Button>
        </div>

        {/* Filters + view switcher */}
        <div className="border-b bg-background px-6 py-3">
          <AppointmentFilters
            view={view}
            onViewChange={setView}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            selectedVets={selectedVets}
            onVetsChange={setSelectedVets}
            selectedServices={selectedServices}
            onServicesChange={setSelectedServices}
            selectedStatuses={selectedStatuses}
            onStatusesChange={setSelectedStatuses}
            veterinarians={veterinarians}
          />
        </div>

        {/* View content */}
        <div className="flex-1 overflow-auto p-6">
          {view === "dia" && (
            <DayView
              date={currentDate}
              appointments={viewAppointments}
              onAppointmentClick={handleAppointmentClick}
              onSlotClick={handleSlotClick}
              selectedVets={selectedVets}
              veterinarians={veterinarians}
            />
          )}
          {view === "semana" && (
            <WeekView
              weekStart={weekStart}
              appointments={viewAppointments}
              onAppointmentClick={handleAppointmentClick}
              onSlotClick={handleSlotClick}
            />
          )}
          {view === "mes" && (
            <MonthView
              date={currentDate}
              appointments={viewAppointments}
              onAppointmentClick={handleAppointmentClick}
              onDateClick={handleDateClick}
            />
          )}
          {view === "lista" && (
            <ListView
              appointments={viewAppointments}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <AppointmentDetailDrawer
        appointment={selectedAppointment}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />

    </AppShell>
  )
}
