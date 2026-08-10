import { all, one } from './client'

/**
 * Study pacing.
 *
 * The target is roughly eleven months. The binding constraint is not lesson
 * time — it is *new cards per day*, because every new card creates a review
 * obligation that recurs for months. Introduce them too fast and the daily
 * review queue overwhelms you around week six; that is the single most common
 * way people quit an SRS.
 *
 * Rule of thumb this uses: with FSRS at 90% retention, one new card generates
 * roughly 8–10 reviews over the first year. So daily review load settles at
 * about 10× your new-cards-per-day, and each review costs ~8 seconds once you
 * are fluent with the interface.
 */

export const TARGET_DAYS = 330 // ~11 months
export const SECONDS_PER_REVIEW = 8
export const REVIEWS_PER_NEW_CARD = 10

export type Plan = {
  totalCards: number
  totalLessons: number
  lessonMinutes: number
  daysRemaining: number
  newCardsPerDay: number
  /** Steady-state daily review count once the deck matures. */
  steadyStateReviews: number
  dailyReviewMinutes: number
  dailyLessonMinutes: number
  dailyTotalMinutes: number
  /** Cards and lessons already started. */
  cardsStarted: number
  lessonsDone: number
  /** Where you should be by now, given when you began. */
  expectedCardsByNow: number
  daysElapsed: number
  onTrack: boolean
  projectedFinish: string
}

export async function studyPlan(): Promise<Plan> {
  const totals = await one<{
    cards: number; lessons: number; minutes: number; started: number; done: number
  }>(`
    SELECT
      (SELECT COUNT(*) FROM card)                                        AS cards,
      (SELECT COUNT(*) FROM lesson)                                      AS lessons,
      (SELECT COALESCE(SUM(estimated_minutes),0) FROM lesson)            AS minutes,
      (SELECT COUNT(*) FROM card_state WHERE state > 0)                  AS started,
      (SELECT COUNT(*) FROM lesson_progress WHERE completed_at IS NOT NULL) AS done
  `)

  const firstDay = await one<{ day: string }>('SELECT MIN(day) AS day FROM study_day')
  const dayMs = 86_400_000
  const daysElapsed = firstDay?.day
    ? Math.max(1, Math.round((Date.parse(new Date().toLocaleDateString('en-CA')) - Date.parse(firstDay.day)) / dayMs) + 1)
    : 1

  const totalCards = totals?.cards ?? 0
  const cardsStarted = totals?.started ?? 0
  const daysRemaining = Math.max(1, TARGET_DAYS - daysElapsed + 1)

  const newCardsPerDay = Math.ceil((totalCards - cardsStarted) / daysRemaining)
  const steadyStateReviews = newCardsPerDay * REVIEWS_PER_NEW_CARD
  const dailyReviewMinutes = Math.round((steadyStateReviews * SECONDS_PER_REVIEW) / 60)
  const dailyLessonMinutes = Math.round((totals?.minutes ?? 0) / TARGET_DAYS)

  const expectedCardsByNow = Math.round((totalCards / TARGET_DAYS) * daysElapsed)

  const finish = new Date(Date.now() + daysRemaining * dayMs)

  return {
    totalCards,
    totalLessons: totals?.lessons ?? 0,
    lessonMinutes: totals?.minutes ?? 0,
    daysRemaining,
    newCardsPerDay,
    steadyStateReviews,
    dailyReviewMinutes,
    dailyLessonMinutes,
    dailyTotalMinutes: dailyReviewMinutes + dailyLessonMinutes,
    cardsStarted,
    lessonsDone: totals?.done ?? 0,
    expectedCardsByNow,
    daysElapsed,
    onTrack: cardsStarted >= expectedCardsByNow,
    projectedFinish: finish.toLocaleDateString(undefined, { year: 'numeric', month: 'long' }),
  }
}

/** Content breakdown, for showing what the year is actually made of. */
export function trackBreakdown() {
  return all<{ kind: string; cards: number; lessons: number }>(`
    SELECT co.kind,
           COUNT(DISTINCT c.id) AS cards,
           COUNT(DISTINCT lc.lesson_id) AS lessons
      FROM concept co
      LEFT JOIN card c ON c.concept_id = co.id
      LEFT JOIN lesson_concept lc ON lc.concept_id = co.id
     GROUP BY co.kind
     ORDER BY cards DESC
  `)
}
