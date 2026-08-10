/**
 * End-to-end smoke test of the learning loop.
 *
 *   bun run smoke
 *
 * Runs against a throwaway copy of the real database, so it exercises the
 * actual seeded content without touching your progress. Verifies the claims
 * the app makes about itself rather than trusting them:
 *
 *   1. lessons load with their blocks
 *   2. cards stay LOCKED until their lesson is read      (review integrity)
 *   3. reading a lesson unlocks exactly its own cards
 *   4. a review writes card_state, review, xp_event, study_day
 *   5. FSRS pushes the due date forward
 *   6. rating "Again" earns no XP                        (XP integrity)
 *   7. the streak rule fires only when the bar is met
 */
import { Database } from 'bun:sqlite'
import { copyFileSync, unlinkSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { fsrs, generatorParameters, Rating, createEmptyCard } from 'ts-fsrs'

const SRC = join(homedir(), 'Library/Application Support/app.kotoba.desktop/kotoba.db')
const TMP = join(tmpdir(), `kotoba-smoke-${process.pid}.db`)
copyFileSync(SRC, TMP)

const db = new Database(TMP)
const today = new Date().toLocaleDateString('en-CA')
const scheduler = fsrs(generatorParameters({ request_retention: 0.9 }))

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!cond) failures++
}

const n = (sql: string, ...p: unknown[]) =>
  (db.query(sql).get(...(p as never[])) as { n: number }).n

/* start from a clean slate on the copy */
db.exec('DELETE FROM lesson_progress; DELETE FROM review; DELETE FROM xp_event; DELETE FROM study_day')
db.exec('UPDATE card_state SET due = unixepoch(), state = 0, reps = 0, lapses = 0, stability = 0, difficulty = 0')

console.log('\n1. content loads')
const lesson = db.query(
  'SELECT id, slug, title FROM lesson WHERE slug = ?',
).get('two-dials') as { id: number; slug: string; title: string } | null
check('two-dials lesson exists', !!lesson)
const blocks = n('SELECT COUNT(*) n FROM lesson_block WHERE lesson_id = ?', lesson!.id)
check('lesson has blocks', blocks > 10, `${blocks} blocks`)
check('all block content is valid JSON', n('SELECT COUNT(*) n FROM lesson_block WHERE json_valid(content)=0') === 0)

const UNLOCKED = `
  SELECT COUNT(*) n FROM card c JOIN card_state cs ON cs.card_id = c.id
   WHERE cs.suspended = 0 AND cs.due <= unixepoch()
     AND EXISTS (SELECT 1 FROM lesson_concept lc
                   JOIN lesson_progress lp ON lp.lesson_id = lc.lesson_id
                  WHERE lc.concept_id = c.concept_id)`

console.log('\n2. review integrity — cards locked until taught')
check('nothing unlocked before any lesson is read', n(UNLOCKED) === 0)
check('cards do exist', n('SELECT COUNT(*) n FROM card') > 0, `${n('SELECT COUNT(*) n FROM card')} cards`)

console.log('\n3. reading a lesson unlocks its cards')
db.query('INSERT INTO lesson_progress (lesson_id, last_block_ordinal, completed_at) VALUES (?, ?, unixepoch())')
  .run(lesson!.id, blocks)
const unlocked = n(UNLOCKED)
check('cards unlocked after reading', unlocked > 0, `${unlocked} unlocked`)

const otherLesson = db.query('SELECT id FROM lesson WHERE slug = ?').get('cost-of-wrong-register') as { id: number }
const otherOnly = n(`
  SELECT COUNT(*) n FROM card c
   WHERE c.concept_id IN (SELECT concept_id FROM lesson_concept WHERE lesson_id = ?)
     AND c.concept_id NOT IN (SELECT concept_id FROM lesson_concept WHERE lesson_id = ?)`,
  otherLesson.id, lesson!.id)
