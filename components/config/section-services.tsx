"use client"

import * as React from "react"
import { Plus, MoreHorizontal, Search, ChevronDown } from "lucide-react"
import { clinicServices, categoryColors, SERVICE_CATEGORIES, type ServiceCategory, type ServiceStatus } from "@/lib/config-statics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const CURRENCY = new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", maximumFractionDigits:0 })

function VetAvatars({ vets }: { vets: Array<{ initials: string; color: string }> }) {
  const max = 3
  return (
    <div className="flex -space-x-1.5">
      {vets.slice(0, max).map((v, i) => (
        <div
          key={i}
          title={v.initials}
          className="flex size-6 items-center justify-center rounded-full border-2 border-background text-[9px] font-bold text-white"
          style={{ background: v.color }}
        >
          {v.initials}
        </div>
      ))}
      {vets.length > max && (
        <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-medium text-muted-foreground">
          +{vets.length - max}
        </div>
      )}
    </div>
  )
}

export function SectionServices() {
  const [search, setSearch] = React.useState("")
  const [selCategories, setSelCategories] = React.useState<ServiceCategory[]>([])
  const [selStatuses, setSelStatuses] = React.useState<ServiceStatus[]>([])

  const toggleCat = (c: ServiceCategory) => setSelCategories(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const toggleSt  = (s: ServiceStatus)   => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const filtered = clinicServices.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false
    if (selCategories.length > 0 && !selCategories.includes(s.category)) return false
    if (selStatuses.length > 0 && !selStatuses.includes(s.status)) return false
    return true
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-base font-semibold">Servicios y tarifas</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{clinicServices.length} servicios configurados · {clinicServices.filter(s => s.status === "Activo").length} activos</p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <Plus className="size-3.5" strokeWidth={1.5} />
          Nuevo servicio
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
          <Input placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              Categoría
              {selCategories.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selCategories.length}</span>}
              <ChevronDown className="size-3" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {SERVICE_CATEGORIES.map(c => (
              <DropdownMenuCheckboxItem key={c} checked={selCategories.includes(c)} onCheckedChange={() => toggleCat(c)}>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", categoryColors[c].bg, categoryColors[c].text)}>{c}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              Estado
              {selStatuses.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{selStatuses.length}</span>}
              <ChevronDown className="size-3" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(["Activo","Inactivo"] as ServiceStatus[]).map(s => (
              <DropdownMenuCheckboxItem key={s} checked={selStatuses.includes(s)} onCheckedChange={() => toggleSt(s)}>{s}</DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} servicios</div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-24">Código</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Duración</TableHead>
              <TableHead className="text-right">Precio base</TableHead>
              <TableHead>Veterinarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => {
              const cc = categoryColors[s.category]
              return (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[240px]">{s.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", cc.bg, cc.text)}>{s.category}</span>
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                    {s.duration >= 1440 ? `${s.duration/1440}d` : `${s.duration} min`}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums font-medium">
                    {CURRENCY.format(s.price)}
                  </TableCell>
                  <TableCell><VetAvatars vets={s.vets} /></TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      s.status === "Activo" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    )}>
                      <span className={cn("size-1.5 rounded-full", s.status === "Activo" ? "bg-emerald-500" : "bg-gray-400")} />
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" strokeWidth={1.5} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar servicio</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{s.status === "Activo" ? "Desactivar" : "Activar"}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
