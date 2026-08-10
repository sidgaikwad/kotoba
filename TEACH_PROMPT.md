# /teach prompt — Japanese for the professional circuit, taught through an app we build together

Teach me Japanese from the inside out, with the goal of making me genuinely able to *operate* as a software engineer inside a Japanese company — not merely able to pass a test or recognise vocabulary.

## My context

I am a developer. I want to work in Japan.

Right now, the things I naturally notice about Japanese are surface-level:

* individual words
* individual kanji
* whether a sentence "looks like" Japanese I've seen before
* whether I can decode the meaning if I read slowly

Those are useful, but they are not the capability I actually need.

What I need is to walk into a Japanese engineering organisation and:

* understand what my team lead actually said in the 朝会
* write a Slack message that reads as normal, not as translated English
* ask a senior engineer for help without sounding either rude or grovelling
* disagree with a design decision in a way that doesn't damage the relationship
* apologise at the correct severity for the actual size of the mistake
* write a 障害報告 that a Japanese manager would accept
* switch into friendly register at 飲み会 and not sound like a business email
* read Japanese technical writing (Qiita, Zenn, 仕様書, internal docs) at working speed

My end state is that I can look at a situation and think:

> "This is a request to a superior, outside my team, about something that is my fault, in writing — so it needs 謙譲語 on my action, 尊敬語 on theirs, a cushion phrase before the ask, and no direct 〜てください."

rather than only:

> "I know the words for this."

I am much more experienced with code than with Japanese, and far more experienced with code than with Japanese *social* norms. Do not over-explain programming. Do over-explain social mechanics.

## The mission

Teach me Japanese at four levels simultaneously, and keep connecting them:

1. **Surface** — what is actually said, written, or heard.
2. **System** — the grammatical machinery that generates it (morphology, particles, transitivity, clause structure).
3. **Social** — register, hierarchy, uchi/soto, who may say this to whom, and what it signals about the relationship.
4. **Retention** — how this gets encoded in the app so I still have it in six months.

Level 3 is the one I will underestimate. Do not let me.

A grammatically perfect sentence at the wrong register is a worse professional failure than a broken sentence at the right one. Teach me that explicitly and repeatedly.

## There are two deliverables, and they are not separate

### Deliverable 1 — the app

A macOS desktop application (shipped as a `.dmg`) that is a universal language tutor. The learner picks a language; Japanese is the first and only fully-authored course, but nothing about the architecture may be Japanese-specific.

### Deliverable 2 — the course

A complete, precise, professionally-oriented Japanese curriculum from genuine N5 through genuine N1, authored *into* the app as data.

**These are one project.** The app is not a wrapper around the course; it is the environment where I do the learning and where you verify the teaching actually worked. Every lesson you teach me must end up as real rows in the real database, and we should then open the real app and do it.

Build the app first — enough of it to be usable — then author the curriculum into it incrementally as we learn. Do not author 5 levels of content into a system that doesn't exist yet.

## The app I want built

### Stack — verify, don't assume

Scaffold with **ZeroStarter** (`https://zerostarter.dev`, `bunx zerostarter init`). Before writing any code, actually run the init and read what it produced. What I believe it gives us — Bun + Turborepo monorepo, Next.js 16 App Router web app, Hono API, PostgreSQL + Drizzle, Better Auth, Tailwind + shadcn/ui + Base UI, TanStack Query, Zod, Fumadocs — may be stale by the time you run it. **Detect the actual scaffold and tell me what it really is before we design on top of it.**

### The conflict you must resolve first

ZeroStarter is a **cloud SaaS starter**: server Postgres, OAuth, two deployed apps. I want an **offline-capable macOS desktop app**. Those pull in opposite directions.

My assumption is:

* keep the ZeroStarter monorepo as the base
* add a third app — `apps/desktop` — as a **Tauri v2** shell producing the `.dmg`
* make **local SQLite the source of truth** for all learning state (progress, SRS scheduling, XP, streaks, notes, session logs), because a study app that needs the internet is a study app I will stop using on a train
* keep Postgres + Better Auth as **optional cloud sync**, not a dependency for launch
* share the Drizzle schema across dialects deliberately, since Postgres and SQLite schemas are not interchangeable verbatim

**Do not accept that plan because I wrote it.** Evaluate it, tell me where it's wrong, and propose the better shape. Specifically interrogate: Next.js 16 inside Tauri (static export vs sidecar server), Bun vs Node in the Tauri build, whether the Hono API is dead weight for a local-first app, and whether Electron is honestly the lower-risk choice. Give me a recommendation, not a survey.

### Core features

**Progress and motivation**

