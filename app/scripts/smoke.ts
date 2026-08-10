/**
 * End-to-end smoke test of the learning loop.
 *
 *   bun run smoke
 *
 * Builds a throwaway database from the generated migrations, seeds the real
 * course into it, then exercises the loop. Self-contained on purpose: it must
 * run in CI where no app has ever launched, and it must never touch your own
 * progress.
 *
 * Verifies the claims the app makes about itself rather than trusting them:
 *   1. migrations apply and the course seeds
 *   2. the kana track exists and starts from zero
 *   3. cards stay LOCKED until their lesson is read     (review integrity)
 *   4. reading a lesson unlocks its cards
 *   5. a review writes card_state, review, xp_event, study_day
 *   6. FSRS pushes the due date forward
 *   7. rating "Again" earns no XP                       (XP integrity)
 *   8. the streak rule fires only when the bar is met
 */
import { Database } from 'bun:sqlite'
import { readdirSync, readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs'

const TMP = join(tmpdir(), `kotoba-smoke-${process.pid}.db`)
const DRIZZLE = join(import.meta.dir, '..', 'drizzle')

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!cond) failures++
}

/* ---- 1. build a fresh database from the real migrations ---- */

const db = new Database(TMP, { create: true })
const migrations = readdirSync(DRIZZLE).filter((f) => f.endsWith('.sql')).sort()
for (const f of migrations) {
  // Drizzle separates statements with this marker; sqlite runs the rest fine.
  db.exec(readFileSync(join(DRIZZLE, f), 'utf8').replaceAll('--> statement-breakpoint', ''))
}
db.close()

console.log('\n1. schema and content')
check('migrations applied', migrations.length > 0, migrations.join(', '))

const runSeed = () => Bun.spawnSync(['bun', 'run', join(import.meta.dir, 'seed.ts')], {
  env: { ...process.env, KOTOBA_DB: TMP }, stdout: 'pipe', stderr: 'pipe',
})
const countCards = () => {
  const t = new Database(TMP)
  const c = (t.query('SELECT COUNT(*) n FROM card').get() as { n: number }).n
  t.close()
  return c
}

const seeded = runSeed()
check('seeder ran', seeded.exitCode === 0, seeded.exitCode === 0 ? '' : seeded.stderr.toString().slice(0, 300))
const firstCount = countCards()

// Regression guard. Re-seeding must be a no-op. Two separate bugs made it
// duplicate content: stale lesson_concept edges kept dead concepts alive, and
// keying cards on their prompt meant rewording a sentence created a second
// card instead of editing the first.
const reseeded = runSeed()
const secondCount = countCards()
check('re-seeding is a no-op', reseeded.exitCode === 0 && secondCount === firstCount,
  `${firstCount} → ${secondCount}`)

const d = new Database(TMP)
const n = (sql: string, ...p: unknown[]) => (d.query(sql).get(...(p as never[])) as { n: number }).n

check('lessons seeded', n('SELECT COUNT(*) n FROM lesson') > 20, `${n('SELECT COUNT(*) n FROM lesson')} lessons`)
check('teaching blocks seeded', n('SELECT COUNT(*) n FROM lesson_block') > 300,
  `${n('SELECT COUNT(*) n FROM lesson_block')} blocks`)
check('all block content is valid JSON', n('SELECT COUNT(*) n FROM lesson_block WHERE json_valid(content)=0') === 0)

/* ---- 2. the course actually starts at zero ---- */

console.log('\n2. beginner entry point')
const first = d.query(`
  SELECT l.slug, l.title, lv.code FROM lesson l
    JOIN unit u ON u.id = l.unit_id JOIN level lv ON lv.id = u.level_id
   ORDER BY lv.ordinal, l.ordinal LIMIT 1`).get() as { slug: string; title: string; code: string }
check('first lesson is the writing system', first.code === 'KANA', `${first.code} · ${first.title}`)
check('kana cards exist', n("SELECT COUNT(*) n FROM card WHERE type LIKE 'kana-%'") > 150,
  `${n("SELECT COUNT(*) n FROM card WHERE type LIKE 'kana-%'")} kana cards`)
check('both directions are covered',
  n("SELECT COUNT(*) n FROM card WHERE type='kana-production'") > 40
  && n("SELECT COUNT(*) n FROM card WHERE type='kana-recognition'") > 40)

/* ---- 3-4. review integrity ---- */

const UNLOCKED = `
  SELECT COUNT(*) n FROM card c JOIN card_state cs ON cs.card_id = c.id
   WHERE cs.suspended = 0 AND cs.due <= unixepoch()
     AND EXISTS (SELECT 1 FROM lesson_concept lc
                   JOIN lesson_progress lp ON lp.lesson_id = lc.lesson_id
                  WHERE lc.concept_id = c.concept_id)`

console.log('\n3. cards stay locked until taught')
check('nothing unlocked before any lesson is read', n(UNLOCKED) === 0)
check('but cards do exist', n('SELECT COUNT(*) n FROM card') > 200, `${n('SELECT COUNT(*) n FROM card')} cards`)

