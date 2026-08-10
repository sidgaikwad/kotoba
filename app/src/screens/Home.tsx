import { useEffect, useState } from 'react'
import { Heatmap } from '../components/Heatmap'
import { Button, Panel, Progress, SectionTitle, Stat } from '../ui'
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
  const doneCount = ls.filter((l) => l.completed_at).length
  const due = t?.due ?? 0
  const todayRow = days.find((d) => d.day === new Date().toLocaleDateString('en-CA'))

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight mb-1">{greeting()}</h1>
      <p className="ja text-ink-3 m-0 mb-8">今日もがんばりましょう · let's get a bit better today</p>

      {/* What to actually do, in priority order — not a wall of numbers. */}
      <div className="space-y-3 mb-9">
        {next && (
          <Panel className="p-6 bg-gradient-to-br from-grape/10 to-sakura/10">
            <div className="text-[0.62rem] uppercase tracking-widest text-grape font-sans font-bold mb-1.5">
              {next.last_block_ordinal ? 'Pick up where you left off' : 'Next lesson'}
            </div>
            <div className="text-xl font-bold mb-1">{next.title}</div>
            <p className="text-ink-2 text-sm mb-4 mt-0">{next.body}</p>
            <Button size="lg" onClick={() => go(`lesson/${next.slug}`)}>
              {next.last_block_ordinal ? 'Continue' : 'Start lesson'}
            </Button>
            <span className="text-ink-3 text-xs font-sans ml-3">{next.estimated_minutes} min</span>
          </Panel>
        )}

        {due > 0 && (
          <Panel className="p-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold mb-0.5">🧠 {due} card{due === 1 ? '' : 's'} to remember</div>
              <div className="text-sm text-ink-2">
                Spacing only works if you turn up on the day it asks you to.
              </div>
            </div>
            <Button variant={next ? 'ghost' : 'solid'} onClick={() => go('remember')}>Review</Button>
          </Panel>
        )}

        {due === 0 && !next && (
          <Panel className="px-6 py-10 text-center">
            <div className="text-3xl mb-2">🌱</div>
            <p className="m-0 mb-1 font-bold">Nothing queued.</p>
            <p className="m-0 text-sm text-ink-2">
              {locked > 0
                ? `${locked} cards are waiting behind lessons you haven't opened.`
                : 'Everything done and nothing due. Come back tomorrow.'}
            </p>
          </Panel>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-9">
        <Stat label="Due now" value={due} color="coral" icon="🧠" />
        <Stat label="Lessons done" value={doneCount} color="matcha" icon="📖" />
        <Stat label="XP today" value={todayRow?.xp ?? 0} color="gold" icon="⚡" />
      </div>

      {ls.length > 0 && (
        <div className="mb-9">
          <SectionTitle right={
            <span className="text-ink-3 text-xs font-sans font-semibold">{doneCount} / {ls.length}</span>
          }>Course progress</SectionTitle>
          <Progress pct={(doneCount / ls.length) * 100} color="matcha" height={12} />
        </div>
      )}

      <div className="mb-9">
        <SectionTitle right={
          <button onClick={() => go('stats')} className="text-xs font-sans font-semibold text-grape cursor-pointer">
            details →
          </button>
        }>Last 12 months</SectionTitle>
        <Panel className="p-4"><Heatmap days={days} /></Panel>
      </div>

      <footer className="pt-4 border-t border-rule text-xs text-ink-3 leading-relaxed">
        Dictionary and kanji data from <a href="https://www.edrdg.org/" className="text-grape">JMdict / KANJIDIC2</a>{' '}
        (EDRDG, CC BY-SA 4.0) · stroke order <a href="https://kanjivg.tagaini.net/" className="text-grape">KanjiVG</a>{' '}
        (CC BY-SA 3.0) · sentences <a href="https://tatoeba.org/" className="text-grape">Tatoeba</a> (CC BY 2.0 FR).
        Register model follows{' '}
        <a href="https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf" className="text-grape">敬語の指針</a>{' '}
        (文化審議会, 2007). No copyrighted textbook content is used anywhere in this app.
      </footer>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Still up?'
  if (h < 11) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
