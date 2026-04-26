"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, Send, MessageSquare, Mail, Phone } from "lucide-react"
import { reminderTemplates, type ReminderTemplate } from "@/lib/config-statics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const VARIABLES = ["{nombre_dueño}","{nombre_paciente}","{fecha_cita}","{hora_cita}","{veterinario}","{servicio}","{telefono_clinica}"]

function ChannelToggle({
  icon: Icon, label, checked, onChange,
}: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
        checked ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.5} />
      {label}
    </button>
  )
}

function renderPreview(body: string): string {
  return body
    .replace(/\{nombre_dueño\}/g, "Carlos Ruiz")
    .replace(/\{nombre_paciente\}/g, "Max")
    .replace(/\{fecha_cita\}/g, "miércoles 23 de abril")
    .replace(/\{hora_cita\}/g, "09:00")
    .replace(/\{veterinario\}/g, "Dra. Marly Jara")
    .replace(/\{servicio\}/g, "Consulta general")
    .replace(/\{telefono_clinica\}/g, "608-555-0100")
    .replace(/\{nombre_vacuna\}/g, "DA2PPL")
    .replace(/\{fecha_vencimiento\}/g, "30 de abril de 2026")
    .replace(/\{edad\}/g, "3")
    .replace(/\{diagnostico\}/g, "Dermatitis alérgica")
    .replace(/\{tratamiento\}/g, "Betametasona tópica 10 días")
    .replace(/\{fecha_control\}/g, "6 de mayo de 2026")
}

function TemplateCard({ template: initial }: { template: ReminderTemplate }) {
  const [open, setOpen] = React.useState(false)
  const [template, setTemplate] = React.useState(initial)
  const [isDirty, setIsDirty] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)

  const update = <K extends keyof ReminderTemplate>(key: K, val: ReminderTemplate[K]) => {
    setTemplate(prev => ({ ...prev, [key]: val }))
    setIsDirty(true)
  }

  const toggleChannel = (ch: keyof ReminderTemplate["channels"]) => {
    setTemplate(prev => ({ ...prev, channels: { ...prev.channels, [ch]: !prev.channels[ch] } }))
    setIsDirty(true)
  }

  const highlightVars = (text: string) =>
    text.split(/(\{[^}]+\})/g).map((part, i) =>
      /^\{[^}]+\}$/.test(part)
        ? <span key={i} className="rounded bg-blue-100 px-0.5 text-blue-700 font-mono text-[10px]">{part}</span>
        : <React.Fragment key={i}>{part}</React.Fragment>
    )

  const activeChannels = Object.entries(template.channels).filter(([,v]) => v).map(([k]) => k).join(", ")

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{template.name}</p>
            {isDirty && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 font-medium">Modificado</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {template.channels.whatsapp && <span className="text-[10px] text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">WhatsApp</span>}
            {template.channels.email && <span className="text-[10px] text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">Email</span>}
            {template.channels.sms && <span className="text-[10px] text-violet-600 bg-violet-50 rounded px-1.5 py-0.5">SMS</span>}
            <span className="text-[10px] text-muted-foreground">· {template.timing}</span>
          </div>
        </div>
        {open ? <ChevronUp className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
               : <ChevronDown className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />}
      </button>

      {/* Expanded editor */}
      {open && (
        <div className="border-t border-border p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left: editor */}
            <div className="space-y-4">
              {/* Channels */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Canales de envío</Label>
                <div className="flex items-center gap-2">
                  <ChannelToggle icon={MessageSquare} label="WhatsApp" checked={template.channels.whatsapp} onChange={() => toggleChannel("whatsapp")} />
                  <ChannelToggle icon={Mail}          label="Email"    checked={template.channels.email}    onChange={() => toggleChannel("email")} />
                  <ChannelToggle icon={Phone}         label="SMS"      checked={template.channels.sms}      onChange={() => toggleChannel("sms")} />
                </div>
              </div>

              {/* Timing */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Tiempo de envío</Label>
                <Input
                  value={template.timing}
                  onChange={e => update("timing", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Subject (email only) */}
              {template.channels.email && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Asunto (email)</Label>
                  <Input
                    value={template.subject}
                    onChange={e => update("subject", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Asunto del correo..."
                  />
                </div>
              )}

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">Cuerpo del mensaje</Label>
                  <button onClick={() => setShowPreview(!showPreview)} className="text-[11px] text-primary hover:underline">
                    {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
                  </button>
                </div>
                <Textarea
                  value={template.body}
                  onChange={e => update("body", e.target.value)}
                  rows={8}
                  className="text-xs font-mono resize-none"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {VARIABLES.map(v => (
                    <span key={v} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-mono text-blue-700 cursor-default">{v}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: preview */}
            {showPreview && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Vista previa (con datos de ejemplo)</Label>
                <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs leading-relaxed whitespace-pre-wrap min-h-[200px]">
                  {renderPreview(template.body)}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              <Send className="size-3.5" strokeWidth={1.5} />
              Probar envío
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setTemplate(initial); setIsDirty(false) }}>
                Descartar
              </Button>
              <Button size="sm" className="h-7 text-xs" disabled={!isDirty} onClick={() => setIsDirty(false)}>
                Guardar plantilla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function SectionTemplates() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4">
        <h2 className="text-base font-semibold">Plantillas de recordatorios</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configura los mensajes automáticos que se envían a propietarios. Usa variables entre llaves para personalizar.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {reminderTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
      </div>
    </div>
  )
}