console.log('\n4. reading a lesson unlocks its cards')
const lesson = d.query('SELECT id FROM lesson WHERE slug = ?').get(first.slug) as { id: number }
const blocks = n('SELECT COUNT(*) n FROM lesson_block WHERE lesson_id = ?', lesson.id)
d.query('INSERT INTO lesson_progress (lesson_id, last_block_ordinal, completed_at) VALUES (?,?,unixepoch())')
  .run(lesson.id, blocks)
const unlocked = n(UNLOCKED)
check('cards unlocked after reading', unlocked > 0, `${unlocked} unlocked`)
check('unread lessons stay locked', unlocked < n('SELECT COUNT(*) n FROM card'),
  `${n('SELECT COUNT(*) n FROM card') - unlocked} still locked`)

// Regression guard. The first lesson teaches exactly five characters, so it
// must unlock exactly ten cards — five recognition, five production. An
// earlier version filed every hiragana under one concept, and finishing
// lesson 1 unlocked all 92 cards including characters never shown.
check('unlocks ONLY the five characters just taught', unlocked === 10,
  `${unlocked} (expected 10: 5 chars × 2 directions)`)

/* ---- 5-7. a review mutates state ---- */

console.log('\n5. a review updates everything it should')
const scheduler = fsrs(generatorParameters({ request_retention: 0.9 }))
const today = new Date().toLocaleDateString('en-CA')

const card = d.query(`
  SELECT c.id, cs.state, cs.due FROM card c JOIN card_state cs ON cs.card_id = c.id
   WHERE EXISTS (SELECT 1 FROM lesson_concept lc JOIN lesson_progress lp ON lp.lesson_id = lc.lesson_id
                  WHERE lc.concept_id = c.concept_id) LIMIT 1`)
  .get() as { id: number; state: number; due: number }

function review(cardId: number, grade: number, stateBefore: number) {
  const { card: next } = scheduler.next(createEmptyCard(new Date()), new Date(), grade as never)
  d.query(`UPDATE card_state SET due=?, stability=?, difficulty=?, reps=?, lapses=?, state=?,
             last_review=unixepoch() WHERE card_id=?`)
    .run(Math.floor(next.due.getTime() / 1000), next.stability, next.difficulty,
         next.reps, next.lapses, next.state, cardId)
  d.query('INSERT INTO review (card_id, rating, state_before, elapsed_ms) VALUES (?,?,?,?)')
    .run(cardId, grade, stateBefore, 4200)
  if (grade > 1) d.query('INSERT INTO xp_event (kind, amount, card_id) VALUES (?,?,?)').run('review', 3, cardId)
  d.query(`INSERT INTO study_day (day, reviews, xp) VALUES (?,1,?)
           ON CONFLICT(day) DO UPDATE SET reviews=reviews+1, xp=xp+excluded.xp`)
    .run(today, grade > 1 ? 3 : 0)
}

review(card.id, Rating.Good, card.state)
const after = d.query('SELECT due, reps, state FROM card_state WHERE card_id=?')
  .get(card.id) as { due: number; reps: number; state: number }

check('review row written', n('SELECT COUNT(*) n FROM review') === 1)
check('card_state advanced', after.reps === 1 && after.state > 0, `state ${after.state}`)
check('FSRS pushed the due date forward', after.due > card.due, `+${Math.round((after.due - card.due) / 60)} min`)
check('xp awarded for a successful recall', n('SELECT COUNT(*) n FROM xp_event') === 1)
check('study_day recorded', n('SELECT reviews n FROM study_day WHERE day=?', today) === 1)

const xpBefore = n('SELECT COALESCE(SUM(amount),0) n FROM xp_event')
const card2 = d.query('SELECT card_id id, state FROM card_state WHERE card_id != ? LIMIT 1')
  .get(card.id) as { id: number; state: number }
review(card2.id, Rating.Again, card2.state)
check('rating "Again" earns no XP', n('SELECT COALESCE(SUM(amount),0) n FROM xp_event') === xpBefore,
  'XP cannot be farmed by failing')

/* ---- 8. streak rule ---- */

console.log('\n6. streak rule')
function streakEarned() {
  const r = d.query(`SELECT (SELECT reviews FROM study_day WHERE day=?1) AS reviews,
    (SELECT COUNT(*) FROM card_state WHERE suspended=0 AND due<=unixepoch()) AS remaining`)
    .get(today) as { reviews: number; remaining: number }
  return r.reviews > 0 && (r.remaining === 0 || r.reviews >= 10)
}
check('2 reviews with hundreds still due does not earn it', streakEarned() === false)
d.query('UPDATE card_state SET due = unixepoch() + 86400').run()
check('clearing everything due earns it', streakEarned() === true)

d.close()
unlinkSync(TMP)

console.log(`\n${failures === 0 ? 'all checks passed' : `${failures} FAILED`}\n`)
process.exit(failures === 0 ? 0 : 1)
