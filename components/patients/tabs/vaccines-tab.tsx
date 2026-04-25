'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Check, Clock, AlertTriangle } from 'lucide-react'
import type { Vaccination } from "@/lib/types/patient-view"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface VaccinesTabProps {
  vaccinations: Vaccination[]
  onNewVaccine: () => void
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  'Aplicada': { variant: 'default', icon: <Check className="mr-1 size-3" strokeWidth={1.5} /> },
  'Pendiente': { variant: 'outline', icon: <Clock className="mr-1 size-3" strokeWidth={1.5} /> },
  'Vencida': { variant: 'destructive', icon: <AlertTriangle className="mr-1 size-3" strokeWidth={1.5} /> },
}

// Vaccine schedule for the year
const vaccineSchedule = [
  { name: 'Séxtuple', months: [0, 12] },
  { name: 'Antirrábica', months: [0, 12] },
  { name: 'Bordetella', months: [0, 6, 12] },
  { name: 'Leptospira', months: [0, 12] },
  { name: 'Giardia', months: [0, 12] },
]

export function VaccinesTab({ vaccinations, onNewVaccine }: VaccinesTabProps) {
  const currentMonth = new Date().getMonth()
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  // Check if vaccine was applied this year
  const isVaccineApplied = (vaccineName: string, month: number): boolean => {
    return vaccinations.some(v => {
      const appliedMonth = v.dateApplied.getMonth()
      return v.vaccineName.includes(vaccineName) && 
             v.status === 'Aplicada' && 
             appliedMonth <= month
    })
  }

  return (
    <div className="space-y-6">
      {/* Vaccine Schedule Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Calendario de vacunación {new Date().getFullYear()}</CardTitle>
          <Button size="sm" onClick={onNewVaccine}>
            <Plus className="mr-2 size-4" strokeWidth={1.5} />
            Registrar vacuna
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Vacuna</th>
                  {months.map((month, i) => (
                    <th 
                      key={month} 
                      className={`pb-3 px-2 text-center font-medium ${i === currentMonth ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vaccineSchedule.map((vaccine) => (
                  <tr key={vaccine.name} className="border-t">
                    <td className="py-3 pr-4 font-medium">{vaccine.name}</td>
                    {months.map((_, monthIndex) => {
                      const isDue = vaccine.months.includes(monthIndex)
                      const isApplied = isVaccineApplied(vaccine.name, monthIndex)
                      const isPast = monthIndex < currentMonth
                      const isCurrent = monthIndex === currentMonth

                      return (
                        <td key={monthIndex} className="px-2 py-3 text-center">
                          {isDue ? (
                            <div 
                              className={`mx-auto size-6 rounded-full flex items-center justify-center ${
                                isApplied 
                                  ? 'bg-green-500 text-white' 
                                  : isPast 
                                    ? 'bg-red-500 text-white'
                                    : isCurrent
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-muted'
                              }`}
                            >
                              {isApplied && <Check className="size-3" strokeWidth={2} />}
                              {!isApplied && isPast && <AlertTriangle className="size-3" strokeWidth={2} />}
                              {!isApplied && isCurrent && <Clock className="size-3" strokeWidth={2} />}
                            </div>
                          ) : (
                            <div className="mx-auto size-6" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-green-500" />
              <span>Aplicada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-amber-500" />
              <span>Pendiente este mes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-red-500" />
              <span>Vencida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-muted" />
              <span>Programada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vaccinations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de vacunaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vacuna</TableHead>
                <TableHead>Laboratorio</TableHead>
                <TableHead>Fecha aplicación</TableHead>
                <TableHead>Próxima dosis</TableHead>
                <TableHead>Aplicado por</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccinations.map((vaccine) => (
                <TableRow key={vaccine.id}>
                  <TableCell className="font-medium">{vaccine.vaccineName}</TableCell>
                  <TableCell className="text-muted-foreground">{vaccine.lab}</TableCell>
                  <TableCell>
                    {format(vaccine.dateApplied, "d MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {vaccine.dateDue 
                      ? format(vaccine.dateDue, "d MMM yyyy", { locale: es })
                      : '—'
                    }
                  </TableCell>
                  <TableCell className="text-muted-foreground">{vaccine.appliedBy}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {vaccine.lotNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[vaccine.status].variant} className="text-xs">
                      {statusConfig[vaccine.status].icon}
                      {vaccine.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
