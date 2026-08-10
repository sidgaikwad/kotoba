# Working notes

## How this learner wants to be taught

- Developer. Skip programming explanation entirely. Never explain what a state machine or a schema is.
- Plain language → the Japanese → the rule. Never the reverse.
- Concrete scenario over definition, always. Abstract examples ("Person A says to Person B") are banned; use the 株式会社ミナト cast.
- Predict-first. Make them produce an attempt *before* showing the answer. The gap is the lesson; do not smooth it over.
- Retrieval practice over re-reading.
- Diagrams/tables when relationships matter (conjugation machines, register ladders, kanji component trees).
- Use real Japanese metalanguage (敬語, 謙譲語Ⅰ/Ⅱ, 自動詞/他動詞, ホウレンソウ) once established — see the glossary.
- Never confuse "we covered it" with "they can produce it under pressure in a meeting."

## Standing cast — 株式会社ミナト (Tokyo SaaS company, learner is a backend engineer)

| Person | Role | Relationship | Register they receive |
|---|---|---|---|
| 田中部長 | 部長 (dept head) | Distant, senior, rarely addressed directly | High; 尊敬語 about them |
| 佐藤さん | Senior engineer, mentor | Above, warm, daily contact | です・ます, softened requests |
| 鈴木さん | Peer engineer | Same level, becomes a friend | Drifts plain over time |
| 山田さん | PM, adjacent team | Same level, different team | です・ます, more distance |
| 株式会社ケイヨウ | Client | 外 (soto) | 尊敬語 to them, 謙譲語 about own side |
| (later) 新人 | Junior joining later | Below | Learner becomes the senior — register flips |

The point of the fixed cast: **the same person receives different language as the learner's level rises.** Show that drift explicitly.

## Sourcing discipline

Every claim gets a tier tag:
- **T1** authoritative + freely usable (文化庁, JLPT official, EDRDG, MEXT, Japan Foundation, NINJAL)
- **T2** high-quality free web (Imabi, Tofugu, NHK News Web Easy, Qiita/Zenn for real usage)
- **T3** general/parametric knowledge — must be labelled as such, and is the weakest thing in the room

Keep these four visibly separate at all times, because they disagree:
1. what textbooks teach 2. what the JLPT tests 3. what engineers actually say in offices 4. what our app currently teaches

## Established facts worth not re-deriving

- **jlpt.jp publishes no vocabulary or kanji counts.** Only prose descriptors. The 出題基準 lists were withdrawn in 2010. Any "N3 = 3,750 words" number is a community reconstruction — say so every time one is used.
- 敬語の指針 (文化審議会答申, 2007-02-02) uses **five** categories, not three: 尊敬語 / 謙譲語Ⅰ / 謙譲語Ⅱ(丁重語) / 丁寧語 / 美化語.
- EDRDG data (JMdict, KANJIDIC2) is CC BY-SA 4.0; commercial use allowed; attribution must be reachable in-app (an About screen suffices for apps).
- Tatoeba is CC BY 2.0 FR, some sentences CC0.

## Decided: app architecture (2026-08-10)

**ZeroStarter was evaluated and rejected**, with the learner's agreement, after scaffolding it and
reading what it actually produces: 12 page routes (waitlist, admin console, user management,
allowlist, activity log, blog, docs, dashboard), 3 schema files (`auth`, `console`, `waitlist`), zero
domain content, and a hard Postgres dependency via docker-compose. It is a good SaaS starter and this
is not a SaaS.

**Built on instead:** Tauri v2 + Vite + React + TS, local SQLite as source of truth, Drizzle (SQLite
dialect) generating migrations that Rust embeds via `include_str!`, ts-fsrs for scheduling, Tailwind v4.
Rationale and rejected alternatives are in [app/ARCHITECTURE.md](app/ARCHITECTURE.md).

Do not re-propose Next.js inside Tauri. It requires `output: 'export'`, which discards Server
Components, route handlers, middleware and ISR — you keep the build system and lose the reason to use it.

**The seam:** `src/db/schema/core.ts` may not know Japanese exists. Cards cross the seam via an opaque
`type` string and an opaque `extra` JSON payload. Japanese lives in `ja.ts`, hanging off `concept.id`.
Adding Korean = write `ko.ts`, touch nothing in core.

## Open questions to resolve with the learner

- Does he already have kana? (Diagnostic 0001 answers this.)
- Target date for moving to Japan / interviewing? Changes urgency ordering a lot.
- Does he want speaking practice with a human tutor early, or read/write first?
