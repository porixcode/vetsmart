"use client"

import * as React from "react"
import Link from "next/link"
import {
  Anchor, Book, Play, HelpCircle, MessageSquare,
  Rocket, PawPrint, CalendarDays, FileText, Package, BarChart2,
  Search, ExternalLink, Clock, ChevronRight,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HELP_CATEGORIES, POPULAR_ARTICLES } from "@/lib/data/help"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Rocket: Rocket, PawPrint: PawPrint, CalendarDays: CalendarDays,
  FileText: FileText, Package: Package, BarChart2: BarChart2,
}

const QUICK_ACTIONS = [
  {
    icon: Book,
    title: "Manual de usuario",
    description: "Guía completa del sistema, organizada por módulo. Incluye capturas y casos de uso.",
    link: "Abrir manual →",
    href: "#",
  },
  {
    icon: Play,
    title: "Videos tutoriales",
    description: "Tutoriales en video de las funciones más usadas. 15 videos cortos.",
    link: "Ver biblioteca →",
    href: "#",
  },
  {
    icon: HelpCircle,
    title: "Preguntas frecuentes",
    description: "Respuestas a las dudas más comunes del equipo SERMEC.",
    link: "Ver FAQs →",
    href: "#",
  },
  {
    icon: MessageSquare,
    title: "Contactar soporte",
    description: "¿No encuentras lo que buscas? Escríbenos directamente.",
    link: "Abrir chat de soporte →",
    href: "#",
  },
]

const SUGGESTED = ["Crear cita", "Registrar paciente", "Generar reporte", "Resetear contraseña"]

const CATEGORY_BADGE: Record<string, string> = {
  "primeros-pasos": "bg-violet-50 text-violet-700",
  "pacientes":       "bg-blue-50 text-blue-700",
  "citas":           "bg-emerald-50 text-emerald-700",
  "historial":       "bg-amber-50 text-amber-700",
  "inventario":      "bg-orange-50 text-orange-700",
  "reportes":        "bg-teal-50 text-teal-700",
}

export default function AyudaPage() {
  const [query, setQuery] = React.useState("")

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-12">

          {/* ── Hero ── */}
          <div className="flex flex-col items-center text-center gap-5">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Anchor className="size-8 text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">¿Cómo podemos ayudarte?</h1>

            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar en la documentación..."
                className="pl-11 h-11 text-sm rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Búsquedas frecuentes:</span>
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon
              return (
                <div key={action.title} className="rounded-xl border border-border bg-background p-5 flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
                    <a href={action.href} className="mt-2 inline-block text-xs text-primary hover:underline">{action.link}</a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Categories ── */}
          <div>
            <h2 className="text-base font-semibold mb-4">Explorar por categoría</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {HELP_CATEGORIES.map(cat => {
                const Icon = CATEGORY_ICONS[cat.icon] ?? HelpCircle
                return (
                  <button
                    key={cat.id}
                    className="group text-left rounded-xl border border-border bg-background p-4 hover:border-primary/30 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border", cat.color)}>
                        <Icon className="size-4" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{cat.name}</p>
                          <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
                        <p className="mt-2 text-[11px] text-primary font-medium">{cat.articleCount} artículos</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Popular articles ── */}
          <div>
            <h2 className="text-base font-semibold mb-4">Artículos populares</h2>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {POPULAR_ARTICLES.map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/ayuda/articulos/${article.slug}`}
                  className="flex items-center gap-4 px-5 py-3.5 bg-background hover:bg-muted/20 transition-colors group"
                >
                  <span className="text-xs font-mono text-muted-foreground/50 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{article.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", CATEGORY_BADGE[article.categoryId])}>
                        {article.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Actualizado {article.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                    <Clock className="size-3" strokeWidth={1.5} />
                    {article.readTime} min lectura
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Footer support section ── */}
          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h2 className="text-base font-semibold mb-4 text-center">¿Necesitas más ayuda?</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-lg border border-border bg-background p-4 text-center space-y-1.5">
                <p className="text-sm font-medium">Soporte técnico</p>
                <p className="text-xs text-primary font-medium">soporte@vetsmart.co</p>
                <p className="text-[11px] text-muted-foreground">Lunes a sábado · 7am – 7pm</p>
                <p className="text-[11px] text-muted-foreground">Respuesta en &lt; 4 horas hábiles</p>
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-center space-y-2">
                <p className="text-sm font-medium">Capacitación al equipo</p>
                <p className="text-[11px] text-muted-foreground">Sesiones 1:1 o grupales para tu personal</p>
                <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                  Agendar capacitación
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-center space-y-2">
                <p className="text-sm font-medium">Sugerir una mejora</p>
                <p className="text-[11px] text-muted-foreground">Tu feedback construye el producto</p>
                <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                  Enviar sugerencia
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>Versión 1.0.0 · Última actualización: Abril 2026</span>
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="flex items-center gap-0.5 hover:text-foreground transition-colors">
                Estado del servicio <ExternalLink className="size-2.5 ml-0.5" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}
