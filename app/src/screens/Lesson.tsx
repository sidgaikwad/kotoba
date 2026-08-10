import { useEffect, useState } from 'react'
import { Button, JA, Panel, SectionTitle } from '../ui'
import { addNote, deleteNote, lessonBySlug, markLessonProgress, notesFor, type Note } from '../db/client'

type Loaded = NonNullable<Awaited<ReturnType<typeof lessonBySlug>>>

/**
 * A lesson is read one block at a time.
 *
 * Blocks are revealed progressively rather than dumped as a wall of text, for
 * two reasons: working memory is small, and a `predict` block only works if
 * the learner cannot see the answer sitting underneath it. Scrolling past an
 * explanation is not learning; committing to an answer first is.
 */
export function LessonScreen({ slug, go }: { slug: string; go: (to: string) => void }) {
  const [lesson, setLesson] = useState<Loaded | null>(null)
  const [upto, setUpto] = useState(1)
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    lessonBySlug(slug).then((l) => {
      if (!l) return
      setLesson(l)
      setUpto(Math.max(1, l.last_block_ordinal ?? 1))
      notesFor(l.id).then(setNotes)
    })
  }, [slug])

  if (!lesson) return <p className="text-ink-3">Loading…</p>

  const blocks = lesson.blocks
  const visible = blocks.filter((b) => b.ordinal <= upto)
  const done = upto >= blocks.length
  const pct = Math.round((Math.min(upto, blocks.length) / blocks.length) * 100)

  async function advance() {
    const next = Math.min(upto + 1, blocks.length)
    setUpto(next)
    await markLessonProgress(lesson!.id, next, next >= blocks.length)
  }

  async function saveNote() {
    if (!draft.trim()) return
    await addNote({ scope: 'lesson', body: draft.trim(), lessonId: lesson!.id })
    setDraft('')
    setNotes(await notesFor(lesson!.id))
  }

  return (
    <div>
      <button onClick={() => go('learn')} className="text-ink-3 text-sm font-sans mb-4 cursor-pointer hover:text-ink">
        ← All lessons
      </button>

      <div className="border-b-2 border-ink pb-4 mb-8">
        <div className="text-ink-3 text-[0.68rem] uppercase tracking-widest mb-2">
          {lesson.level_code} · {lesson.estimated_minutes} min
        </div>
        <h1 className="text-3xl font-semibold tracking-tight m-0">{lesson.title}</h1>
        <div className="h-1 bg-rule rounded mt-4 overflow-hidden">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {visible.map((b) => <BlockView key={b.id} block={b} />)}

      {!done ? (
        <div className="mt-8">
          <Button onClick={advance}>Continue</Button>
          <span className="text-ink-3 text-xs font-sans ml-3">{upto} of {blocks.length}</span>
        </div>
      ) : (
        <Panel className="mt-8 px-6 py-6 text-center">
          <p className="m-0 mb-1 font-semibold">Lesson complete.</p>
          <p className="m-0 mb-4 text-sm text-ink-2">
            Its cards are now unlocked and will start appearing in your reviews. Reading it once
            is not remembering it — the review queue is where it actually sticks.
          </p>
          <Button onClick={() => go('review')}>Review now</Button>
          <Button variant="quiet" className="ml-2" onClick={() => go('learn')}>Later</Button>
        </Panel>
      )}

      {/* ---- sticky notes ---- */}
      <div className="mt-14">
        <SectionTitle>Your notes on this lesson</SectionTitle>
        {notes.length === 0 && (
          <p className="text-ink-3 text-sm">
            Nothing yet. Notes you write here reappear whenever you open this lesson again.
          </p>
        )}
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="border-l-3 border-flag bg-paper-2 rounded-r px-4 py-3 group">
              <div className="text-sm whitespace-pre-wrap">{n.body}</div>
              <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-xs font-sans text-ink-3 hover:text-bad cursor-pointer"
                  onClick={async () => { await deleteNote(n.id); setNotes(await notesFor(lesson.id)) }}
                >delete</button>
              </div>
            </div>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Something you want to remember when you come back to this…"
          rows={3}
          className="w-full mt-3 bg-paper border border-rule rounded-md px-3 py-2 text-sm font-serif resize-y focus:outline-none focus:border-accent"
        />
        <Button variant="ghost" onClick={saveNote} className="mt-2">Add note</Button>
      </div>
    </div>
  )
}

/* ================= block renderers ================= */

