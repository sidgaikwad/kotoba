import Database from '@tauri-apps/plugin-sql'
import type { CardStateRow, Scheduled } from './fsrs'

let handle: Promise<Database> | null = null

export function db(): Promise<Database> {
  handle ??= Database.load('sqlite:kotoba.db')
  return handle
}

export async function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db()).select<T[]>(sql, params)
}
export async function one<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await all<T>(sql, params))[0] ?? null
}
export async function run(sql: string, params: unknown[] = []) {
  return (await db()).execute(sql, params)
}

/** Local calendar day. A streak is a human day, not a UTC one. */
export const today = () => new Date().toLocaleDateString('en-CA')

/* ================= lessons ================= */

export type LessonRow = {
  id: number
  slug: string
  title: string
  body: string
  ordinal: number
  estimated_minutes: number
  level_code: string
  block_count: number
  last_block_ordinal: number | null
  completed_at: number | null
  card_count: number
  due_count: number
}

export async function lessons(): Promise<LessonRow[]> {
  return all<LessonRow>(`
    SELECT l.*, lv.code AS level_code,
      (SELECT COUNT(*) FROM lesson_block b WHERE b.lesson_id = l.id)      AS block_count,
      p.last_block_ordinal, p.completed_at,
      (SELECT COUNT(*) FROM card c
         JOIN lesson_concept lc ON lc.concept_id = c.concept_id
        WHERE lc.lesson_id = l.id)                                        AS card_count,
      (SELECT COUNT(*) FROM card c
         JOIN lesson_concept lc ON lc.concept_id = c.concept_id
         JOIN card_state cs ON cs.card_id = c.id
        WHERE lc.lesson_id = l.id AND cs.suspended = 0
          AND cs.due <= unixepoch())                                      AS due_count
    FROM lesson l
    JOIN unit u  ON u.id = l.unit_id
    JOIN level lv ON lv.id = u.level_id
    LEFT JOIN lesson_progress p ON p.lesson_id = l.id
    ORDER BY lv.ordinal, u.ordinal, l.ordinal
  `)
}

export type Block = {
  id: number
  ordinal: number
  kind: string
  content: string | Record<string, unknown>
}

export async function lessonBySlug(slug: string) {
  const l = await one<LessonRow>('SELECT * FROM lesson WHERE slug = ?1', [slug])
  if (!l) return null
  const blocks = await all<Block>(
    'SELECT id, ordinal, kind, content FROM lesson_block WHERE lesson_id = ?1 ORDER BY ordinal',
    [l.id],
  )
  return {
    ...l,
    blocks: blocks.map((b) => ({
      ...b,
      content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content,
    })),
  }
}

export async function markLessonProgress(lessonId: number, ordinal: number, done: boolean) {
  await run(
    `INSERT INTO lesson_progress (lesson_id, last_block_ordinal, completed_at)
     VALUES (?1, ?2, ?3)
     ON CONFLICT(lesson_id) DO UPDATE SET
       last_block_ordinal = MAX(last_block_ordinal, excluded.last_block_ordinal),
       completed_at = COALESCE(lesson_progress.completed_at, excluded.completed_at)`,
    [lessonId, ordinal, done ? Math.floor(Date.now() / 1000) : null],
  )
  if (done) await awardXp('lesson_complete', 25, { lessonId })
}

/* ================= review queue ================= */

export type QueueCard = {
  id: number
  type: string
  prompt: string
  answer: string
  extra: string | null
  direction: string
  concept_title: string
  concept_slug: string
} & CardStateRow

/**
 * Only cards whose concept has actually been introduced by a lesson the
 * learner has opened. A card must never appear before its content is taught —
 * that is the "review integrity" rule.
 */
export async function dueQueue(limit = 40): Promise<QueueCard[]> {
  return all<QueueCard>(`
    SELECT c.id, c.type, c.prompt, c.answer, c.extra, c.direction,
           co.title AS concept_title, co.slug AS concept_slug,
           cs.*
      FROM card c
      JOIN card_state cs ON cs.card_id = c.id
      JOIN concept co    ON co.id = c.concept_id
     WHERE cs.suspended = 0
       AND cs.due <= unixepoch()
       AND EXISTS (
             SELECT 1 FROM lesson_concept lc
               JOIN lesson_progress lp ON lp.lesson_id = lc.lesson_id
              WHERE lc.concept_id = c.concept_id)
     ORDER BY cs.state ASC, cs.due ASC
     LIMIT ?1
  `, [limit])
}

