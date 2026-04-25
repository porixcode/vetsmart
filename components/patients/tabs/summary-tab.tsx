'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Activity, Calendar, Syringe, ChevronRight, AlertCircle, Pill } from 'lucide-react'
import type { Patient, TimelineEvent } from "@/lib/types/patient-view"
import { formatRelativeDate } from "@/lib/utils/dates"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SummaryTabProps {
  patient: Patient
  timeline: TimelineEvent[]
  totalConsultations: number
}

const eventTypeColors: Record<string, string> = {
  'Consulta': 'bg-blue-500',
  'Vacuna': 'bg-green-500',
  'Desparasitación': 'bg-purple-500',
  'Cirugía': 'bg-red-500',
  'Examen': 'bg-amber-500',
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  'Consulta': <Activity className="size-3" strokeWidth={1.5} />,
  'Vacuna': <Syringe className="size-3" strokeWidth={1.5} />,
  'Desparasitación': <Pill className="size-3" strokeWidth={1.5} />,
  'Cirugía': <AlertCircle className="size-3" strokeWidth={1.5} />,
  'Examen': <Calendar className="size-3" strokeWidth={1.5} />,
}

export function SummaryTab({ patient, timeline, totalConsultations }: SummaryTabProps) {
  const lastConsultation = timeline.find(e => e.type === 'Consulta')
  const nextVaccine = patient.nextAppointment?.service.toLowerCase().includes('vacun') 
    ? patient.nextAppointment 
    : null

  // Mock active diagnoses
  const activeDiagnoses = patient.preexistingConditions.map((condition, i) => ({
    id: i,
    name: condition,
    diagnosedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    status: 'En seguimiento',
  }))

  // Mock current medications
  const currentMedications = patient.preexistingConditions.length > 0 ? [
    { name: 'Glucosamina/Condroitina', dosage: '1500mg', frequency: '1 vez al día', endDate: null },
    { name: 'Omega 3', dosage: '1000mg', frequency: '1 vez al día', endDate: null },
  ] : []

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalConsultations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {lastConsultation ? formatRelativeDate(lastConsultation.date) : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próxima vacuna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {nextVaccine ? `en ${Math.ceil((nextVaccine.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Línea de tiempo médica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0">
            {timeline.slice(0, 10).map((event, index) => (
              <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Timeline line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
                )}
                
                {/* Dot */}
                <div className={`relative z-10 mt-1.5 size-[22px] shrink-0 rounded-full ${eventTypeColors[event.type]} flex items-center justify-center text-white`}>
                  {eventTypeIcons[event.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.veterinarian}</p>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {format(event.date, "d MMM yyyy", { locale: es })}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  {event.recordId && (
                    <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                      Ver detalle
                      <ChevronRight className="ml-1 size-3" strokeWidth={1.5} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Diagnoses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diagnósticos activos</CardTitle>
          </CardHeader>
          <CardContent>
            {activeDiagnoses.length > 0 ? (
              <ul className="space-y-3">
                {activeDiagnoses.map((diagnosis) => (
                  <li key={diagnosis.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{diagnosis.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Diagnosticado: {format(diagnosis.diagnosedDate, "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {diagnosis.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay diagnósticos activos registrados.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Current Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medicación actual</CardTitle>
          </CardHeader>
          <CardContent>
            {currentMedications.length > 0 ? (
              <ul className="space-y-3">
                {currentMedications.map((med, i) => (
                  <li key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{med.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {med.dosage}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {med.frequency}
                      {med.endDate && ` · Hasta ${format(med.endDate, "d MMM", { locale: es })}`}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay medicación actual registrada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
