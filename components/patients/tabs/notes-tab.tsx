'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Pin, PinOff, Send } from 'lucide-react'
import type { Note } from "@/lib/types/patient-view"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface NotesTabProps {
  notes: Note[]
  onAddNote: (content: string) => void
  onTogglePin: (noteId: string) => void
}

export function NotesTab({ notes, onAddNote, onTogglePin }: NotesTabProps) {
  const [newNote, setNewNote] = React.useState('')

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote('')
    }
  }

  return (
    <div className="space-y-6">
      {/* New Note Editor */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Agregar una nota sobre este paciente..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newNote.trim()}>
                <Send className="mr-2 size-4" strokeWidth={1.5} />
                Agregar nota
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notes List */}
      {sortedNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay notas registradas para este paciente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <Card 
              key={note.id} 
              className={cn(
                "transition-colors",
                note.pinned && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{note.author}</span>
                      <span>·</span>
                      <time>{format(note.createdAt, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</time>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => onTogglePin(note.id)}
                  >
                    {note.pinned ? (
                      <PinOff className="size-4 text-amber-500" strokeWidth={1.5} />
                    ) : (
                      <Pin className="size-4" strokeWidth={1.5} />
                    )}
                    <span className="sr-only">
                      {note.pinned ? 'Desfijar nota' : 'Fijar nota'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
