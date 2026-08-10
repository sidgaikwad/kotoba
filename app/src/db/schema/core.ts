/* ============================================================
   LANGUAGE-AGNOSTIC CORE SCHEMA
   ============================================================
   Nothing in this file may know that Japanese exists.

   No column here may mention kanji, kana, readings, pitch accent,
   keigo, particles, or counters. If a concept cannot be expressed
   for Korean, Mandarin, or Portuguese, it does not belong here —
   it belongs in a per-language extension (see ./ja.ts).

   The seam is `card.type` + `card.extra`:
     - `type`   an opaque string the core routes on but never interprets
     - `extra`  an opaque JSON payload the core stores but never reads

   The core schedules, scores, and stores. It never grades meaning.
   Grading lives in the per-language layer.
   ============================================================ */

import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'

const now = sql`(unixepoch())`

/* ---------------- curriculum ---------------- */

export const language = sqliteTable('language', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** BCP-47 ish: 'ja', 'ko', 'pt-BR' */
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  nativeName: text('native_name').notNull(),
  /** Which extension module renders and grades this language's cards. */
  extension: text('extension').notNull(),
  createdAt: integer('created_at').notNull().default(now),
})

export const course = sqliteTable('course', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  languageId: integer('language_id').notNull().references(() => language.id),
  title: text('title').notNull(),
  description: text('description'),
})

/** 'N5'…'N1' for Japanese, 'A1'…'C2' elsewhere. Just an ordered bucket. */
export const level = sqliteTable('level', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull().references(() => course.id),
  code: text('code').notNull(),
  title: text('title').notNull(),
  ordinal: integer('ordinal').notNull(),
}, (t) => [unique('level_course_code').on(t.courseId, t.code)])

export const unit = sqliteTable('unit', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  levelId: integer('level_id').notNull().references(() => level.id),
  title: text('title').notNull(),
  ordinal: integer('ordinal').notNull(),
})

export const lesson = sqliteTable('lesson', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  unitId: integer('unit_id').notNull().references(() => unit.id),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  /** Markdown. Rendered by the shell; the shell does not parse the language. */
  body: text('body').notNull().default(''),
  ordinal: integer('ordinal').notNull(),
  estimatedMinutes: integer('estimated_minutes').notNull().default(5),
})

/**
 * Lesson content, as ordered blocks.
 *
 * A lesson is *teaching*, not a quiz. Storing it as blocks rather than one
 * markdown blob is what lets practice be interleaved into the explanation
 * instead of bolted on at the end — the block right after a new idea can be a
 * `practice` block that makes the learner use it while it is still warm.
 *
 * `kind` and `content` are deliberately generic. A Japanese lesson and a
 * Portuguese one use the same block kinds; only the payload differs.
 */
export const lessonBlock = sqliteTable('lesson_block', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lessonId: integer('lesson_id').notNull().references(() => lesson.id),
  ordinal: integer('ordinal').notNull(),
  /**
   * 'prose'    — explanation
   * 'example'  — a target-language utterance with reading + gloss
   * 'table'    — a grid where relationships matter (the register ladder)
   * 'callout'  — note / warning / the-thing-that-trips-you-up
   * 'predict'  — asks for a commitment BEFORE the explanation lands
   * 'practice' — inline retrieval, mid-lesson, not a final exam
   * 'source'   — the primary source to go read
   */
  kind: text('kind').notNull(),
  /** Block-kind-specific JSON. Opaque to the shell's layout logic. */
  content: text('content', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  /** Optional: which concept this block teaches, for progress attribution. */
  conceptId: integer('concept_id'),
}, (t) => [index('lesson_block_lesson_idx').on(t.lessonId, t.ordinal)])

/**
 * How far through a lesson the learner has read, and whether they finished.
 * Separate from card scheduling: reading is not the same as remembering, and
 * conflating them is how an app reports progress the learner does not have.
 */