* GitHub-style contribution heatmap of daily study
* daily streaks, with an explicit, stated rule for what counts as "studied today" and what breaks a streak
* XP, awarded for things that actually correlate with learning — not for time spent with the app open
* per-level, per-unit, per-skill progress that reflects *retention*, not *completion*

**Review and memory**

* SRS built on **FSRS**, not SM-2 — and explain to me why that choice matters
* daily and weekly review queues drawn from material I have *already learned*, never from unseen content
* leech detection and a real recovery path for cards I keep failing
* multiple card types, because Japanese needs more than one:
  * recognition (kanji → reading + meaning)
  * production (English → Japanese, typed, kana/kanji aware)
  * cloze grammar
  * listening
  * pitch-accent discrimination
  * **register transformation** (plain → 丁寧 → 尊敬 → 謙譲) — this card type is the professional core
  * particle choice
  * counter selection
  * transitivity pair discrimination
* sentence mining: I can turn anything I encounter into a card without leaving flow

**Notes**

* sticky notes attachable to a specific lesson, readable when I return to that lesson
* notes attachable to an individual revision/review session
* a global notebook
* full-text search across every note
* export

**Focus**

* Pomodoro integrated into study sessions, not bolted on beside them
* time-on-task tracked per lesson and per card
* adaptive: detect accuracy decay within a session and *recommend* a break rather than silently letting me grind badly
* be honest with me about which of these techniques have real evidence behind them and which are folklore

**Audio**

* macOS ships Japanese TTS voices (Kyoko, Otoya) usable offline via the system speech APIs — evaluate whether that's good enough, and be honest about where synthetic pitch accent will mislead me

### Architecture requirement — language-agnostic core

The domain model must be generic: `Language`, `Course`, `Level`, `Unit`, `Lesson`, `Concept`, `Card`, `Review`, `Note`, `Session`, `StreakDay`, `XpEvent`.

Everything Japanese-specific — kanji, readings, pitch accent, keigo register ladders, counters, particles — lives in a per-language extension layer. When I add Korean or Mandarin later, the core must not need surgery.

Show me where the seam is before you build past it.

### UI

It should look genuinely good, and it should be calm. This is an app I will open every day, often tired. Prioritise legibility of Japanese text (font stack, line height, furigana rendering, ruby text) over decoration. Japanese typography is a real problem — treat it as one.

## Do not teach Japanese as a list of lessons

This matters more than anything else in this prompt.

Teach it as a connected generative system. For important concepts, walk me through:

`situation` → `intent` → `who I'm speaking to and our relationship` → `register decision` → `sentence pattern` → `morphology` → `particles` → `politeness form` → `channel (spoken / chat / email / document)` → `how it lands socially` → `how it's encoded as cards in the app`

I want to eventually run flows like:

`I broke production` → `who needs to know, in what order` → `報告 vs 相談 vs 謝罪` → `severity of apology` → `written 障害報告 structure` → `spoken follow-up in 朝会` → `what my team lead now expects from me` → `the vocabulary and forms that made all of that possible`

The exact flows should come from real Japanese professional practice, not from my assumptions about it.

## Ground the teaching in reality

Do not rely on your parametric knowledge when a real source can answer the question. Build a source base and cite which tier a claim comes from.

**Tier 1 — authoritative, freely usable**

* JLPT official (`jlpt.jp`) — test structure and official level descriptors. Note: the old 出題基準 vocabulary/kanji lists were withdrawn in 2010; any "official N3 list" you find is a community reconstruction. Say so when you use one.
* **敬語の指針** (Agency for Cultural Affairs / 文化庁, 2007) — the Japanese government's own keigo framework, including the 5-category model. This is the spine of the professional register track.
* **JF Standard for Japanese-Language Education** (Japan Foundation) — Can-do statements mapped to CEFR. Better than JLPT for "what can I actually do at work."
* NINJAL / BCCWJ corpus frequency data
* JMdict / JMnedict (CC BY-SA) — dictionary
* KANJIDIC2 (CC BY-SA) — kanji data
* KanjiVG (CC BY-SA) — stroke order
* Tatoeba (CC BY) — example sentences
* 常用漢字表 (MEXT) — the official 2,136-kanji list

**Tier 2 — high-quality free web**

* Imabi — the deepest free grammar reference available
* Tofugu — kana, kanji, and pedagogy explainers
* NHK News Web Easy — graded authentic reading
* Wiktionary / Japanese Wikipedia (CC BY-SA)
* IPA (情報処理推進機構) and Japanese OSS documentation for engineering vocabulary
* real Japanese job postings, company engineering blogs, Qiita and Zenn — for how engineers *actually* write

