import { useEffect, useState } from 'react'
import { Heatmap } from '../components/Heatmap'
import { Button, Panel, SectionTitle, Stat } from '../ui'
import { lessons, lockedCount, studyDays, totals, type LessonRow, type StudyDay } from '../db/client'

export function HomeScreen({ go }: { go: (to: string) => void }) {
  const [days, setDays] = useState<StudyDay[]>([])
  const [t, setT] = useState<Awaited<ReturnType<typeof totals>>>(null)
  const [ls, setLs] = useState<LessonRow[]>([])
  const [locked, setLocked] = useState(0)

  useEffect(() => {
    const since = new Date(Date.now() - 364 * 86_400_000).toLocaleDateString('en-CA')
    studyDays(since).then(setDays)
    totals().then(setT)
    lessons().then(setLs)
    lockedCount().then(setLocked)
  }, [])

  const next = ls.find((l) => !l.completed_at)
  const due = t?.due ?? 0

  return (
    <div>
      <div className="border-b-2 border-ink pb-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight m-0">Today</h1>
        <p className="ja text-ink-3 text-sm m-0 mt-1">日本語 · Japanese for the professional circuit</p>
      </div>

      {/* What to actually do, in priority order. */}
      <div className="space-y-3 mb-10">
        {due > 0 && (
          <Panel className="px-5 py-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold mb-0.5">{due} card{due === 1 ? '' : 's'} due</div>
              <div className="text-sm text-ink-2">Clear these first — spacing only works if you show up on the day.</div>
            </div>
            <Button onClick={() => go('review')}>Review</Button>
          </Panel>
        )}

        {next && (
          <Panel className="px-5 py-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-[0.6rem] uppercase tracking-widest text-ink-3 font-sans mb-1">
                {next.last_block_ordinal ? 'Continue' : 'Next lesson'}
              </div>
              <div className="font-semibold mb-0.5">{next.title}</div>
              <div className="text-sm text-ink-2">{next.estimated_minutes} min · {next.block_count} sections</div>
            </div>
            <Button variant={due > 0 ? 'ghost' : 'solid'} onClick={() => go(`lesson/${next.slug}`)}>
              {next.last_block_ordinal ? 'Resume' : 'Start'}
            </Button>
          </Panel>
        )}

        {due === 0 && !next && (
          <Panel className="px-6 py-8 text-center">
            <p className="m-0 mb-1 font-semibold">Nothing queued.</p>
            <p className="m-0 text-sm text-ink-2">
              {locked > 0
                ? `${locked} cards are waiting behind lessons you haven't opened.`
                : 'All lessons complete and no reviews due. Come back tomorrow.'}
            </p>
          </Panel>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        <Stat label="Due now" value={due} accent={due > 0} />
        <Stat label="Concepts started" value={t?.learned ?? 0} />
        <Stat label="Total XP" value={t?.xp ?? 0} />
      </div>

      <div className="mb-10">
        <SectionTitle right={
          <button onClick={() => go('stats')} className="text-xs font-sans text-accent cursor-pointer">
            details →
          </button>
        }>Last 12 months</SectionTitle>
        <Heatmap days={days} />
      </div>

      <footer className="pt-4 border-t border-rule text-xs text-ink-3 leading-relaxed">
        Dictionary and kanji data from <a href="https://www.edrdg.org/" className="text-accent">JMdict / KANJIDIC2</a>{' '}
        (EDRDG, CC BY-SA 4.0) · stroke order <a href="https://kanjivg.tagaini.net/" className="text-accent">KanjiVG</a>{' '}
        (CC BY-SA 3.0) · sentences <a href="https://tatoeba.org/" className="text-accent">Tatoeba</a> (CC BY 2.0 FR).
        Register model follows{' '}
        <a href="https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf" className="text-accent">敬語の指針</a>{' '}
        (文化審議会, 2007).
      </footer>
    </div>
  )
}