/** How many are waiting but still locked because their lesson is unread. */
export async function lockedCount(): Promise<number> {
  const r = await one<{ n: number }>(`
    SELECT COUNT(*) n FROM card c JOIN card_state cs ON cs.card_id = c.id
     WHERE cs.suspended = 0 AND NOT EXISTS (
       SELECT 1 FROM lesson_concept lc
         JOIN lesson_progress lp ON lp.lesson_id = lc.lesson_id
        WHERE lc.concept_id = c.concept_id)`)
  return r?.n ?? 0
}

export async function applyReview(
  cardId: number, sessionId: number | null, grade: number,
  s: Scheduled, elapsedMs: number, stateBefore: number,
) {
  await run(
    `UPDATE card_state SET due=?2, stability=?3, difficulty=?4, elapsed_days=?5,
       scheduled_days=?6, reps=?7, lapses=?8, state=?9, last_review=?10,
       leech=?11, suspended=?12 WHERE card_id=?1`,
    [cardId, s.due, s.stability, s.difficulty, s.elapsedDays, s.scheduledDays,
     s.reps, s.lapses, s.state, s.lastReview, s.leech ? 1 : 0, s.suspended ? 1 : 0],
  )
  await run(
    `INSERT INTO review (card_id, session_id, rating, state_before, elapsed_ms)
     VALUES (?1, ?2, ?3, ?4, ?5)`,
    [cardId, sessionId, grade, stateBefore, elapsedMs],
  )
  // XP only for recall that happened. Rating "Again" earns nothing — otherwise
  // you could farm XP by spamming the queue and failing everything.
  if (grade > 1) await awardXp('review', grade === 4 ? 2 : 3, { cardId })
  await touchDay({ reviews: 1, msOnTask: elapsedMs })
}

/* ================= sessions ================= */

export async function startSession(kind: string, lessonId?: number): Promise<number> {
  await run('INSERT INTO session (kind, lesson_id) VALUES (?1, ?2)', [kind, lessonId ?? null])
  const r = await one<{ id: number }>('SELECT last_insert_rowid() AS id')
  return r!.id
}

export async function endSession(id: number, fatigueFlagged = false) {
  await run(
    'UPDATE session SET ended_at = unixepoch(), fatigue_flagged = ?2 WHERE id = ?1',
    [id, fatigueFlagged ? 1 : 0],
  )
}

/* ================= xp, days, streak ================= */

export async function awardXp(
  kind: string, amount: number, ref: { cardId?: number; lessonId?: number } = {},
) {
  await run(
    'INSERT INTO xp_event (kind, amount, card_id, lesson_id) VALUES (?1, ?2, ?3, ?4)',
    [kind, amount, ref.cardId ?? null, ref.lessonId ?? null],
  )
  await touchDay({ xp: amount })
}

async function touchDay(d: { reviews?: number; xp?: number; msOnTask?: number; newCards?: number }) {
  await run(
    `INSERT INTO study_day (day, reviews, new_cards, ms_on_task, xp)
     VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT(day) DO UPDATE SET
       reviews    = reviews    + excluded.reviews,
       new_cards  = new_cards  + excluded.new_cards,
       ms_on_task = ms_on_task + excluded.ms_on_task,
       xp         = xp         + excluded.xp`,
    [today(), d.reviews ?? 0, d.newCards ?? 0, d.msOnTask ?? 0, d.xp ?? 0],
  )
  await recomputeStreakFlag()
}

/**
 * Streak rule, stated so it is falsifiable:
 *   a day counts when you clear everything that was due, or review 10+.
 * Not "opened the app", not "earned any XP" — both reward attendance.
 * Written at the time and never recomputed for past days, so changing this
 * rule later cannot silently rewrite history.
 */
export async function recomputeStreakFlag() {
  const r = await one<{ reviews: number; remaining: number }>(`
    SELECT (SELECT reviews FROM study_day WHERE day = ?1) AS reviews,
           (SELECT COUNT(*) FROM card_state
             WHERE suspended = 0 AND due <= unixepoch())  AS remaining`, [today()])
  if (!r) return
  const earned = r.reviews > 0 && (r.remaining === 0 || r.reviews >= 10)
  await run('UPDATE study_day SET counted_for_streak = ?2 WHERE day = ?1', [today(), earned ? 1 : 0])
}

export type StudyDay = {
  day: string; reviews: number; new_cards: number
  ms_on_task: number; xp: number; counted_for_streak: number
}