**Tier 3 — general knowledge**, clearly labelled as such.

**Copyright constraint, non-negotiable:** do not download, reproduce, or bundle copyrighted textbooks — Genki, Minna no Nihongo, Tobira, Shin Kanzen Master, Kanzen Master, Nihongo Sō-Matome, WaniKani content, Bunpro's written explanations. You may use *published lists of what grammar points exist at each level* — that's factual scope information — but every explanation and every example sentence in this course must be original or drawn from openly-licensed corpora. If a source's licence is unclear, say so and pick another.

**Keep these distinctions visible at all times:**

* what textbooks teach
* what the JLPT tests
* what Japanese professionals actually say in an office
* what my app currently teaches

Those four disagree constantly, and the disagreement is where the real learning is. A form can be textbook-correct, JLPT-tested, and something no colleague has said aloud in twenty years. Tell me when that's the case.

## Use the real app as part of my learning

Once the app runs, every significant concept should be:

1. predicted by me first
2. taught
3. authored into the app as real lesson + card data
4. actually practised by me in the running app
5. verified — did the XP fire, did the streak update, did the card enter the right SRS state, did the review queue pull the right material tomorrow

Use the app's own data to tell me things I can't feel about myself: which grammar points I keep failing, which kanji readings collide in my head, whether my production is lagging my recognition (it will be), whether I'm avoiding a whole card type.

Take screenshots when they materially help.

## Teach from two perspectives

### The Japanese professional's perspective

For any important expression or form, tell me:

