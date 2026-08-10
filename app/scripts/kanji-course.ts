/**
 * The kanji track, generated from KANJIDIC2.
 *
 * Ordered by newspaper frequency rather than school grade. Grade order is
 * designed for Japanese six-year-olds learning words they already speak;
 * frequency order gets an adult reading real text soonest. 人 日 本 年 大 are
 * worth more on day one than the grade-1 characters for "insect" and "shellfish".
 *
 * Ten characters per lesson, each taught with its readings and meaning, then
 * recalled. 2,136 characters at ten per lesson is 214 lessons — which is the
 * single largest block of work in the course, and the honest reason a real
 * N5→N1 run takes about a year.
 *
 * Data: KANJIDIC2, EDRDG, CC BY-SA 4.0.
 */
import type { Block, LessonDef } from './content'

export type KanjiEntry = {
  c: string; on: string[]; kun: string[]; meanings: string[]
  strokes: number; grade: number; freq: number | null
}

let cache: KanjiEntry[] | null = null

/** Returns [] if the dataset has not been fetched — the course still builds. */
export function loadKanji(): KanjiEntry[] {
  if (cache) return cache
  try {
    // Bun resolves this at runtime; absent file falls through to [].
    const data = require('./data/kanji.json') as { kanji: KanjiEntry[] }
    cache = data.kanji ?? []
  } catch {
    cache = []
  }
  return cache
}

const PER_LESSON = 10

/** How many kanji each JLPT level is conventionally said to cover.
 *  These are community reconstructions — jlpt.jp publishes no counts. */
const LEVEL_SPLIT: [string, number][] = [
  ['N5', 100], ['N4', 300], ['N3', 650], ['N2', 1000], ['N1', 2136],
]

export function levelForIndex(i: number): string {
  for (const [level, upto] of LEVEL_SPLIT) if (i < upto) return level
  return 'N1'
}

function kanjiBlocks(k: KanjiEntry): Block[] {
  const on = k.on.length ? k.on.join('・') : '—'
  const kun = k.kun.length ? k.kun.join('・') : '—'
  return [{
    kind: 'prose',
    html: `<div style="display:flex;align-items:flex-start;gap:1.5rem;margin:.75rem 0">
      <div class="ja" style="font-size:3.5rem;line-height:1">${k.c}</div>
      <div style="flex:1">
        <div style="font-size:1.15rem;font-weight:600">${k.meanings.join(', ')}</div>
        <table style="margin:.5rem 0 0;font-size:.9rem">
          <tr><td style="opacity:.6;padding-right:.75rem">音</td><td class="ja">${on}</td></tr>
          <tr><td style="opacity:.6;padding-right:.75rem">訓</td><td class="ja">${kun}</td></tr>
          <tr><td style="opacity:.6;padding-right:.75rem">画</td><td>${k.strokes} strokes</td></tr>
        </table>
      </div>
    </div>`,
  }]
}

function recall(k: KanjiEntry, pool: KanjiEntry[], seed: number): Block | null {
  const wrong = pool.filter((o) => o.c !== k.c).slice(seed % Math.max(1, pool.length - 3), (seed % Math.max(1, pool.length - 3)) + 3)
  if (wrong.length < 3) return null

  const options = [
    { html: `<strong>${k.meanings[0]}</strong>`, ok: true },
    ...wrong.map((o) => ({ html: `<strong>${o.meanings[0]}</strong>` })),
  ]
  const at = seed % options.length
  ;[options[0], options[at]] = [options[at], options[0]]

  return {
    kind: 'practice',
    question: `<div class="ja" style="font-size:3rem;line-height:1.2;text-align:center">${k.c}</div>`,
    options,
    explain: `<p><span class="ja" style="font-size:1.5rem">${k.c}</span> — <strong>${k.meanings.join(', ')}</strong><br>
      <span style="opacity:.7">音 ${k.on.join('・') || '—'} · 訓 ${k.kun.join('・') || '—'}</span></p>`,
  }
}

export function buildKanjiTrack(startOrdinal: number): LessonDef[] {
  const all = loadKanji()
  if (!all.length) return []

  const lessons: LessonDef[] = []
  let ordinal = startOrdinal

  for (let i = 0; i < all.length; i += PER_LESSON) {
    const group = all.slice(i, i + PER_LESSON)
    const n = Math.floor(i / PER_LESSON) + 1
    const level = levelForIndex(i)

    const blocks: Block[] = [{
      kind: 'prose',
      html: `<p>Ten characters, ordered by how often they appear in real Japanese text.
        Read each one and its readings, then recall them. You are not expected to write
        these by hand — recognition and typing are what modern life actually requires.</p>`,
    }]

    for (const k of group) blocks.push(...kanjiBlocks(k))

    blocks.push({
      kind: 'callout', tone: 'warn',
      html: `<p><strong>Recall, without scrolling up.</strong> A wrong answer you then
        understand builds more than a right one you looked up.</p>`,
    })

    for (const [j, k] of group.entries()) {
      const q = recall(k, group, n * 13 + j)
      if (q) blocks.push(q)
    }

    lessons.push({
      slug: `kanji-${n}`,
      title: `Kanji ${n} · ${group.map((k) => k.c).join('')}`,
      summary: `${group.map((k) => `${k.c} ${k.meanings[0]}`).join(' · ')}`,
      ordinal: ordinal++,
      minutes: 12,
      concepts: [`kanji-set-${n}`],
      blocks,
    })
  }

  return lessons
}

export function kanjiConcepts() {
  const all = loadKanji()
  const out: { slug: string; title: string; kind: string }[] = []
  for (let i = 0; i < all.length; i += PER_LESSON) {
    const n = Math.floor(i / PER_LESSON) + 1
    out.push({
      slug: `kanji-set-${n}`,
      title: `Kanji ${n} · ${all.slice(i, i + PER_LESSON).map((k) => k.c).join('')}`,
      kind: 'kanji',
    })
  }
  return out
}

/** Meaning and reading cards for every character. */
export function kanjiCards() {
  const all = loadKanji()
  const cards: {
    concept: string; key: string; type: string; prompt: string; answer: string
    direction: 'recognition' | 'production'; extra: Record<string, unknown>
  }[] = []

  all.forEach((k, i) => {
    const concept = `kanji-set-${Math.floor(i / PER_LESSON) + 1}`
    const extra = {
      on: k.on, kun: k.kun, strokes: k.strokes, grade: k.grade,
      freq: k.freq, level: levelForIndex(i),
    }

    cards.push({
      concept, key: `${k.c}:meaning`, type: 'kanji-meaning',
      prompt: k.c, answer: k.meanings.join(', '),
      direction: 'recognition', extra,
    })

    if (k.on.length || k.kun.length) {
      cards.push({
        concept, key: `${k.c}:reading`, type: 'kanji-reading',
        prompt: k.c,
        answer: [k.on.join('・'), k.kun.join('・')].filter(Boolean).join('  /  '),
        direction: 'recognition', extra,
      })
    }
  })

  return cards
}

/** Rough total study time for the kanji track, used by the pacing plan. */
export const kanjiLessonCount = () => Math.ceil(loadKanji().length / PER_LESSON)