export const lessonProgress = sqliteTable('lesson_progress', {
  lessonId: integer('lesson_id').primaryKey().references(() => lesson.id),
  lastBlockOrdinal: integer('last_block_ordinal').notNull().default(0),
  startedAt: integer('started_at').notNull().default(now),
  completedAt: integer('completed_at'),
  msOnTask: integer('ms_on_task').notNull().default(0),
})

/* ---------------- concepts: the curriculum DAG ---------------- */

/**
 * The atomic teachable thing. A lesson *teaches* concepts; a card *tests* one.
 * Splitting these apart is what lets review scheduling be about knowledge
 * rather than about which page you happened to read.
 */
export const concept = sqliteTable('concept', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull().references(() => course.id),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  /** Opaque to the core. Japanese uses 'kanji' | 'vocab' | 'grammar' | 'register'. */
  kind: text('kind').notNull(),
})

export const lessonConcept = sqliteTable('lesson_concept', {
  lessonId: integer('lesson_id').notNull().references(() => lesson.id),
  conceptId: integer('concept_id').notNull().references(() => concept.id),
  /** 'introduces' unlocks the concept for review; 'reinforces' does not. */
  role: text('role').notNull().default('introduces'),
}, (t) => [primaryKey({ columns: [t.lessonId, t.conceptId] })])

/**
 * The prerequisite edge. This is what makes "curriculum integrity" checkable:
 * a lesson must not be reachable before the concepts it depends on are learned.
 */
export const conceptPrereq = sqliteTable('concept_prereq', {
  conceptId: integer('concept_id').notNull().references(() => concept.id),
  requiresId: integer('requires_id').notNull().references(() => concept.id),
}, (t) => [primaryKey({ columns: [t.conceptId, t.requiresId] })])

/**
 * Concepts that collide in memory and must not be scheduled adjacently —
 * near-synonyms, homophones, visually similar forms. The scheduler reads this
 * to space interfering items apart instead of teaching them into each other.
 */
export const conceptInterference = sqliteTable('concept_interference', {
  conceptId: integer('concept_id').notNull().references(() => concept.id),
  collidesWithId: integer('collides_with_id').notNull().references(() => concept.id),
  reason: text('reason'),
}, (t) => [primaryKey({ columns: [t.conceptId, t.collidesWithId] })])

/* ---------------- cards ---------------- */

/**
 * THE SEAM.
 *
 * `type` selects a renderer + grader from the language extension registry.
 * `extra` is that renderer's private payload. The core stores both and
 * interprets neither. Adding a card type must never require a migration here.
 */
export const card = sqliteTable('card', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conceptId: integer('concept_id').notNull().references(() => concept.id),
  type: text('type').notNull(),
  /**
   * Stable identity for authored content, independent of the text shown.
   *
   * Needed because neither prompt nor answer is a safe key: prompts get
   * reworded (which would create a duplicate card and orphan its review
   * history), and answers collide (じ and ぢ are different characters that
   * both read "ji"). The authoring key is what lets content be edited
   * without losing a learner's scheduling.
   */
  authoringKey: text('authoring_key'),
  prompt: text('prompt').notNull(),
  answer: text('answer').notNull(),
  /** JSON. Opaque to core. Never SELECT into this outside the extension. */
  extra: text('extra', { mode: 'json' }).$type<Record<string, unknown>>(),
  /**
   * Recognition is easier than production and must be tracked separately,
   * or the app will report fluency the learner does not have.
   */
  direction: text('direction', { enum: ['recognition', 'production'] })
    .notNull()
    .default('recognition'),
}, (t) => [
  index('card_concept_idx').on(t.conceptId),
  unique('card_authoring_key').on(t.conceptId, t.type, t.authoringKey),
])

/* ---------------- scheduling (FSRS) ---------------- */

/**
 * One row per card. Mirrors the FSRS card model (ts-fsrs) so the scheduler
 * can be handed a row and hand one back without translation.
 */