* who says this
* to whom, and what the relationship must be for it to be appropriate
* in what channel
* what it signals beyond its literal meaning
* what comes before it in the interaction and what is expected after
* what the *slightly wrong* version sounds like — too stiff, too casual, too apologetic, too direct
* what actually happens socially when a foreigner gets it wrong here (sometimes: nothing, they're forgiving; sometimes: real damage — I need to know which is which)

Use a realistic cast, not abstract A and B.

### My perspective as a learner-developer

Then connect the same concept to:

* which levels it spans
* what it depends on that I already know
* what it unlocks that I don't yet
* how it should be broken into cards, and which card types
* where it goes in the curriculum graph
* what it collides with in memory (near-synonyms, homophone kanji, similar-looking forms) and how the scheduler should keep those apart
* how I'll know I actually have it

## Focus on transformation and state

A large part of this course should train me to ask: **what changed, and what does it now allow?**

Teach me to see Japanese as state machines:

* **verb conjugation** — dictionary → ます → て → た → ない → potential → passive → causative → causative-passive → conditional (ば / たら / なら / と) → volitional → imperative, and which transitions are legal from which state
* **the て-form as the central hub** — how much of the language routes through it
* **the register ladder** — plain → 丁寧 → 尊敬 → 謙譲 → 丁重, as a transformation applied to a sentence, not as separate vocabulary to memorise
* **giving and receiving** — あげる / くれる / もらう and their honorific forms, which is the hidden prerequisite for keigo actually making sense
* **transitivity pairs** — and why choosing the wrong one changes who is responsible for what, which matters enormously when reporting a bug
* **the SRS card lifecycle** — new → learning → review → mature → leech → suspended, and what my behaviour does to each

For each: what are the valid states, what triggers a transition, what's illegal, and what does getting it wrong cost me.

## End-to-end journeys

Once I have prerequisites, teach through complete professional journeys rather than isolated grammar:

* **Getting hired** — 職務経歴書, application email, カジュアル面談, technical interview, salary conversation, 内定, 入社手続き
* **First week** — 自己紹介 to the team, 名刺交換, learning who outranks whom and how to detect it
* **Daily engineering** — 朝会, standup updates, asking a senior for help, pairing, code review comments given and received
* **ホウレンソウ** — 報告 / 連絡 / 相談 as three distinct acts with different forms, and why Japanese workplaces treat this as a core competency
* **When things break** — incident reporting, 障害報告書, apology at correct severity, postmortem
* **Disagreeing** — pushing back on a design, saying "no" without saying no, escalating
* **Requests** — the full ladder from 〜て to 〜ていただけないでしょうか, and when each is correct
* **Meetings** — 議事録, agreeing, hedging, interrupting politely
* **External communication** — clients, vendors, and the uchi/soto flip that makes you use 謙譲語 about your own boss
* **Friendship** — 飲み会, casual register, when to drop です・ます and how to tell you've been invited to
* **Living in Japan** — 区役所, 住民票, banking, 賃貸契約, 病院
* **Reading** — Japanese technical documentation and internal specs at working speed

Add journeys as we discover them.

## One coherent scenario

Use a single consistent fictional world across the whole course instead of unrelated example sentences.

Something like: I join **株式会社ミナト**, a mid-size Tokyo SaaS company, as a backend engineer. A fixed cast:

* 田中部長 — department head, distant, senior, rarely spoken to directly
* 佐藤さん — senior engineer, my mentor, warm but above me
* 鈴木さん — same-level peer, becomes a friend
* 山田さん — PM, adjacent team
* a client company, and a vendor
* someone junior who joins later, so I eventually experience being the senior

Use the same cast from N5 to N1. The point is that as my level rises, **the language I use with the same person changes** — and I can see it change. At N5 I say 「わかりません」to 佐藤さん. Much later I understand why 「申し訳ありません、少し確認させていただけますか」lands differently, and when each is right.

Let the relationships evolve. Register that was correct in month one becomes distant and strange in year two. Teach me that drift.

## Concepts I want to eventually understand deeply

Don't explain these now. They're the depth target.

* What is a particle actually doing? Why は vs が, at a level deeper than "topic vs subject"?
* Why is Japanese word order flexible when particles carry the roles — and what does word order still encode?
* What is the て-form structurally, and why is it everywhere?
* What is the real difference between the five keigo categories in 敬語の指針, and why did the government revise the old three-category model?
* Why does 謙譲語 apply to my own boss when I speak to a client?
* When is keigo actually *wrong* — over-politeness as a social error, 二重敬語, 慇懃無礼
* What is the honest register of Japanese workplace Slack? (It isn't textbook keigo and it isn't casual.)
* How do Japanese engineers actually write code review comments?
* Transitivity: why does 「壊れました」vs「壊しました」matter so much in an incident report?
* How does 〜てしまう encode regret, and how does that interact with apology?
* Apology gradation: すみません → 申し訳ありません → 申し訳ございません → 深くお詫び申し上げます — what each actually costs and claims
* Refusal: how "no" is delivered, and how to *hear* a no that was never said
* What is 空気を読む in concrete linguistic terms — what are the actual signals?
* Pitch accent: does it matter for me, and where specifically will ignoring it cause real misunderstanding?
* How should I learn kanji — by component, by frequency, by JLPT level, by vocabulary — and what does the evidence say?
* What is the actual difference between 音読み and 訓読み in practice, and how do I predict which a compound takes?
* Counters: how many do I truly need, and which can I fake?
* How does written Japanese differ from spoken beyond politeness — な-form, である, compressed clauses?
* What are the real N5/N4/N3/N2/N1 boundaries in vocab, kanji, and grammar counts — from evidence, not from a blog post?
* What does N1 actually certify, and what does it conspicuously fail to certify?
* Where does my English grammar actively sabotage my Japanese?
* What are the highest-frequency mistakes made specifically by English-speaking engineers in Japan?

Keep extending this list as we go.

## Train me to reason, not to remember

Do not give me passive explanations dressed as a course.

Make me predict before you tell me. Use exercises like:

* "You need to ask 佐藤さん — senior to you, same team — to review your PR today because it's blocking a release. Write it. Then I'll show you three real versions and we'll compare what each one costs you socially."
* "Here are two sentences that mean the same thing in English. One will make your team lead uncomfortable. Which, and why?"
* "You deployed a change that took the API down for 12 minutes. Write the Slack message. Now write the same event to a client. Now explain why they're structurally different, not just more polite."
* "Read this real Qiita paragraph. Before translating: what register is it in, and how do you know from the first sentence?"

Then compare: **my prediction vs. what a Japanese professional would actually produce vs. what the source data shows**.

The gap is the lesson. Do not smooth it over to make me feel better.

## Train my judgment about the language

As I improve, make me evaluate what I encounter rather than accept it. Teach me to ask:

* Is this correct, or merely comprehensible?
* Is this correct but dead — grammatically fine, nobody says it?
* Is this the right register for this relationship and channel?
* Is this natural, or is it English wearing Japanese clothes?
* Is this regional, generational, or industry-specific?
* Is this spoken-only or written-only?
* Would a Japanese colleague notice this, and would they care?
* Is my instinct here actually L1 interference?

## Help me classify what I discover

Don't let me file everything as "a rule I got wrong." Train me to distinguish:

* a genuine grammatical error
* a register mismatch (grammar fine, social cost real)
* a naturalness problem (correct, but nobody phrases it this way)
* textbook-only Japanese
* JLPT-only Japanese
* regional or generational variation
* industry or company-specific convention
* a real ambiguity in the language itself
* my own English interference
* a gap in the course we're building

Different failures need different fixes. Lumping them together makes me practise the wrong thing.

## Prioritise by real impact

When we find a gap in my Japanese, help me assess:

* how often it will come up in my actual working life
* whether failure is silent (nobody tells me) or loud
* whether it damages comprehension or damages relationships
* whether a workaround exists
* how expensive it is to fix
* whether it blocks other things I want to learn

Bias the curriculum toward high-frequency, high-social-cost, silently-failing items — those are the ones I will never self-correct.

## The app's pedagogy is also under review

Since we're building the thing that teaches me, regularly interrogate it:

* **Retention integrity** — is the scheduler actually producing recall, or just producing green checkmarks?
* **Curriculum integrity** — can I reach a lesson whose prerequisites I never learned?
* **Review integrity** — can a card enter the queue before its content was taught?
* **Register coverage** — does every core expression carry its full register ladder, or only the polite form?
* **Production vs recognition** — is the app letting me feel fluent while only ever testing recognition?
* **Streak integrity** — does the streak reward learning, or reward opening the app?
* **XP integrity** — can I farm XP without learning?
* **Honesty** — does the app's progress display match my real ability, or flatter me?
* **Failure recovery** — what happens to my data if the app crashes mid-review?
* **Scale** — does it still work at 10,000 cards and three years of history?
* **Extensibility** — could I add a second language without rewriting the core?

When something is wrong, state it as: current behaviour → what a good learning system should do → evidence → consequence for my actual retention → proposed change → where in the code it lives.

## Teaching order

Teach by prerequisite and by my demonstrated understanding, not by a fixed syllabus. My instinct for the spine:

1. app skeleton running, data model settled
2. kana, then pronunciation and pitch — before any romaji habits form
3. core sentence patterns and the copula
4. particles as a system
5. verb classes and the conjugation machine, with て-form as the hub
6. adjectives
7. **politeness axis introduced early** — much earlier than most courses, because it's my actual goal
8. transitivity pairs
9. giving and receiving
10. relative clauses and modification
11. conditionals
12. keigo proper — 尊敬 / 謙譲 / 丁重, grounded in 敬語の指針
13. business email and chat register
14. N3 → N2 grammar with professional framing throughout
15. discourse, nuance, hedging, indirection
16. reading technical and internal Japanese
17. N1 grammar, written/formal registers, 硬い表現
18. sustained sentence mining from real sources

Kanji runs as a parallel track from the start: components → frequency and JLPT-ordered 常用漢字 → always inside vocabulary, never in isolation.

**Change this order whenever the real dependency structure or my actual progress says something better.** The zone-of-proximal-development approach takes precedence over this list.

## Learning style

* I'm a developer — don't explain programming concepts to me.
* Assume I'm a near-beginner in Japanese and a *complete* beginner in Japanese workplace social norms.
* Plain language first, then the Japanese, then the rule.
* Concrete scenarios over definitions. Always.
* Diagrams and tables when relationships matter — conjugation machines, register ladders, kanji component trees.
* Short lessons with one real insight beat long chapters.
* Retrieval practice instead of re-reading.
* Revisit concepts later from different situations so they become durable.
* Use real Japanese terminology (敬語, 謙譲語, 自動詞/他動詞, ホウレンソウ) once established.
* **Correct me aggressively.** Especially register. A politeness error I'm not corrected on is one I'll repeat in front of my future team lead.
* Do not confuse "we covered it" with "I can produce it under time pressure in a meeting."

## What success looks like

This course is not finished when I've seen all the grammar points, and it's not finished when the app is built.

It's successful when I can encounter an unfamiliar Japanese professional situation and reason:

1. What is actually being communicated here, beyond the literal words?
2. What is the relationship between the speakers, and how can I tell?
3. What register is in use, and why that one?
4. What would change if the channel, the audience, or the seniority changed?
5. What am I expected to say next?
6. What are the three ways I could say it, and what does each cost?
7. Which one would a Japanese engineer at my level actually pick?
8. What did I not understand, and is that a vocabulary gap, a grammar gap, or a cultural gap?
9. How do I turn what I just missed into cards so I don't miss it again?

That's the skill. Build the app so it can teach me that, then teach me that.

## Start here

1. Establish the mission and confirm or correct my framing.
2. Assess where I actually am — kana, grammar, kanji, listening, and separately my awareness of workplace norms. Test me; don't ask me to self-report, I'll be wrong.
3. Run `bunx zerostarter init`, report what the scaffold really is, and resolve the desktop-vs-SaaS architecture question with a recommendation.
4. Curate the initial high-trust source base and tell me what you found, what's licensed how, and what you refuse to use.
5. Then teach me the single smallest foundational thing that unlocks the most of the rest — and defend why that's the right first thing.
