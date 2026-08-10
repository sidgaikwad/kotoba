/**
 * The kanji track.
 *
 * Ordered by newspaper frequency rather than school grade. Grade order is
 * designed for Japanese six-year-olds learning words they already speak;
 * frequency order gets an adult reading real text soonest.
 *
 * Each character is taught as a *composition*, not a picture to stare at.
 * That is the one thing that makes 2,136 characters tractable: 聞 is not a
 * dense scribble, it is an ear inside a gate. The decomposition is real data
 * (KRADFILE), the component names are hand-authored, and the memory hook is
 * built from them.
 *
 * Data: KANJIDIC2 + KRADFILE (EDRDG, CC BY-SA 4.0), JMdict for example words.
 */
import { componentName, componentNote, display } from './components'
import type { Block, LessonDef } from './content'
import { loadVocab } from './vocab-course'

export type KanjiEntry = {
  c: string; on: string[]; kun: string[]; meanings: string[]
  strokes: number; grade: number; freq: number | null
}

let kanjiCache: KanjiEntry[] | null = null
let radCache: Record<string, string[]> | null = null

export function loadKanji(): KanjiEntry[] {
  if (kanjiCache) return kanjiCache
  try {
    kanjiCache = (require('./data/kanji.json') as { kanji: KanjiEntry[] }).kanji ?? []
  } catch { kanjiCache = [] }
  return kanjiCache
}

function radicals(): Record<string, string[]> {
  if (radCache) return radCache
  try {
    radCache = (require('./data/radicals.json') as { radicals: Record<string, string[]> }).radicals ?? {}
  } catch { radCache = {} }
  return radCache
}

const PER_LESSON = 8

const LEVEL_SPLIT: [string, number][] = [
  ['N5', 100], ['N4', 300], ['N3', 650], ['N2', 1000], ['N1', 2136],
]
export function levelForIndex(i: number): string {
  for (const [level, upto] of LEVEL_SPLIT) if (i < upto) return level
  return 'N1'
}

/* ---------------- composition and mnemonics ---------------- */

/**
 * Bare strokes. KRADFILE lists these as components, which is technically
 * true and pedagogically useless — 働 decomposes to ｜一化力日ノ, and telling
 * a learner it contains "a vertical stroke" teaches nothing. They are dropped
 * whenever at least two meaningful parts survive.
 */
const NOISE = new Set(['一', '｜', 'ノ', '丶', '亅', '二', '十'])

export function componentsOf(c: string): string[] {
  const raw = (radicals()[c] ?? []).filter((p) => p !== c)
  const meaty = raw.filter((p) => !NOISE.has(p))
  return meaty.length >= 2 ? meaty : raw
}

/**
 * Hand-written hooks for characters where the composition alone does not
 * explain the meaning. Everything else gets a generated composition line,
 * which for most characters is genuinely more useful than a forced story.
 */
