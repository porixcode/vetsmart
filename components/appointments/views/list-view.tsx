"use client"

import { useState } from "react"
import { format, isSameDay, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  type Appointment, 
  serviceLabels,
  statusConfig 
} from "@/lib/types/appointment-view"

interface ListViewProps {
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
}

export function ListView({ appointments, onAppointmentClick }: ListViewProps) {
  // Group appointments by date
  const groupedAppointments = appointments.reduce<Record<string, Appointment[]>>((acc, apt) => {
    const dateKey = apt.date.toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(apt)
    return acc
  }, {})

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  // Track expanded sections (today expanded by default)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(() => {
    const today = new Date().toDateString()
    return new Set([today])
  })

  const toggleDate = (dateKey: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev)
      if (next.has(dateKey)) {
        next.delete(dateKey)
      } else {
        next.add(dateKey)
      }
      return next
    })
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-12 text-center">
        <p className="text-muted-foreground">No hay citas para mostrar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedDates.map((dateKey) => {
        const date = new Date(dateKey)
        const dayAppointments = groupedAppointments[dateKey].sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        )
        const isExpanded = expandedDates.has(dateKey)
        const isTodayDate = isToday(date)

        return (
          <div key={dateKey} className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Date header - sticky */}
            <button
              className={`w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors ${
                isTodayDate ? "bg-blue-50" : "bg-muted"
              }`}
              onClick={() => toggleDate(dateKey)}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <span className={`font-medium capitalize ${isTodayDate ? "text-primary" : ""}`}>
                    {isTodayDate ? "Hoy — " : ""}
                    {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                  </span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {dayAppointments.length} {dayAppointments.length === 1 ? "cita" : "citas"}
              </span>
            </button>

            {/* Appointments table */}
            {isExpanded && (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px]">Hora</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Dueño</TableHead>
                    <TableHead>Veterinario</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead className="w-[80px]">Duración</TableHead>
                    <TableHead className="w-[120px]">Estado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayAppointments.map((apt) => {
                    const status = statusConfig[apt.status]
                    
                    return (
                      <TableRow 
                        key={apt.id} 
                        className="cursor-pointer"
                        onClick={() => onAppointmentClick(apt)}
                      >
                        <TableCell className="font-medium">
                          {format(apt.date, "HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={apt.patient.avatar} alt={apt.patient.name} />
                              <AvatarFallback className="bg-muted text-xs">
                                {apt.patient.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{apt.patient.name}</p>
                              <p className="text-xs text-muted-foreground">{apt.patient.breed}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {apt.owner.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={apt.veterinarian.avatar} alt={apt.veterinarian.name} />
                              <AvatarFallback 
                                style={{ backgroundColor: apt.veterinarian.color }} 
                                className="text-white text-xs"
                              >
                                {apt.veterinarian.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{apt.veterinarian.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{serviceLabels[apt.service]}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {apt.duration} min
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                            {apt.status === "en_curso" && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                              </span>
                            )}
                            {status.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                              <DropdownMenuItem>Reagendar</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )
      })}
    </div>
  )
}
