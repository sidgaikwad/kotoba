# Kotoba — architecture

A macOS desktop language tutor. Japanese is the first course; the core knows nothing about Japanese.

## Stack, and why

| Choice | Why | Rejected alternative |
|---|---|---|
| **Tauri v2** | Native `.dmg`, ~5 MB binary, Rust core for filesystem/SQLite/TTS | Electron — 3 orders of magnitude larger, no benefit here |
| **Vite + React + TS** | The documented Tauri path; instant HMR | Next.js — needs `output: 'export'` inside Tauri, which discards Server Components, route handlers, middleware and ISR. You keep the build system and lose the reason to use it |
| **SQLite, local, source of truth** | Study apps get used on trains. Offline is not a feature here, it is the product | Postgres — needs a server running to review a flashcard |
| **Drizzle (SQLite dialect)** | Typed schema, generates the SQL that Rust embeds | Hand-written migrations — guaranteed drift |
| **ts-fsrs** | FSRS is materially better-calibrated than SM-2 (see below) | SM-2 — fixed heuristics, no per-card memory model |

Cloud sync is deliberately absent. When it is wanted, it is additive: the local DB stays authoritative and a sync layer ships changes upward. Nothing in the schema needs to change for that.

## Why FSRS and not SM-2

SM-2 (Anki's original, 1987) adjusts one "ease factor" per card with fixed multipliers. It has no model of forgetting — it cannot say *how likely you are to recall this card today*, so it cannot target a retention rate, and its intervals drift into the well-known "ease hell" for hard cards.

FSRS models each card with **stability** (how slowly the memory decays) and **difficulty** (how hard it is for you specifically), fits those against your actual review log, and schedules to hit a retention target you choose. Concretely: it can be told "I want to remember 90% of what I see" and it will space accordingly, and it improves as `review` accumulates rows.

This is why `review` is append-only and stores latency. It is not a log — it is the training data.

## The seam

The single rule: **`src/db/schema/core.ts` may not know that Japanese exists.**

```
core  ──▶ language.extension: 'ja'   selects a module at runtime
core  ──▶ card.type: string          opaque; routes to a renderer + grader
core  ──▶ card.extra: JSON           opaque; the renderer's private payload

ja    ──▶ hangs off concept.id       ja_kanji, ja_vocab, ja_verb,
                                     ja_register_ladder, ja_register_rule
```

The core **schedules, scores, and stores**. It never grades meaning — grading is language-specific and lives behind the extension registry. Adding a card type must never require a migration in `core.ts`; if it does, the type is leaking through the seam.

Adding Korean means: write `ko.ts`, register a renderer/grader set, seed a course. `core.ts` is untouched. That is the test.

### Where Japanese-specific knowledge is allowed to live

- `ja_kanji`, `ja_kanji_component` — writing system, from KANJIDIC2 + KanjiVG
- `ja_vocab` — with `register` and `domain` columns, because 障害 means something different at a software company than in a dictionary
- `ja_verb` — verb class, transitivity, and `paired_with_id` for 落ちる ↔ 落とす
- `ja_register_ladder` — plain / 丁寧語 / 尊敬語 / 謙譲語Ⅰ / 謙譲語Ⅱ / 美化語 per expression, plus `anti_patterns` for forms that are grammatical but wrong
- `ja_register_rule` — audience × channel → expected rung, with what going too high or too low costs

The five keigo categories follow [敬語の指針](https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf) (文化審議会答申, 2007-02-02), not the three-category model textbooks still print.

## Design decisions worth not re-arguing

**`study_day.counted_for_streak` is stored, not derived.** If the streak rule is ever changed, recomputing it must not silently rewrite the learner's history.

**`xp_event` is per-event, never a running total.** XP that cannot be audited is XP that can be farmed without anyone noticing.

**`card.direction` separates recognition from production.** Tracking them together lets the app report a fluency the learner does not have — recognition always runs ahead, and hiding that is the single most common way a learning app lies.

**`concept_interference` exists so the scheduler can space colliding items apart.** Teaching 送る and 贈る back to back builds the collision instead of the memory.

**`review` stores `elapsed_ms`.** Fast-and-correct is a different memory state from slow-and-correct, and FSRS-5 can use it.

**Local date, not UTC, for `study_day.day`.** A streak is a human day. Storing UTC breaks streaks for anyone who studies late at night.

## Licence obligations (must be satisfied before any distribution)

Bundled data carries attribution requirements that must be reachable from the About screen:

- JMdict / KANJIDIC2 — EDRDG, **CC BY-SA 4.0**. Commercial use permitted. Data must be kept reasonably current.
- KanjiVG — **CC BY-SA 3.0**
- Tatoeba — **CC BY 2.0 FR** (some sentences CC0)

No copyrighted textbook content is used anywhere in this project.

## Running it

```bash
bun run desktop        # dev: Vite HMR + Rust, live reload
bun run dmg            # release: builds Kotoba.app and the .dmg
bun run db:generate    # after editing schema — regenerates drizzle/*.sql
```

`bun run dmg` packages the `.app` into the disk image and **deletes the staging copy**, so
`bundle/macos/` ends up empty. To get a runnable app back out:

```bash
hdiutil attach src-tauri/target/release/bundle/dmg/Kotoba_0.1.0_aarch64.dmg -nobrowse
cp -R /Volumes/Kotoba/Kotoba.app src-tauri/target/release/bundle/macos/
hdiutil detach /Volumes/Kotoba
```

The app is **unsigned**. That is fine locally, but distributing it to anyone else needs an Apple
Developer ID and notarisation, or they will hit Gatekeeper.

Database location: `~/Library/Application Support/app.kotoba.desktop/kotoba.db`.
Delete that file to reset all progress.

## Layout

```
app/
├── src/
│   ├── db/schema/core.ts    ← language-agnostic. Guard this file.
│   ├── db/schema/ja.ts      ← Japanese extension
│   └── ...
├── drizzle/                 ← generated SQL, embedded by Rust
└── src-tauri/               ← Rust core: SQLite, filesystem, TTS
```
