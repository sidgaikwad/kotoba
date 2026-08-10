/**
 * Fetches KANJIDIC2 and distils it into scripts/data/kanji.json.
 *
 *   bun run fetch-kanji
 *
 * KANJIDIC2 is © the Electronic Dictionary Research and Development Group,
 * licensed CC BY-SA 4.0. The derived file keeps that attribution and inherits
 * the same licence. Only the 常用漢字 (jōyō) set is kept — the 2,136 characters
 * an adult is officially expected to read — plus grade and frequency, which is
 * what the course orders lessons by.
 *
 * The output is committed so the build works offline and CI needs no network.
 * Re-run when you want fresher data; EDRDG asks that bundled copies be kept
 * reasonably current.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const URL = 'http://www.edrdg.org/kanjidic/kanjidic2.xml.gz'
const OUT_DIR = join(import.meta.dir, 'data')
const OUT = join(OUT_DIR, 'kanji.json')

export type KanjiEntry = {
  c: string          // character
  on: string[]       // 音読み, katakana
  kun: string[]      // 訓読み, hiragana
  meanings: string[] // English
  strokes: number
  grade: number      // 1-6 school grades, 8 = remaining jōyō
  freq: number | null // newspaper frequency rank, 1 = commonest
}

async function main() {
  console.log('fetching KANJIDIC2 …')
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`KANJIDIC2 fetch failed: ${res.status} ${res.statusText}`)

  const xml = gunzipSync(Buffer.from(await res.arrayBuffer())).toString('utf8')
  console.log(`  ${(xml.length / 1e6).toFixed(1)} MB of XML`)

  const entries: KanjiEntry[] = []

  // A dependency-free scan. KANJIDIC2's structure is flat and regular enough
  // that a real XML parser would be more machinery than the job needs.
  for (const block of xml.split('<character>').slice(1)) {
    const c = block.match(/<literal>(.+?)<\/literal>/)?.[1]
    if (!c) continue

    const grade = Number(block.match(/<grade>(\d+)<\/grade>/)?.[1] ?? 0)
    if (!grade || grade > 8) continue // jōyō only: grades 1-6 and 8

    const freqRaw = block.match(/<freq>(\d+)<\/freq>/)?.[1]

    entries.push({
      c,
      on: [...block.matchAll(/<reading r_type="ja_on">(.+?)<\/reading>/g)].map((m) => m[1]).slice(0, 4),
      kun: [...block.matchAll(/<reading r_type="ja_kun">(.+?)<\/reading>/g)].map((m) => m[1]).slice(0, 4),
      meanings: [...block.matchAll(/<meaning>([^<]+)<\/meaning>/g)]
        .map((m) => m[1])
        .filter((m) => !/^[a-z-]+$/.test(m) === false || true) // keep all English
        .slice(0, 4),
      strokes: Number(block.match(/<stroke_count>(\d+)<\/stroke_count>/)?.[1] ?? 0),
      grade,
      freq: freqRaw ? Number(freqRaw) : null,
    })
  }

  // Teaching order: frequency first, because the commonest characters unlock
  // the most reading soonest. Characters with no frequency rank go last.
  entries.sort((a, b) => (a.freq ?? 99_999) - (b.freq ?? 99_999))

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT, JSON.stringify({
    _source: 'KANJIDIC2 — Electronic Dictionary Research and Development Group',
    _licence: 'CC BY-SA 4.0',
    _url: 'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project',
    _generated_by: 'bun run fetch-kanji',
    kanji: entries,
  }, null, 0))

  console.log(`wrote ${entries.length} jōyō kanji → ${OUT}`)
  console.log(`  ${(Buffer.byteLength(JSON.stringify(entries)) / 1024).toFixed(0)} KB`)
}

main().catch((e) => { console.error(e); process.exit(1) })
