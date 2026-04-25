'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronUp, Plus, Filter } from 'lucide-react'
import type { ClinicalRecord } from "@/lib/types/patient-view"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ClinicalHistoryTabProps {
  records: ClinicalRecord[]
  onNewRecord: () => void
}

export function ClinicalHistoryTab({ records, onNewRecord }: ClinicalHistoryTabProps) {
  const [expandedIds, setExpandedIds] = React.useState<string[]>([])
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [vetFilter, setVetFilter] = React.useState('all')

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Get unique veterinarians
  const vets = [...new Set(records.map(r => r.veterinarian))]

  // Filter records
  const filteredRecords = records.filter(record => {
    if (vetFilter !== 'all' && record.veterinarian !== vetFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
        </div>
        
        <Input 
          type="date" 
          className="w-auto"
          placeholder="Desde"
        />
        <Input 
          type="date" 
          className="w-auto"
          placeholder="Hasta"
        />

        <Select value={vetFilter} onValueChange={setVetFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Veterinario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los veterinarios</SelectItem>
            {vets.map(vet => (
              <SelectItem key={vet} value={vet}>{vet}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay registros clínicos.</p>
              <Button className="mt-4" onClick={onNewRecord}>
                <Plus className="mr-2 size-4" strokeWidth={1.5} />
                Agregar primer registro
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map(record => (
            <Collapsible
              key={record.id}
              open={expandedIds.includes(record.id)}
              onOpenChange={() => toggleExpanded(record.id)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <time className="text-sm font-medium">
                            {format(record.date, "d 'de' MMMM, yyyy", { locale: es })}
                          </time>
                          {record.diagnosis && (
                            <Badge variant="secondary" className="text-xs">
                              {record.diagnosisCode}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.veterinarian} · {record.visitReason}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-8">
                        {expandedIds.includes(record.id) ? (
                          <ChevronUp className="size-4" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown className="size-4" strokeWidth={1.5} />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="border-t pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Subjective */}
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Subjetivo
                        </h4>
                        <p className="mt-1 text-sm">{record.soap.subjective}</p>
                      </div>

                      {/* Objective */}
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Objetivo
                        </h4>
                        <p className="mt-1 text-sm">{record.soap.objective}</p>
                      </div>

                      {/* Analysis */}
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Análisis
                        </h4>
                        <p className="mt-1 text-sm">{record.soap.analysis}</p>
                      </div>

                      {/* Plan */}
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Plan
                        </h4>
                        <p className="mt-1 text-sm">{record.soap.plan}</p>
                      </div>
                    </div>

                    {/* Diagnosis & Treatment */}
                    {(record.diagnosis || record.treatment) && (
                      <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-2">
                        {record.diagnosis && (
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Diagnóstico
                            </h4>
                            <p className="mt-1 text-sm">{record.diagnosis}</p>
                          </div>
                        )}
                        {record.treatment && (
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Tratamiento
                            </h4>
                            <p className="mt-1 text-sm">{record.treatment}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {record.nextControl && (
                      <div className="mt-4 rounded-lg bg-muted/50 p-3">
                        <p className="text-sm">
                          <span className="font-medium">Próximo control:</span>{' '}
                          {format(record.nextControl, "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg"
        onClick={onNewRecord}
      >
        <Plus className="size-6" strokeWidth={1.5} />
        <span className="sr-only">Nuevo registro</span>
      </Button>
    </div>
  )
}