export const studyDays = (since: string) =>
  all<StudyDay>('SELECT * FROM study_day WHERE day >= ?1 ORDER BY day', [since])

export async function totals() {
  return one<{ xp: number; learned: number; due: number; mature: number }>(`
    SELECT
      (SELECT COALESCE(SUM(amount),0) FROM xp_event)                          AS xp,
      (SELECT COUNT(*) FROM card_state WHERE state > 0)                       AS learned,
      (SELECT COUNT(*) FROM card_state WHERE suspended=0 AND due<=unixepoch())AS due,
      (SELECT COUNT(*) FROM card_state WHERE stability >= 21)                 AS mature
  `)
}

export async function currentStreak(): Promise<number> {
  const rows = await all<{ day: string }>(
    'SELECT day FROM study_day WHERE counted_for_streak = 1 ORDER BY day DESC')
  if (!rows.length) return 0
  const D = 86_400_000
  const gap = Math.round((Date.parse(today()) - Date.parse(rows[0].day)) / D)
  if (gap > 1) return 0
  let n = 1
  for (let i = 1; i < rows.length; i++) {
    if (Math.round((Date.parse(rows[i - 1].day) - Date.parse(rows[i].day)) / D) !== 1) break
    n++
  }
  return n
}

/**
 * Recognition runs ahead of production in every learner. Surfacing the gap is
 * the honest thing to do — hiding it is how an app flatters you into thinking
 * you can speak.
 */
export async function recognitionVsProduction() {
  return one<{ rec: number; prod: number; rec_acc: number; prod_acc: number }>(`
    SELECT
      (SELECT COUNT(*) FROM card WHERE direction='recognition')          AS rec,
      (SELECT COUNT(*) FROM card WHERE direction='production')           AS prod,
      (SELECT COALESCE(ROUND(AVG(CASE WHEN r.rating>1 THEN 100.0 ELSE 0 END)),0)
         FROM review r JOIN card c ON c.id=r.card_id
        WHERE c.direction='recognition')                                 AS rec_acc,
      (SELECT COALESCE(ROUND(AVG(CASE WHEN r.rating>1 THEN 100.0 ELSE 0 END)),0)
         FROM review r JOIN card c ON c.id=r.card_id
        WHERE c.direction='production')                                  AS prod_acc
  `)
}

export const troubleConcepts = () => all<{ title: string; lapses: number; slug: string }>(`
  SELECT co.title, co.slug, SUM(cs.lapses) AS lapses
    FROM card_state cs JOIN card c ON c.id=cs.card_id JOIN concept co ON co.id=c.concept_id
   GROUP BY co.id HAVING lapses > 0 ORDER BY lapses DESC LIMIT 6`)

/* ================= notes ================= */

export type Note = {
  id: number; scope: string; lesson_id: number | null; session_id: number | null
  card_id: number | null; body: string; created_at: number; updated_at: number
  pinned: number; lesson_title?: string
}

export const notesFor = (lessonId: number) =>
  all<Note>('SELECT * FROM note WHERE lesson_id = ?1 ORDER BY pinned DESC, created_at DESC', [lessonId])

export const allNotes = () => all<Note>(`
  SELECT n.*, l.title AS lesson_title FROM note n
    LEFT JOIN lesson l ON l.id = n.lesson_id
   ORDER BY n.pinned DESC, n.updated_at DESC`)

export const searchNotes = (q: string) => all<Note>(`
  SELECT n.*, l.title AS lesson_title FROM note n
    LEFT JOIN lesson l ON l.id = n.lesson_id
   WHERE n.body LIKE '%' || ?1 || '%'
   ORDER BY n.pinned DESC, n.updated_at DESC`, [q])

export async function addNote(n: {
  scope: string; body: string; lessonId?: number; sessionId?: number; cardId?: number
}) {
  await run(
    `INSERT INTO note (scope, body, lesson_id, session_id, card_id) VALUES (?1,?2,?3,?4,?5)`,
    [n.scope, n.body, n.lessonId ?? null, n.sessionId ?? null, n.cardId ?? null],
  )
}

export const updateNote = (id: number, body: string) =>
  run('UPDATE note SET body = ?2, updated_at = unixepoch() WHERE id = ?1', [id, body])

export const deleteNote = (id: number) => run('DELETE FROM note WHERE id = ?1', [id])

export const togglePin = (id: number) =>
  run('UPDATE note SET pinned = 1 - pinned WHERE id = ?1', [id])
