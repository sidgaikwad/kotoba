import type { Block, LessonDef } from '../content'
import { N1 } from './n1'
import { N2 } from './n2'
import { N3 } from './n3'
import { N4 } from './n4'
import { N5 } from './n5'
import type { GrammarPoint } from './types'

export const ALL_GRAMMAR: GrammarPoint[] = [...N5, ...N4, ...N3, ...N2, ...N1]
export type { GrammarPoint }

const REGISTER_LABEL: Record<string, string> = {
  casual: 'casual', polite: 'polite', business: 'business', written: 'written',
}

/**
 * Turns catalogue entries into teaching lessons.
 *
 * Every lesson follows the same shape, because consistency is what lets a
 * learner stop spending attention on the format and spend it on the content:
 *
 *   what this does  →  how it attaches  →  worked examples  →  practice
 *   →  contrast with the point it gets confused with  →  register note
 *
 * Points are grouped four to a lesson. More than that and the practice at the
 * end stops being retrieval and starts being a reading comprehension test.
 */

function pointBlocks(p: GrammarPoint, all: Map<string, GrammarPoint>): Block[] {
  const blocks: Block[] = []

  blocks.push({
    kind: 'prose',
    html: `<h3><span class="ja">${p.title}</span></h3>
      <p><strong>${p.meaning}</strong></p>
      <p style="opacity:.8"><em>Attaches as:</em> <span class="ja">${p.formation}</span></p>
      <p>${p.explain}</p>`,
  })

  for (const ex of p.examples) {
    blocks.push({
      kind: 'example',
      ja: ex.ja,
      reading: ex.romaji,
      gloss: ex.en,
      note: ex.register ? `Register: ${REGISTER_LABEL[ex.register] ?? ex.register}` : undefined,
    })
  }

  if (p.register) {
    blocks.push({ kind: 'callout', tone: 'warn', html: `<p><strong>Register.</strong> ${p.register}</p>` })
  }

  // Contrast blocks are where the real learning is: near-synonyms are the
  // thing learners actually get wrong, not the points themselves.
  for (const id of p.contrast ?? []) {
    const other = all.get(id)
    if (!other) continue
    blocks.push({
      kind: 'callout',
      html: `<p><strong>Not to be confused with <span class="ja">${other.title}</span></strong>
        — ${other.meaning}. ${firstSentence(other.explain)}</p>`,
    })
  }

  return blocks
}

function firstSentence(s: string) {
  const m = s.match(/^[^.]+\./)
  return m ? m[0] : s
}

/** A recall question built from the point's own example. */
function practiceFor(p: GrammarPoint, pool: GrammarPoint[], seed: number): Block | null {
  const ex = p.examples[0]
  if (!ex) return null

  const wrong = pool
    .filter((q) => q.id !== p.id && q.level === p.level)
    .slice(seed % Math.max(1, pool.length - 1), (seed % Math.max(1, pool.length - 1)) + 3)
    .map((q) => ({ html: `<span class="ja">${q.title}</span>` }))

  if (wrong.length < 2) return null

  const options = [{ html: `<span class="ja">${p.title}</span>`, ok: true }, ...wrong]
  // Rotate the correct answer's position so it is never predictable.
  const at = seed % options.length
  ;[options[0], options[at]] = [options[at], options[0]]

  return {
    kind: 'practice',
    question: `<p>Which pattern gives you <strong>${p.meaning}</strong>?</p>
      <p class="ja" style="font-size:1.15rem">${ex.ja}</p>
      <p style="opacity:.7;font-size:.9rem">${ex.en}</p>`,
    options,
    explain: `<p><span class="ja">${p.title}</span> — ${p.meaning}.</p>
      <p style="opacity:.8"><span class="ja">${p.formation}</span></p>`,
  }
}

export function buildGrammarTrack(startOrdinal: number): LessonDef[] {
  const index = new Map(ALL_GRAMMAR.map((p) => [p.id, p]))
  const lessons: LessonDef[] = []
  let ordinal = startOrdinal

  for (const level of ['N5', 'N4', 'N3', 'N2', 'N1'] as const) {
    const points = ALL_GRAMMAR.filter((p) => p.level === level)

    // Group by the unit the author assigned, then split into lessons of four.
    const units = [...new Set(points.map((p) => p.unit))]

    for (const unit of units) {
      const inUnit = points.filter((p) => p.unit === unit)
      for (let i = 0; i < inUnit.length; i += 4) {
        const group = inUnit.slice(i, i + 4)
        const part = inUnit.length > 4 ? ` (${Math.floor(i / 4) + 1})` : ''

        const blocks: Block[] = [{
          kind: 'prose',
          html: `<p>${group.length} pattern${group.length === 1 ? '' : 's'} in this lesson.
            Read each one, look at how it attaches, then you will be asked to pick it out.</p>`,
        }]

        for (const p of group) blocks.push(...pointBlocks(p, index))

        blocks.push({
          kind: 'callout',
          tone: 'warn',
          html: `<p><strong>Now recall them.</strong> Looking back up the page defeats the point —
            a wrong answer you then understand is worth more than a right one you looked up.</p>`,
        })

        let seeded = 0
        for (const [j, p] of group.entries()) {
          const q = practiceFor(p, points, ordinal * 7 + j)
          if (q) { blocks.push(q); seeded++ }
        }
        if (seeded === 0) {
          blocks.push({ kind: 'prose', html: '<p>Take these into your review deck.</p>' })
        }

        lessons.push({
          slug: `${level.toLowerCase()}-${slug(unit)}${part ? `-${Math.floor(i / 4) + 1}` : ''}`,
          title: `${unit}${part}`,
          summary: group.map((p) => p.title).join(' · '),
          ordinal: ordinal++,
          minutes: 4 + group.length * 3,
          concepts: group.map((p) => `g-${p.id}`),
          blocks,
        })
      }
    }
  }

  return lessons
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

/** One concept per grammar point, so unlocking stays honest. */
export const GRAMMAR_CONCEPTS = ALL_GRAMMAR.map((p) => ({
  slug: `g-${p.id}`,
  title: p.title,
  kind: 'grammar',
}))

/** Recognition and production cards for every point. */
export function grammarCards() {
  return ALL_GRAMMAR.flatMap((p) => {
    const ex = p.examples[0]
    const cards = [{
      concept: `g-${p.id}`,
      key: `${p.id}:meaning`,
      type: 'grammar-meaning',
      prompt: p.title,
      answer: p.meaning,
      direction: 'recognition' as const,
      extra: { formation: p.formation, level: p.level, example: ex?.ja, gloss: ex?.en },
    }]

    if (ex) {
      cards.push({
        concept: `g-${p.id}`,
        key: `${p.id}:produce`,
        type: 'grammar-production',
        prompt: ex.en,
        answer: ex.ja,
        direction: 'production' as const,
        extra: { romaji: ex.romaji, pattern: p.title, level: p.level, register: ex.register },
      })
    }
    return cards
  })
}

/** Confusable pairs, so the scheduler spaces them apart. */
export function grammarInterference(): [string, string, string][] {
  const out: [string, string, string][] = []
  for (const p of ALL_GRAMMAR) {
    for (const id of p.contrast ?? []) {
      out.push([`g-${p.id}`, `g-${id}`, `${p.title} vs ${id}`])
    }
  }
  return out
}
