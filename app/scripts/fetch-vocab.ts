/**
 * Fetches JMdict and distils the common-word core into scripts/data/vocab.json.
 *
 *   bun run fetch-vocab
 *
 * JMdict is © the Electronic Dictionary Research and Development Group,
 * licensed CC BY-SA 4.0. The derived file keeps that attribution.
 *
 * Only entries JMdict itself marks as common are kept — the news1/ichi1/spec1
 * priority tags, which come from newspaper and corpus frequency work. That is
 * roughly the vocabulary an educated adult actually uses, and it is a far
 * better teaching order than any "N3 word list", none of which are official
 * (jlpt.jp withdrew its lists in 2010).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const URL = 'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz'
const OUT_DIR = join(import.meta.dir, 'data')
const OUT = join(OUT_DIR, 'vocab.json')
const MAX = 6000

export type VocabEntry = {
  w: string       // headword (kanji form if it has one)
  r: string       // reading, kana
  g: string[]     // glosses
  pos: string     // part of speech, abbreviated
  common: number  // count of priority tags — higher is commoner
}

const POS_SHORT: [RegExp, string][] = [
  [/Godan verb/, 'godan'],
  [/Ichidan verb/, 'ichidan'],
  [/suru verb/, 'suru'],
  [/noun/, 'noun'],
  [/adjective \(keiyoushi\)/, 'i-adj'],
  [/adjectival nouns/, 'na-adj'],
  [/adverb/, 'adv'],
  [/expressions/, 'expr'],
  [/particle/, 'particle'],
]

function shortPos(s: string): string {
  for (const [re, out] of POS_SHORT) if (re.test(s)) return out
  return 'other'
}

async function main() {
  console.log('fetching JMdict …')
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`JMdict fetch failed: ${res.status} ${res.statusText}`)

  const xml = gunzipSync(Buffer.from(await res.arrayBuffer())).toString('utf8')
  console.log(`  ${(xml.length / 1e6).toFixed(0)} MB of XML`)

  const out: VocabEntry[] = []

  for (const block of xml.split('<entry>')) {
    // Priority tags are the whole point of this filter.
    const pri = (block.match(/<(ke|re)_pri>(news1|ichi1|spec1)<\/(ke|re)_pri>/g) ?? []).length
    if (pri === 0) continue

    const reading = block.match(/<reb>(.+?)<\/reb>/)?.[1]
    if (!reading) continue
    const kanji = block.match(/<keb>(.+?)<\/keb>/)?.[1]

    const glosses = [...block.matchAll(/<gloss(?: xml:lang="eng")?>([^<]+)<\/gloss>/g)]
      .map((m) => m[1])
      .slice(0, 3)
    if (!glosses.length) continue

    const posRaw = block.match(/<pos>([^<]+)<\/pos>/)?.[1] ?? ''

    out.push({
      w: kanji ?? reading,
      r: reading,
      g: glosses,
      pos: shortPos(posRaw),
      common: pri,
    })
  }

  // Commonest first, deduplicated by written form.
  out.sort((a, b) => b.common - a.common)
  const seen = new Set<string>()
  const deduped = out.filter((e) => {
    const k = `${e.w}|${e.r}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  }).slice(0, MAX)

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT, JSON.stringify({
    _source: 'JMdict — Electronic Dictionary Research and Development Group',
    _licence: 'CC BY-SA 4.0',
    _url: 'https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project',
    _generated_by: 'bun run fetch-vocab',
    _filter: 'entries tagged news1 / ichi1 / spec1',
    vocab: deduped,
  }, null, 0))

  console.log(`wrote ${deduped.length} common words → ${OUT}`)
  console.log(`  ${(Buffer.byteLength(JSON.stringify(deduped)) / 1024).toFixed(0)} KB`)
}

main().catch((e) => { console.error(e); process.exit(1) })