const HOOKS: Record<string, string> = {
  聞: 'An ear pressed to a gate. You are listening — or asking.',
  休: 'A person resting against a tree. Rest, a break, a day off.',
  明: 'Sun and moon together — the brightest things there are.',
  好: 'A woman and a child. Fondness, liking.',
  男: 'Power applied to a rice field. The old word for a man.',
  安: 'A woman under a roof — safe, settled, and by extension cheap.',
  信: 'A person standing by their words. Trust, belief, a message.',
  時: 'The sun measured out by a hand — telling the time.',
  持: 'A hand doing the measuring — holding, carrying.',
  待: 'Stepping, then measuring. You stop and wait.',
  語: 'Words, mouth and five — speech, language.',
  話: 'Words and a tongue. Talking, a story.',
  読: 'Words being sold to you — reading.',
  買: 'A net over shells. Money caught in a net — buying.',
  売: 'A scholar with legs and a lid — goods going out. Selling.',
  海: 'Water and mother — the sea, mother of all water.',
  空: 'A hole beneath a roof — empty, and the sky.',
  国: 'A jewel inside an enclosure. A country protects what it values.',
  電: 'Rain with lightning underneath — electricity.',
  駅: 'A horse and a measure — the old post station. Now a train station.',
  働: 'A person plus movement plus power. Work, in the Japanese sense.',
  仕: 'A person serving a scholar. Service, doing.',
  会: 'People gathered under a roof — a meeting.',
  社: 'Earth and an altar — a shrine, and by extension a company.',
  考: 'An old person bending over — thinking it through.',
  題: 'Right and page — the topic at the head of a page.',
  問: 'A mouth at the gate — asking a question.',
  開: 'Two hands opening a gate.',
  閉: 'A gate with a bolt across it.',
  間: 'The sun seen through a gate — a gap, an interval, space between.',
  京: 'A tall building on a lid — the capital.',
  東: 'The sun caught behind a tree — where it rises. East.',
  西: 'A bird settling into its nest at sunset. West.',
  南: 'Warmth and shelter — the sunny side. South.',
  北: 'Two people back to back, turning away from the cold. North.',
  先: 'Legs going ahead of you — earlier, ahead, previous.',
  生: 'A sprout pushing out of the earth. Life, birth, raw.',
  死: 'Bare bones and a bent figure. Death.',
  病: 'A person on a bed under a roof — illness.',
  薬: 'Grass that brings comfort — medicine.',
  食: 'A roof over good things — eating.',
  飲: 'Food and a person with an open mouth — drinking.',
  歩: 'Two feet, one after the other. Walking.',
  止: 'A single footprint, planted. Stop.',
  正: 'One line and a stopped foot — doing it correctly.',
  自: 'A nose. Japanese speakers point at their nose to mean "me".',
  最: 'Taking with the ear — the most, the extreme.',
  新: 'A standing tree cut with an axe — freshly made.',
  親: 'Standing by a tree, watching. A parent, and intimacy.',
  友: 'Two hands reaching the same way — a friend.',
  数: 'Rice, woman and a striking hand — counting.',
  料: 'Rice measured with a ladle — a fee, materials.',
  理: 'A jewel in a village — logic, reason, principle.',
  使: 'A person and an official — to use, to send as an envoy.',
  作: 'A person making something. To make.',
  同: 'One mouth under a cover — everyone saying the same thing.',
  制: 'A blade cutting to shape — control, a system.',
  性: 'Heart and life — nature, quality, gender.',
  義: 'A sheep above me — righteousness, meaning.',
  議: 'Words about righteousness — deliberation, a meeting.',
  発: 'Departing footsteps — to set out, to emit.',
  現: 'A jewel that can be seen — appearing, the present.',
  実: 'A roof over substance — fruit, truth, reality.',
  受: 'A claw and a hand with something between — receiving.',
  取: 'An ear in a hand — taking. Ears were once war trophies.',
  対: 'Text and a measure facing each other — opposite, versus.',
  必: 'A heart pierced through — necessity.',
  要: 'A woman under a cover — the essential point.',
  想: 'A tree, an eye and a heart — thinking of something.',
  情: 'Heart and blue-green freshness — feeling, circumstance.',
  報: 'Fortune and a hand — reporting, requital.',
  告: 'A mouth over a cow — announcing.',
  認: 'Words and endurance — acknowledging, recognising.',
  確: 'Stone and a bird under a roof — certainty, confirming.',
  検: 'A tree examined — inspection.',
  査: 'A tree and one — investigating.',
  障: 'A hill and a badge — an obstacle. In IT, an outage.',
  害: 'A roof, a life, a mouth — harm.',
  修: 'A person and hair strokes — mending, mastering.',
  復: 'Stepping back the way you came — restoring, again.',
  防: 'A hill and a direction — defending.',
  策: 'Bamboo and thorns — a plan, a measure.',
}

function compositionLine(k: KanjiEntry): string | null {
  const parts = componentsOf(k.c)
  if (parts.length < 2) return null
  const names = parts.map((p) => componentName(p))
  const uniq = [...new Set(names)]
  if (uniq.length < 2) return null
  return `${uniq.slice(0, 4).join(' + ')}`
}

export function hookFor(k: KanjiEntry): string | null {
  if (HOOKS[k.c]) return HOOKS[k.c]
  const comp = compositionLine(k)
  if (!comp) return null
  return `${comp} — ${k.meanings[0]}.`
}

/** Words from the JMdict core that contain this character. */
function exampleWords(c: string, limit = 3) {
  return loadVocab().filter((v) => v.w.includes(c)).slice(0, limit)
}

