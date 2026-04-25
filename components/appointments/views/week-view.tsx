"use client"

import { format, addDays, isSameDay, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { 
  type Appointment, 
  serviceColors 
} from "@/lib/types/appointment-view"

interface WeekViewProps {
  weekStart: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  onSlotClick: (time: Date) => void
}

const HOURS = [7, 9, 11, 13, 15, 17, 19] // Compressed hours (every 2 hours)
const SLOT_HEIGHT = 80 // pixels per 2-hour block

export function WeekView({ weekStart, appointments, onAppointmentClick, onSlotClick }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Get appointments for a specific day
  const getDayAppointments = (day: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, day))
  }

  // Get appointments for a specific time slot (2-hour window)
  const getSlotAppointments = (day: Date, hour: number) => {
    return getDayAppointments(day).filter(apt => {
      const aptHour = apt.date.getHours()
      return aptHour >= hour && aptHour < hour + 2
    })
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Header with day columns */}
      <div className="flex border-b border-border">
        {/* Time column header */}
        <div className="w-16 flex-shrink-0 border-r border-border bg-muted p-2">
          <span className="text-xs text-muted-foreground">Hora</span>
        </div>
        
        {/* Day column headers */}
        {days.map((day) => (
          <div 
            key={day.toISOString()} 
            className={`flex-1 min-w-[120px] border-r border-border last:border-r-0 p-3 text-center ${
              isToday(day) ? "bg-blue-50" : "bg-muted"
            }`}
          >
            <p className="text-xs text-muted-foreground uppercase">
              {format(day, "EEE", { locale: es })}
            </p>
            <p className={`text-xl font-semibold ${isToday(day) ? "text-primary" : ""}`}>
              {format(day, "d")}
            </p>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <div className="flex">
          {/* Time column */}
          <div className="w-16 flex-shrink-0 border-r border-border">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="border-b border-border/50"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                <span className="block px-2 py-1 text-xs text-muted-foreground">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => (
            <div 
              key={day.toISOString()} 
              className={`flex-1 min-w-[120px] border-r border-border last:border-r-0 ${
                isToday(day) ? "bg-blue-50/30" : ""
              }`}
            >
              {HOURS.map((hour) => {
                const slotAppointments = getSlotAppointments(day, hour)
                const displayCount = 3
                const overflow = slotAppointments.length - displayCount

                return (
                  <div 
                    key={hour}
                    className="border-b border-border/50 p-1 hover:bg-muted/50 cursor-pointer transition-colors"
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    onClick={() => {
                      const slotDate = new Date(day)
                      slotDate.setHours(hour, 0, 0, 0)
                      onSlotClick(slotDate)
                    }}
                  >
                    <div className="space-y-0.5 overflow-hidden h-full">
                      {slotAppointments.slice(0, displayCount).map((apt) => (
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
                          <span className="truncate font-medium" style={{ color: serviceColors[apt.service] }}>
                            {apt.patient.name}
                          </span>
                          <span className="text-muted-foreground flex-shrink-0">
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
    </div>
  )
}
