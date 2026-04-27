"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  X, Copy as CopyIcon, Calendar, Clock, User, Weight, Thermometer, Heart, Wind,
  FileText, Image, FlaskConical, X as XRay, Eye, Printer, Edit, PenBox, CheckCircle2,
} from "lucide-react"
import type { ClinicalRecordView } from "@/lib/types/clinical-records-view"
import { ATTENTION_CONFIG, STATUS_CONFIG } from "@/lib/types/clinical-records-view"
import { finalizarClinicalRecord, firmarClinicalRecord } from "@/lib/actions/clinical-records"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RecordDetailDrawerProps {
  record: ClinicalRecordView | null
  isOpen: boolean
  onClose: () => void
}

const fileIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="size-8 text-red-500" strokeWidth={1.5} />,
  IMAGEN: <Image className="size-8 text-blue-500" strokeWidth={1.5} />,
  LAB: <FlaskConical className="size-8 text-purple-500" strokeWidth={1.5} />,
  RADIOGRAFIA: <XRay className="size-8 text-cyan-500" strokeWidth={1.5} />,
}

export function RecordDetailDrawer({ record, isOpen, onClose }: RecordDetailDrawerProps) {
  const router = useRouter()
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  if (!record) return null

  const tc = ATTENTION_CONFIG[record.type] ?? { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" }
  const sc = STATUS_CONFIG[record.status] ?? { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" }
  const iconTypes = ["PDF", "IMAGEN", "LAB", "RADIOGRAFIA"]

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-[640px] max-w-full flex-col bg-background border-l border-border shadow-xl transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="border-b px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                style={{ background: record.patient.color }}
              >
                {record.patient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-semibold">{record.patient.name}</h3>
                <p className="text-xs text-muted-foreground">{record.patient.breed} · {record.patient.species}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", tc.bg, tc.text)}>
              <span className={cn("size-1.5 rounded-full", tc.dot)} />
              {record.type}
            </span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", sc.bg, sc.text)}>
              <span className={cn("size-1.5 rounded-full", sc.dot)} />
              {record.status}
            </span>
            {record.attachments > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Eye className="size-3" strokeWidth={1.5} />
                {record.attachments} adjunto{record.attachments !== 1 ? "s" : ""}
              </Badge>
            )}
            {record.signedBy && record.signedAt && (
              <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="size-3" strokeWidth={1.5} />
                Firmado por {record.signedBy}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Atencion info */}
          <div className="p-5 border-b">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Información de la atención
            </h4>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span>{format(record.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span>{format(record.date, "HH:mm")} {record.duration ? `(${record.duration} min)` : ""}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <User className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span>Dr. {record.veterinarian.name}</span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Motivo de consulta</p>
              <p className="text-sm">{record.visitReason}</p>
            </div>
          </div>

          {/* Vitals */}
          {record.vitals && (
            <div className="p-5 border-b">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Datos clínicos
              </h4>
              <div className="grid grid-cols-5 gap-3">
                <VitalCard icon={<Weight className="size-4" strokeWidth={1.5} />} label="Peso" value={record.vitals.weight ? `${record.vitals.weight} kg` : "—"} />
                <VitalCard icon={<Thermometer className="size-4" strokeWidth={1.5} />} label="Temp." value={record.vitals.temperature ? `${record.vitals.temperature}°C` : "—"} />
                <VitalCard icon={<Heart className="size-4" strokeWidth={1.5} />} label="FC" value={record.vitals.heartRate ? `${record.vitals.heartRate} lpm` : "—"} />
                <VitalCard icon={<Wind className="size-4" strokeWidth={1.5} />} label="FR" value={record.vitals.respRate ? `${record.vitals.respRate} rpm` : "—"} />
                <VitalCard label="Mucosas" value={record.vitals.mucous ?? "—"} />
              </div>
            </div>
          )}

          {/* SOAP */}
          <div className="p-5 border-b">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Notas SOAP
            </h4>
            <div className="grid gap-4">
              {record.soap.subjective && (
                <SoapSection title="Subjetivo" content={record.soap.subjective} />
              )}
              {record.soap.objective && (
                <SoapSection title="Objetivo" content={record.soap.objective} />
              )}
              {record.soap.analysis && (
                <SoapSection title="Análisis" content={record.soap.analysis} />
              )}
              {record.soap.plan && (
                <SoapSection title="Plan" content={record.soap.plan} />
              )}
            </div>
            {record.diagnoses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {record.diagnoses.map((d, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] gap-1 font-mono">
                    <span className="text-muted-foreground">{d.cie10}</span>
                    {d.description}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Medications */}
          {record.medications.length > 0 && (
            <div className="p-5 border-b">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Medicación prescrita
              </h4>
              <div className="space-y-2">
                {record.medications.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.dose} · {m.frequency ?? ""}{m.duration ? ` · ${m.duration}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Procedures */}
          {record.procedures.length > 0 && (
            <div className="p-5 border-b">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Procedimientos realizados
              </h4>
              <div className="space-y-1">
                {record.procedures.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-[11px] text-muted-foreground">{p.code}</span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {record.files.length > 0 && (
            <div className="p-5 border-b">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Archivos adjuntos
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {record.files.map((f, i) => {
                  const fileIcon = iconTypes.includes(f.type)
                    ? fileIcons[f.type] ?? fileIcons["PDF"]
                    : <FileText className="size-8 text-gray-400" strokeWidth={1.5} />
                  const fileUrl = f.url.startsWith("/") ? f.url : `/uploads/${f.url}`
                  return (
                    <a
                      key={i}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      {fileIcon}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground">{f.size ?? ""}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Next control */}
          {record.followUp && (
            <div className="mx-5 my-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-amber-600" strokeWidth={1.5} />
                <p className="text-sm font-medium text-amber-800">Próximo control</p>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                {record.nextControl ? format(record.nextControl, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : "Pendiente"}
              </p>
            </div>
          )}
        </div>

        <div className="border-t px-5 py-3 flex items-center justify-between">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => window.print()}>
            <Printer className="size-3.5" strokeWidth={1.5} />
            Imprimir
          </Button>
          <div className="flex items-center gap-2">
            {record.status === "Borrador" && (
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={async () => {
                await finalizarClinicalRecord(record.id); router.refresh()
              }}>
                <PenBox className="size-3.5" strokeWidth={1.5} />
                Finalizar
              </Button>
            )}
            {record.status === "Finalizado" && (
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={async () => {
                if (confirm("¿Firmar digitalmente este registro? Una vez firmado no podrá modificarse."))
                  await firmarClinicalRecord(record.id); router.refresh()
              }}>
                <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
                Firmar
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"
              onClick={() => { onClose(); router.push(`/pacientes/${record.patientId}`) }}>
              <Edit className="size-3.5" strokeWidth={1.5} />
              Ir a paciente
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function VitalCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function SoapSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground mb-1">{title}</p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
