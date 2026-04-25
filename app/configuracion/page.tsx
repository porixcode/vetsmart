"use client"

import * as React from "react"
import {
  Building2, MapPin, Clock, CalendarOff,
  Stethoscope, Tag, FileText, BookOpen,
  Bell, Radio, MessageSquare,
  Package, Truck, BarChart2, AlertTriangle,
  Receipt, Hash, Percent, CreditCard,
  Palette, Globe, HardDrive, Plug, History,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { SectionGeneral }     from "@/components/config/section-general"
import { SectionSchedule }    from "@/components/config/section-schedule"
import { SectionServices }    from "@/components/config/section-services"
import { SectionTemplates }   from "@/components/config/section-templates"
import { SectionPlaceholder } from "@/components/config/section-placeholder"
import { cn } from "@/lib/utils"

type SectionId =
  | "general" | "branches" | "schedule" | "holidays"
  | "services" | "categories-clinical" | "record-templates" | "diagnoses"
  | "reminder-templates" | "channels" | "auto-messages"
  | "product-categories" | "suppliers" | "min-stock" | "expiry-alerts"
  | "fiscal" | "invoice-numbering" | "taxes" | "payment-methods"
  | "appearance" | "language" | "backups" | "integrations" | "changelog"

interface NavItem { id: SectionId; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
interface NavGroup { group: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    group: "PERFIL DE LA CLÍNICA",
    items: [
      { id:"general",   label:"Información general",      icon:Building2 },
      { id:"branches",  label:"Sucursales y consultorios", icon:MapPin },
      { id:"schedule",  label:"Horarios de atención",      icon:Clock },
      { id:"holidays",  label:"Días no laborables",        icon:CalendarOff },
    ],
  },
  {
    group: "OPERACIÓN",
    items: [
      { id:"services",           label:"Servicios y tarifas",        icon:Stethoscope },
      { id:"categories-clinical",label:"Categorías clínicas",        icon:Tag },
      { id:"record-templates",   label:"Plantillas de historial",    icon:FileText },
      { id:"diagnoses",          label:"Diagnósticos frecuentes",    icon:BookOpen },
    ],
  },
  {
    group: "COMUNICACIÓN",
    items: [
      { id:"reminder-templates", label:"Plantillas de recordatorios", icon:Bell },
      { id:"channels",           label:"Canales de notificación",     icon:Radio },
      { id:"auto-messages",      label:"Mensajes automáticos",        icon:MessageSquare },
    ],
  },
  {
    group: "INVENTARIO",
    items: [
      { id:"product-categories", label:"Categorías de productos",  icon:Package },
      { id:"suppliers",          label:"Proveedores",              icon:Truck },
      { id:"min-stock",          label:"Reglas de stock mínimo",   icon:BarChart2 },
      { id:"expiry-alerts",      label:"Alertas de vencimiento",   icon:AlertTriangle },
    ],
  },
  {
    group: "FACTURACIÓN",
    items: [
      { id:"fiscal",            label:"Datos fiscales",            icon:Receipt },
      { id:"invoice-numbering", label:"Numeración de facturas",    icon:Hash },
      { id:"taxes",             label:"Impuestos y retenciones",   icon:Percent },
      { id:"payment-methods",   label:"Métodos de pago aceptados", icon:CreditCard },
    ],
  },
  {
    group: "SISTEMA",
    items: [
      { id:"appearance",    label:"Apariencia",         icon:Palette },
      { id:"language",      label:"Idioma y región",    icon:Globe },
      { id:"backups",       label:"Copias de seguridad",icon:HardDrive },
      { id:"integrations",  label:"Integraciones",      icon:Plug },
      { id:"changelog",     label:"Registro de cambios",icon:History },
    ],
  },
]

const SECTION_META: Partial<Record<SectionId, { title: string; description: string }>> = {
  branches:           { title:"Sucursales y consultorios", description:"Gestiona las sedes y salas de la clínica." },
  holidays:           { title:"Días no laborables", description:"Configura festivos y cierres temporales." },
  "categories-clinical": { title:"Categorías clínicas", description:"Organiza los tipos de diagnóstico y tratamiento." },
  "record-templates": { title:"Plantillas de historial", description:"Define los formatos SOAP predefinidos." },
  diagnoses:          { title:"Diagnósticos frecuentes (CIE-10)", description:"Administra el catálogo de diagnósticos comunes." },
  channels:           { title:"Canales de notificación", description:"Configura WhatsApp, email y SMS." },
  "auto-messages":    { title:"Mensajes automáticos", description:"Reglas de envío de mensajes sin intervención manual." },
  "product-categories":{ title:"Categorías de productos", description:"Organiza las categorías del inventario." },
  suppliers:          { title:"Proveedores", description:"Gestiona los proveedores y sus condiciones comerciales." },
  "min-stock":        { title:"Reglas de stock mínimo", description:"Define umbrales de alerta por categoría." },
  "expiry-alerts":    { title:"Alertas de vencimiento", description:"Configura los días de anticipación para alertas de vencimiento." },
  fiscal:             { title:"Datos fiscales", description:"Información tributaria para la generación de facturas." },
  "invoice-numbering":{ title:"Numeración de facturas", description:"Configura prefijos y rangos de numeración." },
  taxes:              { title:"Impuestos y retenciones", description:"IVA, ICA, retenciones aplicables." },
  "payment-methods":  { title:"Métodos de pago aceptados", description:"Efectivo, transferencia, tarjeta, QR." },
  appearance:         { title:"Apariencia", description:"Tema, colores y marca visual del sistema." },
  language:           { title:"Idioma y región", description:"Zona horaria, formato de fecha y moneda." },
  backups:            { title:"Copias de seguridad", description:"Programa y descarga backups de datos." },
  integrations:       { title:"Integraciones", description:"Conecta con servicios externos: WhatsApp Business, DIAN, etc." },
  changelog:          { title:"Registro de cambios", description:"Historial de cambios de configuración del sistema." },
}

function renderSection(id: SectionId) {
  if (id === "general")            return <SectionGeneral />
  if (id === "schedule")           return <SectionSchedule />
  if (id === "services")           return <SectionServices />
  if (id === "reminder-templates") return <SectionTemplates />

  const meta = SECTION_META[id]
  return <SectionPlaceholder title={meta?.title ?? id} description={meta?.description} />
}

export default function ConfiguracionPage() {
  const [activeSection, setActiveSection] = React.useState<SectionId>("general")

  return (
    <AppShell>
      <div className="flex h-full overflow-hidden">

        {/* ── Left navigation ── */}
        <nav className="w-60 shrink-0 overflow-y-auto border-r border-border bg-background py-4">
          {NAV.map(group => (
            <div key={group.group} className="mb-4">
              <p className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.group}
              </p>
              {group.items.map(item => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors relative",
                      isActive
                        ? "text-primary font-medium bg-primary/5 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r before:bg-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Content area ── */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {renderSection(activeSection)}
        </div>
      </div>
    </AppShell>
  )
}
