/**
 * FSRS scheduling. Wraps ts-fsrs and owns the translation between the
 * `card_state` row shape and the algorithm's card object.
 *
 * Why FSRS rather than SM-2: SM-2 nudges a single "ease" number with fixed
 * multipliers and has no model of forgetting, so it cannot answer "how likely
 * am I to recall this today" and cannot target a retention rate. FSRS fits
 * stability and difficulty per card against the real review log, so it gets
 * better as `review` fills up. That is why `review` is append-only.
 */
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card as FsrsCard,
  type Grade,
} from 'ts-fsrs'

/** 0.9 = "I want to remember 90% of what I'm shown." The knob SM-2 lacks. */
export const REQUEST_RETENTION = 0.9

/** Lapses before a card is flagged as a leech and pulled from the queue. */
export const LEECH_THRESHOLD = 6

const scheduler = fsrs(
  generatorParameters({ request_retention: REQUEST_RETENTION, enable_fuzz: true }),
)

export type CardStateRow = {
  card_id: number
  due: number
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: number
  last_review: number | null
  suspended: number
  leech: number
}

export const RATINGS = [
  { grade: Rating.Again, label: 'Again', hint: 'No recall', key: '1' },
  { grade: Rating.Hard, label: 'Hard', hint: 'Recalled, painfully', key: '2' },
  { grade: Rating.Good, label: 'Good', hint: 'Recalled', key: '3' },
  { grade: Rating.Easy, label: 'Easy', hint: 'Instant', key: '4' },
] as const

function toFsrs(row: CardStateRow): FsrsCard {
  if (row.reps === 0 && row.state === 0) return createEmptyCard(new Date(row.due * 1000))
  return {
    due: new Date(row.due * 1000),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    last_review: row.last_review ? new Date(row.last_review * 1000) : undefined,
    learning_steps: 0,
  } as FsrsCard
}

export type Scheduled = {
  due: number
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: number
  lastReview: number
  leech: boolean
  suspended: boolean
  /** For the UI: how far out each button would push this card. */
  intervalLabel: string
}

export function schedule(row: CardStateRow, grade: Grade, at = new Date()): Scheduled {
  const { card } = scheduler.next(toFsrs(row), at, grade)
  const lapses = card.lapses
  const leech = lapses >= LEECH_THRESHOLD

  return {
    due: Math.floor(card.due.getTime() / 1000),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses,
    state: card.state,
    lastReview: Math.floor(at.getTime() / 1000),
    leech,
    // A leech is suspended rather than deleted: the content is not the
    // problem, the encoding is. It comes back after the concept is re-taught.
    suspended: leech,
    intervalLabel: humanInterval(card.due.getTime() - at.getTime()),
  }
}

/** Preview intervals for all four buttons, so the learner rates honestly
 *  instead of gaming for the shortest gap. */
export function previewAll(row: CardStateRow, at = new Date()): Record<number, string> {
  const out: Record<number, string> = {}
  for (const { grade } of RATINGS) {
    const { card } = scheduler.next(toFsrs(row), at, grade)
    out[grade] = humanInterval(card.due.getTime() - at.getTime())
  }
  return out
}

export function humanInterval(ms: number): string {
  const m = Math.round(ms / 60_000)
  if (m < 60) return `${Math.max(1, m)}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d`
  const mo = d / 30
  if (mo < 12) return `${mo.toFixed(mo < 2 ? 1 : 0)}mo`
  return `${(d / 365).toFixed(1)}y`
}

export { Rating }
export type { Grade }