/* ---------------- lesson blocks ---------------- */

function kanjiBlocks(k: KanjiEntry): Block[] {
  const blocks: Block[] = []
  const parts = componentsOf(k.c)
  const on = k.on.length ? k.on.join('・') : '—'
  const kun = k.kun.length ? k.kun.join('・') : '—'

  blocks.push({
    kind: 'prose',
    html: `<div style="display:flex;align-items:flex-start;gap:1.5rem;margin:1.25rem 0 .5rem">
      <div class="ja" style="font-size:4rem;line-height:1">${k.c}</div>
      <div style="flex:1">
        <div style="font-size:1.3rem;font-weight:700">${k.meanings.join(', ')}</div>
        <div style="margin-top:.4rem;font-size:.9rem">
          <span style="opacity:.55">音</span> <span class="ja">${on}</span>
          &nbsp;&nbsp;<span style="opacity:.55">訓</span> <span class="ja">${kun}</span>
        </div>
        <div style="margin-top:.2rem;font-size:.78rem;opacity:.5">
          ${k.strokes} strokes${k.freq ? ` · #${k.freq} most common` : ''}
        </div>
      </div>
    </div>`,
  })

  // The composition — the part that makes a character learnable.
  if (parts.length >= 2) {
    const chips = parts.map((p) => {
      const note = componentNote(p)
      return `<span style="display:inline-block;margin:.2rem .3rem .2rem 0;padding:.25rem .55rem;
        border-radius:.5rem;background:var(--color-sunk);font-size:.85rem">
        <span class="ja" style="font-size:1.1rem">${display(p)}</span>
        <span style="opacity:.7"> ${componentName(p)}</span>${
          note ? `<span style="opacity:.45"> · ${note}</span>` : ''}
      </span>`
    }).join('')

    blocks.push({
      kind: 'prose',
      html: `<div style="margin:.25rem 0 .5rem">
        <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;opacity:.5;
                    margin-bottom:.4rem">Built from</div>${chips}</div>`,
    })
  }

  const hook = hookFor(k)
  if (hook) {
    blocks.push({ kind: 'callout', html: `<p><strong>Hook.</strong> ${hook}</p>` })
  }

  const words = exampleWords(k.c)
  if (words.length) {
    blocks.push({
      kind: 'prose',
      html: `<div style="margin:.4rem 0 1rem">
        <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;opacity:.5;
                    margin-bottom:.35rem">Seen in</div>
        ${words.map((v) => `<div style="font-size:.9rem;margin:.15rem 0">
          <span class="ja" style="font-size:1.05rem">${v.w}</span>
          <span class="ja" style="opacity:.55">${v.w !== v.r ? ` ${v.r}` : ''}</span>
          <span style="opacity:.75"> — ${v.g[0]}</span></div>`).join('')}
      </div>`,
    })
  }

  return blocks
}

function meaningRecall(k: KanjiEntry, pool: KanjiEntry[], seed: number): Block | null {
  const wrong = pool.filter((o) => o.c !== k.c).slice(seed % Math.max(1, pool.length - 3), (seed % Math.max(1, pool.length - 3)) + 3)
  if (wrong.length < 3) return null
  const options = [
    { html: `<strong>${k.meanings[0]}</strong>`, ok: true },
    ...wrong.map((o) => ({ html: `<strong>${o.meanings[0]}</strong>` })),
  ]
  const at = seed % options.length
  ;[options[0], options[at]] = [options[at], options[0]]

  const hook = hookFor(k)
  return {
    kind: 'practice',
    question: `<div class="ja" style="font-size:3rem;line-height:1.2;text-align:center">${k.c}</div>`,
    options,
    explain: `<p><span class="ja" style="font-size:1.5rem">${k.c}</span> — <strong>${k.meanings.join(', ')}</strong></p>
      ${hook ? `<p style="opacity:.8">${hook}</p>` : ''}`,
  }
}

