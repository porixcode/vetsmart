"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, Clock, Calendar, User, ThumbsUp, ThumbsDown,
  Lightbulb, AlertTriangle, ImageIcon, ChevronRight,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { ARTICLES, POPULAR_ARTICLES, type ArticleBlock } from "@/lib/data/help"
import { cn } from "@/lib/utils"

const CATEGORY_BADGE: Record<string, string> = {
  "primeros-pasos": "bg-violet-50 text-violet-700",
  "pacientes":       "bg-blue-50 text-blue-700",
  "citas":           "bg-emerald-50 text-emerald-700",
  "historial":       "bg-amber-50 text-amber-700",
  "inventario":      "bg-orange-50 text-orange-700",
  "reportes":        "bg-teal-50 text-teal-700",
}

function BlockRenderer({ block }: { block: ArticleBlock }) {
  if (block.type === "paragraph") {
    return <p className="text-sm leading-relaxed text-foreground">{block.text}</p>
  }

  if (block.type === "tip") {
    return (
      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Lightbulb className="size-4 shrink-0 text-blue-600 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs leading-relaxed text-blue-800">{block.text}</p>
      </div>
    )
  }

  if (block.type === "warning") {
    return (
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs leading-relaxed text-amber-800">{block.text}</p>
      </div>
    )
  }

  if (block.type === "steps") {
    return (
      <ol className="space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground mt-0.5">
              {i + 1}
            </span>
            <span className="text-foreground">{item}</span>
          </li>
        ))}
      </ol>
    )
  }

  if (block.type === "image") {
    return (
      <figure className="space-y-2">
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
          <div className="text-center">
            <ImageIcon className="mx-auto size-8 text-muted-foreground/50" strokeWidth={1} />
            <p className="mt-1 text-xs text-muted-foreground">{block.alt}</p>
          </div>
        </div>
        <figcaption className="text-center text-[11px] text-muted-foreground">{block.caption}</figcaption>
      </figure>
    )
  }

  if (block.type === "code") {
    return (
      <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
        <code>{block.text}</code>
      </pre>
    )
  }

  return null
}

function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
        <p className="text-sm font-medium">Artículo no encontrado</p>
        <p className="text-xs text-muted-foreground">El artículo que buscas no existe o fue movido.</p>
        <Link href="/ayuda">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 mt-2">
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            Volver a Ayuda
          </Button>
        </Link>
      </div>
    </AppShell>
  )
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = ARTICLES[slug]

  const [feedback, setFeedback] = React.useState<"up" | "down" | null>(null)
  const [activeSection, setActiveSection] = React.useState(article?.sections[0]?.id ?? "")

  React.useEffect(() => {
    if (!article) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) setActiveSection(visible[0].target.id)
      },
      { rootMargin: "-20% 0% -60% 0%", threshold: 0 }
    )
    article.sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [article])

  if (!article) return <NotFound />

  const relatedArticles = article.related
    .map(r => POPULAR_ARTICLES.find(a => a.slug === r))
    .filter(Boolean)

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex gap-8">

            {/* ── Left: ToC ── */}
            <aside className="w-56 shrink-0 hidden lg:block">
              <div className="sticky top-6 space-y-4">
                <Link href="/ayuda" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                  Volver a Ayuda
                </Link>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">En este artículo</p>
                  <nav className="space-y-0.5">
                    {article.sections.map(section => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={cn(
                          "block rounded px-2 py-1.5 text-xs transition-colors",
                          activeSection === section.id
                            ? "bg-primary/5 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* ── Right: Article content ── */}
            <article className="flex-1 min-w-0">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-5">
                <Link href="/ayuda" className="hover:text-foreground transition-colors">Ayuda</Link>
                <ChevronRight className="size-3" strokeWidth={1.5} />
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", CATEGORY_BADGE[article.categoryId])}>
                  {article.category}
                </span>
                <ChevronRight className="size-3" strokeWidth={1.5} />
                <span className="text-foreground truncate max-w-[280px]">{article.title}</span>
              </nav>

              <h1 className="text-2xl font-semibold tracking-tight mb-4">{article.title}</h1>

              {/* Metadata bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pb-5 border-b border-border mb-8">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3.5" strokeWidth={1.5} />
                  Actualizado el {article.lastUpdated}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3.5" strokeWidth={1.5} />
                  {article.readTime} min de lectura
                </div>
                <div className="flex items-center gap-1">
                  <User className="size-3.5" strokeWidth={1.5} />
                  {article.author}
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-10">
                {article.sections.map(section => (
                  <section key={section.id} id={section.id} className="scroll-mt-6">
                    <h2 className="text-base font-semibold mb-4">{section.title}</h2>
                    <div className="space-y-4">
                      {section.content.map((block, i) => (
                        <BlockRenderer key={i} block={block} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* Feedback */}
              <div className="mt-12 rounded-xl border border-border bg-muted/20 p-5 text-center space-y-3">
                <p className="text-sm font-medium">¿Te resultó útil este artículo?</p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant={feedback === "up" ? "default" : "outline"}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setFeedback("up")}
                  >
                    <ThumbsUp className="size-3.5" strokeWidth={1.5} />
                    Sí, me ayudó
                  </Button>
                  <Button
                    variant={feedback === "down" ? "destructive" : "outline"}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setFeedback("down")}
                  >
                    <ThumbsDown className="size-3.5" strokeWidth={1.5} />
                    Necesita mejoras
                  </Button>
                </div>
                {feedback && (
                  <p className="text-xs text-muted-foreground">
                    {feedback === "up" ? "¡Gracias por tu feedback! Nos alegra que fuera útil." : "Gracias — tu feedback nos ayuda a mejorar la documentación."}
                  </p>
                )}
              </div>

              {/* Related articles */}
              {relatedArticles.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold mb-3">Artículos relacionados</h3>
                  <div className="space-y-2">
                    {relatedArticles.map(related => related && (
                      <Link
                        key={related.slug}
                        href={`/ayuda/articulos/${related.slug}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3 hover:bg-muted/20 transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{related.title}</p>
                          <p className="text-[11px] text-muted-foreground">{related.readTime} min · {related.category}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </article>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