function BlockView({ block }: { block: { kind: string; content: Record<string, unknown> } }) {
  const c = block.content as never

  switch (block.kind) {
    case 'prose':
      return <Prose html={(c as { html: string }).html} />

    case 'example': {
      const e = c as { ja: string; reading?: string; gloss?: string; tone?: 'good' | 'bad' | 'flag'; note?: string }
      return (
        <div className="my-4">
          <JA text={e.ja} reading={e.reading} gloss={e.gloss} tone={e.tone} />
          {e.note && <p className="text-sm text-ink-2 ml-4 mt-1">{e.note}</p>}
        </div>
      )
    }

    case 'table': {
      const t = c as { caption?: string; headers: string[]; rows: string[][] }
      return (
        <div className="my-6">
          {t.caption && <SectionTitle>{t.caption}</SectionTitle>}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>{t.headers.map((h, i) => (
                  <th key={i} className="text-left font-sans text-[0.68rem] uppercase tracking-widest text-ink-3 border-b-2 border-ink-2 px-2 py-2"
                      dangerouslySetInnerHTML={{ __html: h }} />
                ))}</tr>
              </thead>
              <tbody>
                {t.rows.map((r, i) => (
                  <tr key={i}>{r.map((cell, j) => (
                    <td key={j} className="border-b border-rule px-2 py-2 align-top"
                        dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    case 'callout': {
      const k = c as { tone?: 'note' | 'warn'; html: string }
      const border = k.tone === 'warn' ? 'border-flag' : 'border-accent'
      return (
        <div className={`border-l-3 ${border} bg-paper-2 rounded-r px-4 py-3 my-5 text-[0.95rem]`}
             dangerouslySetInnerHTML={{ __html: k.html }} />
      )
    }

    case 'predict':
      return <Predict content={c as { html: string; reveal: string }} />

    case 'practice':
      return <Practice content={c as PracticeContent} />

    case 'source': {
      const s = c as { tier: string; title: string; url: string; html: string }
      return (
        <div className="border-l-3 border-ink-3 bg-paper-2 rounded-r px-4 py-3 my-6 text-sm font-sans">
          <div className="mb-1">
            <span className="text-[0.6rem] font-bold tracking-wider bg-good text-paper px-1.5 py-0.5 rounded">
              {s.tier}
            </span>{' '}
            <a href={s.url} target="_blank" rel="noreferrer" className="text-accent font-semibold">{s.title}</a>
          </div>
          <div className="text-ink-2 font-serif" dangerouslySetInnerHTML={{ __html: s.html }} />
        </div>
      )
    }

    default:
      return null
  }
}

function Prose({ html }: { html: string }) {
  return (
    <div
      className="leading-[1.75] [&_p]:mb-4 [&_strong]:font-semibold [&_em]:italic [&_.ja]:text-[1.05em] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Forces a commitment before the explanation. The reveal is hidden until the
 * learner clicks — an unfalsifiable "I would have got that" is worth nothing.
 */
function Predict({ content }: { content: { html: string; reveal: string } }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="border border-accent/40 rounded-lg bg-paper-2 px-5 py-4 my-6">
      <div className="text-[0.65rem] uppercase tracking-widest text-accent font-sans font-bold mb-2">
        Commit to an answer first
      </div>
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
      {shown
        ? <div className="mt-4 pt-3 border-t border-dashed border-rule"
               dangerouslySetInnerHTML={{ __html: content.reveal }} />
        : <Button variant="ghost" className="mt-3" onClick={() => setShown(true)}>
            I've decided — show me
          </Button>}
    </div>
  )
}

type PracticeContent = {
  question: string
  options: { html: string; ok?: boolean }[]
  explain: string
}

/** Inline retrieval, placed mid-lesson while the idea is warm — not a final exam. */
function Practice({ content }: { content: PracticeContent }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div className="border border-rule rounded-lg bg-paper-2 px-5 py-4 my-6">
      <div className="text-[0.65rem] uppercase tracking-widest text-ink-3 font-sans font-bold mb-2">
        Try it
      </div>
      <div className="mb-3" dangerouslySetInnerHTML={{ __html: content.question }} />
      <div className="space-y-2">
        {content.options.map((o, i) => {
          const state = picked === null ? ''
            : o.ok ? 'border-good bg-good/10'
            : picked === i ? 'border-bad bg-bad/10' : 'opacity-50'
          return (
            <button
              key={i}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className={`block w-full text-left px-3 py-2 rounded border border-rule bg-paper text-[0.95rem] transition-colors ${state} ${picked === null ? 'cursor-pointer hover:border-accent' : 'cursor-default'}`}
              dangerouslySetInnerHTML={{ __html: o.html }}
            />
          )
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 pt-3 border-t border-dashed border-rule text-[0.95rem]"
             dangerouslySetInnerHTML={{ __html: content.explain }} />
      )}
    </div>
  )
}
