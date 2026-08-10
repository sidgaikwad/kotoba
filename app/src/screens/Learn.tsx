import { useEffect, useState } from 'react'
import { bgOf, colorFor, Panel, Ring, textOf } from '../ui'
import { lessons, type LessonRow } from '../db/client'

/**
 * The learning path.
 *
 * Shape borrowed from Duolingo — a vertical run of nodes you walk down, one
 * unlocking the next — because it answers the only question a beginner has:
 * *what do I do right now?* A flat list of 24 lessons does not.
 *
 * A node is locked until the one before it is finished. That is not
 * gamification; it is the prerequisite DAG made visible, and it stops you
 * meeting katakana before you can read hiragana.
 */
export function LearnScreen({ go }: { go: (to: string) => void }) {
  const [rows, setRows] = useState<LessonRow[]>([])
  useEffect(() => { lessons().then(setRows) }, [])

  if (!rows.length) {
    return (
      <Panel className="px-6 py-10 text-center text-ink-2">
        No lessons yet. Run <code className="font-mono text-sm">bun run seed</code>.
      </Panel>
    )
  }

  const byLevel = rows.reduce<Record<string, LessonRow[]>>((acc, l) => {
    (acc[l.level_code] ??= []).push(l); return acc
  }, {})

  // First unfinished lesson overall — the only node with a "start here" state.
  const currentSlug = rows.find((l) => !l.completed_at)?.slug

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Learn</h1>
      <p className="text-ink-2 mb-9">
        Start at the top. Each lesson teaches a little and makes you use it straight away.
      </p>

      {Object.entries(byLevel).map(([code, ls], levelIdx) => {
        const color = colorFor(levelIdx)
        const doneCount = ls.filter((l) => l.completed_at).length
        return (
          <section key={code} className="mb-12">
            <div className={`rounded-2xl px-5 py-4 mb-6 ${bgOf(color)} text-white shadow-[var(--shadow-pop)]`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-widest font-sans font-bold opacity-80">
                    {code === 'KANA' ? 'Start here' : `Level ${code}`}
                  </div>
                  <div className="text-xl font-bold mt-0.5">{levelTitle(code, ls)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tabular-nums leading-none">
                    {doneCount}<span className="opacity-60 text-base">/{ls.length}</span>
                  </div>
                  <div className="text-[0.6rem] uppercase tracking-widest font-sans opacity-80 mt-1">
                    lessons
                  </div>
                </div>
              </div>
            </div>

            <ol className="list-none p-0 m-0">
              {ls.map((l, i) => {
                const done = !!l.completed_at
                const pct = l.block_count
                  ? Math.round(Math.min(l.last_block_ordinal ?? 0, l.block_count) / l.block_count * 100)
                  : 0
                const isCurrent = l.slug === currentSlug
                // Locked until the previous lesson in this level is finished.
                const locked = !done && !isCurrent && i > 0 && !ls[i - 1].completed_at

                return (
                  <li key={l.id} className="relative pl-[4.5rem] pb-4">
                    {i < ls.length - 1 && (
                      <span
                        className={`absolute left-[1.72rem] top-14 bottom-0 w-0.5 rounded ${done ? bgOf(color) : 'bg-rule'}`}
                      />
                    )}

                    <span className="absolute left-0 top-0">
                      <Ring pct={done ? 100 : pct} color={color} size={56}>
                        <span className={`text-lg ${locked ? 'opacity-35' : ''}`}>
                          {done ? '✓' : locked ? '🔒' : i + 1}
                        </span>
                      </Ring>
                    </span>

                    <button
                      disabled={locked}
                      onClick={() => go(`lesson/${l.slug}`)}
                      className={`block w-full text-left rounded-2xl px-5 py-4 transition-all
                        ${locked
                          ? 'bg-sunk opacity-55 cursor-default'
                          : `bg-surface shadow-[var(--shadow-card)] cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]
                             ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-bg ' + ringOf(color) : ''}`}`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-bold">{l.title}</span>
                        <span className={`text-xs font-sans font-semibold shrink-0 ${done ? textOf(color) : 'text-ink-3'}`}>
                          {done ? 'done' : pct > 0 ? `${pct}%` : `${l.estimated_minutes} min`}
                        </span>
                      </div>
                      <p className="text-ink-2 text-sm mt-1 mb-0 line-clamp-2">{l.body}</p>
                      {isCurrent && (
                        <span className={`inline-block mt-2 text-[0.6rem] uppercase tracking-widest font-sans font-bold ${textOf(color)}`}>
                          {pct > 0 ? 'Continue →' : 'Start here →'}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}

const RING: Record<string, string> = {
  grape: 'ring-grape', coral: 'ring-coral', matcha: 'ring-matcha',
  sky: 'ring-sky', gold: 'ring-gold', sakura: 'ring-sakura',
}
const ringOf = (c: string) => RING[c] ?? 'ring-grape'

function levelTitle(code: string, ls: LessonRow[]) {
  if (code === 'KANA') return 'Reading the alphabet'
  return ls[0]?.level_code === code ? LEVEL_NAMES[code] ?? code : code
}

const LEVEL_NAMES: Record<string, string> = {
  N5: 'Foundations',
  N4: 'Basic working Japanese',
  N3: 'Everyday professional',
  N2: 'Fluent professional',
  N1: 'Full register control',
}
