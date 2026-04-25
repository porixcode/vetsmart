"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronDown, ChevronUp, Paperclip, Calendar } from "lucide-react"
import {
  type ClinicalRecord, recordTypeConfig, recordStatusConfig,
} from "@/lib/data/clinical-records"
import { cn } from "@/lib/utils"

interface RecordsTimelineProps {
  records: ClinicalRecord[]
  onRecordClick: (record: ClinicalRecord) => void
}

function groupByDate(records: ClinicalRecord[]): Array<{ dateKey: string; date: Date; records: ClinicalRecord[] }> {
  const map = new Map<string, { date: Date; records: ClinicalRecord[] }>()
  for (const r of records) {
    const key = format(r.date, "yyyy-MM-dd")
    if (!map.has(key)) map.set(key, { date: r.date, records: [] })
    map.get(key)!.records.push(r)
  }
  return Array.from(map.entries()).map(([dateKey, v]) => ({ dateKey, ...v }))
}

function TimelineCard({
  record,
  onClick,
}: {
  record: ClinicalRecord
  onClick: () => void
}) {
  const [expanded, setExpanded] = React.useState(false)
  const tc = recordTypeConfig[record.type]
  const sc = recordStatusConfig[record.status]

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border bg-background overflow-hidden border-l-4 transition-shadow",
        tc.border,
      )}
    >
      {/* Main row */}
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onClick}
      >
        {/* Patient avatar */}
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold mt-0.5"
          style={{ background: record.patient.color }}
        >
          {record.patient.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{record.patient.name}</span>
            <span className="text-xs text-muted-foreground">{record.patient.breed}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{record.owner.name}</span>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{record.reason}</p>

          {expanded && record.soap && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              {[
                { label: "S", text: record.soap.subjective },
                { label: "O", text: record.soap.objective },
                { label: "A", text: record.soap.analysis },
                { label: "P", text: record.soap.plan },
              ].map(({ label, text }) => (
                <div key={label} className="flex gap-2">
                  <span className="shrink-0 size-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {label}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
              {record.diagnoses.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {record.diagnoses.map(d => (
                    <span key={d.cie10} className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {d.cie10} {d.description}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Vet avatar */}
          <div
            className="flex size-6 items-center justify-center rounded-full text-white text-[9px] font-semibold"
            style={{ background: record.veterinarian.color }}
            title={record.veterinarian.name}
          >
            {record.veterinarian.lastName[0]}
          </div>

          {/* Type badge */}
          <span className={cn(
            "hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
            tc.bg, tc.text
          )}>
            <span className={cn("size-1.5 rounded-full", tc.dot)} />
            {record.type}
          </span>

          {/* Status badge */}
          <span className={cn(
            "hidden md:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            sc.bg, sc.text
          )}>
            {record.status}
          </span>

          {/* Attachments */}
          {record.attachments > 0 && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Paperclip className="size-3" strokeWidth={1.5} />
              <span className="text-[10px]">{record.attachments}</span>
            </div>
          )}

          {/* Follow-up */}
          {record.followUp && (
            <span title={`Seguimiento: ${format(record.followUp, "d MMM", { locale: es })}`}>
              <Calendar className="size-3.5 text-amber-500" strokeWidth={1.5} />
            </span>
          )}

          {/* Expand toggle */}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
            className="rounded p-0.5 hover:bg-muted transition-colors text-muted-foreground"
          >
            {expanded
              ? <ChevronUp className="size-4" strokeWidth={1.5} />
              : <ChevronDown className="size-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function RecordsTimeline({ records, onRecordClick }: RecordsTimelineProps) {
  const groups = groupByDate(records)

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">No se encontraron registros con esos filtros.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {groups.map(group => (
        <div key={group.dateKey}>
          {/* Sticky date header */}
          <div className="sticky top-0 z-10 mb-3 flex items-center gap-3 bg-background py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {format(group.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              {" "}
              <span className="text-foreground">— {group.records.length} atencion{group.records.length !== 1 ? "es" : ""}</span>
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Timeline entries */}
          <div className="relative pl-16">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-3">
              {group.records.map(r => (
                <div key={r.id} className="relative">
                  {/* Time label on left axis */}
                  <div className="absolute -left-16 top-3 flex w-12 justify-end">
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {format(r.date, "HH:mm")}
                    </span>
                  </div>

                  {/* Dot on the line */}
                  <div className={cn(
                    "absolute -left-[1.15rem] top-3.5 size-2.5 rounded-full border-2 border-background",
                    recordTypeConfig[r.type].dot
                  )} />

                  <TimelineCard record={r} onClick={() => onRecordClick(r)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
