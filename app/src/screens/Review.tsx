import { useEffect, useRef, useState } from 'react'
import { Button, Panel } from '../ui'
import { Pomodoro, useFatigue } from '../components/Pomodoro'
import { renderCard } from '../lang/ja/cards'
import {
  addNote, applyReview, dueQueue, endSession, lockedCount, startSession, type QueueCard,
} from '../db/client'
import { previewAll, RATINGS, schedule } from '../db/fsrs'

type Phase = 'idle' | 'asking' | 'revealed' | 'done'

export function ReviewScreen({ go }: { go: (to: string) => void }) {
  const [queue, setQueue] = useState<QueueCard[]>([])
  const [locked, setLocked] = useState(0)
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [tally, setTally] = useState({ again: 0, ok: 0 })
  const [noteDraft, setNoteDraft] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const shownAt = useRef(Date.now())
  const fatigue = useFatigue()

  useEffect(() => {
    Promise.all([dueQueue(), lockedCount()]).then(([q, l]) => { setQueue(q); setLocked(l) })
  }, [])

  const card = queue[i]

  async function begin() {
    setSessionId(await startSession('review'))
    setPhase('asking')
    shownAt.current = Date.now()
  }

  async function rate(grade: number) {
    if (!card) return
    const elapsed = Date.now() - shownAt.current
    const s = schedule(card, grade as never)
    await applyReview(card.id, sessionId, grade, s, elapsed, card.state)

    fatigue.record(grade > 1)
    setTally((t) => grade === 1 ? { ...t, again: t.again + 1 } : { ...t, ok: t.ok + 1 })

    const next = i + 1
    if (next >= queue.length) {
      if (sessionId) await endSession(sessionId, fatigue.tired)
      setPhase('done')
    } else {
      setI(next)
      setPhase('asking')
      shownAt.current = Date.now()
    }
  }

  /* keyboard: space reveals, 1-4 rate */
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (phase === 'asking' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault(); setPhase('revealed')
      } else if (phase === 'revealed') {
        const n = Number(e.key)
        if (n >= 1 && n <= 4) { e.preventDefault(); void rate(n) }
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  })

  /* ---------- empty / idle ---------- */

  if (phase === 'idle') {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Review</h1>
        {queue.length === 0 ? (
          <Panel className="px-6 py-8 mt-6 text-center">
            <p className="m-0 mb-2 font-semibold">Nothing due right now.</p>
            <p className="m-0 text-sm text-ink-2 max-w-md mx-auto">
              {locked > 0
                ? `${locked} card${locked === 1 ? ' is' : 's are'} waiting behind lessons you haven't read yet. A card never appears before the lesson that teaches it.`
                : 'Read a lesson to unlock its cards.'}
            </p>
            <Button className="mt-4" onClick={() => go('learn')}>Go to lessons</Button>
          </Panel>
        ) : (
          <>
            <p className="text-ink-2 mb-6">
              {queue.length} card{queue.length === 1 ? '' : 's'} due. Rate yourself honestly —
              the schedule is only as good as the ratings you feed it.
            </p>
            <Button onClick={begin}>Start</Button>
            {locked > 0 && (
              <p className="text-ink-3 text-xs mt-4">{locked} more locked behind unread lessons.</p>
            )}
          </>
        )}
      </div>
    )
  }

  /* ---------- finished ---------- */

  if (phase === 'done') {
    const total = tally.again + tally.ok
    const acc = total ? Math.round((tally.ok / total) * 100) : 0
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-6">Session complete</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Panel className="px-4 py-4"><div className="text-2xl font-semibold tabular-nums">{total}</div>
            <div className="text-ink-3 text-[0.68rem] uppercase tracking-widest mt-2">reviewed</div></Panel>
          <Panel className="px-4 py-4"><div className="text-2xl font-semibold tabular-nums">{acc}%</div>
            <div className="text-ink-3 text-[0.68rem] uppercase tracking-widest mt-2">recalled</div></Panel>
          <Panel className="px-4 py-4"><div className="text-2xl font-semibold tabular-nums text-berry">{tally.again}</div>
            <div className="text-ink-3 text-[0.68rem] uppercase tracking-widest mt-2">missed</div></Panel>
        </div>

        {acc >= 95 && total >= 5 && (
          <div className="border-l-3 border-gold bg-sunk rounded-r px-4 py-3 mb-6 text-sm">
            <strong>That was too easy.</strong> Near-perfect recall means the intervals are shorter
            than they need to be — you're spending effort on things you already know. If this keeps
            up, the material needs to get harder, not more frequent.
          </div>
        )}

        <div className="mb-6">
          <label className="text-xs uppercase tracking-widest text-ink-3 font-sans block mb-2">
            Note on this session
          </label>
          <textarea
            rows={3} value={noteDraft} onChange={(e) => { setNoteDraft(e.target.value); setNoteSaved(false) }}
            placeholder="What tripped you up? Write it while it's fresh."
            className="w-full bg-surface border border-rule rounded-md px-3 py-2 text-sm font-serif resize-y focus:outline-none focus:border-grape"
          />
          <Button
            variant="ghost" className="mt-2"
            onClick={async () => {
              if (!noteDraft.trim()) return
              await addNote({ scope: 'session', body: noteDraft.trim(), sessionId: sessionId ?? undefined })
              setNoteSaved(true); setNoteDraft('')
            }}
          >{noteSaved ? 'Saved' : 'Save note'}</Button>
        </div>

        <Button onClick={() => go('')}>Done</Button>
      </div>
    )
  }

  /* ---------- reviewing ---------- */

  if (!card) return null
  const previews = previewAll(card)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-ink-3 text-xs font-sans tabular-nums">
          {i + 1} / {queue.length}
        </div>
        <Pomodoro />
      </div>

      <div className="h-1 bg-rule rounded mb-8 overflow-hidden">
        <div className="h-full bg-grape transition-all" style={{ width: `${(i / queue.length) * 100}%` }} />
      </div>

      {fatigue.tired && (
        <div className="border-l-3 border-gold bg-sunk rounded-r px-4 py-3 mb-6 text-sm">
          <strong>Your accuracy is dropping.</strong> The last several have gone worse than the ones
          before. Reviewing while fatigued teaches you the wrong thing — take five minutes.
        </div>
      )}

      <div className="text-[0.65rem] uppercase tracking-widest text-ink-3 font-sans mb-3">
        {card.concept_title} · {card.direction}
      </div>

      {renderCard(card, phase === 'revealed')}

      {phase === 'asking' ? (
        <Button className="mt-8" onClick={() => setPhase('revealed')}>
          Show answer <span className="opacity-60 font-normal ml-1">space</span>
        </Button>
      ) : (
        <div className="mt-8">
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.grade}
                onClick={() => void rate(r.grade)}
                className="border border-rule rounded-md px-2 py-3 bg-surface hover:border-grape cursor-pointer transition-colors text-center"
              >
                <div className="font-sans text-sm font-semibold">{r.label}</div>
                <div className="text-ink-3 text-[0.68rem] mt-0.5">{r.hint}</div>
                <div className="text-grape text-xs tabular-nums mt-1.5 font-sans">{previews[r.grade]}</div>
              </button>
            ))}
          </div>
          <p className="text-ink-3 text-xs mt-3 font-sans">
            Keys 1–4. "Again" costs nothing but honesty — a card you flatter yourself on comes back
            when you need it, which is worse.
          </p>
        </div>
      )}
    </div>
  )
}
