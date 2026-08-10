/**
 * Builds a fully-seeded course database and stages it as a Tauri resource.
 *
 *   bun run pack-content
 *
 * Runs automatically before `bun run dmg`. Without it a downloaded build opens
 * with an empty Learn screen and no way to fix that short of cloning the repo,
 * which is not a release — it is a demo.
 *
 * The output is gitignored: it is derived entirely from scripts/data/*.json
 * plus the authored catalogues, so committing it would just be a second copy
 * that goes stale.
 */
import { Database } from 'bun:sqlite'
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const DRIZZLE = join(ROOT, 'drizzle')
const OUT_DIR = join(ROOT, 'src-tauri', 'resources')
const OUT = join(OUT_DIR, 'course.db')

mkdirSync(OUT_DIR, { recursive: true })
rmSync(OUT, { force: true })
rmSync(`${OUT}-shm`, { force: true })
rmSync(`${OUT}-wal`, { force: true })

console.log('applying migrations …')
const db = new Database(OUT, { create: true })
const migrations = readdirSync(DRIZZLE).filter((f) => f.endsWith('.sql')).sort()
for (const f of migrations) {
  db.exec(readFileSync(join(DRIZZLE, f), 'utf8').replaceAll('--> statement-breakpoint', ''))
}

// Record them in sqlx's own table so the plugin does not try to re-apply on
// first launch. Checksums are not verified by the plugin, so a zero blob is
// sufficient and avoids reimplementing sqlx's hashing.
db.exec(`CREATE TABLE IF NOT EXISTS _sqlx_migrations (
  version BIGINT PRIMARY KEY,
  description TEXT NOT NULL,
  installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN NOT NULL,
  checksum BLOB NOT NULL,
  execution_time BIGINT NOT NULL
)`)
migrations.forEach((f, i) => {
  db.query(
    `INSERT OR REPLACE INTO _sqlx_migrations
     (version, description, success, checksum, execution_time) VALUES (?,?,1,?,0)`,
  ).run(i + 1, f.replace(/^\d+_|\.sql$/g, ''), Buffer.alloc(0))
})
db.close()

console.log('seeding course …')
const seeded = Bun.spawnSync(['bun', 'run', join(import.meta.dir, 'seed.ts')], {
  env: { ...process.env, KOTOBA_DB: OUT },
  stdout: 'inherit', stderr: 'inherit',
})
if (seeded.exitCode !== 0) { console.error('seed failed'); process.exit(1) }

// VACUUM reclaims the churn from the seeder's insert-then-prune passes.
const v = new Database(OUT)
v.exec('VACUUM')
const counts = v.query(`SELECT
  (SELECT COUNT(*) FROM lesson) l, (SELECT COUNT(*) FROM card) c`).get() as { l: number; c: number }
v.close()

console.log(`packed ${counts.l} lessons and ${counts.c} cards`)
console.log(`  ${(statSync(OUT).size / 1048576).toFixed(1)} MB → ${OUT}`)