export const cardState = sqliteTable('card_state', {
  cardId: integer('card_id').primaryKey().references(() => card.id),
  due: integer('due').notNull(),
  stability: real('stability').notNull().default(0),
  difficulty: real('difficulty').notNull().default(0),
  elapsedDays: integer('elapsed_days').notNull().default(0),
  scheduledDays: integer('scheduled_days').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  /** FSRS: 0 New · 1 Learning · 2 Review · 3 Relearning */
  state: integer('state').notNull().default(0),
  lastReview: integer('last_review'),
  /** Set when lapses cross the leech threshold. Suspended cards leave the queue. */
  suspended: integer('suspended', { mode: 'boolean' }).notNull().default(false),
  leech: integer('leech', { mode: 'boolean' }).notNull().default(false),
}, (t) => [index('card_state_due_idx').on(t.due, t.suspended)])

/** Append-only. Never updated. This is the evidence trail for every claim
 *  the app makes about the learner, and the training data for FSRS optimisation. */
export const review = sqliteTable('review', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: integer('card_id').notNull().references(() => card.id),
  sessionId: integer('session_id').references(() => session.id),
  reviewedAt: integer('reviewed_at').notNull().default(now),
  /** FSRS: 1 Again · 2 Hard · 3 Good · 4 Easy */
  rating: integer('rating').notNull(),
  stateBefore: integer('state_before').notNull(),
  /** Response latency. Fast-and-correct differs from slow-and-correct. */
  elapsedMs: integer('elapsed_ms').notNull().default(0),
}, (t) => [
  index('review_card_idx').on(t.cardId),
  index('review_at_idx').on(t.reviewedAt),
])

/* ---------------- sessions, focus, progress ---------------- */

export const session = sqliteTable('session', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  startedAt: integer('started_at').notNull().default(now),
  endedAt: integer('ended_at'),
  kind: text('kind', { enum: ['lesson', 'review', 'mining'] }).notNull(),
  lessonId: integer('lesson_id').references(() => lesson.id),
  /** Which pomodoro of the day this was. Null when the timer was off. */
  pomodoroIndex: integer('pomodoro_index'),
  /** Set when the app advised a break because accuracy was decaying. */
  fatigueFlagged: integer('fatigue_flagged', { mode: 'boolean' }).notNull().default(false),
})

/**
 * One row per calendar day studied — the heatmap and the streak read this.
 * Denormalised on purpose: the heatmap renders 365 cells and must not
 * aggregate the whole review table to do it.
 */
export const studyDay = sqliteTable('study_day', {
  /** Local date 'YYYY-MM-DD'. Local, not UTC: a streak is a human day. */
  day: text('day').primaryKey(),
  reviews: integer('reviews').notNull().default(0),
  newCards: integer('new_cards').notNull().default(0),
  msOnTask: integer('ms_on_task').notNull().default(0),
  xp: integer('xp').notNull().default(0),
  /** Did this day meet the streak bar? Stored, not derived, so that
   *  changing the rule later cannot silently rewrite past history. */
  countedForStreak: integer('counted_for_streak', { mode: 'boolean' }).notNull().default(false),
})

/**
 * XP is awarded per event so it can be audited and, if the rule turns out to
 * be farmable, recomputed. Never increment a running total.
 */
export const xpEvent = sqliteTable('xp_event', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  at: integer('at').notNull().default(now),
  kind: text('kind').notNull(),
  amount: integer('amount').notNull(),
  cardId: integer('card_id').references(() => card.id),
  lessonId: integer('lesson_id').references(() => lesson.id),
}, (t) => [index('xp_at_idx').on(t.at)])

/* ---------------- notes ---------------- */

export const note = sqliteTable('note', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** 'lesson' sticky · 'session' post-review · 'global' notebook */
  scope: text('scope', { enum: ['lesson', 'session', 'global'] }).notNull(),
  lessonId: integer('lesson_id').references(() => lesson.id),
  sessionId: integer('session_id').references(() => session.id),
  cardId: integer('card_id').references(() => card.id),
  body: text('body').notNull(),
  createdAt: integer('created_at').notNull().default(now),
  updatedAt: integer('updated_at').notNull().default(now),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
}, (t) => [
  index('note_lesson_idx').on(t.lessonId),
  index('note_scope_idx').on(t.scope),
])
