"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Paperclip, Clock } from "lucide-react"
import type { ClinicalRecordView } from "@/lib/types/clinical-records-view"
import { ATTENTION_CONFIG, STATUS_CONFIG } from "@/lib/types/clinical-records-view"
import { cn } from "@/lib/utils"

interface RecordsTimelineProps {
  records: ClinicalRecordView[]
  onRecordClick: (record: ClinicalRecordView) => void
}

export function RecordsTimeline({ records, onRecordClick }: RecordsTimelineProps) {
  const grouped = React.useMemo(() => {
    const groups: Array<{ date: Date; label: string; records: ClinicalRecordView[] }> = []
    let currentGroup: (typeof groups)[number] | null = null

    for (const r of records) {
      if (!currentGroup || !isSameDay(r.date, currentGroup.date)) {
        const isToday = isSameDay(r.date, new Date())
        const isYesterday = isSameDay(r.date, new Date(Date.now() - 86400000))
        const label = isToday ? "Hoy" : isYesterday ? "Ayer" : format(r.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
        currentGroup = { date: r.date, label: label.charAt(0).toUpperCase() + label.slice(1), records: [] }
        groups.push(currentGroup)
      }
      currentGroup.records.push(r)
    }

    return groups
  }, [records])

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">No se encontraron registros clínicos</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {grouped.map(group => (
        <div key={group.date.toISOString()}>
          <div className="sticky top-0 z-10 bg-background pb-2 mb-4 border-b">
            <h3 className="text-sm font-semibold">{group.label}</h3>
          </div>

          <div className="relative space-y-0">
            {group.records.map((r, i) => {
              const tc = ATTENTION_CONFIG[r.type] ?? { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" }
              const sc = STATUS_CONFIG[r.status] ?? { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" }
              const isLast = i === group.records.length - 1

              return (
                <div key={r.id} className="relative flex gap-4 pb-6">
                  {!isLast && (
                    <div className="absolute left-[11px] top-5 bottom-0 w-px bg-border" />
                  )}

                  <div className="flex shrink-0 flex-col items-center pt-1">
                    <span className={cn("size-[6px] rounded-full ring-2 ring-background", tc.dot)} />
                  </div>

                  <div
                    className="flex-1 cursor-pointer rounded-lg border border-border bg-background p-3 hover:bg-muted/30 transition-colors min-w-0"
                    onClick={() => onRecordClick(r)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="size-6 shrink-0 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ background: r.patient.color }}
                        >
                          {r.patient.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{r.patient.name}</p>
                          <p className="text-xs text-muted-foreground">{r.patient.breed} · {r.owner.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", tc.bg, tc.text)}>
                          <span className={cn("size-1.5 rounded-full", tc.dot)} />
                          {r.type}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", sc.bg, sc.text)}>
                          <span className={cn("size-1.5 rounded-full", sc.dot)} />
                          {r.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Dr. {r.veterinarian.name}</span>
                        <span className="mx-1">·</span>
                        {format(r.date, "HH:mm", { locale: es })}
                      </p>
                      <p className="text-xs">{r.visitReason}</p>
                      {r.diagnoses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.diagnoses.slice(0, 3).map((d, i) => (
                            <span key={i} className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                              {d.cie10}
                            </span>
                          ))}
                          {r.diagnoses.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{r.diagnoses.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{r.veterinarian.lastName}</span>
                      {r.attachments > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="size-3" strokeWidth={1.5} />
                          {r.attachments}
                        </span>
                      )}
                      {r.followUp && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock className="size-3" strokeWidth={1.5} />
                          Seguimiento
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
