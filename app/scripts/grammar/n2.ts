import { P, type GrammarPoint } from './types'

/** N2 — written and formal Japanese, and the nuance that separates near-synonyms. */
export const N2: GrammarPoint[] = [
  P({ id: 'n2-wake-da', level: 'N2', unit: 'Explaining and concluding',
    title: '〜わけだ', formation: 'Plain form + わけだ', meaning: 'that means, no wonder',
    explain: 'Draws a logical conclusion from what was just established. 「なるほど、それでエラーが出るわけですね」— ah, so that is why the error appears.',
    examples: [{ ja: 'つまり、設定が反映されていないわけですね。', romaji: 'Tsumari, settei ga han\'ei sarete inai wake desu ne.', en: 'So that means the config was not applied.', register: 'business' }] }),

  P({ id: 'n2-wake-de-wa-nai', level: 'N2', unit: 'Explaining and concluding',
    title: '〜わけではない', formation: 'Plain form + わけではない', meaning: 'it is not that; not necessarily',
    explain: 'Partial denial — correcting an over-reading without contradicting outright. Very useful for disagreeing gently.',
    examples: [{ ja: '反対しているわけではありません。', romaji: 'Hantai shite iru wake dewa arimasen.', en: 'It is not that I am opposed.', register: 'business' }] }),

  P({ id: 'n2-mono-da', level: 'N2', unit: 'Explaining and concluding',
    title: '〜ものだ', formation: 'Plain form + ものだ', meaning: 'that is how it is; used to',
    explain: 'States a general truth or reminisces. Can also carry mild reproach: 挨拶はするものだ — one *ought* to greet people.',
    examples: [{ ja: '最初は誰でも間違えるものです。', romaji: 'Saisho wa dare demo machigaeru mono desu.', en: 'Everyone makes mistakes at first.', register: 'business' }] }),

  P({ id: 'n2-toiu', level: 'N2', unit: 'Explaining and concluding',
    title: '〜という', formation: 'Clause / Noun + という + Noun', meaning: 'called; the fact that',
    explain: 'Names or packages a clause into a noun phrase. Ubiquitous in written Japanese; learning to skim past it speeds up reading enormously.',
    examples: [{ ja: '再現しないという報告があります。', romaji: 'Saigen shinai to iu houkoku ga arimasu.', en: 'There is a report that it does not reproduce.', register: 'written' }] }),

  P({ id: 'n2-ni-kanshite', level: 'N2', unit: 'Formal written register',
    title: '〜に基づいて / 〜に応じて', formation: 'Noun + に基づいて / に応じて', meaning: 'based on / in accordance with',
    explain: 'Specification language. You will meet both in any 仕様書.',
    examples: [{ ja: '仕様に基づいて実装します。', romaji: 'Shiyou ni motozuite jissou shimasu.', en: 'We implement based on the spec.', register: 'written' }] }),

  P({ id: 'n2-ni-wataru', level: 'N2', unit: 'Formal written register',
    title: '〜にわたって / 〜を通じて', formation: 'Noun + にわたって / を通じて', meaning: 'spanning / throughout, via',
    explain: 'Extent across time, space, or channel.',
    examples: [{ ja: '三時間にわたって障害が発生しました。', romaji: 'Sanjikan ni watatte shougai ga hassei shimashita.', en: 'An outage occurred over three hours.', register: 'business' }] }),

  P({ id: 'n2-wo-megutte', level: 'N2', unit: 'Formal written register',
    title: '〜をめぐって / 〜をもとに', formation: 'Noun + をめぐって / をもとに', meaning: 'concerning (disputed) / on the basis of',
    explain: 'をめぐって implies contention around a topic; をもとに means built from source material.',
    examples: [{ ja: 'ログをもとに原因を特定しました。', romaji: 'Rogu o moto ni gen\'in o tokutei shimashita.', en: 'We identified the cause based on the logs.', register: 'business' }] }),

  P({ id: 'n2-kagiri', level: 'N2', unit: 'Limits and extents',
    title: '〜限り', formation: 'Plain form + 限り', meaning: 'as far as; as long as',
    explain: '知る限り — as far as I know. Very useful for scoping a claim you cannot fully guarantee, which in engineering you frequently cannot.',
    examples: [{ ja: '私が知る限り、影響はありません。', romaji: 'Watashi ga shiru kagiri, eikyou wa arimasen.', en: 'As far as I know, there is no impact.', register: 'business' }] }),

  P({ id: 'n2-ue-de', level: 'N2', unit: 'Limits and extents',
    title: '〜上で', formation: 'た-form / Noun の + 上で', meaning: 'after doing; in terms of',
    explain: 'Sequencing with deliberation — having done A properly, then B. Common in approval flows.',
    examples: [{ ja: '検証した上で、リリースします。', romaji: 'Kenshou shita ue de, ririisu shimasu.', en: 'We will release after verifying.', register: 'business' }] }),

  P({ id: 'n2-dake-ni', level: 'N2', unit: 'Limits and extents',
    title: '〜だけに / 〜だけあって', formation: 'Plain form + だけに / だけあって', meaning: 'precisely because; as expected of',
    explain: 'Causal with a note of "which fits". だけあって is complimentary.',
    examples: [{ ja: '経験があるだけあって、対応が早いです。', romaji: 'Keiken ga aru dake atte, taiou ga hayai desu.', en: 'As you would expect from their experience, they respond fast.', register: 'business' }] }),

  P({ id: 'n2-hodo', level: 'N2', unit: 'Degree',
    title: '〜ほど / 〜ば〜ほど', formation: 'Plain form + ほど', meaning: 'to the extent that; the more… the more',
    explain: 'Proportional relationships. 早ければ早いほどいい — the sooner the better.',
    examples: [{ ja: '早ければ早いほど助かります。', romaji: 'Hayakereba hayai hodo tasukarimasu.', en: 'The sooner the better.', register: 'business' }] }),

  P({ id: 'n2-kaneru', level: 'N2', unit: 'Business softening',
    title: '〜かねる / 〜かねない', formation: 'Verb stem + かねる / かねない', meaning: 'cannot (politely) / might well (badly)',
    explain: 'かねます is the business register\'s way of refusing without saying no — 分かりかねます is far softer than 分かりません. かねない warns of a bad possibility.',
    examples: [{ ja: 'その件については分かりかねます。', romaji: 'Sono ken ni tsuite wa wakarikanemasu.', en: 'I am not able to say on that matter.', register: 'business' }],
    register: 'The standard corporate refusal. Recognising it as "no" is essential.' }),

  P({ id: 'n2-zaru-o-enai', level: 'N2', unit: 'Business softening',
    title: '〜ざるを得ない', formation: 'ない-stem + ざるを得ない', meaning: 'have no choice but to',
    explain: 'Reluctant necessity. Signals that the decision was forced, which softens delivering bad news.',
    examples: [{ ja: 'リリースを延期せざるを得ません。', romaji: 'Ririisu o enki sezaru o emasen.', en: 'We have no choice but to postpone the release.', register: 'business' }] }),

  P({ id: 'n2-ni-suginai', level: 'N2', unit: 'Business softening',
    title: '〜にすぎない / 〜にほかならない', formation: 'Plain form + にすぎない / にほかならない', meaning: 'is merely / is nothing other than',
    explain: 'Downplaying or emphasising. にすぎない minimises; にほかならない insists.',
    examples: [{ ja: '暫定対応にすぎません。', romaji: 'Zantei taiou ni sugimasen.', en: 'It is only a stopgap fix.', register: 'business' }] }),

  P({ id: 'n2-you-ga-nai', level: 'N2', unit: 'Business softening',
    title: '〜ようがない', formation: 'Verb stem + ようがない', meaning: 'there is no way to',
    explain: 'Impossibility for lack of means, not lack of ability.',
    examples: [{ ja: 'ログがないので、調べようがありません。', romaji: 'Rogu ga nai node, shirabeyou ga arimasen.', en: 'Without logs there is no way to investigate.', register: 'business' }] }),

  P({ id: 'n2-mono-no', level: 'N2', unit: 'Concession, formal',
    title: '〜ものの / 〜とはいえ', formation: 'Plain form + ものの / とはいえ', meaning: 'although, that said',
    explain: 'Formal concession for writing. とはいえ can open a sentence, which makes it handy in reports.',
    examples: [{ ja: '修正したものの、根本原因は不明です。', romaji: 'Shuusei shita mono no, konpon gen\'in wa fumei desu.', en: 'We fixed it, though the root cause is unknown.', register: 'written' }] }),

  P({ id: 'n2-nimokakawarazu', level: 'N2', unit: 'Concession, formal',
    title: '〜にもかかわらず', formation: 'Plain form / Noun + にもかかわらず', meaning: 'despite',
    explain: 'Strong formal concession. Also appears as a set courtesy: ご多忙にもかかわらず, "despite your busy schedule".',
    examples: [{ ja: 'ご多忙にもかかわらず、ありがとうございます。', romaji: 'Gotabou ni mo kakawarazu, arigatou gozaimasu.', en: 'Thank you despite your busy schedule.', register: 'business' }] }),

  P({ id: 'n2-tokoro-ga', level: 'N2', unit: 'Concession, formal',
    title: '〜どころか', formation: 'Plain form / Noun + どころか', meaning: 'far from; let alone',
    explain: 'Contradicts an expectation in the stronger direction.',
    examples: [{ ja: '改善するどころか、悪化しました。', romaji: 'Kaizen suru dokoro ka, akka shimashita.', en: 'Far from improving, it got worse.', register: 'business' }] }),

  P({ id: 'n2-shidai', level: 'N2', unit: 'Timing, formal',
    title: '〜次第', formation: 'Verb stem + 次第 / Noun + 次第', meaning: 'as soon as; depending on',
    explain: 'Business standard for "the moment X happens, I will…". 分かり次第ご連絡します is a phrase you will use weekly.',
    examples: [{ ja: '分かり次第、ご連絡いたします。', romaji: 'Wakari shidai, gorenraku itashimasu.', en: 'I will contact you as soon as I know.', register: 'business' }] }),

  P({ id: 'n2-ka-to-omou-to', level: 'N2', unit: 'Timing, formal',
    title: '〜たとたん / 〜か〜ないかのうちに', formation: 'た-form + とたん', meaning: 'the instant that',
    explain: 'Immediate and often surprising succession.',
    examples: [{ ja: 'デプロイしたとたん、アラートが鳴りました。', romaji: 'Depuroi shita totan, araato ga narimashita.', en: 'The instant we deployed, the alerts fired.', register: 'business' }] }),

  P({ id: 'n2-ppanashi', level: 'N2', unit: 'States and habits',
    title: '〜っぱなし', formation: 'Verb stem + っぱなし', meaning: 'left in a state, kept doing',
    explain: 'Usually critical — something left as it was when it should not have been.',
    examples: [{ ja: 'ログが出っぱなしです。', romaji: 'Rogu ga deppanashi desu.', en: 'The logs are just spewing continuously.', register: 'casual' }] }),

  P({ id: 'n2-gachi', level: 'N2', unit: 'States and habits',
    title: '〜がち / 〜ぎみ', formation: 'Verb stem / Noun + がち / ぎみ', meaning: 'tends to / slightly',
    explain: 'がち is a negative tendency; ぎみ is a mild degree of something.',
    examples: [{ ja: '最近、遅れぎみです。', romaji: 'Saikin, okuregimi desu.', en: 'We have been running slightly behind lately.', register: 'business' }] }),

  P({ id: 'n2-mama', level: 'N2', unit: 'States and habits',
    title: '〜まま', formation: 'た-form / Noun の + まま', meaning: 'as it is, unchanged',
    explain: 'A state persisting when you might expect it to change.',
    examples: [{ ja: '古い設定のままでした。', romaji: 'Furui settei no mama deshita.', en: 'It was left on the old configuration.', register: 'business' }] }),

  P({ id: 'n2-keigo-uchi-soto', level: 'N2', unit: 'Keigo in practice',
    title: '内/外 and the referent flip', formation: 'Drop titles and honorifics for your own side',
    meaning: 'who counts as "mine" changes per conversation',
    explain: 'Speaking to a client, your entire company becomes 内 — your own department head loses his title and takes humble verbs. This is the single most counter-intuitive rule in business Japanese for English speakers.',
    examples: [{ ja: '田中はただいま外出しております。', romaji: 'Tanaka wa tadaima gaishutsu shite orimasu.', en: 'Tanaka is out at the moment. (to a client)', register: 'business' }],
    contrast: ['n3-keigo-sonkeigo'] }),

  P({ id: 'n2-nijuu-keigo', level: 'N2', unit: 'Keigo in practice',
    title: '二重敬語', formation: 'Two honorific mechanisms on one verb',
    meaning: 'over-politeness as an error',
    explain: 'おっしゃられる stacks おっしゃる with -られる. 敬語の指針 names this as something to avoid, though native speakers do it daily. More politeness is not safer.',
    examples: [{ ja: '部長がおっしゃいました。', romaji: 'Buchou ga osshaimashita.', en: 'The department head said so. (correct)', register: 'business' }] }),

  P({ id: 'n2-bikago', level: 'N2', unit: 'Keigo in practice',
    title: '美化語', formation: 'お / ご + noun', meaning: 'beautification',
    explain: 'The fifth keigo category. お茶, お酒, ご飯 dress up the word without respecting anyone in particular. Native ど words take お, Sino-Japanese words usually take ご — お名前 but ご住所.',
    examples: [{ ja: 'お名前とご住所をお願いします。', romaji: 'Onamae to gojuusho o onegai shimasu.', en: 'Your name and address, please.', register: 'business' }] }),

  P({ id: 'n2-email-open', level: 'N2', unit: 'Business email',
    title: 'Email openings and closings', formation: 'いつもお世話になっております / よろしくお願いいたします',
    meaning: 'the fixed frame of a business email',
    explain: 'Japanese business email has a near-mandatory skeleton: greeting, self-identification, the matter, the request, closing. Omitting お世話になっております reads as brusque even from a foreigner.',
    examples: [{ ja: 'いつもお世話になっております。ミナトの田中です。', romaji: 'Itsumo osewa ni natte orimasu. Minato no Tanaka desu.', en: 'Thank you as always. This is Tanaka from Minato.', register: 'business' }] }),

  P({ id: 'n2-shougai-houkoku', level: 'N2', unit: 'Business email',
    title: 'Incident report structure', formation: '発生日時 / 影響範囲 / 原因 / 対応 / 再発防止策',
    meaning: 'the expected shape of a 障害報告',
    explain: 'A Japanese incident report follows a fixed skeleton: when, who was affected, cause, what was done, and how it will be prevented. 再発防止策 is the section foreigners forget and Japanese managers look for first.',
    examples: [{ ja: '再発防止策として、監視を追加いたします。', romaji: 'Saihatsu boushi saku to shite, kanshi o tsuika itashimasu.', en: 'As a preventive measure, we will add monitoring.', register: 'business' }] }),

  P({ id: 'n2-apology-ladder', level: 'N2', unit: 'Business email',
    title: 'The apology ladder', formation: 'すみません → 申し訳ありません → 申し訳ございません → 深くお詫び申し上げます',
    meaning: 'apology is graded and overshooting is an error',
    explain: 'Match severity to the event. Three minutes late is すみません. Taking production down for an hour is 申し訳ございません. 深くお詫び申し上げます is for something that reached customers. Over-apologising spends credibility and makes people wonder what you actually did.',
    examples: [{ ja: 'ご迷惑をおかけし、申し訳ございません。', romaji: 'Gomeiwaku o okake shi, moushiwake gozaimasen.', en: 'I sincerely apologise for the trouble caused.', register: 'business' }] }),
]
