/**
 * Generates the kana track from the dataset.
 *
 * Shape borrowed from Duolingo — bite-size units, teach a little, practise it
 * immediately, move on — but none of their content. Five characters per
 * lesson, because that is roughly what fits in working memory before recall
 * starts degrading.
 *
 * Each lesson: introduce → practise each character → mixed recall over
 * everything so far. The mixed section at the end is the part that actually
 * builds retention: blocked practice feels better and works worse.
 */
import type { Block, LessonDef } from './content'
import { DAKUTEN, GOJUON, type Kana, YOON, CONFUSABLE } from './kana'

type Script = 'hiragana' | 'katakana'

const chunk = <T,>(xs: T[], n: number): T[][] =>
  xs.reduce<T[][]>((acc, x, i) => (i % n ? acc[acc.length - 1].push(x) : acc.push([x]), acc), [])

const shuffleBy = <T,>(xs: T[], seed: number): T[] => {
  // Deterministic shuffle so regenerating the course does not churn the DB.
  const a = [...xs]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Wrong answers that are plausible — same row, or a known confusable. */
function distractors(target: Kana, pool: Kana[], script: Script, seed: number): string[] {
  const ch = (x: Kana) => (script === 'hiragana' ? x.h : x.k)
  const confused = CONFUSABLE
    .filter(([a, b]) => a === ch(target) || b === ch(target))
    .map(([a, b]) => (a === ch(target) ? b : a))
  const rest = shuffleBy(pool.filter((x) => x.r !== target.r), seed).map(ch)
  return [...new Set([...confused, ...rest])].slice(0, 3)
}

function introBlock(script: Script, k: Kana): Block {
  const char = script === 'hiragana' ? k.h : k.k
  const hook = script === 'hiragana' ? k.mh : k.mk
  return {
    kind: 'prose',
    html: `<div style="display:flex;align-items:center;gap:1.25rem;margin:0.5rem 0">
      <div class="ja" style="font-size:4rem;line-height:1">${char}</div>
      <div>
        <div style="font-size:1.5rem;font-weight:600">${k.r}</div>
        <div style="opacity:.75;margin-top:.25rem">${hook}</div>
      </div>
    </div>`,
  }
}

function recallBlock(script: Script, k: Kana, pool: Kana[], seed: number): Block {
  const char = script === 'hiragana' ? k.h : k.k
  const wrong = distractors(k, pool, script, seed)
  const opts = shuffleBy(
    [{ html: `<strong>${k.r}</strong>`, ok: true },
     ...wrong.map((w) => ({ html: `<strong>${romajiOf(w)}</strong>` }))],
    seed + 7,
  )
  return {
    kind: 'practice',
    question: `<div class="ja" style="font-size:3.5rem;line-height:1.2;text-align:center">${char}</div>`,
    options: opts,
    explain: `<p><span class="ja" style="font-size:1.5rem">${char}</span> is <strong>${k.r}</strong>.
      ${script === 'hiragana' ? k.mh : k.mk}</p>`,
  }
}

function produceBlock(script: Script, k: Kana, pool: Kana[], seed: number): Block {
  const char = script === 'hiragana' ? k.h : k.k
  const wrong = distractors(k, pool, script, seed + 3)
  const opts = shuffleBy(
    [{ html: `<span class="ja" style="font-size:1.75rem">${char}</span>`, ok: true },
     ...wrong.map((w) => ({ html: `<span class="ja" style="font-size:1.75rem">${w}</span>` }))],
    seed + 11,
  )
  return {
    kind: 'practice',
    question: `<p style="text-align:center;font-size:1.75rem;font-weight:600">${k.r}</p>
      <p style="text-align:center;opacity:.7;font-size:.9rem">Which character is this?</p>`,
    options: opts,
    explain: `<p><strong>${k.r}</strong> is
      <span class="ja" style="font-size:1.5rem">${char}</span>.</p>`,
  }
}

const ALL = [...GOJUON]
const romajiOf = (char: string) =>
  ALL.find((k) => k.h === char || k.k === char)?.r
  ?? DAKUTEN.find((d) => d.h === char || d.k === char)?.r
  ?? '?'

/* ============================================================
   Unit builders
   ============================================================ */

function kanaLesson(
  script: Script, group: Kana[], seen: Kana[], index: number, ordinal: number,
): LessonDef {
  const label = script === 'hiragana' ? 'Hiragana' : 'Katakana'
  const chars = group.map((k) => (script === 'hiragana' ? k.h : k.k)).join(' ')

  const blocks: Block[] = [
    {
      kind: 'prose',
      html: `<p>Five new characters. Read each one, say the sound out loud, then you will be
        asked to recall them. Saying it aloud matters more than it feels like it should —
        it is the difference between recognising a shape and knowing a sound.</p>`,
    },
  ]

  // teach → immediately test that same character
  for (const [i, k] of group.entries()) {
    blocks.push(introBlock(script, k))
    blocks.push(recallBlock(script, k, [...seen, ...group], index * 100 + i))
  }

  // then mixed production over everything learned so far
  blocks.push({
    kind: 'callout',
    html: `<p><strong>Now the other direction.</strong> Recognising a character is easier than
      producing it. These next few go from sound to symbol, which is harder and worth more.</p>`,
  })

  const producePool = [...seen, ...group]
  for (const [i, k] of shuffleBy(group, index * 31).entries()) {
    blocks.push(produceBlock(script, k, producePool, index * 200 + i))
  }

  // interleave older material — the part that builds durable memory
  if (seen.length >= 5) {
    blocks.push({
      kind: 'callout',
      tone: 'warn',
      html: `<p><strong>Mixed review.</strong> These come from earlier lessons. Jumping between
        old and new feels worse than drilling one set — and works better.</p>`,
    })
    for (const [i, k] of shuffleBy(seen, index * 17).slice(0, 4).entries()) {
      blocks.push(recallBlock(script, k, [...seen, ...group], index * 300 + i))
    }
  }

  blocks.push({
    kind: 'prose',
    html: `<p>Done. These ${group.length} characters are now in your review deck — head to
      <strong>Remember</strong> when you want them to stick.</p>`,
  })

  return {
    slug: `${script}-${index + 1}`,
    title: `${label} ${index + 1} · ${chars}`,
    summary: `Learn ${chars} — five characters, taught one at a time with immediate recall.`,
    ordinal,
    minutes: 6,
    // One concept PER GROUP, not one for all of hiragana. With a single
    // shared concept, finishing lesson 1 would unlock cards for all 46
    // characters — including the 41 you have never seen.
    concepts: [`kana-${script}-${index + 1}`],
    blocks,
  }
}

function dakutenLesson(ordinal: number): LessonDef {
  const sample = DAKUTEN.slice(0, 5)
  return {
    slug: 'dakuten',
    title: 'Dakuten · か → が',
    summary: 'Two little strokes change the sound. Not 25 new characters — one rule.',
    ordinal,
    minutes: 5,
    concepts: ['kana-marks'],
    blocks: [
      {
        kind: 'prose',
        html: `<p>Good news: you have already learned most of what is left.</p>
          <p>Two small strokes in the top-right corner — <strong>dakuten</strong>
          <span class="ja">゛</span> — voice the consonant. That is one rule, not twenty-five new
          characters to memorise.</p>`,
      },
      {
        kind: 'table',
        caption: 'The whole rule',
        headers: ['Plain', 'With ゛', 'Sound change'],
        rows: [
          ['<span class="ja">か</span> ka', '<span class="ja">が</span> ga', 'k → g'],
          ['<span class="ja">さ</span> sa', '<span class="ja">ざ</span> za', 's → z'],
          ['<span class="ja">た</span> ta', '<span class="ja">だ</span> da', 't → d'],
          ['<span class="ja">は</span> ha', '<span class="ja">ば</span> ba', 'h → b'],
          ['<span class="ja">は</span> ha', '<span class="ja">ぱ</span> pa', 'h → p (circle ゜ instead)'],
        ],
      },
      {
        kind: 'prose',
        html: `<p>Say "ka" and "ga" out loud. Your mouth makes the same shape; only your voice box
          switches on. That is literally what the two strokes mean.</p>`,
      },
      {
        kind: 'practice',
        question: `<p>If <span class="ja" style="font-size:1.5rem">て</span> is <strong>te</strong>,
          what is <span class="ja" style="font-size:1.5rem">で</span>?</p>`,
        options: [
          { html: '<strong>de</strong>', ok: true },
          { html: '<strong>ze</strong>' },
          { html: '<strong>be</strong>' },
          { html: '<strong>pe</strong>' },
        ],
        explain: `<p>t → d. You did not memorise <span class="ja">で</span> — you worked it out.
          That is how the whole voiced set should feel.</p>`,
      },
      {
        kind: 'practice',
        question: `<p>Which one uses the <em>circle</em> mark rather than the two strokes?</p>`,
        options: [
          { html: '<span class="ja" style="font-size:1.5rem">ぴ</span> pi', ok: true },
          { html: '<span class="ja" style="font-size:1.5rem">び</span> bi' },
          { html: '<span class="ja" style="font-size:1.5rem">じ</span> ji' },
          { html: '<span class="ja" style="font-size:1.5rem">ど</span> do' },
        ],
        explain: `<p>Only the h-row takes the circle (handakuten), turning h → p.
          <span class="ja">は ば ぱ</span> — ha, ba, pa.</p>`,
      },
      {
        kind: 'prose',
        html: `<p>Sample of what this unlocks: ${sample.map((d) =>
          `<span class="ja">${d.h}</span> ${d.r}`).join(' · ')} … and twenty more, all from
          the same rule.</p>`,
      },
    ],
  }
}

function yoonLesson(ordinal: number): LessonDef {
  return {
    slug: 'yoon-sokuon',
    title: 'Small kana · きゃ and っ',
    summary: 'Small characters change timing. Getting this wrong changes the word.',
    ordinal,
    minutes: 6,
    concepts: ['kana-marks'],
    blocks: [
      {
        kind: 'prose',
        html: `<p>Japanese is counted in <strong>beats</strong>, not syllables. Every kana is one
          beat, held for the same length. Small kana break that rule on purpose — and the
          difference is not decorative, it changes which word you said.</p>`,
      },
      {
        kind: 'prose',
        html: `<h3>Small ゃゅょ — squeeze two into one beat</h3>
          <p><span class="ja">きや</span> is <em>ki-ya</em>, two beats.
          <span class="ja">きゃ</span> is <em>kya</em>, one beat. The small character glues onto
          the one before it.</p>`,
      },
      {
        kind: 'practice',
        question: `<p>How many beats is <span class="ja" style="font-size:1.75rem">きょう</span>
          (today)?</p>`,
        options: [
          { html: 'Two — <strong>kyo–u</strong>', ok: true },
          { html: 'One — <strong>kyo</strong>' },
          { html: 'Three — <strong>ki–yo–u</strong>' },
          { html: 'Four' },
        ],
        explain: `<p><span class="ja">きょ</span> is one beat, <span class="ja">う</span> adds a
          second by lengthening it. So <strong>kyō</strong>, held for two beats.</p>
          <p>Compare <span class="ja">きよ</span> — <em>ki-yo</em>, a different word entirely.</p>`,
      },
      {
        kind: 'prose',
        html: `<h3>Small っ — a beat of silence</h3>
          <p>A small <span class="ja">っ</span> doubles the next consonant. You hold a silent beat
          before it, like a tiny stumble.</p>`,
      },
      {
        kind: 'example',
        ja: 'きて / きって',
        reading: 'kite / kitte',
        gloss: 'come / postage stamp',
        tone: 'flag',
        note: 'Two completely unrelated words. The only difference is one silent beat.',
      },
      {
        kind: 'practice',
        question: `<p>You want to say <strong>"a little"</strong> —
          <span class="ja">ちょっと</span> <em>chotto</em>. How many beats?</p>`,
        options: [
          { html: 'Four — <strong>cho–(pause)–to</strong>', ok: false },
          { html: 'Three — <strong>cho–t–to</strong>', ok: true },
          { html: 'Two — <strong>cho–to</strong>' },
          { html: 'One' },
        ],
        explain: `<p><span class="ja">ちょ</span> (1) + <span class="ja">っ</span> silent beat (2)
          + <span class="ja">と</span> (3). Say it with the pause and it suddenly sounds Japanese.</p>
          <p>You will use this word constantly — it is also how a Japanese colleague says
          <em>no</em> without saying no.</p>`,
      },
      {
        kind: 'source',
        tier: 'T2',
        title: 'NHK NEWS WEB EASY',
        url: 'https://www3.nhk.or.jp/news/easy/',
        html: `<p>Once you finish hiragana, open this. Every kanji has furigana above it, so you
          can read it with kana alone. You will not understand much yet — the point is that the
          shapes stop being noise.</p>`,
      },
    ],
  }
}

/* ============================================================
   The track
   ============================================================ */

export function buildKanaTrack(startOrdinal = 1): LessonDef[] {
  const out: LessonDef[] = []
  let ordinal = startOrdinal

  for (const script of ['hiragana', 'katakana'] as Script[]) {
    const seen: Kana[] = []
    chunk(GOJUON, 5).forEach((group, i) => {
      out.push(kanaLesson(script, group, [...seen], i, ordinal++))
      seen.push(...group)
    })
    if (script === 'hiragana') out.push(dakutenLesson(ordinal++))
  }

  out.push(yoonLesson(ordinal++))
  return out
}

/** One concept per five-character group, so unlocking stays honest. */
export const KANA_CONCEPTS = [
  ...(['hiragana', 'katakana'] as Script[]).flatMap((script) =>
    chunk(GOJUON, 5).map((group, i) => ({
      slug: `kana-${script}-${i + 1}`,
      title: `${script === 'hiragana' ? 'Hiragana' : 'Katakana'} ${i + 1} · ${
        group.map((k) => (script === 'hiragana' ? k.h : k.k)).join('')}`,
      kind: 'kana',
    })),
  ),
  { slug: 'kana-marks', title: 'Dakuten and small kana', kind: 'kana' },
]

/** SRS cards for every kana, both directions, filed under their own group. */
export function kanaCards() {
  const cards: {
    concept: string; type: string; prompt: string; answer: string
    direction: 'recognition' | 'production'; extra: Record<string, unknown>
  }[] = []

  for (const script of ['hiragana', 'katakana'] as Script[]) {
    chunk(GOJUON, 5).forEach((group, gi) => {
      const concept = `kana-${script}-${gi + 1}`
      for (const k of group) {
        const char = script === 'hiragana' ? k.h : k.k
        cards.push({
          concept, type: 'kana-recognition', prompt: char, answer: k.r,
          direction: 'recognition',
          extra: { script, hook: script === 'hiragana' ? k.mh : k.mk },
        })
        cards.push({
          concept, type: 'kana-production', prompt: k.r, answer: char,
          direction: 'production',
          extra: { script, hook: script === 'hiragana' ? k.mh : k.mk },
        })
      }
    })
  }

  for (const d of DAKUTEN) {
    cards.push({
      concept: 'kana-marks', type: 'kana-recognition', prompt: d.h, answer: d.r,
      direction: 'recognition', extra: { script: 'hiragana', from: d.from },
    })
  }
  for (const y of YOON.slice(0, 12)) {
    cards.push({
      concept: 'kana-marks', type: 'kana-recognition', prompt: y.h, answer: y.r,
      direction: 'recognition', extra: { script: 'hiragana', yoon: true },
    })
  }

  return cards
}
