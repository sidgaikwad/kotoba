import { useEffect, useState } from 'react'
import { Button, Panel, SectionTitle } from '../ui'
import {
  addNote, allNotes, deleteNote, searchNotes, togglePin, updateNote, type Note,
} from '../db/client'

const SCOPE_LABEL: Record<string, string> = {
  lesson: 'lesson', session: 'review', global: 'notebook',
}

export function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([])
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [editBody, setEditBody] = useState('')

  const refresh = async () => setNotes(q.trim() ? await searchNotes(q.trim()) : await allNotes())
  useEffect(() => { void refresh() }, [q])

  function exportAll() {
    const md = notes.map((n) => {
      const where = n.lesson_title ? ` — ${n.lesson_title}` : ''
      const when = new Date(n.created_at * 1000).toLocaleDateString()
      return `## ${SCOPE_LABEL[n.scope] ?? n.scope}${where}\n_${when}_\n\n${n.body}\n`
    }).join('\n')
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'kotoba-notes.md'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Notes</h1>
      <p className="text-ink-2 mb-6">
        Everything you've written — sticky notes on lessons, notes after reviews, and this notebook.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all notes…"
          className="flex-1 bg-surface border border-rule rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-grape"
        />
        <Button variant="ghost" onClick={exportAll}>Export</Button>
      </div>

      <Panel className="px-4 py-4 mb-8">
        <textarea
          rows={3} value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder="New note…"
          className="w-full bg-surface border border-rule rounded-md px-3 py-2 text-sm font-serif resize-y focus:outline-none focus:border-grape"
        />
        <Button
          className="mt-2"
          onClick={async () => {
            if (!draft.trim()) return
            await addNote({ scope: 'global', body: draft.trim() })
            setDraft(''); await refresh()
          }}
        >Add</Button>
      </Panel>

      <SectionTitle right={<span className="text-ink-3 text-xs font-sans">{notes.length}</span>}>
        {q.trim() ? 'Matches' : 'All notes'}
      </SectionTitle>

      {notes.length === 0 && (
        <p className="text-ink-3 text-sm">
          {q.trim() ? 'Nothing matched.' : 'No notes yet. They accumulate as you study.'}
        </p>
      )}

      <div className="space-y-2">
        {notes.map((n) => (
          <div
            key={n.id}
            className={`border-l-3 rounded-r bg-sunk px-4 py-3 group ${n.pinned ? 'border-grape' : 'border-rule'}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[0.6rem] uppercase tracking-widest font-sans text-ink-3">
                {SCOPE_LABEL[n.scope] ?? n.scope}
              </span>
              {n.lesson_title && <span className="text-xs text-ink-3">· {n.lesson_title}</span>}
              <span className="text-xs text-ink-3 ml-auto">
                {new Date(n.updated_at * 1000).toLocaleDateString()}
              </span>
            </div>

            {editing === n.id ? (
              <>
                <textarea
                  rows={3} value={editBody} onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-surface border border-rule rounded-md px-3 py-2 text-sm font-serif resize-y focus:outline-none focus:border-grape"
                />
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" onClick={async () => {
                    await updateNote(n.id, editBody); setEditing(null); await refresh()
                  }}>Save</Button>
                  <Button variant="quiet" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm whitespace-pre-wrap">{n.body}</div>
                <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-sans">
                  <button className="text-ink-3 hover:text-ink cursor-pointer"
                    onClick={() => { setEditing(n.id); setEditBody(n.body) }}>edit</button>
                  <button className="text-ink-3 hover:text-grape cursor-pointer"
                    onClick={async () => { await togglePin(n.id); await refresh() }}>
                    {n.pinned ? 'unpin' : 'pin'}
                  </button>
                  <button className="text-ink-3 hover:text-berry cursor-pointer"
                    onClick={async () => { await deleteNote(n.id); await refresh() }}>delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
