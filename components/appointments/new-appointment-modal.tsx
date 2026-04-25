"use client"

import * as React from "react"
import { useActionState, useState, useTransition } from "react"
import { format, addDays, setHours, setMinutes, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search,
  Plus,
  Stethoscope,
  Syringe,
  Scissors,
  Sparkles,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  AlertCircle,
  X,
  MessageSquare,
  Mail,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  ServiceTypeLabel,
  VeterinarianView,
  ServiceOption,
} from "@/lib/types/appointment-view"
import { createAppointment, type AppointmentActionState } from "@/lib/actions/appointments"
import { searchPatientsAction } from "@/lib/actions/appointment-modal-data"

export type AppointmentPatientOption = {
  id:      string
  name:    string
  breed:   string
  species: "perro" | "gato" | "ave" | "otro"
  age:     string
  weight:  string
  ownerId: string
  owner: {
    id:    string
    name:  string
    phone: string
    email: string
  }
}

interface NewAppointmentModalProps {
  open:           boolean
  onOpenChange:   (open: boolean) => void
  onSuccess?:     () => void
  initialDate?:   Date
  initialVetId?:  string
  initialPatient?: AppointmentPatientOption | null
  veterinarians:  VeterinarianView[]
  services:       ServiceOption[]
}

const FORM_ID = "new-appointment-form"

const serviceOptions: { type: ServiceTypeLabel; label: string; icon: React.ElementType; color: string }[] = [
  { type: "consulta",   label: "Consulta",   icon: Stethoscope,    color: "#3B82F6" },
  { type: "vacunacion", label: "Vacunación", icon: Syringe,        color: "#10B981" },
  { type: "cirugia",    label: "Cirugía",    icon: Scissors,       color: "#EF4444" },
  { type: "estetica",   label: "Estética",   icon: Sparkles,       color: "#EC4899" },
  { type: "urgencia",   label: "Urgencia",   icon: AlertTriangle,  color: "#F59E0B" },
  { type: "control",    label: "Control",    icon: ClipboardCheck, color: "#6366F1" },
]

const durationOptions = [15, 30, 45, 60, 90, 120]

const generateTimeSlots = (date: Date) => {
  const slots: { time: Date; available: boolean; reason?: string }[] = []
  for (let hour = 7; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = setMinutes(setHours(new Date(date), hour), minute)
      const isLunch  = hour === 12
      slots.push({
        time:      slotTime,
        available: !isLunch,
        reason:    isLunch ? "Almuerzo" : undefined,
      })
    }
  }
  return slots
}

const INITIAL_STATE: AppointmentActionState = {}

