/**
 * Authors course content directly into the live app database.
 *
 *   bun run seed
 *
 * Uses bun:sqlite against the same file the app opens, so anything seeded here
 * is immediately real inside the running app — no import step, no fixtures.
 * Idempotent: re-running replaces content by slug rather than duplicating it.
 *
 * Every lesson taught in ../../lessons/ should have a corresponding block here.
 * A lesson that exists as HTML but not as rows is a lesson the SRS cannot
 * schedule, which means it will be forgotten.
 */
import { Database } from 'bun:sqlite'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { LESSONS } from './content'

const DB_PATH = join(
  homedir(),
  'Library/Application Support/app.kotoba.desktop/kotoba.db',
)

const db = new Database(DB_PATH)
db.exec('PRAGMA foreign_keys = ON')

const now = Math.floor(Date.now() / 1000)

/* ---------------- helpers ---------------- */

function upsert(table: string, cols: Record<string, unknown>, conflictCol: string): number {
  const keys = Object.keys(cols)
  const existing = db
    .query(`SELECT id FROM ${table} WHERE ${conflictCol} = ?`)
    .get(cols[conflictCol] as string) as { id: number } | null

  if (existing) {
    const sets = keys.filter((k) => k !== conflictCol).map((k) => `${k} = ?`).join(', ')
    db.query(`UPDATE ${table} SET ${sets} WHERE id = ?`).run(
      ...keys.filter((k) => k !== conflictCol).map((k) => cols[k] as never),
      existing.id,
    )
    return existing.id
  }
  const r = db
    .query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')}) RETURNING id`,
    )
    .get(...keys.map((k) => cols[k] as never)) as { id: number }
  return r.id
}

