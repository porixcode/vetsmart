"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  PlayCircle,
  XCircle,
  CalendarClock,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  type Appointment,
  serviceLabels,
  statusConfig,
} from "@/lib/types/appointment-view"
import { cancelAppointment, rescheduleAppointment } from "@/lib/actions/appointments"

interface AppointmentDetailDrawerProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (appointmentId: string, newStatus: string) => void
}

export function AppointmentDetailDrawer({
  appointment,
  isOpen,
  onClose,
  onStatusChange,
}: AppointmentDetailDrawerProps) {
  const router = useRouter()
  const [isReschedule, setIsReschedule] = useState(false)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [isPending, setIsPending] = useState(false)

  if (!appointment) return null

  const status = statusConfig[appointment.status]

  const handleCancel = () => {
    if (!confirm("¿Cancelar esta cita? Esta acción puede revertirse cambiando el estado de nuevo.")) return
    setActionError(null)
    setIsPending(true)
    startTransition(async () => {
      const res = await cancelAppointment(appointment.id)
      setIsPending(false)
      if (!("ok" in res) || !res.ok) {
        setActionError("ok" in res && !res.ok ? res.error : "No se pudo cancelar")
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  const handleRescheduleSubmit = () => {
    if (!newDate || !newTime) {
      setActionError("Selecciona fecha y hora")
      return
    }
    const startsAt = new Date(`${newDate}T${newTime}:00`)
    if (Number.isNaN(startsAt.getTime())) {
      setActionError("Fecha/hora inválidas")
      return
    }
    setActionError(null)
    setIsPending(true)
    startTransition(async () => {
      const res = await rescheduleAppointment(appointment.id, startsAt)
      setIsPending(false)
      if (!("ok" in res) || !res.ok) {
        setActionError("ok" in res && !res.ok ? res.error : "No se pudo reagendar")
      } else {
        router.refresh()
        setIsReschedule(false)
        onClose()
      }
    })
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "whatsapp":
        return "📱"
      case "email":
        return "📧"
      case "sms":
        return "💬"
      default:
        return "📩"
    }
  }

  const getReminderLabel = (type: string) => {
    switch (type) {
      case "whatsapp":
        return "WhatsApp"
      case "email":
        return "Email"
      case "sms":
        return "SMS"
      default:
        return type
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-[480px] bg-background border-l border-border shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={appointment.patient.avatar} alt={appointment.patient.name} />
              <AvatarFallback className="bg-muted text-lg">
                {appointment.patient.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{appointment.patient.name}</h2>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                {appointment.status === "en_curso" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                {status.label}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Appointment Info */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Información de la cita</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">
                  {format(appointment.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(appointment.date, "HH:mm")} - {format(new Date(appointment.date.getTime() + appointment.duration * 60000), "HH:mm")} ({appointment.duration} min)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{serviceLabels[appointment.service]}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={appointment.veterinarian.avatar} />
                    <AvatarFallback 
                      style={{ backgroundColor: appointment.veterinarian.color }} 
                      className="text-white text-xs"
                    >
                      {appointment.veterinarian.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{appointment.veterinarian.name}</span>
                </div>
              </div>
              {appointment.room && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.room}</span>
                </div>
              )}
            </div>
          </section>

          {/* Patient Info */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Paciente</h3>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Link 
                    href={`/pacientes/${appointment.patient.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {appointment.patient.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {appointment.patient.breed} · {appointment.patient.age} · {appointment.patient.weight}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/pacientes/${appointment.patient.id}`}>
                    Ver ficha
                  </Link>
                </Button>
              </div>
              {appointment.patient.hasOverdueVaccines && (
                <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Vacuna pendiente desde hace {appointment.patient.overdueVaccineDays} días</span>
                </div>
              )}
            </div>
          </section>

          {/* Owner Info */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Dueño</h3>
            <div className="space-y-2">
              <p className="font-medium">{appointment.owner.name}</p>
              <a 
                href={`tel:${appointment.owner.phone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {appointment.owner.phone}
              </a>
              <a 
                href={`mailto:${appointment.owner.email}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {appointment.owner.email}
              </a>
            </div>
          </section>

          {/* Reason */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Motivo de consulta</h3>
            <Textarea 
              defaultValue={appointment.reason || ""} 
              placeholder="Sin motivo especificado"
              className="min-h-[80px] resize-none"
            />
          </section>

          {/* Internal Notes */}
          {appointment.internalNotes && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Notas internas</h3>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                {appointment.internalNotes}
              </div>
            </section>
          )}

          {/* Reminders */}
          {appointment.reminders.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recordatorios enviados</h3>
              <div className="space-y-2">
                {appointment.reminders.map((reminder, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span>{getReminderIcon(reminder.type)}</span>
                    <span className="flex-1">
                      {getReminderLabel(reminder.type)} {reminder.status === "confirmado" ? "confirmado" : "enviado"}
                    </span>
                    <span className="text-muted-foreground">
                      hace {formatDistanceToNow(reminder.sentAt, { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer - sticky actions */}
        <div className="border-t border-border p-4 bg-background space-y-3">
          {actionError && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{actionError}</span>
            </div>
          )}

          {isReschedule ? (
            <div className="space-y-3 rounded-md border border-border p-3 bg-background-muted">
              <p className="text-xs font-medium text-text-secondary">Nueva fecha y hora</p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setIsReschedule(false); setActionError(null) }}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button size="sm" className="flex-1" onClick={handleRescheduleSubmit} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarClock className="h-4 w-4 mr-2" />}
                  Reagendar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {appointment.status === "programada" && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onStatusChange?.(appointment.id, "confirmada")}
                  disabled={isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              )}
              {(appointment.status === "programada" || appointment.status === "confirmada") && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onStatusChange?.(appointment.id, "en_curso")}
                  disabled={isPending}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  En curso
                </Button>
              )}
              {appointment.status === "en_curso" && (
                <Button
                  className="flex-1"
                  onClick={() => onStatusChange?.(appointment.id, "completada")}
                  disabled={isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar
                </Button>
              )}
              {appointment.status !== "completada" && appointment.status !== "cancelada" && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsReschedule(true)}
                    disabled={isPending}
                  >
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Reagendar
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
