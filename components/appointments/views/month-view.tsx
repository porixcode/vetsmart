"use client"

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth,
  isToday 
} from "date-fns"
import { es } from "date-fns/locale"
import { 
  type Appointment, 
  serviceColors 
} from "@/lib/types/appointment-view"

interface MonthViewProps {
  date: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  onDateClick: (date: Date) => void
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export function MonthView({ date, appointments, onAppointmentClick, onDateClick }: MonthViewProps) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Generate all days for the calendar
  const days: Date[] = []
  let currentDay = calendarStart
  while (currentDay <= calendarEnd) {
    days.push(currentDay)
    currentDay = addDays(currentDay, 1)
  }

  // Get appointments for a specific day
  const getDayAppointments = (day: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, day))
  }

  // Split days into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted">
        {WEEKDAYS.map((day) => (
          <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="divide-y divide-border-default">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 divide-x divide-border-default">
            {week.map((day) => {
              const dayAppointments = getDayAppointments(day)
              const isCurrentMonth = isSameMonth(day, date)
              const displayCount = 3
              const overflow = dayAppointments.length - displayCount

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !isCurrentMonth ? "bg-muted/30" : ""
                  } ${isToday(day) ? "ring-2 ring-inset ring-primary" : ""}`}
                  onClick={() => onDateClick(day)}
                >
                  <p className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth ? "text-muted-foreground" : isToday(day) ? "text-primary" : ""
                  }`}>
                    {format(day, "d")}
                  </p>

                  <div className="space-y-0.5">
                    {dayAppointments.slice(0, displayCount).map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center gap-1 rounded px-1 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `${serviceColors[apt.service]}15` }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAppointmentClick(apt)
                        }}
                      >
                        <div 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: serviceColors[apt.service] }}
                        />
                        <span className="truncate" style={{ color: serviceColors[apt.service] }}>
                          {apt.patient.name}
                        </span>
                        <span className="text-muted-foreground flex-shrink-0 text-[10px]">
                          {format(apt.date, "HH:mm")}
                        </span>
                      </div>
                    ))}
                    {overflow > 0 && (
                      <p className="text-xs text-muted-foreground px-1">
                        +{overflow} más
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
