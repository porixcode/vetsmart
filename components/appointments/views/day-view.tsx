"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  type Appointment,
  type VeterinarianView,
  serviceColors,
  serviceLabels,
  statusConfig,
} from "@/lib/types/appointment-view"

interface DayViewProps {
  date: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  onSlotClick: (time: Date, vetId: string) => void
  selectedVets: string[]
  veterinarians: VeterinarianView[]
}

const HOURS = Array.from({ length: 27 }, (_, i) => 7 + i * 0.5) // 7:00 to 20:00 in 30-min slots
const SLOT_HEIGHT = 48 // pixels per 30-min slot

export function DayView({ date, appointments, onAppointmentClick, onSlotClick, selectedVets, veterinarians }: DayViewProps) {
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null)

  // Filter veterinarians based on selection
  const displayVets = selectedVets.length > 0 
    ? veterinarians.filter(v => selectedVets.includes(v.id))
    : veterinarians

  // Update current time indicator
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      if (now.toDateString() === date.toDateString()) {
        const hours = now.getHours() + now.getMinutes() / 60
        if (hours >= 7 && hours <= 20) {
          setCurrentTimePosition((hours - 7) * 2 * SLOT_HEIGHT)
        } else {
          setCurrentTimePosition(null)
        }
      } else {
        setCurrentTimePosition(null)
      }
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [date])

  // Get appointments for a specific vet
  const getVetAppointments = (vetId: string) => {
    return appointments.filter(apt => apt.veterinarian.id === vetId)
  }

  // Calculate position and height for appointment block
  const getAppointmentStyle = (apt: Appointment) => {
    const startHour = apt.date.getHours() + apt.date.getMinutes() / 60
    const durationHours = apt.duration / 60
    const top = (startHour - 7) * 2 * SLOT_HEIGHT
    const height = durationHours * 2 * SLOT_HEIGHT - 4 // -4 for gap
    return { top: `${top}px`, height: `${height}px` }
  }

  // Count today's appointments per vet
  const getVetCount = (vetId: string) => {
    return appointments.filter(apt => apt.veterinarian.id === vetId).length
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Header with vet columns */}
      <div className="flex border-b border-border">
        {/* Time column header */}
        <div className="w-16 flex-shrink-0 border-r border-border bg-muted p-2">
          <span className="text-xs text-muted-foreground">Hora</span>
        </div>
        
        {/* Vet column headers */}
        {displayVets.map((vet) => (
          <div 
            key={vet.id} 
            className="flex-1 min-w-[200px] border-r border-border last:border-r-0 p-3 bg-muted"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={vet.avatar} alt={vet.name} />
                <AvatarFallback style={{ backgroundColor: vet.color }} className="text-white text-xs">
                  {vet.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{vet.name}</p>
                <p className="text-xs text-muted-foreground">{getVetCount(vet.id)} citas hoy</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="relative overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {/* Current time indicator */}
        {currentTimePosition !== null && (
          <div 
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="flex items-center">
              <div className="w-16 flex justify-end pr-1">
                <span className="text-xs font-medium text-red-500">
                  {format(new Date(), "HH:mm")}
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          </div>
        )}

        <div className="flex">
          {/* Time column */}
          <div className="w-16 flex-shrink-0 border-r border-border">
            {HOURS.map((hour, idx) => (
              <div 
                key={hour} 
                className="border-b border-border/50"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                {Number.isInteger(hour) && (
                  <span className="block px-2 py-1 text-xs text-muted-foreground">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Vet columns with appointments */}
          {displayVets.map((vet) => (
            <div 
              key={vet.id} 
              className="flex-1 min-w-[200px] border-r border-border last:border-r-0 relative"
            >
              {/* Grid slots */}
              {HOURS.map((hour) => (
                <div 
                  key={hour}
                  className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                  onClick={() => {
                    const slotDate = new Date(date)
                    slotDate.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0)
                    onSlotClick(slotDate, vet.id)
                  }}
                />
              ))}

              {/* Appointment blocks */}
              {getVetAppointments(vet.id).map((apt) => {
                const style = getAppointmentStyle(apt)
                const serviceColor = serviceColors[apt.service]
                const status = statusConfig[apt.status]
                
                return (
                  <div
                    key={apt.id}
                    className="absolute left-1 right-1 rounded-md bg-background border border-border cursor-pointer hover:shadow-md transition-shadow overflow-hidden z-10"
                    style={style}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentClick(apt)
                    }}
                  >
                    {/* Color bar */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: serviceColor }}
                    />
                    
                    <div className="pl-3 pr-2 py-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium truncate">{apt.patient.name}</p>
                        {apt.status === "en_curso" && (
                          <span className="relative flex h-2 w-2 flex-shrink-0 mt-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {apt.patient.breed} · {serviceLabels[apt.service]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(apt.date, "HH:mm")} - {format(new Date(apt.date.getTime() + apt.duration * 60000), "HH:mm")}
                      </p>
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
