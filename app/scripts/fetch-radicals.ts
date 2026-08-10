/**
 * Fetches KRADFILE and distils it into scripts/data/radicals.json.
 *
 *   bun run fetch-radicals
 *
 * KRADFILE decomposes each kanji into its visual components. It is part of
 * the EDRDG RADKFILE/KRADFILE project, licensed CC BY-SA 4.0 (originally
 * compiled by Jim Breen and Jim Rose).
 *
 * Two wrinkles the parser handles:
 *   - the file is EUC-JP, not UTF-8
 *   - it ships inside a zip, so we shell out to `unzip`
 *
 * Only jōyō kanji are kept, matched against the KANJIDIC2 set we already have.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL = 'http://ftp.edrdg.org/pub/Nihongo/kradzip.zip'
const OUT_DIR = join(import.meta.dir, 'data')
const OUT = join(OUT_DIR, 'radicals.json')
const KANJI_JSON = join(OUT_DIR, 'kanji.json')

async function main() {
  const work = join(tmpdir(), `kotoba-krad-${process.pid}`)
  mkdirSync(work, { recursive: true })

  console.log('fetching KRADFILE …')
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`KRADFILE fetch failed: ${res.status} ${res.statusText}`)
  const zipPath = join(work, 'kradzip.zip')
  writeFileSync(zipPath, Buffer.from(await res.arrayBuffer()))

  const unzip = Bun.spawnSync(['unzip', '-o', '-q', zipPath, '-d', work])
  if (unzip.exitCode !== 0) throw new Error(`unzip failed: ${unzip.stderr.toString()}`)

  // EUC-JP → UTF-8. Node's TextDecoder handles this label natively.
  const raw = readFileSync(join(work, 'kradfile'))
  const text = new TextDecoder('euc-jp').decode(raw)

  // Restrict to the jōyō set so the output matches the kanji track.
  let allowed: Set<string> | null = null
  if (existsSync(KANJI_JSON)) {
    const { kanji } = JSON.parse(readFileSync(KANJI_JSON, 'utf8')) as { kanji: { c: string }[] }
    allowed = new Set(kanji.map((k) => k.c))
    console.log(`  restricting to ${allowed.size} jōyō kanji`)
  }

  const map: Record<string, string[]> = {}
  let skipped = 0

  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const [left, right] = line.split(' : ')
    if (!right) continue
    const char = left.trim()
    if (allowed && !allowed.has(char)) { skipped++; continue }

    // Drop self-references: kradfile sometimes lists a character as its own
    // component, which teaches nothing.
    const parts = right.trim().split(/\s+/).filter((p) => p && p !== char)
    if (parts.length) map[char] = parts
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT, JSON.stringify({
    _source: 'KRADFILE — Electronic Dictionary Research and Development Group',
    _licence: 'CC BY-SA 4.0',
    _url: 'https://www.edrdg.org/krad/kradinf.html',
    _generated_by: 'bun run fetch-radicals',
    radicals: map,
  }, null, 0))

  rmSync(work, { recursive: true, force: true })

  const total = Object.values(map).reduce((n, v) => n + v.length, 0)
  const distinct = new Set(Object.values(map).flat()).size
  console.log(`wrote ${Object.keys(map).length} kanji, ${distinct} distinct components → ${OUT}`)
  console.log(`  ${(total / Object.keys(map).length).toFixed(1)} components per kanji on average`)
  if (skipped) console.log(`  skipped ${skipped} non-jōyō entries`)
}

main().catch((e) => { console.error(e); process.exit(1) })