/** Creates the card and its FSRS state row. New cards are due immediately. */
function card(conceptId: number, o: {
  type: string
  prompt: string
  answer: string
  direction?: 'recognition' | 'production'
  extra?: Record<string, unknown>
}) {
  const existing = db
    .query('SELECT id FROM card WHERE concept_id = ? AND type = ? AND prompt = ?')
    .get(conceptId, o.type, o.prompt) as { id: number } | null
  if (existing) return existing.id

  const r = db
    .query(
      `INSERT INTO card (concept_id, type, prompt, answer, extra, direction)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
    )
    .get(
      conceptId,
      o.type,
      o.prompt,
      o.answer,
      o.extra ? JSON.stringify(o.extra) : null,
      o.direction ?? 'recognition',
    ) as { id: number }

  db.query('INSERT INTO card_state (card_id, due, state) VALUES (?, ?, 0)').run(r.id, now)
  return r.id
}

/* ---------------- course skeleton ---------------- */

const langId = upsert('language', {
  code: 'ja', name: 'Japanese', native_name: '日本語', extension: 'ja',
}, 'code')

const courseId = upsert('course', {
  language_id: langId,
  title: 'Japanese for the professional circuit',
  description: 'Operating as a software engineer inside a Japanese company.',
}, 'title')

// JLPT levels are a scope map, not the goal. Note deliberately: jlpt.jp
// publishes no vocab or kanji counts, so none are recorded here.
const levels: Record<string, number> = {}
for (const [i, [code, title]] of ([
  ['N5', 'Foundations'],
  ['N4', 'Basic working Japanese'],
  ['N3', 'Everyday professional'],
  ['N2', 'Fluent professional'],
  ['N1', 'Full register control'],
] as const).entries()) {
  levels[code] = upsert('level',
    { course_id: courseId, code, title, ordinal: i + 1 }, 'code')
}

const unitId = upsert('unit', {
  level_id: levels.N5, title: 'Register foundations', ordinal: 1,
}, 'title')

/* ---------------- concepts ---------------- */

function concept(slug: string, title: string, kind: string) {
  return upsert('concept', { course_id: courseId, slug, title, kind }, 'slug')
}

const cTwoDials  = concept('two-dials',      'The two dials of politeness',   'register')
const cSonkeigo  = concept('sonkeigo-verbs', 'Irregular 尊敬語 verbs',         'register')
const cKenjougo  = concept('kenjougo-verbs', 'Irregular 謙譲語 verbs',         'register')
const cKen1vs2   = concept('kenjougo-1-vs-2','謙譲語Ⅰ vs 謙譲語Ⅱ',            'register')
const cUchiSoto  = concept('uchi-soto-flip', '内/外 and the referent flip',    'register')
const cNijuu     = concept('nijuu-keigo',    '二重敬語 as an error',           'register')

/** The DAG. Everything in this lesson depends on the two-dial model. */
const prereqs: [number, number][] = [
  [cSonkeigo, cTwoDials],
  [cKenjougo, cTwoDials],
  [cKen1vs2, cKenjougo],
  [cUchiSoto, cTwoDials],
  [cNijuu, cSonkeigo],
]
for (const [c, r] of prereqs) {
  db.query('INSERT OR IGNORE INTO concept_prereq (concept_id, requires_id) VALUES (?, ?)').run(c, r)
}

/** 伺う appears in both 謙譲語Ⅰ senses and collides with 参る. Keep them apart. */
db.query('INSERT OR IGNORE INTO concept_interference (concept_id, collides_with_id, reason) VALUES (?, ?, ?)')
  .run(cKen1vs2, cKenjougo, '伺う and 参る are both humble "go" and are routinely confused')

/* ---------------- lessons ---------------- */

const conceptBySlug: Record<string, number> = {
  'two-dials': cTwoDials,
  'sonkeigo-verbs': cSonkeigo,
  'kenjougo-verbs': cKenjougo,
  'kenjougo-1-vs-2': cKen1vs2,
  'uchi-soto-flip': cUchiSoto,
  'nijuu-keigo': cNijuu,
}

for (const def of LESSONS) {
  const lessonId = upsert('lesson', {
    unit_id: unitId,
    slug: def.slug,
    title: def.title,
    body: def.summary,
    ordinal: def.ordinal,
    estimated_minutes: def.minutes,
  }, 'slug')

  // Blocks are rewritten wholesale each run: content is authored here, so the
  // file is the source of truth and edits should always win.
  db.query('DELETE FROM lesson_block WHERE lesson_id = ?').run(lessonId)
  def.blocks.forEach((b, i) => {
    const { kind, ...content } = b
    db.query(
      'INSERT INTO lesson_block (lesson_id, ordinal, kind, content) VALUES (?, ?, ?, ?)',
    ).run(lessonId, i + 1, kind, JSON.stringify(content))
  })

  for (const slug of def.concepts) {
    const cid = conceptBySlug[slug]
    if (!cid) throw new Error(`lesson ${def.slug} references unknown concept ${slug}`)
    db.query('INSERT OR IGNORE INTO lesson_concept (lesson_id, concept_id, role) VALUES (?, ?, ?)')
      .run(lessonId, cid, 'introduces')
  }
}

/* ---------------- register ladders ---------------- */

const ladders = [
  { gloss: 'to go / to come', plain: '行く', teineigo: '行きます',
    sonkeigo: 'いらっしゃる', kenjougo1: '伺う', kenjougo2: '参る',
    notes: '伺う needs a respectable destination; 参る does not.' },
  { gloss: 'to be present', plain: 'いる', teineigo: 'います',
    sonkeigo: 'いらっしゃる', kenjougo1: null, kenjougo2: 'おる', notes: null },
  { gloss: 'to do', plain: 'する', teineigo: 'します',
    sonkeigo: 'なさる', kenjougo1: null, kenjougo2: 'いたす', notes: null },
  { gloss: 'to say', plain: '言う', teineigo: '言います',
    sonkeigo: 'おっしゃる', kenjougo1: '申し上げる', kenjougo2: '申す',
    notes: '申し上げる needs someone to say it *to*; 申す does not.' },
  { gloss: 'to see', plain: '見る', teineigo: '見ます',
    sonkeigo: 'ご覧になる', kenjougo1: '拝見する', kenjougo2: null, notes: null },
  { gloss: 'to eat / to drink', plain: '食べる', teineigo: '食べます',
    sonkeigo: '召し上がる', kenjougo1: 'いただく', kenjougo2: null, notes: null },
]

const antiPatterns = {
  'to say': [
    { form: 'おっしゃられる', error: 'nijuu-keigo', note: 'おっしゃる is already 尊敬語; -られる doubles it.' },
  ],
  'to see': [
    { form: '拝見させていただく', error: 'over-polite', note: 'Two humble mechanisms stacked.' },
  ],
}

for (const l of ladders) {
  const existing = db.query('SELECT id FROM ja_register_ladder WHERE gloss = ?')
    .get(l.gloss) as { id: number } | null
  if (existing) continue

  db.query(
    `INSERT INTO ja_register_ladder
     (concept_id, gloss, plain, teineigo, sonkeigo, kenjougo1, kenjougo2, anti_patterns, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    cTwoDials, l.gloss, l.plain, l.teineigo, l.sonkeigo, l.kenjougo1, l.kenjougo2,
    JSON.stringify(antiPatterns[l.gloss as keyof typeof antiPatterns] ?? []),
    l.notes,
  )

  // Register-transformation cards — the card type that carries this course.
  if (l.sonkeigo) {
    card(cSonkeigo, {
      type: 'register-transform',
      prompt: `${l.plain} → 尊敬語`,
      answer: l.sonkeigo,
      direction: 'production',
      extra: { gloss: l.gloss, from: 'plain', to: 'sonkeigo', dial: 2 },
    })
  }
  if (l.kenjougo2 ?? l.kenjougo1) {
    card(cKenjougo, {
      type: 'register-transform',
      prompt: `${l.plain} → 謙譲語`,
      answer: [l.kenjougo1, l.kenjougo2].filter(Boolean).join(' / '),
      direction: 'production',
      extra: { gloss: l.gloss, from: 'plain', to: 'kenjougo', dial: 2 },
    })
  }
}

/* ---------------- reasoning cards ---------------- */

card(cKen1vs2, {
  type: 'register-choice',
  prompt: '明日、大阪に___（行く）。To your manager.',
  answer: '参ります',
  direction: 'production',
  extra: {
    distractors: ['伺います', 'いらっしゃいます', 'お越しになります'],
    why: 'Osaka is not a person, so there is nobody to elevate — 謙譲語Ⅱ, not Ⅰ.',
  },
})

card(cUchiSoto, {
  type: 'register-choice',
  prompt: 'To a client: your boss 田中部長 is currently out.',
  answer: '田中はただいま外出しております',
  direction: 'production',
  extra: {
    distractors: ['田中部長はいらっしゃいません', '田中部長は外出されています'],
    why: 'Speaking to 外, your own company becomes 内. Drop the title, use humble forms.',
  },
})

card(cNijuu, {
  type: 'error-detection',
  prompt: '部長がおっしゃられました — what is wrong?',
  answer: '二重敬語 — おっしゃる is already 尊敬語, -られる doubles it',
  extra: { correct: '部長がおっしゃいました' },
})

card(cTwoDials, {
  type: 'register-analysis',
  prompt: '田中部長、もう帰られた？ — which dials are engaged?',
  answer: 'Dial 2 honorific (帰られる, about 田中) + Dial 1 plain (〜た, toward your peer)',
  extra: { dial1: 'plain', dial2: 'sonkeigo' },
})

/* ---------------- report ---------------- */

const count = (sql: string) => (db.query(sql).get() as { n: number }).n

console.log('seeded into', DB_PATH)
console.table({
  languages: count('SELECT COUNT(*) n FROM language'),
  levels: count('SELECT COUNT(*) n FROM level'),
  lessons: count('SELECT COUNT(*) n FROM lesson'),
  lesson_blocks: count('SELECT COUNT(*) n FROM lesson_block'),
  concepts: count('SELECT COUNT(*) n FROM concept'),
  prereq_edges: count('SELECT COUNT(*) n FROM concept_prereq'),
  register_ladders: count('SELECT COUNT(*) n FROM ja_register_ladder'),
  cards: count('SELECT COUNT(*) n FROM card'),
  due_now: count('SELECT COUNT(*) n FROM card_state WHERE due <= unixepoch() AND suspended = 0'),
})

db.close()
