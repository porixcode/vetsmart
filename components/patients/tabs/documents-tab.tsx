'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Upload, FileText, Image, FlaskConical, X as XRay, FileCheck, File, Trash2, Download, ExternalLink } from 'lucide-react'
import type { Document as PatientDocument } from "@/lib/types/patient-view"
import { deleteDocument } from "@/lib/actions/documents"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DocumentsTabProps {
  documents: PatientDocument[]
  onUpload: () => void
  patientId: string
}

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'Exámenes', label: 'Exámenes' },
  { id: 'Radiografías', label: 'Radiografías' },
  { id: 'Recetas', label: 'Recetas' },
  { id: 'Consentimientos', label: 'Consentimientos' },
  { id: 'Otros', label: 'Otros' },
]

const typeIcons: Record<string, React.ReactNode> = {
  'PDF': <FileText className="size-8 text-red-500" strokeWidth={1.5} />,
  'Imagen': <Image className="size-8 text-blue-500" strokeWidth={1.5} />,
  'Laboratorio': <FlaskConical className="size-8 text-purple-500" strokeWidth={1.5} />,
  'Radiografía': <XRay className="size-8 text-cyan-500" strokeWidth={1.5} />,
  'Receta': <FileCheck className="size-8 text-green-500" strokeWidth={1.5} />,
  'Consentimiento': <FileCheck className="size-8 text-amber-500" strokeWidth={1.5} />,
  'Otro': <File className="size-8 text-gray-500" strokeWidth={1.5} />,
}

export function DocumentsTab({ documents, onUpload, patientId }: DocumentsTabProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [docs, setDocs] = React.useState(documents)

  React.useEffect(() => { setDocs(documents) }, [documents])

  const filteredDocuments = selectedCategory === 'all'
    ? docs
    : docs.filter(d => d.category === selectedCategory)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        formData.append('files', file)
      }
      formData.append('patientId', patientId)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.files) {
        router.refresh()
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (docId: string) => {
    const result = await deleteDocument(docId, patientId)
    if (result.ok) {
      setDocs(prev => prev.filter(d => d.id !== docId))
      router.refresh()
    }
  }

  return (
    <div className="flex gap-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="w-48 shrink-0">
        <nav className="space-y-1">
          {categories.map((category) => {
            const count = category.id === 'all'
              ? docs.length
              : docs.filter(d => d.category === category.id).length

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span>{category.label}</span>
                <span className={cn(
                  "text-xs",
                  selectedCategory === category.id ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          <Upload className="mb-3 size-10 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm font-medium">Arrastrar archivos o hacer clic para subir</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF, imágenes, documentos hasta 10MB</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Subiendo...' : 'Seleccionar archivos'}
          </Button>
        </div>

        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay documentos en esta categoría.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="group relative transition-colors hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <a
                      href={`/api/files/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 min-w-0 flex-1"
                    >
                      <div className="flex size-12 items-center justify-center rounded-lg bg-muted shrink-0">
                        {typeIcons[doc.type] || typeIcons['Otro']}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(doc.uploadDate, "d MMM yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">{doc.size}</p>
                      </div>
                    </a>
                  </div>
                  <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-7" asChild>
                      <a href={`/api/files/${doc.id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3.5" strokeWidth={1.5} />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
