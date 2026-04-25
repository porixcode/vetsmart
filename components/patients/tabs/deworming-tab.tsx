'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import type { Deworming } from "@/lib/types/patient-view"
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

interface DewormingTabProps {
  dewormings: Deworming[]
  onNewDeworming: () => void
}

export function DewormingTab({ dewormings, onNewDeworming }: DewormingTabProps) {
  const now = new Date()

  const getStatus = (nextDue?: Date) => {
    if (!nextDue) return null
    const diff = nextDue.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { label: 'Vencido', variant: 'destructive' as const }
    if (days <= 7) return { label: 'Próximamente', variant: 'outline' as const }
    return { label: 'Al día', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última desparasitación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {dewormings.length > 0 
                ? format(dewormings[0].dateApplied, "d MMM yyyy", { locale: es })
                : '—'
              }
            </p>
            {dewormings.length > 0 && (
              <p className="text-sm text-muted-foreground">{dewormings[0].product}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próxima desparasitación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {dewormings.length > 0 && dewormings[0].nextDue
                ? format(dewormings[0].nextDue, "d MMM yyyy", { locale: es })
                : '—'
              }
            </p>
            {dewormings.length > 0 && dewormings[0].nextDue && (
              <Badge 
                variant={getStatus(dewormings[0].nextDue)?.variant} 
                className="mt-1 text-xs"
              >
                {getStatus(dewormings[0].nextDue)?.label}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{dewormings.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Deworming Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Historial de desparasitaciones</CardTitle>
          <Button size="sm" onClick={onNewDeworming}>
            <Plus className="mr-2 size-4" strokeWidth={1.5} />
            Registrar desparasitación
          </Button>
        </CardHeader>
        <CardContent>
          {dewormings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No hay desparasitaciones registradas.</p>
              <Button className="mt-4" onClick={onNewDeworming}>
                <Plus className="mr-2 size-4" strokeWidth={1.5} />
                Agregar primera desparasitación
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead>Peso al aplicar</TableHead>
                  <TableHead>Fecha aplicación</TableHead>
                  <TableHead>Próxima aplicación</TableHead>
                  <TableHead>Aplicado por</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dewormings.map((deworming) => {
                  const status = getStatus(deworming.nextDue)
                  return (
                    <TableRow key={deworming.id}>
                      <TableCell className="font-medium">{deworming.product}</TableCell>
                      <TableCell className="text-muted-foreground">{deworming.dose}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {deworming.weightAtApplication} kg
                      </TableCell>
                      <TableCell>
                        {format(deworming.dateApplied, "d MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {deworming.nextDue 
                          ? format(deworming.nextDue, "d MMM yyyy", { locale: es })
                          : '—'
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {deworming.appliedBy}
                      </TableCell>
                      <TableCell>
                        {status && (
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
