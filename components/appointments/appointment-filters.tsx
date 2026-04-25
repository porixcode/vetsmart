"use client"

import { useState } from "react"
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar, List, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  serviceLabels,
  statusConfig,
  type ServiceTypeLabel as ServiceType,
  type AppointmentStatusLabel as AppointmentStatus,
  type VeterinarianView,
} from "@/lib/types/appointment-view"

export type ViewMode = "dia" | "semana" | "mes" | "lista"

interface AppointmentFiltersProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  currentDate: Date
  onDateChange: (date: Date) => void
  selectedVets: string[]
  onVetsChange: (vets: string[]) => void
  selectedServices: ServiceType[]
  onServicesChange: (services: ServiceType[]) => void
  selectedStatuses: AppointmentStatus[]
  onStatusesChange: (statuses: AppointmentStatus[]) => void
  veterinarians: VeterinarianView[]
}

export function AppointmentFilters({
  view,
  onViewChange,
  currentDate,
  onDateChange,
  selectedVets,
  onVetsChange,
  selectedServices,
  onServicesChange,
  selectedStatuses,
  onStatusesChange,
  veterinarians,
}: AppointmentFiltersProps) {
  const handlePrevious = () => {
    switch (view) {
      case "dia":
        onDateChange(subDays(currentDate, 1))
        break
      case "semana":
        onDateChange(subWeeks(currentDate, 1))
        break
      case "mes":
        onDateChange(subMonths(currentDate, 1))
        break
      case "lista":
        onDateChange(subWeeks(currentDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (view) {
      case "dia":
        onDateChange(addDays(currentDate, 1))
        break
      case "semana":
        onDateChange(addWeeks(currentDate, 1))
        break
      case "mes":
        onDateChange(addMonths(currentDate, 1))
        break
      case "lista":
        onDateChange(addWeeks(currentDate, 1))
        break
    }
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const getDateLabel = () => {
    switch (view) {
      case "dia":
        return format(currentDate, "EEEE, d 'de' MMMM", { locale: es })
      case "semana":
        const weekEnd = addDays(currentDate, 6)
        return `${format(currentDate, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`
      case "mes":
        return format(currentDate, "MMMM yyyy", { locale: es })
      case "lista":
        return format(currentDate, "MMMM yyyy", { locale: es })
    }
  }

  const toggleVet = (vetId: string) => {
    if (selectedVets.includes(vetId)) {
      onVetsChange(selectedVets.filter(v => v !== vetId))
    } else {
      onVetsChange([...selectedVets, vetId])
    }
  }

  const toggleService = (service: ServiceType) => {
    if (selectedServices.includes(service)) {
      onServicesChange(selectedServices.filter(s => s !== service))
    } else {
      onServicesChange([...selectedServices, service])
    }
  }

  const toggleStatus = (status: AppointmentStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter(s => s !== status))
    } else {
      onStatusesChange([...selectedStatuses, status])
    }
  }

  const services: ServiceType[] = ["consulta", "vacunacion", "cirugia", "estetica", "urgencia", "control"]
  const statuses: AppointmentStatus[] = ["programada", "confirmada", "en_curso", "completada", "cancelada", "no_asistio"]

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-lg bg-muted p-1">
          {[
            { value: "dia", label: "Día", icon: Calendar },
            { value: "semana", label: "Semana", icon: LayoutGrid },
            { value: "mes", label: "Mes", icon: Calendar },
            { value: "lista", label: "Lista", icon: List },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => onViewChange(item.value as ViewMode)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 ${
                view === item.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3">
        {/* Veterinarian Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Veterinario
              {selectedVets.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {selectedVets.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {veterinarians.map((vet) => (
              <DropdownMenuCheckboxItem
                key={vet.id}
                checked={selectedVets.includes(vet.id)}
                onCheckedChange={() => toggleVet(vet.id)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={vet.avatar} alt={vet.name} />
                    <AvatarFallback style={{ backgroundColor: vet.color }} className="text-white text-xs">
                      {vet.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{vet.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Service Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Servicio
              {selectedServices.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {selectedServices.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {services.map((service) => (
              <DropdownMenuCheckboxItem
                key={service}
                checked={selectedServices.includes(service)}
                onCheckedChange={() => toggleService(service)}
              >
                {serviceLabels[service]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Estado
              {selectedStatuses.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {selectedStatuses.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              >
                <span className={statusConfig[status].textColor}>
                  {statusConfig[status].label}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={handleToday}>
            Hoy
          </Button>
          <span className="min-w-[180px] text-center text-sm font-medium capitalize">
            {getDateLabel()}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
