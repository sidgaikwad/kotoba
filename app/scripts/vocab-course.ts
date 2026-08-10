/**
 * The vocabulary track, generated from JMdict's common-word core.
 *
 * Ordered by JMdict's own priority tags (news1 / ichi1 / spec1), which come
 * from newspaper and corpus frequency work. This beats any "N3 word list" —
 * none of those are official, since jlpt.jp withdrew its lists in 2010.
 *
 * Twelve words per lesson. Vocabulary is the largest single time cost in
 * reaching N1 and the main reason the plan runs about a year: 6,000 words at
 * two cards each is 12,000 review obligations.
 *
 * Data: JMdict, EDRDG, CC BY-SA 4.0.
 */
import type { Block, LessonDef } from './content'

export type VocabEntry = { w: string; r: string; g: string[]; pos: string; common: number }

let cache: VocabEntry[] | null = null

export function loadVocab(): VocabEntry[] {
  if (cache) return cache
  try {
    const data = require('./data/vocab.json') as { vocab: VocabEntry[] }
    cache = data.vocab ?? []
  } catch {
    cache = []
  }
  return cache
}

const PER_LESSON = 12

/** Frequency bands, mapped onto levels for shelving purposes only. */
export function levelForVocabIndex(i: number): string {
  if (i < 800) return 'N5'
  if (i < 1800) return 'N4'
  if (i < 3200) return 'N3'
  if (i < 4800) return 'N2'
  return 'N1'
}

const POS_LABEL: Record<string, string> = {
  godan: 'godan verb', ichidan: 'ichidan verb', suru: 'suru verb',
  noun: 'noun', 'i-adj': 'い-adjective', 'na-adj': 'な-adjective',
  adv: 'adverb', expr: 'expression', particle: 'particle', other: '',
}

function wordBlock(v: VocabEntry): Block {
  const showsReading = v.w !== v.r
  const pos = POS_LABEL[v.pos] ?? ''
  return {
    kind: 'prose',
    html: `<div style="display:flex;align-items:baseline;gap:1rem;margin:.6rem 0;
                       padding-bottom:.6rem;border-bottom:1px solid var(--color-rule)">
      <div style="min-width:7rem">
        <span class="ja" style="font-size:1.6rem">${v.w}</span>
        ${showsReading ? `<div class="ja" style="font-size:.85rem;opacity:.6">${v.r}</div>` : ''}
      </div>
      <div style="flex:1">
        <div>${v.g.join('; ')}</div>
        ${pos ? `<div style="font-size:.75rem;opacity:.55;margin-top:.15rem">${pos}</div>` : ''}
      </div>
    </div>`,
  }
}

function recall(v: VocabEntry, pool: VocabEntry[], seed: number): Block | null {
  const wrong = pool.filter((o) => o.w !== v.w)
    .slice(seed % Math.max(1, pool.length - 3), (seed % Math.max(1, pool.length - 3)) + 3)
  if (wrong.length < 3) return null

  const options = [
    { html: `<strong>${v.g[0]}</strong>`, ok: true },
    ...wrong.map((o) => ({ html: `<strong>${o.g[0]}</strong>` })),
  ]
  const at = seed % options.length
  ;[options[0], options[at]] = [options[at], options[0]]

  return {
    kind: 'practice',
    question: `<div style="text-align:center">
      <div class="ja" style="font-size:2.2rem;line-height:1.3">${v.w}</div>
      ${v.w !== v.r ? `<div class="ja" style="font-size:1rem;opacity:.55">${v.r}</div>` : ''}
    </div>`,
    options,
    explain: `<p><span class="ja" style="font-size:1.3rem">${v.w}</span>
      <span class="ja" style="opacity:.6">${v.w !== v.r ? ` (${v.r})` : ''}</span>
      — <strong>${v.g.join('; ')}</strong></p>`,
  }
}

export function buildVocabTrack(startOrdinal: number): LessonDef[] {
  const all = loadVocab()
  if (!all.length) return []

  const lessons: LessonDef[] = []
  let ordinal = startOrdinal

  for (let i = 0; i < all.length; i += PER_LESSON) {
    const group = all.slice(i, i + PER_LESSON)
    const n = Math.floor(i / PER_LESSON) + 1

    const blocks: Block[] = [{
      kind: 'prose',
      html: `<p>Twelve words, ordered by how often they appear in real Japanese.
        Read them once, then recall. Do not try to memorise here — that is what the
        review deck is for. The job right now is a first clean encounter.</p>`,
    }]

    for (const v of group) blocks.push(wordBlock(v))

    blocks.push({
      kind: 'callout',
      html: `<p><strong>Quick recall.</strong> Getting some wrong now is the point —
        a failed retrieval followed by the answer beats reading the list twice.</p>`,
    })

    for (const [j, v] of group.entries()) {
      const q = recall(v, group, n * 17 + j)
      if (q) blocks.push(q)
    }

    lessons.push({
      slug: `vocab-${n}`,
      title: `Words ${n} · ${group.slice(0, 4).map((v) => v.w).join(' ')}…`,
      summary: group.slice(0, 6).map((v) => `${v.w} ${v.g[0]}`).join(' · '),
      ordinal: ordinal++,
      minutes: 10,
      concepts: [`vocab-set-${n}`],
      blocks,
    })
  }

  return lessons
}

export function vocabConcepts() {
  const all = loadVocab()
  const out: { slug: string; title: string; kind: string }[] = []
  for (let i = 0; i < all.length; i += PER_LESSON) {
    const n = Math.floor(i / PER_LESSON) + 1
    out.push({
      slug: `vocab-set-${n}`,
      title: `Words ${n} · ${all.slice(i, i + PER_LESSON).slice(0, 3).map((v) => v.w).join(' ')}…`,
      kind: 'vocabulary',
    })
  }
  return out
}

/** Recognition and production cards for every word. */
export function vocabCards() {
  const all = loadVocab()
  const cards: {
    concept: string; key: string; type: string; prompt: string; answer: string
    direction: 'recognition' | 'production'; extra: Record<string, unknown>
  }[] = []

  all.forEach((v, i) => {
    const concept = `vocab-set-${Math.floor(i / PER_LESSON) + 1}`
    const extra = { reading: v.r, pos: v.pos, level: levelForVocabIndex(i) }

    cards.push({
      concept, key: `${v.w}|${v.r}:recog`, type: 'vocab-recognition',
      prompt: v.w, answer: v.g.join('; '), direction: 'recognition', extra,
    })
    cards.push({
      concept, key: `${v.w}|${v.r}:prod`, type: 'vocab-production',
      prompt: v.g[0], answer: v.w, direction: 'production', extra,
    })
  })

  return cards
}
