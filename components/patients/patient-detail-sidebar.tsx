'use client'

import { Phone, Mail, MapPin, Plus, FileText, Pencil, Archive } from 'lucide-react'
import type { Patient } from "@/lib/types/patient-view"
import { formatAge } from "@/lib/utils/dates"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PatientDetailSidebarProps {
  patient: Patient
  onNewAppointment: () => void
  onAddRecord: () => void
  onEdit: () => void
  onArchive: () => void
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Activo': 'default',
  'Inactivo': 'secondary',
  'En tratamiento': 'outline',
}

export function PatientDetailSidebar({
  patient,
  onNewAppointment,
  onAddRecord,
  onEdit,
  onArchive,
}: PatientDetailSidebarProps) {
  return (
    <TooltipProvider>
      <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-80 flex-col border-r bg-background">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Patient Avatar & Basic Info */}
          <div className="flex flex-col items-center text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {patient.name.charAt(0)}
            </div>
            <h2 className="mt-3 text-xl font-semibold">{patient.name}</h2>
            <p className="text-sm text-muted-foreground">{patient.breed}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {patient.id}
              </Badge>
              <Badge variant={statusVariants[patient.status]}>
                {patient.status}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Edad</p>
              <p className="text-sm font-medium">{formatAge(patient.birthDate)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Peso</p>
              <p className="text-sm font-medium">{patient.weight} kg</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Sexo</p>
              <p className="text-sm font-medium">{patient.sex}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Esterilizado</p>
              <p className="text-sm font-medium">{patient.neutered ? 'Sí' : 'No'}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Owner Info */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dueño
            </h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {patient.owner.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{patient.owner.name}</span>
              </div>

              <a 
                href={`tel:${patient.owner.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="size-4" strokeWidth={1.5} />
                {patient.owner.phone}
              </a>

              <a 
                href={`mailto:${patient.owner.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="size-4" strokeWidth={1.5} />
                {patient.owner.email}
              </a>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                    <span className="line-clamp-2">{patient.owner.address}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {patient.owner.address}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Allergies & Conditions */}
          {(patient.allergies.length > 0 || patient.preexistingConditions.length > 0) && (
            <>
              <div className="space-y-4">
                {patient.allergies.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Alergias
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patient.preexistingConditions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Condiciones
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {patient.preexistingConditions.map((condition, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Separator className="my-6" />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="border-t p-4 space-y-2">
          <Button className="w-full" onClick={onNewAppointment}>
            <Plus className="mr-2 size-4" strokeWidth={1.5} />
            Nueva cita
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onAddRecord}>
            <FileText className="mr-2 size-4" strokeWidth={1.5} />
            Agregar registro
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onEdit}>
            <Pencil className="mr-2 size-4" strokeWidth={1.5} />
            Editar paciente
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive" 
            onClick={onArchive}
          >
            <Archive className="mr-2 size-4" strokeWidth={1.5} />
            Archivar
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
