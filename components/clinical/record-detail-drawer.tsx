"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  X, ExternalLink, Clock, MapPin, LinkIcon,
  Thermometer, Heart, Wind, Scale, FileText, Image as ImageIcon, FlaskConical,
  AlertTriangle, CheckCircle2, Package,
} from "lucide-react"
import {
  type ClinicalRecord, recordTypeConfig, recordStatusConfig,
} from "@/lib/data/clinical-records"
import { cn } from "@/lib/utils"

interface RecordDetailDrawerProps {
  record: ClinicalRecord | null
  isOpen: boolean
  onClose: () => void
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function InfoGrid({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-[11px] text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium mt-0.5">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function FileTypeIcon({ type }: { type: "pdf" | "image" | "lab" }) {
  if (type === "image") return <ImageIcon className="size-5 text-blue-500" strokeWidth={1.5} />
  if (type === "lab")   return <FlaskConical className="size-5 text-violet-500" strokeWidth={1.5} />
  return <FileText className="size-5 text-red-500" strokeWidth={1.5} />
}

export function RecordDetailDrawer({ record, isOpen, onClose }: RecordDetailDrawerProps) {
  // Trap keyboard close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  if (!record) return null

  const tc = recordTypeConfig[record.type]
  const sc = recordStatusConfig[record.status]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[640px] max-w-full flex-col bg-background border-l border-border shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Sticky header ── */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-white text-base font-bold"
              style={{ background: record.patient.color }}
            >
              {record.patient.name[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{record.patient.name}</h3>
                <button className="text-xs text-primary hover:underline flex items-center gap-0.5 shrink-0">
                  Ver paciente <ExternalLink className="size-3" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">
                  {format(record.date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </p>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  sc.bg, sc.text
                )}>
                  <span className={cn("size-1.5 rounded-full", sc.dot)} />
                  {record.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-5">

            {/* Section 1 — Información de la atención */}
            <div>
              <SectionHeader title="Información de la atención" />
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                    style={{ background: record.veterinarian.color }}
                  >
                    {record.veterinarian.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{record.veterinarian.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {record.veterinarian.specialty} · Ced. Prof. {record.veterinarian.cedula}
                    </p>
                  </div>
                  <span className={cn(
                    "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    tc.bg, tc.text
                  )}>
                    <span className={cn("size-1.5 rounded-full", tc.dot)} />
                    {record.type}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Duración</p>
                      <p className="text-xs font-medium">{record.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Sala</p>
                      <p className="text-xs font-medium">{record.room}</p>
                    </div>
                  </div>
                  {record.appointmentId && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Cita</p>
                        <button className="text-xs font-medium text-primary hover:underline">{record.appointmentId}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2 — Datos clínicos */}
            <div>
              <SectionHeader title="Datos clínicos del momento" />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Scale,       label: "Peso",                value: `${record.vitals.weight} kg` },
                  { icon: Thermometer, label: "Temperatura",         value: `${record.vitals.temp} °C` },
                  { icon: Heart,       label: "Frec. cardíaca",      value: `${record.vitals.heartRate} lpm` },
                  { icon: Wind,        label: "Frec. respiratoria",  value: `${record.vitals.respRate} rpm` },
                  { icon: CheckCircle2,label: "Mucosas",             value: record.vitals.mucosas },
                  { icon: Clock,       label: "TLLC",                value: record.vitals.tllc },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5">
                    <Icon className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-xs font-semibold tabular-nums">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 — SOAP */}
            <div>
              <SectionHeader title="SOAP" />
              <div className="space-y-2">
                {[
                  { key: "S", label: "Subjetivo",  text: record.soap.subjective },
                  { key: "O", label: "Objetivo",   text: record.soap.objective },
                  { key: "A", label: "Análisis",   text: record.soap.analysis },
                  { key: "P", label: "Plan",       text: record.soap.plan },
                ].map(({ key, label, text }) => (
                  <div key={key} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-foreground">
                        {key}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{text}</p>
                    {key === "A" && record.diagnoses.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {record.diagnoses.map(d => (
                          <span key={d.cie10} className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-[10px]">
                            <span className="font-mono font-semibold">{d.cie10}</span>
                            <span className="text-muted-foreground">{d.description}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4 — Medicación prescrita */}
            {record.medications.length > 0 && (
              <div>
                <SectionHeader title="Medicación prescrita" />
                <div className="space-y-2">
                  {record.medications.map((med, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{med.name}</p>
                          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                            {[
                              { l: "Dosis", v: med.dosage },
                              { l: "Frecuencia", v: med.frequency },
                              { l: "Duración", v: med.duration },
                              { l: "Vía", v: med.route },
                            ].map(({ l, v }) => (
                              <div key={l}>
                                <span className="text-[10px] text-muted-foreground">{l}: </span>
                                <span className="text-[11px] font-medium">{v}</span>
                              </div>
                            ))}
                          </div>
                          {med.notes && (
                            <p className="mt-1.5 text-[11px] text-muted-foreground italic">{med.notes}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          {med.stockAvailable !== null ? (
                            <div className={cn(
                              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                              med.stockAvailable > 10
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            )}>
                              {med.stockAvailable <= 10 && <AlertTriangle className="size-2.5" strokeWidth={1.5} />}
                              <Package className="size-2.5" strokeWidth={1.5} />
                              {med.stockAvailable > 10
                                ? `Disponible: ${med.stockAvailable} u.`
                                : `Stock crítico: ${med.stockAvailable} u.`}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Sin stock ref.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5 — Procedimientos */}
            {record.procedures.length > 0 && (
              <div>
                <SectionHeader title="Procedimientos realizados" />
                <div className="rounded-lg border border-border bg-background overflow-hidden">
                  {record.procedures.map((proc, i) => (
                    <div key={proc.code} className={cn(
                      "flex items-center gap-3 px-3 py-2.5",
                      i < record.procedures.length - 1 && "border-b border-border"
                    )}>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
                        {proc.code}
                      </span>
                      <span className="text-sm">{proc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6 — Archivos adjuntos */}
            {record.files.length > 0 && (
              <div>
                <SectionHeader title="Archivos adjuntos" />
                <div className="grid grid-cols-2 gap-2">
                  {record.files.map((f, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <FileTypeIcon type={f.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {f.size} · {format(f.date, "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Next control */}
            {record.nextControl && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="size-4 text-amber-600 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Seguimiento pendiente</p>
                  <p className="text-[11px] text-amber-700">
                    Control programado para el {format(record.nextControl, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="border-t border-border px-5 py-3 flex items-center justify-between">
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Imprimir / exportar PDF
          </button>
          <div className="flex items-center gap-2">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border hover:bg-muted">
              Editar
            </button>
            <button className="text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3 py-1.5 rounded">
              Duplicar para nueva consulta
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
