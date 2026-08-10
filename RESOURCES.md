# Japanese (professional register) — Resources

Every entry is tagged **T1** (authoritative, freely usable), **T2** (high-quality free web), or **T3** (general knowledge — weakest, must be labelled in lessons).

## Knowledge — register and workplace language (the mission core)

- **T1** [敬語の指針 — 文化審議会答申, 2007-02-02 (文化庁)](https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf)
  The Japanese government's own keigo framework. Replaces the old 3-category folk model with **five**: 尊敬語 / 謙譲語Ⅰ / 謙譲語Ⅱ(丁重語) / 丁寧語 / 美化語. Chapter 3 is a Q&A on real usage disputes. **This is the spine of the register track** — when a textbook and this disagree, this wins.
- **T1** [JF Standard for Japanese-Language Education (Japan Foundation)](https://jfstandard.jpf.go.jp/)
  Can-do statements mapped to CEFR A1–C2. Use for: "what can I actually *do* at this level", which is a better progress measure than JLPT levels for this mission.
- **T2** [TokyoDev](https://www.tokyodev.com/)
  Written by and for foreign software engineers working in Japan. Use for: what Japanese is actually required in engineering roles, interview norms, contract/visa vocabulary, salary conversations.

## Knowledge — grammar and reference

- **T2** [Imabi](https://www.imabi.org/)
  The deepest free Japanese grammar reference in English; historically grounded and unusually rigorous about register and archaism. Use for: any "why is it like this" question.
- **T2** [Tofugu](https://www.tofugu.com/)
  Best free kana and kanji pedagogy explainers. Use for: learning-method questions, kana mnemonics, kanji-component approach.
- **T1** [JLPT official — level summary](https://www.jlpt.jp/e/about/levelsummary.html) and [test sections/scoring](https://www.jlpt.jp/e/guideline/testsections.html)
  Use for: what the exam actually measures. **Note: publishes no vocabulary or kanji counts.** The 出題基準 lists were withdrawn in 2010; every level word-count online is a community reconstruction.
- **T1** [常用漢字表 (MEXT/文化庁)](https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/)
  The official 2,136-character list — the actual boundary of "kanji an adult is expected to read".

## Knowledge — data we can legally ship in the app

- **T1** [JMdict / JMnedict (EDRDG)](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project) — **CC BY-SA 4.0**, commercial use permitted, attribution must be reachable in-app.
- **T1** [KANJIDIC2 (EDRDG)](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) — **CC BY-SA 4.0**. Readings, meanings, stroke counts, grade/frequency data.
- **T1** [KanjiVG](https://kanjivg.tagaini.net/) — **CC BY-SA 3.0**. Stroke-order SVG with component decomposition. Use for: the kanji-component track.
- **T1** [Tatoeba](https://tatoeba.org/en/downloads) — **CC BY 2.0 FR** (some CC0). `jpn_indices.tar.bz2` gives Japanese/English pairs from the Tanaka Corpus. Use for: example sentences we're allowed to ship.
- **T1** [NINJAL / BCCWJ frequency data](https://clrd.ninjal.ac.jp/bccwj/en/freq-list.html) — corpus frequency lists. Use for: ordering vocabulary by real frequency instead of by textbook order.
- **T2** [EDRDG licence terms](https://www.edrdg.org/edrdg/licence.html) — read before shipping; the attribution rules are specific.

## Knowledge — authentic reading

- **T2** [NHK NEWS WEB EASY](https://www3.nhk.or.jp/news/easy/) — furigana'd graded news. Use for: the first real reading that isn't textbook Japanese.
- **T2** [Qiita](https://qiita.com/) and [Zenn](https://zenn.dev/) — how Japanese engineers actually write technical prose. Use for: 仕様書 register, technical vocabulary, the だ/である style.
- **T2** [IPA 情報処理推進機構](https://www.ipa.go.jp/) — official Japanese IT terminology and security/incident vocabulary. Use for: 障害報告 language.

## Wisdom (Communities)

- [r/japanlife](https://www.reddit.com/r/japanlife/) — foreigners actually living and working in Japan. Use for: workplace norm reality-checks, "is this normal at my company", bureaucracy.
- [TokyoDev Discord](https://www.tokyodev.com/) — English-speaking developers in Japan. Use for: interview prep, which companies expect what Japanese level, salary norms.
- [r/LearnJapanese](https://www.reddit.com/r/LearnJapanese/) — large, decently moderated. Use for: method questions and grammar disputes. Treat individual answers as T3.
- [HiNative](https://hinative.com/) — native speakers answer "does this sound natural?" **This is the single best tool for the naturalness question**, which is the one I cannot answer reliably myself.
- **italki** or a similar 1:1 tutor — eventually non-optional. Register errors are silent: nobody at work will correct them, so a paid human who *will* correct them is the only reliable feedback loop for production.

## Gaps — no good source found yet

- **A corpus of real Japanese workplace Slack/chat.** This register is under-documented: it is neither textbook keigo nor casual speech, and no authoritative source describes it. Current plan: reconstruct from Qiita/Zenn comment threads, public company engineering blogs, and OSS issue threads in Japanese, and flag every claim as inferred.
- **Real 障害報告書 examples.** Public postmortems in Japanese exist (some company tech blogs) but there's no canonical template source. Need to gather 5–10 real ones.
- **Pitch accent data with a clear licence.** OJAD is excellent but licence terms need checking before anything is bundled into the app.
- **Verified code-review comment register.** Plan: mine Japanese-language OSS PR threads on GitHub for actual phrasing.