export function NewAppointmentModal({
  open,
  onOpenChange,
  onSuccess,
  initialDate,
  initialVetId,
  initialPatient,
  veterinarians,
  services,
}: NewAppointmentModalProps) {
  const onClose = () => onOpenChange(false)

  const [patientSearch, setPatientSearch]       = useState("")
  const [searchResults, setSearchResults]       = useState<AppointmentPatientOption[]>([])
  const [selectedPatient, setSelectedPatient]   = useState<AppointmentPatientOption | null>(initialPatient ?? null)
  const [selectedService, setSelectedService]   = useState<ServiceTypeLabel | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [selectedVet, setSelectedVet]           = useState<VeterinarianView | null>(
    initialVetId ? veterinarians.find(v => v.id === initialVetId) ?? null : null,
  )
  const [selectedDate, setSelectedDate]         = useState<Date>(initialDate || new Date())
  const [selectedTime, setSelectedTime]         = useState<Date | null>(initialDate || null)
  const [duration, setDuration]                 = useState(30)
  const [reason, setReason]                     = useState("")
  const [internalNotes, setInternalNotes]       = useState("")
  const [showInternalNotes, setShowInternalNotes] = useState(false)
  const [reminders, setReminders]               = useState({ whatsapp: true, email: true, sms: false })
  const [, startSearchTransition]               = useTransition()

  const [state, formAction, pending] = useActionState(createAppointment, INITIAL_STATE)

  // Sync initialPatient when it changes (e.g. modal reopened with different patient)
  React.useEffect(() => {
    if (initialPatient) setSelectedPatient(initialPatient)
  }, [initialPatient])

  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      onSuccess?.()
      // reset
      setPatientSearch("")
      setSearchResults([])
      setSelectedPatient(initialPatient ?? null)
      setSelectedService(null)
      setSelectedServiceId("")
      setSelectedVet(null)
      setSelectedTime(null)
      setReason("")
      setInternalNotes("")
    }
  }, [state, onSuccess, initialPatient])

  // Patient search (debounced)
  React.useEffect(() => {
    if (patientSearch.trim().length < 2) {
      setSearchResults([])
      return
    }
    const handle = setTimeout(() => {
      startSearchTransition(async () => {
        const results = await searchPatientsAction(patientSearch)
        setSearchResults(results as AppointmentPatientOption[])
      })
    }, 250)
    return () => clearTimeout(handle)
  }, [patientSearch])

  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  const timeSlots      = generateTimeSlots(selectedDate)
  const canSubmit      = !!(selectedPatient && selectedService && selectedVet && selectedTime)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border">
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          {state && "ok" in state && !state.ok && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{state.error}</span>
            </div>
          )}

          <form id={FORM_ID} action={formAction} className="space-y-6">
            <input type="hidden" name="patientId"      value={selectedPatient?.id ?? ""} />
            <input type="hidden" name="veterinarianId" value={selectedVet?.id ?? ""} />
            <input type="hidden" name="serviceType"    value={selectedService ?? ""} />
            <input type="hidden" name="serviceId"      value={selectedServiceId} />
            <input type="hidden" name="startsAt"       value={selectedTime ? selectedTime.toISOString() : ""} />
            <input type="hidden" name="duration"       value={String(duration)} />
            <input type="hidden" name="reason"         value={reason} />
            <input type="hidden" name="internalNotes"  value={internalNotes} />

            {/* Patient */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Paciente *</Label>
              {selectedPatient ? (
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback>{selectedPatient.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{selectedPatient.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedPatient.breed} · {selectedPatient.owner.name}
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, raza o dueño..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-background shadow-lg z-10">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                          onClick={() => {
                            setSelectedPatient(p)
                            setPatientSearch("")
                            setSearchResults([])
                          }}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback>{p.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {p.breed} · {p.owner.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Service Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de servicio *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {serviceOptions.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = selectedService === opt.type
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all min-w-0 ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setSelectedService(opt.type)
                        const match = services.find(s => s.code.toLowerCase().includes(opt.type) || s.name.toLowerCase().includes(opt.label.toLowerCase()))
                        if (match) {
                          setSelectedServiceId(match.id)
                          setDuration(match.duration)
                        } else {
                          setSelectedServiceId("")
                        }
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: isSelected ? opt.color : undefined }} />
                      <span className={`text-sm truncate ${isSelected ? "font-medium" : ""}`}>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Veterinarian — vertical list, scales to N vets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Veterinario *</Label>
              <div className="space-y-2 max-h-[260px] overflow-y-auto rounded-lg border border-border p-2">
                {veterinarians.map((vet) => {
                  const isSelected = selectedVet?.id === vet.id
                  return (
                    <button
                      key={vet.id}
                      type="button"
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 transition-all min-w-0 ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedVet(vet)}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        {vet.avatar && <AvatarImage src={vet.avatar} alt={vet.name} />}
                        <AvatarFallback style={{ backgroundColor: vet.color }} className="text-white">
                          {vet.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-sm truncate ${isSelected ? "font-medium" : ""}`}>{vet.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{vet.specialty}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Fecha y hora *</Label>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map((date) => {
                  const isSelected = isSameDay(date, selectedDate)
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={`flex flex-col items-center rounded-lg border px-4 py-2 min-w-[70px] shrink-0 transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime(null)
                      }}
                    >
                      <span className="text-xs text-muted-foreground uppercase">{format(date, "EEE", { locale: es })}</span>
                      <span className={`text-lg font-semibold ${isSelected ? "text-primary" : ""}`}>{format(date, "d")}</span>
                      <span className="text-xs text-muted-foreground">{format(date, "MMM", { locale: es })}</span>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-[160px] overflow-y-auto rounded-lg border border-border p-2">
                {timeSlots.map((slot, idx) => {
                  const isSelected = selectedTime && slot.time.getTime() === selectedTime.getTime()
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      className={`rounded px-2 py-1.5 text-sm transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : slot.available
                            ? "hover:bg-muted"
                            : "text-muted-foreground line-through opacity-50 cursor-not-allowed"
                      }`}
                      title={slot.reason}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {format(slot.time, "HH:mm")}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Duración</Label>
              <div className="flex flex-wrap gap-2">
                {durationOptions.map((mins) => {
                  const isSelected = duration === mins
                  return (
                    <button
                      key={mins}
                      type="button"
                      className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                        isSelected ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setDuration(mins)}
                    >
                      {mins} min
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reminders */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Recordatorios</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="whatsapp" checked={reminders.whatsapp}
                    onCheckedChange={(c) => setReminders(r => ({ ...r, whatsapp: c }))} />
                  <Label htmlFor="whatsapp" className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <Smartphone className="h-4 w-4" /> WhatsApp
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="email" checked={reminders.email}
                    onCheckedChange={(c) => setReminders(r => ({ ...r, email: c }))} />
                  <Label htmlFor="email" className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="sms" checked={reminders.sms}
                    onCheckedChange={(c) => setReminders(r => ({ ...r, sms: c }))} />
                  <Label htmlFor="sms" className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <MessageSquare className="h-4 w-4" /> SMS
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">El envío automático se activa en F6 (cron).</p>
            </div>

            {/* Reason */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Motivo de consulta</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describa el motivo de la cita..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Internal Notes */}
            <div className="space-y-3">
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowInternalNotes(!showInternalNotes)}
              >
                <Plus className={`h-4 w-4 transition-transform ${showInternalNotes ? "rotate-45" : ""}`} />
                Notas internas (solo personal)
              </button>
              {showInternalNotes && (
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notas visibles solo para el personal..."
                  className="min-h-[60px] resize-none"
                />
              )}
            </div>
          </form>
        </div>

        {/* Footer fijo, fuera del scroll */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-background">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={!canSubmit || pending}>
            <Calendar className="h-4 w-4 mr-2" />
            {pending ? "Agendando…" : "Agendar cita"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
