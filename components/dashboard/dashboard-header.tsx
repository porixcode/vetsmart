"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, ChevronDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 18) return "Buenas tardes"
  return "Buenas noches"
}

export function DashboardHeader() {
  const [greeting, setGreeting] = useState("Hola")
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    const today = new Date()
    setFormattedDate(format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }))
    setGreeting(getGreeting())
  }, [])

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight-custom text-text-primary">
          {greeting}, Marly
        </h1>
        <p className="mt-1 text-sm text-text-muted capitalize">
          {formattedDate ? `Hoy es ${formattedDate} — 8 citas programadas` : '\u00A0'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-sm border-border bg-background text-text-secondary hover:bg-background-muted hover:text-text-primary transition-colors duration-150"
        >
          <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
          <span>Hoy</span>
          <ChevronDown className="h-3 w-3 ml-1" strokeWidth={1.5} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-sm text-text-secondary hover:bg-background-muted hover:text-text-primary transition-colors duration-150"
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          <span>Exportar</span>
        </Button>
      </div>
    </div>
  )
}
