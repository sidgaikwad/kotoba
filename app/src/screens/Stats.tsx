import { useEffect, useState } from 'react'
import { Heatmap } from '../components/Heatmap'
import { Panel, Progress, SectionTitle, Stat } from '../ui'
import { studyPlan, TARGET_DAYS, trackBreakdown, type Plan } from '../db/plan'
import {
  recognitionVsProduction, studyDays, totals, troubleConcepts, type StudyDay,
} from '../db/client'

function PlanPanel() {
  const [p, setP] = useState<Plan | null>(null)
  const [tracks, setTracks] = useState<{ kind: string; cards: number; lessons: number }[]>([])

  useEffect(() => {
    studyPlan().then(setP)
    trackBreakdown().then(setTracks)
  }, [])

  if (!p) return null
  const pctDone = p.totalCards ? Math.round((p.cardsStarted / p.totalCards) * 100) : 0

  return (
    <div className="mb-10">
      <SectionTitle right={
        <span className="text-ink-3 text-xs font-sans font-semibold">
          target {p.projectedFinish}
        </span>
      }>The plan</SectionTitle>

      <Panel className="p-5">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <div className="text-2xl font-bold tabular-nums text-grape">{p.newCardsPerDay}</div>
            <div className="text-ink-3 text-[0.62rem] uppercase tracking-widest mt-1 font-sans font-bold">
              new cards / day
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-coral">~{p.steadyStateReviews}</div>
            <div className="text-ink-3 text-[0.62rem] uppercase tracking-widest mt-1 font-sans font-bold">
              reviews / day
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-matcha">
              ~{Math.round(p.dailyTotalMinutes / 6) / 10}h
            </div>
            <div className="text-ink-3 text-[0.62rem] uppercase tracking-widest mt-1 font-sans font-bold">
              per day
            </div>
          </div>
        </div>

        <Progress pct={pctDone} color="grape" height={10} />
        <div className="flex justify-between text-xs text-ink-3 mt-2 font-sans">
          <span>{p.cardsStarted.toLocaleString()} of {p.totalCards.toLocaleString()} cards started</span>
          <span>day {p.daysElapsed} of {TARGET_DAYS}</span>
        </div>

        <p className="text-sm text-ink-2 mt-4 mb-0">
          {p.daysElapsed <= 1
            ? `${p.totalCards.toLocaleString()} cards across ${p.totalLessons} lessons. At
               ${p.newCardsPerDay} new cards a day this finishes in about eleven months, and the
               daily load settles around ${p.steadyStateReviews} reviews once the deck matures.`
            : p.onTrack
              ? `On track — ${p.cardsStarted} cards started against ${p.expectedCardsByNow} expected by now.`
              : `Behind by ${p.expectedCardsByNow - p.cardsStarted} cards. Either add a few new cards
                 a day or push the target date; grinding extra reviews will not close the gap.`}
        </p>
      </Panel>

      {tracks.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {tracks.filter((t) => t.cards > 0).map((t) => (
            <Panel key={t.kind} className="px-4 py-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold capitalize">{t.kind}</span>
                <span className="text-sm tabular-nums text-ink-2 font-sans">{t.cards.toLocaleString()}</span>
              </div>
              <div className="text-ink-3 text-xs mt-0.5">{t.lessons} lessons</div>
            </Panel>
          ))}
        </div>
      )}

      <p className="text-ink-3 text-xs mt-3 leading-relaxed">
        The pacing constraint is new cards per day, not lesson time. Every new card creates a
        review obligation that recurs for months — introduce them too fast and the queue buries
        you around week six, which is how most people quit an SRS.
      </p>
    </div>
  )
}

export function StatsScreen() {
  const [days, setDays] = useState<StudyDay[]>([])
  const [t, setT] = useState<Awaited<ReturnType<typeof totals>>>(null)
  const [rp, setRp] = useState<Awaited<ReturnType<typeof recognitionVsProduction>>>(null)
  const [trouble, setTrouble] = useState<{ title: string; lapses: number; slug: string }[]>([])

  useEffect(() => {
    const since = new Date(Date.now() - 364 * 86_400_000).toLocaleDateString('en-CA')
    studyDays(since).then(setDays)
    totals().then(setT)
    recognitionVsProduction().then(setRp)
    troubleConcepts().then(setTrouble)
  }, [])

  const totalReviews = days.reduce((n, d) => n + d.reviews, 0)
  const hours = (days.reduce((n, d) => n + d.ms_on_task, 0) / 3_600_000).toFixed(1)
  const gap = rp ? rp.rec_acc - rp.prod_acc : 0

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight mb-8">Progress</h1>

      <PlanPanel />

      <div className="grid grid-cols-4 gap-3 mb-10">
        <Stat label="Reviews" value={totalReviews} color="grape" icon="🔁" />
        <Stat label="Hours" value={hours} color="sky" icon="⏱" />
        <Stat label="Mature" value={t?.mature ?? 0} color="matcha" icon="🌳" />
        <Stat label="XP" value={t?.xp ?? 0} color="gold" icon="⚡" />
      </div>

      <div className="mb-10">
        <SectionTitle>Last 12 months</SectionTitle>
        <Heatmap days={days} />
        <p className="text-ink-3 text-xs mt-3">
          Intensity is reviews completed — not minutes with the app open. Outlined days met the
          streak bar: everything due cleared, or 10+ reviewed.
        </p>
      </div>

      {/* The honesty panel. */}
      <div className="mb-10">
        <SectionTitle>Recognition vs production</SectionTitle>
        <Panel className="px-5 py-5">
          <div className="grid grid-cols-2 gap-6">
            <Bar label="Recognition" pct={rp?.rec_acc ?? 0} count={rp?.rec ?? 0} />
            <Bar label="Production" pct={rp?.prod_acc ?? 0} count={rp?.prod ?? 0} />
          </div>
          <p className="text-sm text-ink-2 mt-5 mb-0">
            {totalReviews < 10
              ? 'Not enough reviews yet to say anything honest about this.'
              : gap >= 20
                ? `Your recognition is running ${gap} points ahead of your production. That is normal
                   and it is also the gap that matters: you can read it and you cannot yet say it.
                   Production cards are the ones worth not skipping.`
                : 'Recognition and production are tracking closely. That is unusual and good.'}
          </p>
        </Panel>
      </div>

      {trouble.length > 0 && (
        <div className="mb-10">
          <SectionTitle>Where you keep slipping</SectionTitle>
          <Panel className="px-5 py-4">
            {trouble.map((c) => (
              <div key={c.slug} className="flex justify-between py-1.5 border-b border-rule last:border-0">
                <span className="text-sm">{c.title}</span>
                <span className="text-sm tabular-nums text-berry font-sans">{c.lapses} lapses</span>
              </div>
            ))}
            <p className="text-xs text-ink-3 mt-3 mb-0">
              Repeated lapses usually mean the concept was never properly built, not that you need
              more repetitions. Ask me to re-teach any of these from a different angle.
            </p>
          </Panel>
        </div>
      )}
    </div>
  )
}

function Bar({ label, pct, count }: { label: string; pct: number; count: number }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs uppercase tracking-widest text-ink-3 font-sans">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 bg-rule rounded overflow-hidden">
        <div className="h-full bg-grape transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-ink-3 text-xs mt-1">{count} cards</div>
    </div>
  )
}