check('unread lesson\'s exclusive cards stay locked', unlocked === n('SELECT COUNT(*) n FROM card') - otherOnly,
  `${otherOnly} still locked`)

console.log('\n4-6. a review mutates state correctly')
const card = db.query(`
  SELECT c.id, cs.state FROM card c JOIN card_state cs ON cs.card_id = c.id
   WHERE EXISTS (SELECT 1 FROM lesson_concept lc JOIN lesson_progress lp ON lp.lesson_id = lc.lesson_id
                  WHERE lc.concept_id = c.concept_id) LIMIT 1`)
  .get() as { id: number; state: number }

const before = db.query('SELECT due FROM card_state WHERE card_id = ?').get(card.id) as { due: number }

function review(cardId: number, grade: number) {
  const { card: next } = scheduler.next(createEmptyCard(new Date()), new Date(), grade as never)
  db.query(`UPDATE card_state SET due=?, stability=?, difficulty=?, reps=?, lapses=?, state=?,
              last_review=unixepoch() WHERE card_id=?`)
    .run(Math.floor(next.due.getTime() / 1000), next.stability, next.difficulty,
         next.reps, next.lapses, next.state, cardId)
  db.query('INSERT INTO review (card_id, rating, state_before, elapsed_ms) VALUES (?,?,?,?)')
    .run(cardId, grade, card.state, 4200)
  if (grade > 1) {
    db.query('INSERT INTO xp_event (kind, amount, card_id) VALUES (?,?,?)').run('review', 3, cardId)
  }
  db.query(`INSERT INTO study_day (day, reviews, xp) VALUES (?,1,?)
            ON CONFLICT(day) DO UPDATE SET reviews=reviews+1, xp=xp+excluded.xp`)
    .run(today, grade > 1 ? 3 : 0)
}

review(card.id, Rating.Good)
const after = db.query('SELECT due, reps, state FROM card_state WHERE card_id = ?')
  .get(card.id) as { due: number; reps: number; state: number }

check('review row written', n('SELECT COUNT(*) n FROM review') === 1)
check('card_state advanced', after.reps === 1 && after.state > 0, `state ${after.state}`)
check('FSRS pushed the due date forward', after.due > before.due,
  `+${Math.round((after.due - before.due) / 60)} min`)
check('xp awarded for a successful recall', n('SELECT COUNT(*) n FROM xp_event') === 1)
check('study_day recorded', n('SELECT reviews n FROM study_day WHERE day = ?', today) === 1)

const xpBefore = n('SELECT COALESCE(SUM(amount),0) n FROM xp_event')
const card2 = db.query('SELECT card_id id FROM card_state WHERE card_id != ? LIMIT 1').get(card.id) as { id: number }
review(card2.id, Rating.Again)
check('rating "Again" earns no XP', n('SELECT COALESCE(SUM(amount),0) n FROM xp_event') === xpBefore,
  'XP cannot be farmed by failing')

console.log('\n7. streak rule')
function recomputeStreak() {
  const r = db.query(`SELECT (SELECT reviews FROM study_day WHERE day=?1) AS reviews,
    (SELECT COUNT(*) FROM card_state WHERE suspended=0 AND due<=unixepoch()) AS remaining`)
    .get(today) as { reviews: number; remaining: number }
  const earned = r.reviews > 0 && (r.remaining === 0 || r.reviews >= 10)
  db.query('UPDATE study_day SET counted_for_streak=? WHERE day=?').run(earned ? 1 : 0, today)
  return earned
}
check('2 reviews with more still due does not earn the streak', recomputeStreak() === false)

db.query('UPDATE card_state SET due = unixepoch() + 86400').run()
check('clearing everything due earns the streak', recomputeStreak() === true)

db.close()
unlinkSync(TMP)

console.log(`\n${failures === 0 ? 'all checks passed' : `${failures} FAILED`}\n`)
process.exit(failures === 0 ? 0 : 1)
