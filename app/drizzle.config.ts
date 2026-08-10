import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle is the single source of truth for the schema. `bun run db:generate`
 * writes SQL into ./drizzle, and src-tauri/src/lib.rs embeds those files with
 * include_str! so the Rust side applies exactly what Drizzle generated.
 * Never hand-write a migration in Rust — it will drift.
 */
export default defineConfig({
  dialect: 'sqlite',
  // Both files listed explicitly. index.ts re-exports the extension as a
  // namespace (`export * as ja`) to enforce the seam at import sites, and
  // drizzle-kit cannot see through a namespace re-export.
  schema: ['./src/db/schema/core.ts', './src/db/schema/ja.ts'],
  out: './drizzle',
})
