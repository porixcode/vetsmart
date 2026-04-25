"use client"

import * as React from "react"
import { Plus, X, Copy, Clock, Wifi } from "lucide-react"
import { defaultSchedule, DAYS, type DaySchedule, type DayShift } from "@/lib/data/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  )
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-7 w-28 text-xs tabular-nums"
    />
  )
}

function DayCard({
  day, schedule, onChange,
}: {
  day: string
  schedule: DaySchedule
  onChange: (s: DaySchedule) => void
}) {
  const addShift = () => onChange({ ...schedule, shifts: [...schedule.shifts, { start:"08:00", end:"12:00" }] })
  const removeShift = (i: number) => onChange({ ...schedule, shifts: schedule.shifts.filter((_,idx) => idx !== i) })
  const updateShift = (i: number, field: keyof DayShift, val: string) =>
    onChange({ ...schedule, shifts: schedule.shifts.map((s,idx) => idx === i ? { ...s, [field]:val } : s) })

  return (
    <div className={cn(
      "rounded-lg border border-border bg-background p-4 transition-opacity",
      !schedule.isOpen && "opacity-60"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Toggle checked={schedule.isOpen} onChange={() => onChange({ ...schedule, isOpen: !schedule.isOpen })} />
          <span className="text-sm font-medium">{day}</span>
        </div>
        <span className={cn(
          "text-xs font-medium rounded-full px-2 py-0.5",
          schedule.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
        )}>
          {schedule.isOpen ? "Abierto" : "Cerrado"}
        </span>
      </div>

      {schedule.isOpen && (
        <>
          <div className="space-y-2">
            {schedule.shifts.map((shift, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <TimeInput value={shift.start} onChange={v => updateShift(i, "start", v)} />
                  <span className="text-xs text-muted-foreground">—</span>
                  <TimeInput value={shift.end} onChange={v => updateShift(i, "end", v)} />
                </div>
                {schedule.shifts.length > 1 && (
                  <button onClick={() => removeShift(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="size-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <button
              onClick={addShift}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="size-3" strokeWidth={1.5} />
              Agregar turno
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Máx. citas/hora:</span>
              <Input
                type="number"
                min={1} max={12}
                value={schedule.maxPerHour}
                onChange={e => onChange({ ...schedule, maxPerHour: parseInt(e.target.value) || 1 })}
                className="h-6 w-14 text-xs text-center"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function SectionSchedule() {
  const [schedule, setSchedule] = React.useState<Record<string, DaySchedule>>(() =>
    JSON.parse(JSON.stringify(defaultSchedule))
  )
  const [urgencies, setUrgencies] = React.useState(false)
  const [onlineBooking, setOnlineBooking] = React.useState(true)
  const [minHours, setMinHours] = React.useState("4")
  const [maxDays, setMaxDays] = React.useState("30")
  const [isDirty, setIsDirty] = React.useState(false)

  const updateDay = (day: string, s: DaySchedule) => {
    setSchedule(prev => ({ ...prev, [day]: s }))
    setIsDirty(true)
  }

  const applyWeekdays = () => {
    const lunes = schedule["Lunes"]
    setSchedule(prev => {
      const next = { ...prev }
      for (const d of ["Lunes","Martes","Miércoles","Jueves","Viernes"]) {
        next[d] = JSON.parse(JSON.stringify(lunes))
      }
      return next
    })
    setIsDirty(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-base font-semibold">Horarios de atención</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Define los turnos y capacidad por día de la semana.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={applyWeekdays}>
            <Copy className="size-3.5" strokeWidth={1.5} />
            Aplicar L–V iguales
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {/* Day cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {DAYS.map(day => (
            <DayCard key={day} day={day} schedule={schedule[day]} onChange={s => updateDay(day, s)} />
          ))}
        </div>

        {/* Urgencies toggle */}
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-red-50">
                <Clock className="size-4 text-red-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">Urgencias 24/7</p>
                <p className="text-xs text-muted-foreground">Disponible fuera del horario regular con número de guardia</p>
              </div>
            </div>
            <Toggle checked={urgencies} onChange={() => { setUrgencies(!urgencies); setIsDirty(true) }} />
          </div>
          {urgencies && (
            <div className="mt-3 pt-3 border-t border-border">
              <Input placeholder="Número de guardia (ej. +57 310-555-9999)" className="h-8 text-sm" />
            </div>
          )}
        </div>

        {/* Online booking toggle */}
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-50">
                <Wifi className="size-4 text-blue-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">Citas online disponibles</p>
                <p className="text-xs text-muted-foreground">Permite a los propietarios agendar desde la app</p>
              </div>
            </div>
            <Toggle checked={onlineBooking} onChange={() => { setOnlineBooking(!onlineBooking); setIsDirty(true) }} />
          </div>
          {onlineBooking && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Desde</span>
                <Input
                  type="number" value={minHours} onChange={e => { setMinHours(e.target.value); setIsDirty(true) }}
                  className="h-7 w-14 text-xs text-center"
                />
                <span className="text-xs text-muted-foreground">horas de antelación</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Hasta</span>
                <Input
                  type="number" value={maxDays} onChange={e => { setMaxDays(e.target.value); setIsDirty(true) }}
                  className="h-7 w-14 text-xs text-center"
                />
                <span className="text-xs text-muted-foreground">días de anticipación</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background px-6 py-3 flex items-center justify-end gap-3">
        <Button variant="ghost" size="sm" className="h-8 text-xs" disabled={!isDirty}>Descartar cambios</Button>
        <Button size="sm" className="h-8 text-xs" disabled={!isDirty} onClick={() => setIsDirty(false)}>Guardar cambios</Button>
      </div>
    </div>
  )
}