/** Which character is built from these parts? Tests the composition itself. */
function componentRecall(k: KanjiEntry, pool: KanjiEntry[], seed: number): Block | null {
  const parts = componentsOf(k.c)
  if (parts.length < 2) return null
  const wrong = pool.filter((o) => o.c !== k.c).slice(seed % Math.max(1, pool.length - 3), (seed % Math.max(1, pool.length - 3)) + 3)
  if (wrong.length < 3) return null

  const options = [
    { html: `<span class="ja" style="font-size:1.9rem">${k.c}</span>`, ok: true },
    ...wrong.map((o) => ({ html: `<span class="ja" style="font-size:1.9rem">${o.c}</span>` })),
  ]
  const at = seed % options.length
  ;[options[0], options[at]] = [options[at], options[0]]

  const names = [...new Set(parts.map((p) => componentName(p)))].slice(0, 4)
  return {
    kind: 'practice',
    question: `<p style="text-align:center">Which character is built from
      <strong>${names.join(' + ')}</strong>?</p>
      <p class="ja" style="text-align:center;font-size:1.6rem;opacity:.65">
        ${parts.map((p) => display(p)).join('  ')}</p>`,
    options,
    explain: `<p><span class="ja" style="font-size:1.5rem">${k.c}</span> —
      <strong>${k.meanings[0]}</strong>. ${hookFor(k) ?? ''}</p>`,
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

    const blocks: Block[] = [{
      kind: 'prose',
      html: `<p>Eight characters. Each one is shown with the parts it is built from —
        that is the thing that makes kanji learnable at all. A character you can decompose
        is a short phrase; a character you cannot is a scribble you have to brute-force.</p>
        <p style="opacity:.75">You are not expected to write these by hand. Recognition and
        typing are what modern life actually requires.</p>`,
    }]

    for (const k of group) blocks.push(...kanjiBlocks(k))

    blocks.push({
      kind: 'callout', tone: 'warn',
      html: `<p><strong>Recall, without scrolling up.</strong> A wrong answer you then
        understand builds more than a right one you looked up.</p>`,
    })

    for (const [j, k] of group.entries()) {
      const q = meaningRecall(k, group, n * 13 + j)
      if (q) blocks.push(q)
    }
    // Then the harder direction: parts → character.
    for (const [j, k] of group.entries()) {
      const q = componentRecall(k, group, n * 29 + j)
      if (q) blocks.push(q)
    }

    lessons.push({
      slug: `kanji-${n}`,
      title: `Kanji ${n} · ${group.map((k) => k.c).join('')}`,
      summary: group.map((k) => `${k.c} ${k.meanings[0]}`).join(' · '),
      ordinal: ordinal++,
      minutes: 14,
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

export function kanjiCards() {
  const all = loadKanji()
  const cards: {
    concept: string; key: string; type: string; prompt: string; answer: string
    direction: 'recognition' | 'production'; extra: Record<string, unknown>
  }[] = []

  all.forEach((k, i) => {
    const concept = `kanji-set-${Math.floor(i / PER_LESSON) + 1}`
    const parts = componentsOf(k.c)
    const extra = {
      on: k.on, kun: k.kun, strokes: k.strokes, grade: k.grade, freq: k.freq,
      level: levelForIndex(i),
      hook: hookFor(k) ?? undefined,
      parts: parts.map((p) => ({ c: display(p), name: componentName(p) })),
      words: exampleWords(k.c, 2).map((v) => ({ w: v.w, r: v.r, g: v.g[0] })),
    }

    cards.push({
      concept, key: `${k.c}:meaning`, type: 'kanji-meaning',
      prompt: k.c, answer: k.meanings.join(', '), direction: 'recognition', extra,
    })

    if (k.on.length || k.kun.length) {
      cards.push({
        concept, key: `${k.c}:reading`, type: 'kanji-reading',
        prompt: k.c,
        answer: [k.on.join('・'), k.kun.join('・')].filter(Boolean).join('  /  '),
        direction: 'recognition', extra,
      })
    }

    // Parts → character. Production, and only where decomposition exists.
    if (parts.length >= 2) {
      const names = [...new Set(parts.map((p) => componentName(p)))].slice(0, 4)
      cards.push({
        concept, key: `${k.c}:build`, type: 'kanji-build',
        prompt: names.join(' + '), answer: k.c, direction: 'production', extra,
      })
    }
  })

  return cards
}

export const kanjiLessonCount = () => Math.ceil(loadKanji().length / PER_LESSON)
