/**
 * Authors course content directly into the live app database.
 *
 *   bun run seed
 *
 * Uses bun:sqlite against the same file the app opens, so anything seeded here
 * is immediately real inside the running app. Idempotent: re-running replaces
 * content by slug rather than duplicating it.
 *
 * Track order matters and is deliberate. The course starts at genuine zero —
 * you cannot read a single character — so kana comes before everything, and
 * nothing in the N5 track renders Japanese the learner has not been taught to
 * decode yet.
 */
import { Database } from 'bun:sqlite'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { LESSONS as REGISTER_LESSONS } from './content'
import { buildKanaTrack, KANA_CONCEPTS, kanaCards } from './kana-course'
import { CONFUSABLE } from './kana'

/** KOTOBA_DB lets CI and the smoke test seed a throwaway database. */
const DB_PATH = process.env.KOTOBA_DB
  ?? join(homedir(), 'Library/Application Support/app.kotoba.desktop/kotoba.db')
const db = new Database(DB_PATH)
db.exec('PRAGMA foreign_keys = ON')

const now = Math.floor(Date.now() / 1000)

/* ---------------- helpers ---------------- */

function upsert(table: string, cols: Record<string, unknown>, conflictCol: string): number {
  const keys = Object.keys(cols)
  const existing = db.query(`SELECT id FROM ${table} WHERE ${conflictCol} = ?`)
    .get(cols[conflictCol] as string) as { id: number } | null

  if (existing) {
    const upd = keys.filter((k) => k !== conflictCol)
    if (upd.length) {
      db.query(`UPDATE ${table} SET ${upd.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
        .run(...upd.map((k) => cols[k] as never), existing.id)
    }
    return existing.id
  }
  return (db.query(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')}) RETURNING id`,
  ).get(...keys.map((k) => cols[k] as never)) as { id: number }).id
}

/**
 * Every card written this run. Anything not in here at the end is content the
 * curriculum no longer contains, and gets removed.
 *
 * Identity is (concept, type, authoring_key) — an explicit key, never derived
 * from displayed text. Prompts get reworded, and answers collide (じ and ぢ
 * both read "ji"), so neither can serve as identity without either orphaning
 * review history or silently merging two different cards.
 */
const touched = new Set<number>()

function card(conceptId: number, o: {
  /** Stable across rewordings. Never derive this from displayed text. */
  key: string
  type: string; prompt: string; answer: string
  direction?: 'recognition' | 'production'; extra?: Record<string, unknown>
}) {
  const extra = o.extra ? JSON.stringify(o.extra) : null
  const direction = o.direction ?? 'recognition'

  const existing = db.query('SELECT id FROM card WHERE concept_id=? AND type=? AND authoring_key=?')
    .get(conceptId, o.type, o.key) as { id: number } | null

  if (existing) {
    // Update in place so review history and scheduling survive a reword.
    db.query('UPDATE card SET prompt=?, answer=?, extra=?, direction=? WHERE id=?')
      .run(o.prompt, o.answer, extra, direction, existing.id)
    touched.add(existing.id)
    return existing.id
  }

  const r = db.query(
    `INSERT INTO card (concept_id, type, authoring_key, prompt, answer, extra, direction)
     VALUES (?,?,?,?,?,?,?) RETURNING id`,
  ).get(conceptId, o.type, o.key, o.prompt, o.answer, extra, direction) as { id: number }

  db.query('INSERT INTO card_state (card_id, due, state) VALUES (?,?,0)').run(r.id, now)
  touched.add(r.id)
  return r.id
}

/* ---------------- course skeleton ---------------- */

const langId = upsert('language',
  { code: 'ja', name: 'Japanese', native_name: '日本語', extension: 'ja' }, 'code')

const courseId = upsert('course', {
  language_id: langId,
  title: 'Japanese for the professional circuit',
  description: 'From not reading a single character to operating inside a Japanese company.',
}, 'title')

// "Kana" sits before N5 because JLPT levels assume you can already read.
// jlpt.jp publishes no vocab or kanji counts, so none are recorded anywhere here.
const LEVELS = [
  ['KANA', 'Reading the alphabet', 0],
  ['N5', 'Foundations', 1],
  ['N4', 'Basic working Japanese', 2],
  ['N3', 'Everyday professional', 3],
  ['N2', 'Fluent professional', 4],
  ['N1', 'Full register control', 5],
] as const

const levelId: Record<string, number> = {}
for (const [code, title, ordinal] of LEVELS) {
  levelId[code] = upsert('level', { course_id: courseId, code, title, ordinal }, 'code')
}

const unitId: Record<string, number> = {
  kana: upsert('unit', { level_id: levelId.KANA, title: 'The writing system', ordinal: 1 }, 'title'),
  register: upsert('unit', { level_id: levelId.N5, title: 'Register foundations', ordinal: 1 }, 'title'),
}

/* ---------------- concepts ---------------- */

const concept = (slug: string, title: string, kind: string) =>
  upsert('concept', { course_id: courseId, slug, title, kind }, 'slug')

const conceptId: Record<string, number> = {}
for (const c of KANA_CONCEPTS) conceptId[c.slug] = concept(c.slug, c.title, c.kind)

const REGISTER_CONCEPTS = [
  ['two-dials', 'The two dials of politeness'],
  ['sonkeigo-verbs', 'Irregular 尊敬語 verbs'],
  ['kenjougo-verbs', 'Irregular 謙譲語 verbs'],
  ['kenjougo-1-vs-2', '謙譲語Ⅰ vs 謙譲語Ⅱ'],
  ['uchi-soto-flip', '内/外 and the referent flip'],
  ['nijuu-keigo', '二重敬語 as an error'],
] as const
for (const [slug, title] of REGISTER_CONCEPTS) conceptId[slug] = concept(slug, title, 'register')

/**
 * The DAG. Each kana group depends on the one before it, katakana depends on
 * finishing hiragana, and the register work depends on being able to read at
 * all — which is the whole correction this course needed.
 */
const kanaGroups = KANA_CONCEPTS.map((c) => c.slug).filter((s) => s !== 'kana-marks')
const hiraganaGroups = kanaGroups.filter((s) => s.startsWith('kana-hiragana'))
const katakanaGroups = kanaGroups.filter((s) => s.startsWith('kana-katakana'))
const lastHiragana = hiraganaGroups[hiraganaGroups.length - 1]

const prereqs: [string, string][] = [
  ...hiraganaGroups.slice(1).map((s, i) => [s, hiraganaGroups[i]] as [string, string]),
  ...katakanaGroups.slice(1).map((s, i) => [s, katakanaGroups[i]] as [string, string]),
  [katakanaGroups[0], lastHiragana],
  ['kana-marks', lastHiragana],
  ['two-dials', lastHiragana],
  ['uchi-soto-flip', lastHiragana],
  ['sonkeigo-verbs', 'two-dials'],
  ['kenjougo-verbs', 'two-dials'],
  ['kenjougo-1-vs-2', 'kenjougo-verbs'],
  ['nijuu-keigo', 'sonkeigo-verbs'],
]
for (const [c, r] of prereqs) {
  if (!conceptId[c] || !conceptId[r]) throw new Error(`bad prereq edge ${c} → ${r}`)
  db.query('INSERT OR IGNORE INTO concept_prereq (concept_id, requires_id) VALUES (?,?)')
    .run(conceptId[c], conceptId[r])
}

/**
 * Characters that collide in memory. Recorded against the two groups that own
 * them so the scheduler can space interfering items apart rather than teaching
 * them into each other — シ/ツ being the canonical case.
 */
const ownerOf = (ch: string) => {
  for (const [slug, title] of KANA_CONCEPTS.map((c) => [c.slug, c.title] as const)) {
    if (title.includes(ch)) return slug
  }
  return null
}
for (const [a, b, why] of CONFUSABLE) {
  const ca = ownerOf(a), cb = ownerOf(b)
  if (!ca || !cb || ca === cb) continue
  db.query('INSERT OR IGNORE INTO concept_interference (concept_id, collides_with_id, reason) VALUES (?,?,?)')
    .run(conceptId[ca], conceptId[cb], `${a} / ${b} — ${why}`)
}

/* ---------------- lessons ---------------- */

const kanaTrack = buildKanaTrack(1)
const registerTrack = REGISTER_LESSONS.map((l, i) => ({ ...l, ordinal: kanaTrack.length + i + 1 }))

function writeLesson(def: (typeof kanaTrack)[number], unit: number) {
  const id = upsert('lesson', {
    unit_id: unit,
    slug: def.slug,
    title: def.title,
    body: def.summary,
    ordinal: def.ordinal,
    estimated_minutes: def.minutes,
  }, 'slug')

  // Content is authored in code, so the files always win.
  db.query('DELETE FROM lesson_block WHERE lesson_id = ?').run(id)
  def.blocks.forEach((b, i) => {
    const { kind, ...content } = b
    db.query('INSERT INTO lesson_block (lesson_id, ordinal, kind, content) VALUES (?,?,?,?)')
      .run(id, i + 1, kind, JSON.stringify(content))
  })

  // Clear stale edges first. Leaving them keeps concepts alive that the
  // curriculum no longer teaches, which is how the orphan cards appeared
  // when kana was resplit into per-group concepts.
  db.query('DELETE FROM lesson_concept WHERE lesson_id = ?').run(id)
  for (const slug of def.concepts) {
    if (!conceptId[slug]) throw new Error(`lesson ${def.slug} references unknown concept ${slug}`)
    db.query('INSERT INTO lesson_concept (lesson_id, concept_id, role) VALUES (?,?,?)')
      .run(id, conceptId[slug], 'introduces')
  }
  return id
}

for (const l of kanaTrack) writeLesson(l, unitId.kana)
for (const l of registerTrack) writeLesson(l, unitId.register)

/* ---------------- cards ---------------- */

for (const c of kanaCards()) {
  // The character itself is the stable key: it never changes, and unlike the
  // romaji it is unique (じ and ぢ both read "ji").
  const key = c.direction === 'recognition' ? c.prompt : c.answer
  card(conceptId[c.concept], {
    key, type: c.type, prompt: c.prompt, answer: c.answer,
    direction: c.direction, extra: c.extra,
  })
}

/* register ladders + their cards */

const ladders = [
  { gloss: 'to go / to come', plain: '行く', teineigo: '行きます', sonkeigo: 'いらっしゃる',
    kenjougo1: '伺う', kenjougo2: '参る', notes: '伺う needs a respectable destination; 参る does not.' },
  { gloss: 'to be present', plain: 'いる', teineigo: 'います', sonkeigo: 'いらっしゃる',
    kenjougo1: null, kenjougo2: 'おる', notes: null },
  { gloss: 'to do', plain: 'する', teineigo: 'します', sonkeigo: 'なさる',
    kenjougo1: null, kenjougo2: 'いたす', notes: null },
  { gloss: 'to say', plain: '言う', teineigo: '言います', sonkeigo: 'おっしゃる',
    kenjougo1: '申し上げる', kenjougo2: '申す', notes: '申し上げる needs someone to say it to.' },
  { gloss: 'to see', plain: '見る', teineigo: '見ます', sonkeigo: 'ご覧になる',
    kenjougo1: '拝見する', kenjougo2: null, notes: null },
  { gloss: 'to eat / to drink', plain: '食べる', teineigo: '食べます', sonkeigo: '召し上がる',
    kenjougo1: 'いただく', kenjougo2: null, notes: null },
]

const antiPatterns: Record<string, { form: string; error: string; note: string }[]> = {
  'to say': [{ form: 'おっしゃられる', error: 'nijuu-keigo', note: 'おっしゃる is already 尊敬語.' }],
  'to see': [{ form: '拝見させていただく', error: 'over-polite', note: 'Two humble mechanisms stacked.' }],
}

for (const l of ladders) {
  const exists = db.query('SELECT id FROM ja_register_ladder WHERE gloss = ?').get(l.gloss)
  if (!exists) {
    db.query(
      `INSERT INTO ja_register_ladder
       (concept_id, gloss, plain, teineigo, sonkeigo, kenjougo1, kenjougo2, anti_patterns, notes)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    ).run(conceptId['two-dials'], l.gloss, l.plain, l.teineigo, l.sonkeigo,
          l.kenjougo1, l.kenjougo2, JSON.stringify(antiPatterns[l.gloss] ?? []), l.notes)
  }
  if (l.sonkeigo) {
    card(conceptId['sonkeigo-verbs'], {
      key: `sonkeigo:${l.plain}`,
      type: 'register-transform', prompt: `${l.plain} → 尊敬語`, answer: l.sonkeigo,
      direction: 'production', extra: { gloss: l.gloss, from: 'plain', to: 'sonkeigo', dial: 2 },
    })
  }
  if (l.kenjougo1 ?? l.kenjougo2) {
    card(conceptId['kenjougo-verbs'], {
      key: `kenjougo:${l.plain}`,
      type: 'register-transform', prompt: `${l.plain} → 謙譲語`,
      answer: [l.kenjougo1, l.kenjougo2].filter(Boolean).join(' / '),
      direction: 'production', extra: { gloss: l.gloss, from: 'plain', to: 'kenjougo', dial: 2 },
    })
  }
}

card(conceptId['kenjougo-1-vs-2'], {
  key: 'osaka-mairimasu',
  type: 'register-choice', prompt: '明日、大阪に___（行く）。To your manager.', answer: '参ります',
  direction: 'production',
  extra: { distractors: ['伺います', 'いらっしゃいます'], why: 'Osaka is not a person — 謙譲語Ⅱ, not Ⅰ.' },
})
card(conceptId['uchi-soto-flip'], {
  key: 'client-boss-out',
  type: 'register-choice', prompt: 'To a client: your boss 田中部長 is out.',
  answer: '田中はただいま外出しております', direction: 'production',
  extra: { distractors: ['田中部長はいらっしゃいません'], why: 'Speaking to 外, your company becomes 内.' },
})
card(conceptId['nijuu-keigo'], {
  key: 'ossharareru',
  type: 'error-detection', prompt: '部長がおっしゃられました — what is wrong?',
  answer: '二重敬語 — おっしゃる is already 尊敬語, -られる doubles it',
  extra: { correct: '部長がおっしゃいました' },
})
card(conceptId['two-dials'], {
  key: 'kaerareta-analysis',
  type: 'register-analysis', prompt: '田中部長、もう帰られた？ — which dials are engaged?',
  answer: 'Dial 2 honorific (帰られる) + Dial 1 plain (〜た, toward your peer)',
  extra: { dial1: 'plain', dial2: 'sonkeigo' },
})

/* ---------------- prune ---------------- */

/** Cards the curriculum no longer authors — left behind by reworded content. */
const stale = db.query(
  `SELECT id FROM card WHERE id NOT IN (${[...touched].join(',') || '0'})`,
).all() as { id: number }[]

for (const { id } of stale) {
  db.query('DELETE FROM review WHERE card_id = ?').run(id)
  db.query('DELETE FROM xp_event WHERE card_id = ?').run(id)
  db.query('DELETE FROM note WHERE card_id = ?').run(id)
  db.query('DELETE FROM card_state WHERE card_id = ?').run(id)
  db.query('DELETE FROM card WHERE id = ?').run(id)
}
if (stale.length) console.log(`pruned ${stale.length} stale card(s)`)

/**
 * Remove concepts no lesson teaches any more, and everything hanging off them.
 *
 * Without this the database accumulates orphans every time the curriculum is
 * restructured — cards for concepts that no longer appear in any lesson, which
 * can never be unlocked but still inflate every count the app reports. That
 * happened once already when kana moved from two coarse concepts to one per
 * five-character group.
 *
 * Review history for a genuinely deleted concept is not worth keeping: the
 * material is gone, so the schedule for it is meaningless.
 */
const orphans = db.query(`
  SELECT c.id, c.slug FROM concept c
   WHERE NOT EXISTS (SELECT 1 FROM lesson_concept lc WHERE lc.concept_id = c.id)
`).all() as { id: number; slug: string }[]

for (const o of orphans) {
  const ids = db.query('SELECT id FROM card WHERE concept_id = ?').all(o.id) as { id: number }[]
  for (const { id } of ids) {
    db.query('DELETE FROM review WHERE card_id = ?').run(id)
    db.query('DELETE FROM xp_event WHERE card_id = ?').run(id)
    db.query('DELETE FROM note WHERE card_id = ?').run(id)
    db.query('DELETE FROM card_state WHERE card_id = ?').run(id)
  }
  db.query('DELETE FROM card WHERE concept_id = ?').run(o.id)
  db.query('DELETE FROM concept_prereq WHERE concept_id = ? OR requires_id = ?').run(o.id, o.id)
  db.query('DELETE FROM concept_interference WHERE concept_id = ? OR collides_with_id = ?').run(o.id, o.id)
  db.query('DELETE FROM ja_register_ladder WHERE concept_id = ?').run(o.id)
  db.query('DELETE FROM concept WHERE id = ?').run(o.id)
}
if (orphans.length) {
  console.log(`pruned ${orphans.length} orphaned concept(s): ${orphans.map((o) => o.slug).join(', ')}`)
}

/* ---------------- report ---------------- */

const n = (sql: string) => (db.query(sql).get() as { n: number }).n
console.log('seeded into', DB_PATH)
console.table({
  levels: n('SELECT COUNT(*) n FROM level'),
  lessons: n('SELECT COUNT(*) n FROM lesson'),
  lesson_blocks: n('SELECT COUNT(*) n FROM lesson_block'),
  concepts: n('SELECT COUNT(*) n FROM concept'),
  cards: n('SELECT COUNT(*) n FROM card'),
  kana_cards: n("SELECT COUNT(*) n FROM card WHERE type LIKE 'kana-%'"),
  register_cards: n("SELECT COUNT(*) n FROM card WHERE type LIKE 'register-%' OR type='error-detection'"),
})
db.close()
