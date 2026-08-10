import { P, type GrammarPoint } from './types'

/** N4 — the conjugation machine opens up, and you stop sounding like a textbook. */
export const N4: GrammarPoint[] = [
  /* ---------------- plain form ---------------- */
  P({
    id: 'n4-plain', level: 'N4', unit: 'Plain form and where it lives',
    title: 'Plain (dictionary) form', formation: '書く / 書かない / 書いた / 書かなかった',
    meaning: 'the unmarked verb form',
    explain: 'Plain form is the base every other structure attaches to. It is also what you speak with close colleagues — and, separately, what documents are written in. Plain is not informal; it is simply the absence of listener-directed politeness.',
    examples: [
      { ja: '明日リリースする。', romaji: 'Ashita ririisu suru.', en: 'We release tomorrow.', register: 'casual' },
      { ja: '本機能は認証を必要とする。', romaji: 'Hon kinou wa ninshou o hitsuyou to suru.', en: 'This feature requires authentication.', register: 'written' },
    ],
  }),
  P({
    id: 'n4-to-omou', level: 'N4', unit: 'Plain form and where it lives',
    title: '〜と思います', formation: 'Plain form + と思います', meaning: 'I think that',
    explain: 'Quoting your own opinion. Vital at work because Japanese business speech avoids flat assertions — hedging with と思います is not weakness, it is the default register for stating a view.',
    examples: [
      { ja: 'この設計のほうがいいと思います。', romaji: 'Kono sekkei no hou ga ii to omoimasu.', en: 'I think this design is better.', register: 'business' },
    ],
    register: 'Softening an opinion is expected. A bare assertion can read as combative.',
  }),
  P({
    id: 'n4-to-itte', level: 'N4', unit: 'Plain form and where it lives',
    title: '〜と言っていました', formation: 'Plain form + と言っていました', meaning: 'X said that',
    explain: 'Reported speech. Japanese does not shift tense inside the quote the way English does — you keep what they actually said and mark the reporting verb as past.',
    examples: [
      { ja: '佐藤さんは明日休むと言っていました。', romaji: 'Satou-san wa ashita yasumu to itte imashita.', en: 'Sato said he is off tomorrow.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-kamoshirenai', level: 'N4', unit: 'Certainty and guessing',
    title: '〜かもしれません', formation: 'Plain form + かもしれません', meaning: 'might, may',
    explain: 'Low confidence — perhaps 40%. Useful when flagging a risk you are not sure about, which is a common and welcome thing to do in an incident channel.',
    examples: [
      { ja: 'メモリリークかもしれません。', romaji: 'Memori riiku kamoshiremasen.', en: 'It might be a memory leak.', register: 'business' },
    ],
    contrast: ['n4-deshou', 'n4-hazu'],
  }),
  P({
    id: 'n4-deshou', level: 'N4', unit: 'Certainty and guessing',
    title: '〜でしょう', formation: 'Plain form + でしょう', meaning: 'probably; right?',
    explain: 'Higher confidence than かもしれません. With rising intonation it seeks agreement, which softens a statement into something collaborative.',
    examples: [
      { ja: '明日には直るでしょう。', romaji: 'Ashita ni wa naoru deshou.', en: 'It will probably be fixed by tomorrow.', register: 'polite' },
    ],
    contrast: ['n4-kamoshirenai'],
  }),
  P({
    id: 'n4-hazu', level: 'N4', unit: 'Certainty and guessing',
    title: '〜はずです', formation: 'Plain form + はずです', meaning: 'is supposed to be, should be',
    explain: 'Expectation grounded in evidence or agreement — not moral obligation. 動くはずです means "it ought to work, based on what I know", and is exactly the phrase you use right before it does not.',
    examples: [
      { ja: 'テストは通るはずです。', romaji: 'Tesuto wa tooru hazu desu.', en: 'The tests should pass.', register: 'business' },
    ],
    contrast: ['n4-kamoshirenai'],
  }),
  P({
    id: 'n4-souda-appear', level: 'N4', unit: 'Certainty and guessing',
    title: '〜そうです (looks like)', formation: 'Verb stem / adj stem + そう', meaning: 'appears, seems',
    explain: 'Judgement from appearance. Distinct from the hearsay そうです which attaches to the plain form — 難しそう means "looks hard", 難しいそう means "I hear it is hard". One kana of difference, completely different claim.',
    examples: [
      { ja: '間に合いそうです。', romaji: 'Ma ni aisou desu.', en: 'It looks like we will make it.', register: 'business' },
    ],
    contrast: ['n4-souda-hearsay'],
  }),
  P({
    id: 'n4-souda-hearsay', level: 'N4', unit: 'Certainty and guessing',
    title: '〜そうです (I hear)', formation: 'Plain form + そうです', meaning: 'I hear that, apparently',
    explain: 'Hearsay. Marks the information as second-hand, which protects you from owning a claim you cannot verify — a genuinely useful move when relaying something.',
    examples: [
      { ja: '来月リリースだそうです。', romaji: 'Raigetsu ririisu da sou desu.', en: 'Apparently the release is next month.', register: 'business' },
    ],
    contrast: ['n4-souda-appear'],
  }),
  P({
    id: 'n4-you-da', level: 'N4', unit: 'Certainty and guessing',
    title: '〜ようです / 〜みたいです', formation: 'Plain form + ようです / みたいです', meaning: 'it seems',
    explain: 'Inference from your own observation. ようです is the written and formal option; みたいです is its spoken counterpart and appears constantly in chat.',
    examples: [
      { ja: '設定が反映されていないようです。', romaji: 'Settei ga han\'ei sarete inai you desu.', en: 'It seems the config has not been applied.', register: 'business' },
    ],
  }),

  /* ---------------- potential, volitional ---------------- */
  P({
    id: 'n4-potential', level: 'N4', unit: 'Ability and intention',
    title: 'Potential form', formation: '書く→書ける, 食べる→食べられる, する→できる',
    meaning: 'can do',
    explain: 'The compact way to say you can do something. Note the object particle usually shifts from を to が: 日本語が話せます. In casual speech ichidan potentials drop the ら — 食べれる — which is extremely common and still considered nonstandard in writing.',
    examples: [
      { ja: '日本語が話せます。', romaji: 'Nihongo ga hanasemasu.', en: 'I can speak Japanese.', register: 'polite' },
    ],
  }),
  P({
    id: 'n4-volitional', level: 'N4', unit: 'Ability and intention',
    title: 'Volitional 〜よう / 〜おう', formation: '行く→行こう, 食べる→食べよう',
    meaning: "let's; I think I'll",
    explain: 'The plain equivalent of ましょう. Combined with と思う it expresses intention: 〜ようと思います, "I intend to".',
    examples: [
      { ja: '今日はここまでにしよう。', romaji: 'Kyou wa koko made ni shiyou.', en: "Let's stop here for today.", register: 'casual' },
    ],
  }),
  P({
    id: 'n4-tsumori', level: 'N4', unit: 'Ability and intention',
    title: '〜つもりです', formation: 'Plain form + つもりです', meaning: 'I intend to',
    explain: 'A settled plan. Stronger than 〜たい (want) and more personal than 〜予定 (scheduled).',
    examples: [
      { ja: '来年、日本に行くつもりです。', romaji: 'Rainen, nihon ni iku tsumori desu.', en: 'I intend to go to Japan next year.', register: 'polite' },
    ],
  }),
  P({
    id: 'n4-yotei', level: 'N4', unit: 'Ability and intention',
    title: '〜予定です', formation: 'Plain form / Noun の + 予定です', meaning: 'is scheduled to',
    explain: 'An arrangement that exists independently of your wishes — the calendar says so. This is the register for reporting plans at work.',
    examples: [
      { ja: '金曜日にリリースする予定です。', romaji: 'Kin\'youbi ni ririisu suru yotei desu.', en: 'We are scheduled to release on Friday.', register: 'business' },
    ],
  }),

  /* ---------------- giving and receiving ---------------- */
  P({
    id: 'n4-ageru', level: 'N4', unit: 'Giving and receiving',
    title: 'あげる / くれる / もらう', formation: 'Noun を + あげる/くれる/もらう',
    meaning: 'give outward / give inward / receive',
    explain: 'Japanese tracks the direction of a favour. あげる is me→you, くれる is you→me, もらう is me receiving. The choice encodes who benefited, and getting it backwards makes a sentence genuinely hard to parse. This is also the hidden prerequisite for keigo: いただく and くださる are just the humble and honorific versions of these.',
    examples: [
      { ja: '佐藤さんが手伝ってくれました。', romaji: 'Satou-san ga tetsudatte kuremashita.', en: 'Sato helped me (and I am grateful).', register: 'polite' },
      { ja: '佐藤さんに手伝ってもらいました。', romaji: 'Satou-san ni tetsudatte moraimashita.', en: 'I had Sato help me.', register: 'polite' },
    ],
    register: 'Omitting these where a favour occurred sounds cold. Japanese expects the gratitude to be grammatically visible.',
  }),
  P({
    id: 'n4-te-ageru', level: 'N4', unit: 'Giving and receiving',
    title: '〜てあげる / 〜てくれる / 〜てもらう', formation: 'て-form + あげる/くれる/もらう',
    meaning: 'do something as a favour',
    explain: 'The same directionality applied to actions rather than objects. Caution with 〜てあげる toward superiors: announcing that you will do them a favour is presumptuous. Use 〜ましょうか to offer instead.',
    examples: [
      { ja: 'レビューしてもらえますか。', romaji: 'Rebyuu shite moraemasu ka.', en: 'Could I get you to review this?', register: 'business' },
    ],
    contrast: ['n4-ageru'],
  }),

  /* ---------------- conditionals ---------------- */
  P({
    id: 'n4-tara', level: 'N4', unit: 'Conditionals',
    title: '〜たら', formation: 'た-form + ら', meaning: 'if / when (once X happens)',
    explain: 'The most flexible conditional and the safest default. Works for hypotheticals and for "once this happens". If you only learn one conditional, learn this one.',
    examples: [
      { ja: 'テストが通ったらマージします。', romaji: 'Tesuto ga tootara maaji shimasu.', en: 'Once the tests pass, I will merge.', register: 'business' },
    ],
    contrast: ['n4-ba', 'n4-to-cond', 'n4-nara'],
  }),
  P({
    id: 'n4-ba', level: 'N4', unit: 'Conditionals',
    title: '〜ば', formation: '書く→書けば, 食べる→食べれば', meaning: 'if (general condition)',
    explain: 'A more general, slightly more formal conditional, common in written Japanese and in set expressions like 〜ばいい ("you should just…"). Cannot normally be used when the main clause is a request or command.',
    examples: [
      { ja: 'ログを見れば分かります。', romaji: 'Rogu o mireba wakarimasu.', en: 'If you look at the logs you will see.', register: 'business' },
    ],
    contrast: ['n4-tara'],
  }),
  P({
    id: 'n4-to-cond', level: 'N4', unit: 'Conditionals',
    title: '〜と (conditional)', formation: 'Dictionary form + と', meaning: 'whenever X, inevitably Y',
    explain: 'Automatic consequence — natural law, machine behaviour, instructions. Because the result is presented as inevitable, you cannot follow it with a request or intention.',
    examples: [
      { ja: 'このボタンを押すと、再起動します。', romaji: 'Kono botan o osu to, saikidou shimasu.', en: 'If you press this button, it restarts.', register: 'business' },
    ],
    contrast: ['n4-tara'],
  }),
  P({
    id: 'n4-nara', level: 'N4', unit: 'Conditionals',
    title: '〜なら', formation: 'Noun / plain form + なら', meaning: 'if it is the case that',
    explain: 'Picks up something the other person just said and responds to it. 東京に行くなら — "if (as you say) you are going to Tokyo, then…". It is conversational, and using it correctly makes you sound markedly more natural.',
    examples: [
      { ja: 'レビューが必要なら、言ってください。', romaji: 'Rebyuu ga hitsuyou nara, itte kudasai.', en: 'If you need a review, tell me.', register: 'business' },
    ],
    contrast: ['n4-tara'],
  }),

  /* ---------------- obligation, advice ---------------- */
  P({
    id: 'n4-nakereba', level: 'N4', unit: 'Obligation and advice',
    title: '〜なければなりません', formation: 'ない-form − い + ければなりません', meaning: 'must',
    explain: 'Formal obligation. Spoken Japanese usually contracts it: 〜なきゃ or 〜ないと. The long form appears in writing and in careful speech.',
    examples: [
      { ja: '今日中に対応しなければなりません。', romaji: 'Kyoujuu ni taiou shinakereba narimasen.', en: 'We have to handle it today.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-nakute-mo-ii', level: 'N4', unit: 'Obligation and advice',
    title: '〜なくてもいいです', formation: 'ない-form − い + くてもいい', meaning: 'do not have to',
    explain: 'Releases someone from an obligation. A kind thing to be able to say to a stressed colleague.',
    examples: [
      { ja: '今日はやらなくてもいいです。', romaji: 'Kyou wa yaranakute mo ii desu.', en: 'You do not have to do it today.', register: 'polite' },
    ],
  }),
  P({
    id: 'n4-hou-ga-ii', level: 'N4', unit: 'Obligation and advice',
    title: '〜ほうがいいです', formation: 'た-form / ない-form + ほうがいい', meaning: 'had better',
    explain: 'Advice. Note it usually takes the past form for the positive — 見たほうがいい, not 見るほうがいい. Softer than an obligation and the normal way to suggest a change in a code review.',
    examples: [
      { ja: 'ログを確認したほうがいいです。', romaji: 'Rogu o kakunin shita hou ga ii desu.', en: 'You had better check the logs.', register: 'business' },
    ],
  }),

  /* ---------------- passive, causative, transitivity ---------------- */
  P({
    id: 'n4-passive', level: 'N4', unit: 'Passive and causative',
    title: 'Passive 〜られる', formation: '書く→書かれる, 食べる→食べられる', meaning: 'to be done to',
    explain: 'Two uses. The neutral one describes an action without naming the doer, which is everywhere in technical writing. The other is the "suffering passive", where the subject is adversely affected — 雨に降られた, "I got rained on". English has no equivalent and it takes a while to hear.',
    examples: [
      { ja: 'この機能は来月リリースされます。', romaji: 'Kono kinou wa raigetsu ririisu saremasu.', en: 'This feature will be released next month.', register: 'business' },
    ],
    contrast: ['n4-causative', 'n5-te-iru'],
  }),
  P({
    id: 'n4-causative', level: 'N4', unit: 'Passive and causative',
    title: 'Causative 〜させる', formation: '書く→書かせる, 食べる→食べさせる', meaning: 'make or let someone do',
    explain: 'Ambiguous between forcing and permitting — context decides. Combined with もらう it becomes the extremely common business request 〜させていただきます, literally "I humbly receive permission to do", used to announce your own action politely.',
    examples: [
      { ja: '確認させていただきます。', romaji: 'Kakunin sasete itadakimasu.', en: 'Allow me to check.', register: 'business' },
    ],
    contrast: ['n4-passive'],
  }),
  P({
    id: 'n4-transitivity', level: 'N4', unit: 'Passive and causative',
    title: 'Transitive / intransitive pairs', formation: '落ちる↔落とす, 始まる↔始める, 直る↔直す',
    meaning: 'did it happen, or did someone do it',
    explain: 'Japanese has hundreds of these verb pairs, and the choice assigns responsibility. In an incident report the difference between サーバーが落ちました and サーバーを落としました is the difference between a fault and a confession. Learn them in pairs, never singly.',
    examples: [
      { ja: 'ビルドが直りました。', romaji: 'Birudo ga naorimashita.', en: 'The build got fixed.', register: 'business' },
      { ja: 'ビルドを直しました。', romaji: 'Birudo o naoshimashita.', en: 'I fixed the build.', register: 'business' },
    ],
    register: 'Choosing the intransitive to dodge blame is transparent. Choose accurately.',
  }),

  /* ---------------- modification ---------------- */
  P({
    id: 'n4-relative', level: 'N4', unit: 'Building longer sentences',
    title: 'Relative clauses', formation: 'Plain clause + Noun', meaning: 'the X that does Y',
    explain: 'Japanese modifies nouns by putting an entire clause in front of them, with no relative pronoun at all. 昨日書いたコード — "the code I wrote yesterday". Once this clicks, sentence length stops being frightening: you read backwards from the noun.',
    examples: [
      { ja: '昨日デプロイした機能にバグがあります。', romaji: 'Kinou depuroi shita kinou ni bagu ga arimasu.', en: 'There is a bug in the feature we deployed yesterday.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-noni-although', level: 'N4', unit: 'Building longer sentences',
    title: '〜のに', formation: 'Plain form + のに', meaning: 'even though (with frustration)',
    explain: 'Concessive, and it carries emotion — disappointment or complaint. Neutral "although" is 〜が or 〜けれども; のに tells the listener you are unhappy about it.',
    examples: [
      { ja: 'テストしたのに、本番で落ちました。', romaji: 'Tesuto shita noni, honban de ochimashita.', en: 'Even though we tested it, it fell over in production.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-shi', level: 'N4', unit: 'Building longer sentences',
    title: '〜し', formation: 'Plain form + し', meaning: 'and what is more (listing reasons)',
    explain: 'Stacks reasons, implying there are others you have not listed. Very common when justifying a decision without sounding like you are arguing.',
    examples: [
      { ja: '時間もないし、リスクも高いです。', romaji: 'Jikan mo nai shi, risuku mo takai desu.', en: 'There is no time, and the risk is high.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-te-oku', level: 'N4', unit: 'て-form extensions',
    title: '〜ておく', formation: 'て-form + おく', meaning: 'do in advance, leave done',
    explain: 'Preparation. Contracts to 〜とく in speech. Extremely common at work: 資料を用意しておきます, "I will have the materials ready beforehand".',
    examples: [
      { ja: '資料を準備しておきます。', romaji: 'Shiryou o junbi shite okimasu.', en: 'I will prepare the materials in advance.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-te-shimau', level: 'N4', unit: 'て-form extensions',
    title: '〜てしまう', formation: 'て-form + しまう', meaning: 'complete fully; do regrettably',
    explain: 'Either "finish off" or "did it, unfortunately". The regret reading is what makes it central to apologising: 消してしまいました is "I deleted it (and I wish I had not)". Contracts to 〜ちゃう casually.',
    examples: [
      { ja: '間違えて消してしまいました。', romaji: 'Machigaete keshite shimaimashita.', en: 'I deleted it by mistake.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-te-miru', level: 'N4', unit: 'て-form extensions',
    title: '〜てみる', formation: 'て-form + みる', meaning: 'try doing and see',
    explain: 'Attempting something to find out what happens — not trying *hard*, which is 〜ようとする. Softens a proposal nicely: 試してみます sounds exploratory rather than committed.',
    examples: [
      { ja: 'キャッシュを消してみます。', romaji: 'Kyasshu o keshite mimasu.', en: 'I will try clearing the cache.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-te-iku-kuru', level: 'N4', unit: 'て-form extensions',
    title: '〜ていく / 〜てくる', formation: 'て-form + いく / くる', meaning: 'change over time, moving away or toward',
    explain: 'Direction in time or space relative to you. 増えてきた — it has been increasing up to now. 増えていく — it will go on increasing from here.',
    examples: [
      { ja: 'エラーが増えてきました。', romaji: 'Eraa ga fuete kimashita.', en: 'Errors have been increasing.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-sugiru', level: 'N4', unit: 'Degree and comparison',
    title: '〜すぎる', formation: 'Verb stem / adj stem + すぎる', meaning: 'too much',
    explain: 'Excess, and always negative in flavour. 大きすぎる is a complaint, not a measurement.',
    examples: [
      { ja: 'このPRは大きすぎます。', romaji: 'Kono PR wa ookisugimasu.', en: 'This PR is too large.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-yasui-nikui', level: 'N4', unit: 'Degree and comparison',
    title: '〜やすい / 〜にくい', formation: 'Verb stem + やすい / にくい', meaning: 'easy to / hard to',
    explain: 'Describes a property of the thing, not the person. 読みにくいコード is code that is hard to read — a much less personal criticism than saying the author wrote it badly, which is why it is the polite way to raise this in review.',
    examples: [
      { ja: 'この関数は読みにくいです。', romaji: 'Kono kansuu wa yominikui desu.', en: 'This function is hard to read.', register: 'business' },
    ],
    register: 'Criticising the artefact rather than the person is the norm in Japanese code review.',
  }),
  P({
    id: 'n4-yori-hou', level: 'N4', unit: 'Degree and comparison',
    title: '〜より / 〜のほうが', formation: 'A より B のほうが + adjective', meaning: 'B is more X than A',
    explain: 'Comparison. Japanese states the loser first with より, then the winner with のほうが.',
    examples: [
      { ja: 'こちらのほうが速いです。', romaji: 'Kochira no hou ga hayai desu.', en: 'This one is faster.', register: 'business' },
    ],
  }),
  P({
    id: 'n4-ichiban', level: 'N4', unit: 'Degree and comparison',
    title: '〜で一番', formation: 'Group + で一番 + adjective', meaning: 'the most X in',
    explain: 'Superlative. で marks the field of comparison.',
    examples: [
      { ja: 'チームで一番経験があります。', romaji: 'Chiimu de ichiban keiken ga arimasu.', en: 'They have the most experience on the team.', register: 'polite' },
    ],
  }),
  P({
    id: 'n4-keigo-intro', level: 'N4', unit: 'First contact with keigo',
    title: 'お〜になる / お〜する', formation: 'お + verb stem + になる (honorific) / する (humble)',
    meaning: 'the regular honorific and humble patterns',
    explain: 'Most verbs without a special keigo form use these two templates. お待ちになる raises them; お待ちする lowers you. Recognising the template means you stop needing to memorise keigo verb by verb.',
    examples: [
      { ja: '少々お待ちください。', romaji: 'Shoushou omachi kudasai.', en: 'Please wait a moment.', register: 'business' },
      { ja: '資料をお送りします。', romaji: 'Shiryou o ookuri shimasu.', en: 'I will send the materials.', register: 'business' },
    ],
    register: 'Do not apply お〜になる to your own actions — that elevates yourself.',
  }),
]
