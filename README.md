# Kotoba

An offline-first macOS language tutor, built around the idea that **register — knowing which
version of a sentence to use with which person — is the part of a language that fails silently.**

The first course is Japanese for software engineers working in Japanese companies. The core is
language-agnostic; Japanese is an extension.

![status](https://img.shields.io/badge/status-early-informational)

## Why this exists

Grammar errors are loud. Say a verb wrong and comprehension breaks, someone asks what you meant,
and you find out immediately. Register errors are silent: the sentence is grammatical, everyone
understands you, and nobody corrects your politeness because correcting it would itself be rude.
You come across slightly wrong, every day, for years.

Most language apps optimise the loud half. This one is built for the silent half.

## Where it starts

**At zero.** Lesson one teaches あ. You are not assumed to read a single character.

The course opens with a full kana track — 22 bite-size units covering all 46 hiragana and katakana,
plus dakuten, yōon and small っ — before a word of the professional material appears. Five
characters per lesson, each taught then immediately recalled, then produced, then interleaved with
earlier ones.

Only once you can read does the register work begin. The prerequisite graph enforces this: the
politeness lessons are literally locked behind finishing hiragana.

```
KANA  ·  Hiragana 1–10  →  Dakuten  →  Katakana 1–10  →  Small kana
N5    ·  The cost of the wrong register  →  Two dials, not one
N4–N1 ·  (in progress)
```

## What it does

- **Lessons that teach**, not quizzes with prose attached. Content is stored as ordered blocks —
  `prose`, `example`, `table`, `callout`, `predict`, `practice`, `source` — revealed progressively,
  so a `predict` block can force a commitment before the explanation is visible.
- **Learn and Remember are separate.** Learn is the syllabus path. Remember is the SRS deck. Reading
  something and being able to recall it are different states and the app never conflates them.
- **FSRS scheduling** (not SM-2), so the app can target a retention rate and improve as the review
  log grows.
- **Card types that fit the material**: `kana-recognition`, `kana-production`,
  `register-transform`, `register-choice`, `error-detection`, `register-analysis`. All added
  without touching the language-agnostic core.
- **Review integrity**: a card can never appear before the lesson that teaches it has been read.
- **Recognition vs production tracked separately**, because recognition always runs ahead and
  conflating them lets an app report fluency the learner does not have.
- **Notes** — sticky notes per lesson, notes per review session, a global notebook, search, export.
- **Pomodoro with fatigue detection** — flags within-session accuracy decay and recommends a break.
- **Contribution heatmap and streaks**, driven by reviews completed rather than time with the app
  open.

## Stack

Tauri v2 · Vite · React · TypeScript · SQLite (local, source of truth) · Drizzle · ts-fsrs ·
Tailwind v4.

Deliberately **not** a web SaaS: a study app that needs the internet is a study app you stop using
on a train. Cloud sync, if it ever arrives, is additive — the local database stays authoritative.

See [app/ARCHITECTURE.md](app/ARCHITECTURE.md) for the reasoning, including why not Next.js inside
Tauri and where the language-agnostic seam sits.

## Running it

```bash
cd app
bun install
bun run desktop     # dev, with HMR
bun run seed        # author course content into the local database
bun run dmg         # build Kotoba.app and the installer
```

Database lives at `~/Library/Application Support/app.kotoba.desktop/kotoba.db`.
Delete it to reset all progress.

The build is unsigned — fine locally, but distributing to others needs an Apple Developer ID and
notarisation.

## Sources and licensing

The register model follows
[敬語の指針](https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf)
(文化審議会答申, 2007-02-02) — the Japanese government's own framework, which uses **five**
categories (尊敬語 / 謙譲語Ⅰ / 謙譲語Ⅱ / 丁寧語 / 美化語), not the three most textbooks still print.

Data intended for bundling:

| Source | Licence |
|---|---|
| [JMdict / KANJIDIC2](https://www.edrdg.org/) (EDRDG) | CC BY-SA 4.0 |
| [KanjiVG](https://kanjivg.tagaini.net/) | CC BY-SA 3.0 |
| [Tatoeba](https://tatoeba.org/) | CC BY 2.0 FR (some CC0) |

**No copyrighted textbook content is used anywhere in this project.** Every explanation and example
sentence is original or drawn from openly-licensed corpora.

One thing worth stating because it is widely got wrong: **jlpt.jp publishes no vocabulary or kanji
counts.** The 出題基準 lists were withdrawn in 2010, so every "N3 = 3,750 words" figure online is a
community reconstruction. JLPT levels are used here as a scope map, never as a source of truth.
