import { useEffect, useState } from 'react'
import { Panel, SectionTitle } from '../ui'
import { lessons, type LessonRow } from '../db/client'

export function LearnScreen({ go }: { go: (to: string) => void }) {
  const [rows, setRows] = useState<LessonRow[]>([])
  useEffect(() => { lessons().then(setRows) }, [])

  const byLevel = rows.reduce<Record<string, LessonRow[]>>((acc, l) => {
    (acc[l.level_code] ??= []).push(l)
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Learn</h1>
      <p className="text-ink-2 mb-8">
        Lessons teach; the review queue is what makes them stick. A lesson's cards stay locked
        until you've read it.
      </p>

      {rows.length === 0 && (
        <Panel className="px-6 py-8 text-center text-ink-2">
          No lessons authored yet. Run <code className="font-mono text-sm">bun run seed</code>.
        </Panel>
      )}

      {Object.entries(byLevel).map(([level, ls]) => (
        <div key={level} className="mb-10">
          <SectionTitle>{level}</SectionTitle>
          <div className="space-y-2">
            {ls.map((l) => {
              const started = (l.last_block_ordinal ?? 0) > 0
              const done = !!l.completed_at
              const pct = l.block_count
                ? Math.round(Math.min(l.last_block_ordinal ?? 0, l.block_count) / l.block_count * 100)
                : 0
              return (
                <button
                  key={l.id}
                  onClick={() => go(`lesson/${l.slug}`)}
                  className="block w-full text-left border border-rule rounded-lg bg-paper-2 px-5 py-4 cursor-pointer hover:border-accent transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold">{l.title}</span>
                    <span className="text-ink-3 text-xs font-sans shrink-0">
                      {done ? 'complete' : started ? `${pct}%` : `${l.estimated_minutes} min`}
                    </span>
                  </div>
                  <div className="text-ink-2 text-sm mt-1 line-clamp-2">{l.body}</div>
                  <div className="flex gap-4 mt-3 text-[0.68rem] uppercase tracking-widest font-sans text-ink-3">
                    <span>{l.block_count} sections</span>
                    <span>{l.card_count} cards</span>
                    {l.due_count > 0 && <span className="text-accent">{l.due_count} due</span>}
                  </div>
                  {started && !done && (
                    <div className="h-0.5 bg-rule rounded mt-3 overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
