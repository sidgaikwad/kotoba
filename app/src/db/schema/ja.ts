/* ============================================================
   JAPANESE EXTENSION SCHEMA
   ============================================================
   Everything the core is forbidden to know.

   These tables hang off `concept.id`. Nothing in ./core.ts may
   import from this file. When Korean is added, it gets ko.ts and
   the core does not change.

   Attribution for bundled data (required by licence):
     JMdict / KANJIDIC2  — EDRDG, CC BY-SA 4.0
     KanjiVG             — Ulrich Apel, CC BY-SA 3.0
     Tatoeba             — CC BY 2.0 FR
   These must be reachable from the app's About screen before ship.
   ============================================================ */

import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { concept } from './core'

/* ---------------- writing system ---------------- */

/** Source: KANJIDIC2 (EDRDG, CC BY-SA 4.0). */
export const jaKanji = sqliteTable('ja_kanji', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  character: text('character').notNull().unique(),
  /** JSON arrays of readings. */
  onReadings: text('on_readings', { mode: 'json' }).$type<string[]>(),
  kunReadings: text('kun_readings', { mode: 'json' }).$type<string[]>(),
  meanings: text('meanings', { mode: 'json' }).$type<string[]>(),
  strokeCount: integer('stroke_count'),
  /** 常用漢字 school grade, 1–6 and 8. Null = outside 常用漢字表. */
  grade: integer('grade'),
  /** Newspaper frequency rank, 1–2501. Lower is commoner. */
  frequency: integer('frequency'),
  /** Community-reconstructed JLPT level. The official lists were
   *  withdrawn in 2010 — this is a hint for ordering, never a fact. */
  jlptHint: text('jlpt_hint'),
  conceptId: integer('concept_id').references(() => concept.id),
})

/** Component decomposition, for teaching kanji by parts rather than by shape.
 *  Source: KanjiVG (CC BY-SA 3.0). */
export const jaKanjiComponent = sqliteTable('ja_kanji_component', {
  kanjiId: integer('kanji_id').notNull().references(() => jaKanji.id),
  component: text('component').notNull(),
  /** Position hint: 'left' | 'right' | 'top' | 'bottom' | 'enclose'. */
  position: text('position'),
}, (t) => [unique('ja_kanji_component_uq').on(t.kanjiId, t.component, t.position)])

/* ---------------- vocabulary ---------------- */

/** Source: JMdict (EDRDG, CC BY-SA 4.0), frequency-ordered against BCCWJ. */
export const jaVocab = sqliteTable('ja_vocab', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  headword: text('headword').notNull(),
  reading: text('reading').notNull(),
  meanings: text('meanings', { mode: 'json' }).$type<string[]>(),
  partOfSpeech: text('part_of_speech'),
  /** Mora index of the accent drop; 0 = 平板 heiban (no drop). */
  pitchAccent: integer('pitch_accent'),
  /**
   * Register tag. This is the column that makes the course work:
   * 'plain' | 'teineigo' | 'sonkeigo' | 'kenjougo1' | 'kenjougo2' | 'bikago'
   * plus 'written' | 'spoken' | 'chat' for channel restriction.
   */
  register: text('register'),
  /** Domain. 'general' | 'engineering' | 'business' | 'legal'.
   *  障害 means something different at a software company. */
  domain: text('domain').notNull().default('general'),
  conceptId: integer('concept_id').references(() => concept.id),
}, (t) => [
  unique('ja_vocab_uq').on(t.headword, t.reading),
  index('ja_vocab_register_idx').on(t.register),
])

/* ---------------- verbs and the conjugation machine ---------------- */

export const jaVerb = sqliteTable('ja_verb', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vocabId: integer('vocab_id').notNull().references(() => jaVocab.id),
  dictionaryForm: text('dictionary_form').notNull(),
  /** 'godan' | 'ichidan' | 'irregular' — the first branch of the machine. */
  verbClass: text('verb_class').notNull(),
  transitivity: text('transitivity', { enum: ['transitive', 'intransitive'] }),
  /**
   * The other half of a transitivity pair: 落ちる ↔ 落とす.
   * Choosing between the pair assigns blame, which is why this is
   * modelled as a first-class relation and not a note in a gloss.
   */
  pairedWithId: integer('paired_with_id'),
})

/* ---------------- register: the professional core ---------------- */

/**
 * One row per expression, carrying its full ladder.
 *
 * A course that stores only the polite form teaches a learner who can be
 * polite and nothing else. Every core expression must be authored with its
 * ladder populated, and a lesson that leaves these null is incomplete —
 * that check is the "register coverage" audit.
 *
 * Categories follow 敬語の指針 (文化審議会答申, 2007-02-02), which uses five,
 * not the three that textbooks still print.
 */
export const jaRegisterLadder = sqliteTable('ja_register_ladder', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conceptId: integer('concept_id').notNull().references(() => concept.id),
  /** English label for the act: 'to go', 'to say', 'to receive'. */
  gloss: text('gloss').notNull(),

  plain: text('plain'),                 // 行く         常体
  teineigo: text('teineigo'),           // 行きます      丁寧語
  sonkeigo: text('sonkeigo'),           // いらっしゃる   尊敬語   raises the subject
  kenjougo1: text('kenjougo1'),         // 伺う         謙譲語Ⅰ  lowers me toward a third party
  kenjougo2: text('kenjougo2'),         // 参る         謙譲語Ⅱ  lowers me toward the listener
  bikago: text('bikago'),               // お〜         美化語

  /** Forms that are grammatical but wrong in practice, with the reason.
   *  JSON: [{ form, error: 'nijuu-keigo'|'over-polite'|'dead', note }] */
  antiPatterns: text('anti_patterns', { mode: 'json' })
    .$type<{ form: string; error: string; note: string }[]>(),

  notes: text('notes'),
}, (t) => [index('ja_ladder_concept_idx').on(t.conceptId)])

/**
 * Who may say what to whom, in which channel. This is the table that lets the
 * app grade a *register* answer rather than a vocabulary answer — and it is
 * the thing no textbook dataset provides, so rows here are authored by hand
 * and each carries its evidence.
 */
export const jaRegisterRule = sqliteTable('ja_register_rule', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** 'senior-same-team' | 'peer' | 'client' | 'own-boss-to-client' | 'junior' */
  audience: text('audience').notNull(),
  /** 'speech' | 'chat' | 'email' | 'document' */
  channel: text('channel').notNull(),
  /** Which ladder rung is correct here. */
  expected: text('expected').notNull(),
  /** What going one rung too high or too low actually costs, socially. */
  tooHigh: text('too_high'),
  tooLow: text('too_low'),
  /** 'T1' | 'T2' | 'T3' — inferred claims must be marked T3 and revisited. */
  evidenceTier: text('evidence_tier').notNull().default('T3'),
  evidenceUrl: text('evidence_url'),
}, (t) => [unique('ja_register_rule_uq').on(t.audience, t.channel, t.expected)])
