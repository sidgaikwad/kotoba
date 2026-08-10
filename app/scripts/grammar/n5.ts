import { P, type GrammarPoint } from './types'

/** N5 — everything needed to make a true sentence about the world. */
export const N5: GrammarPoint[] = [
  /* ---------------- unit: the copula ---------------- */
  P({
    id: 'n5-desu', level: 'N5', unit: 'Saying what things are',
    title: '〜です', formation: 'Noun + です', meaning: 'X is Y (polite)',
    explain: 'The politest way to link two nouns. です carries no meaning of its own — it marks the sentence as polite toward whoever is listening. That is Dial 1, and it is independent of everything else in the sentence.',
    examples: [
      { ja: '私はエンジニアです。', romaji: 'Watashi wa enjinia desu.', en: 'I am an engineer.', register: 'polite' },
      { ja: '田中さんは部長です。', romaji: 'Tanaka-san wa buchou desu.', en: 'Tanaka is the department head.', register: 'polite' },
    ],
    register: '丁寧語. Drops to だ in casual speech and である in documents.',
    contrast: ['n5-da'],
  }),
  P({
    id: 'n5-da', level: 'N5', unit: 'Saying what things are',
    title: '〜だ', formation: 'Noun + だ', meaning: 'X is Y (plain)',
    explain: 'The plain copula. Used with people you are close to, and in your own head. Note that written documents use である, not です — plain form is not the same thing as informal.',
    examples: [
      { ja: 'これはバグだ。', romaji: 'Kore wa bagu da.', en: "This is a bug.", register: 'casual' },
      { ja: '原因はメモリリークである。', romaji: 'Gen\'in wa memori riiku de aru.', en: 'The cause is a memory leak.', register: 'written' },
    ],
    contrast: ['n5-desu'],
  }),
  P({
    id: 'n5-janai', level: 'N5', unit: 'Saying what things are',
    title: '〜じゃない / 〜ではありません', formation: 'Noun + じゃない (casual) / ではありません (polite)',
    meaning: 'X is not Y',
    explain: 'Negating the copula. ではありません is the polite written form; じゃありません is its spoken contraction; じゃない is plain. In business writing you will see ではございません, which is the same thing one rung more humble.',
    examples: [
      { ja: 'これは仕様ではありません。', romaji: 'Kore wa shiyou dewa arimasen.', en: 'This is not the spec.', register: 'business' },
      { ja: 'バグじゃないよ。', romaji: 'Bagu janai yo.', en: "It's not a bug.", register: 'casual' },
    ],
  }),
  P({
    id: 'n5-deshita', level: 'N5', unit: 'Saying what things are',
    title: '〜でした', formation: 'Noun + でした', meaning: 'X was Y',
    explain: 'Past tense of です. Japanese marks tense on the predicate at the end of the sentence, so the last word is where you find out when something happened. This is why listening to only the first half of a Japanese sentence tells you very little.',
    examples: [
      { ja: '昨日は休みでした。', romaji: 'Kinou wa yasumi deshita.', en: 'Yesterday was a day off.', register: 'polite' },
    ],
  }),

  /* ---------------- unit: particles ---------------- */
  P({
    id: 'n5-wa', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'は', formation: 'Noun + は', meaning: 'topic marker',
    explain: 'は says "as for this thing, here is what I want to tell you". It sets what the sentence is about, and crucially implies the listener already knows what you are referring to. This is why a question word can never take は — you cannot treat an unknown as established.',
    examples: [
      { ja: '私は日本語を勉強しています。', romaji: 'Watashi wa nihongo o benkyou shite imasu.', en: 'I am studying Japanese.', register: 'polite' },
      { ja: 'このバグは直りました。', romaji: 'Kono bagu wa naorimashita.', en: 'This bug is fixed.', register: 'polite' },
    ],
    contrast: ['n5-ga'],
    register: 'Read わa. Written は, pronounced wa.',
  }),
  P({
    id: 'n5-ga', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'が', formation: 'Noun + が', meaning: 'subject marker; introduces new information',
    explain: 'が points at the thing that does the verb, and marks it as *new* — the answer to a question rather than the setting for one. 誰がやりましたか asks who did it; the answer 私がやりました means "it was me", with emphasis. Swap to 私はやりました and you get "as for me, I did it", which answers a different question.',
    examples: [
      { ja: '誰がデプロイしましたか。', romaji: 'Dare ga depuroi shimashita ka.', en: 'Who deployed?', register: 'polite' },
      { ja: '問題があります。', romaji: 'Mondai ga arimasu.', en: 'There is a problem.', register: 'polite' },
    ],
    contrast: ['n5-wa'],
  }),
  P({
    id: 'n5-wo', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'を', formation: 'Noun + を + transitive verb', meaning: 'direct object marker',
    explain: 'Marks the thing the verb acts on. Only transitive verbs take を — which means the particle itself tells you whether someone did this or it happened by itself. サーバーを落とす is you taking it down; サーバーが落ちる is it going down.',
    examples: [
      { ja: 'コードを書きます。', romaji: 'Koodo o kakimasu.', en: 'I write code.', register: 'polite' },
      { ja: 'メールを送りました。', romaji: 'Meeru o okurimashita.', en: 'I sent the email.', register: 'polite' },
    ],
    register: 'Written を, pronounced o. Used only as a particle.',
  }),
  P({
    id: 'n5-ni', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'に', formation: 'Noun + に', meaning: 'to / at / in — destination, time, recipient',
    explain: 'に fixes a point: a point in time, a destination, the person on the receiving end. If something arrives somewhere or lands on someone, に is usually involved.',
    examples: [
      { ja: '九時に会議があります。', romaji: 'Kuji ni kaigi ga arimasu.', en: 'There is a meeting at nine.', register: 'polite' },
      { ja: '佐藤さんに聞きます。', romaji: 'Satou-san ni kikimasu.', en: 'I will ask Sato.', register: 'polite' },
    ],
    contrast: ['n5-de', 'n5-e'],
  }),
  P({
    id: 'n5-de', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'で', formation: 'Noun + で', meaning: 'at (where an action happens) / by means of',
    explain: 'で marks where an action takes place, or the tool it is done with. The split with に catches everyone: に is where something *is*, で is where something *happens*. 会社にいます — I am at the office. 会社で働きます — I work at the office.',
    examples: [
      { ja: '会社で働いています。', romaji: 'Kaisha de hataraite imasu.', en: 'I work at a company.', register: 'polite' },
      { ja: '日本語で話しましょう。', romaji: 'Nihongo de hanashimashou.', en: "Let's talk in Japanese.", register: 'polite' },
    ],
    contrast: ['n5-ni'],
  }),
  P({
    id: 'n5-e', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'へ', formation: 'Noun + へ', meaning: 'toward (direction)',
    explain: 'Direction rather than destination. In practice に and へ overlap heavily for movement; へ leans slightly more "in the direction of" and appears often on envelopes and signs.',
    examples: [
      { ja: '東京へ行きます。', romaji: 'Toukyou e ikimasu.', en: 'I am going to Tokyo.', register: 'polite' },
    ],
    register: 'Written へ, pronounced e.',
    contrast: ['n5-ni'],
  }),
  P({
    id: 'n5-no', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'の', formation: 'Noun + の + Noun', meaning: "possession / of / 's",
    explain: 'Links two nouns, with the first modifying the second. Reads right to left: 会社の名前 is the company\'s name. It also stacks freely, which is how Japanese builds long noun phrases without relative clauses.',
    examples: [
      { ja: '私の会社', romaji: 'Watashi no kaisha', en: 'my company' },
      { ja: '会議の資料', romaji: 'Kaigi no shiryou', en: 'the meeting materials' },
    ],
  }),
  P({
    id: 'n5-to', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'と', formation: 'Noun + と + Noun', meaning: 'and (exhaustive) / with',
    explain: 'Joins nouns — and implies the list is complete. If there might be more, use や instead. と also means "together with" for people.',
    examples: [
      { ja: 'パソコンとマウス', romaji: 'Pasokon to mausu', en: 'a laptop and a mouse (just those two)' },
      { ja: '佐藤さんと話しました。', romaji: 'Satou-san to hanashimashita.', en: 'I spoke with Sato.', register: 'polite' },
    ],
    contrast: ['n5-ya'],
  }),
  P({
    id: 'n5-ya', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'や', formation: 'Noun + や + Noun (+ など)', meaning: 'and (non-exhaustive)',
    explain: 'A partial list — "things like these, among others". Choosing や over と quietly tells the listener you are giving examples rather than the whole set.',
    examples: [
      { ja: 'バグやパフォーマンスの問題', romaji: 'Bagu ya pafoomansu no mondai', en: 'bugs, performance issues, and so on' },
    ],
    contrast: ['n5-to'],
  }),
  P({
    id: 'n5-mo', level: 'N5', unit: 'Particles that carry the sentence',
    title: 'も', formation: 'Noun + も', meaning: 'also / too',
    explain: 'Replaces は or が rather than stacking with them. It carries a quiet "in addition to something already mentioned", so using it out of nowhere sounds like you skipped a sentence.',
    examples: [
      { ja: '私も行きます。', romaji: 'Watashi mo ikimasu.', en: 'I will go too.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-kara-made', level: 'N5', unit: 'Particles that carry the sentence',
    title: '〜から / 〜まで', formation: 'Noun + から / まで', meaning: 'from / until',
    explain: 'Endpoints in time or space. Very common in work contexts — meeting times, deadlines, scope boundaries.',
    examples: [
      { ja: '九時から五時まで働きます。', romaji: 'Kuji kara goji made hatarakimasu.', en: 'I work from nine to five.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-ka', level: 'N5', unit: 'Particles that carry the sentence',
    title: '〜か', formation: 'Sentence + か', meaning: 'question marker',
    explain: 'Turns any statement into a question without changing word order. In polite speech か does the work that rising intonation does in English. In casual speech it is usually dropped and intonation takes over.',
    examples: [
      { ja: 'もう終わりましたか。', romaji: 'Mou owarimashita ka.', en: 'Are you finished?', register: 'polite' },
    ],
  }),

  /* ---------------- unit: verbs ---------------- */
  P({
    id: 'n5-masu', level: 'N5', unit: 'Verbs: the polite present',
    title: '〜ます', formation: 'Verb stem + ます', meaning: 'polite non-past',
    explain: 'The polite form of any verb. It covers both present and future — Japanese does not distinguish them. 行きます is "I go" and "I will go"; context decides.',
    examples: [
      { ja: '毎日コードを書きます。', romaji: 'Mainichi koodo o kakimasu.', en: 'I write code every day.', register: 'polite' },
    ],
    register: '丁寧語 — Dial 1. Says nothing about who you are talking about.',
  }),
  P({
    id: 'n5-masen', level: 'N5', unit: 'Verbs: the polite present',
    title: '〜ません', formation: 'Verb stem + ません', meaning: 'polite negative',
    explain: 'Negative of ます. Note that a plain "no" is often softened further in Japanese — 分かりません is fine, but 分かりかねます is the business-register version and sounds considerably gentler.',
    examples: [
      { ja: 'まだ分かりません。', romaji: 'Mada wakarimasen.', en: "I don't know yet.", register: 'polite' },
    ],
  }),
  P({
    id: 'n5-mashita', level: 'N5', unit: 'Verbs: the polite present',
    title: '〜ました / 〜ませんでした', formation: 'Verb stem + ました / ませんでした', meaning: 'polite past / polite past negative',
    explain: 'Past tense, polite. This is the form your standup update lives in: 昨日は〜をしました.',
    examples: [
      { ja: 'レビューをお願いしました。', romaji: 'Rebyuu o onegai shimashita.', en: 'I requested a review.', register: 'business' },
    ],
  }),
  P({
    id: 'n5-verb-classes', level: 'N5', unit: 'Verbs: the polite present',
    title: 'Verb classes: 五段 / 一段 / irregular', formation: 'How a verb ends decides how it conjugates',
    meaning: 'the first branch of every conjugation',
    explain: 'Every conjugation you will ever learn starts by asking which class a verb belongs to. 一段 verbs end in -iru or -eru and just drop る. 五段 verbs change their final vowel. There are exactly two irregulars: する and 来る. Learning to spot the class costs an afternoon and saves years.',
    examples: [
      { ja: '食べる → 食べます', romaji: 'taberu → tabemasu', en: 'ichidan: drop る' },
      { ja: '作る → 作ります', romaji: 'tsukuru → tsukurimasu', en: 'godan: る → り' },
      { ja: 'する → します', romaji: 'suru → shimasu', en: 'irregular' },
    ],
  }),
  P({
    id: 'n5-te', level: 'N5', unit: 'The て-form',
    title: '〜て form', formation: 'Class-dependent: 食べて, 書いて, 話して, 行って',
    meaning: 'the connective form — links clauses and attaches dozens of endings',
    explain: 'The single most important form in Japanese. On its own it joins clauses like "and then". Attached to other words it produces requests, progressives, permission, prohibition, attempts, regret, and giving/receiving. Almost every grammar point above N5 routes through it, so the time you spend drilling it pays back permanently.',
    examples: [
      { ja: '会社に行って、コードを書きます。', romaji: 'Kaisha ni itte, koodo o kakimasu.', en: 'I go to the office and write code.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-te-iru', level: 'N5', unit: 'The て-form',
    title: '〜ている', formation: 'て-form + いる', meaning: 'ongoing action, or a resulting state',
    explain: 'Two meanings that beginners conflate. With action verbs it is "currently doing" — 書いています, I am writing. With change-of-state verbs it is the state *after* the change — 結婚しています means "is married", not "is getting married". Getting this wrong produces some memorable mistakes.',
    examples: [
      { ja: '今、レビューしています。', romaji: 'Ima, rebyuu shite imasu.', en: 'I am reviewing it now.', register: 'polite' },
      { ja: 'サーバーが落ちています。', romaji: 'Saabaa ga ochite imasu.', en: 'The server is down (and still is).', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-te-kudasai', level: 'N5', unit: 'The て-form',
    title: '〜てください', formation: 'て-form + ください', meaning: 'please do X',
    explain: 'The textbook request. Be careful with it at work: it is polite but *directive* — you are telling someone to do something. To a superior it is too blunt. The ladder above it runs 〜ていただけますか → 〜ていただけませんか → 〜ていただけないでしょうか, each one softer.',
    examples: [
      { ja: '確認してください。', romaji: 'Kakunin shite kudasai.', en: 'Please check it.', register: 'polite' },
      { ja: 'ご確認いただけますでしょうか。', romaji: 'Gokakunin itadakemasu deshou ka.', en: 'Might I ask you to check?', register: 'business' },
    ],
    register: 'Fine to peers and juniors. Too direct upward — soften it.',
  }),
  P({
    id: 'n5-te-mo-ii', level: 'N5', unit: 'The て-form',
    title: '〜てもいいです', formation: 'て-form + もいい', meaning: 'may I / it is okay to',
    explain: 'Asking or granting permission. As a question it is the standard way to check before doing something — which in a Japanese workplace you will do more often than you expect.',
    examples: [
      { ja: '先に帰ってもいいですか。', romaji: 'Saki ni kaette mo ii desu ka.', en: 'May I leave before you?', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-te-wa-ikenai', level: 'N5', unit: 'The て-form',
    title: '〜てはいけません', formation: 'て-form + はいけません', meaning: 'must not',
    explain: 'Prohibition. Strong and rule-like — signage, policies, a manager laying down a boundary. Between colleagues you would normally soften to 〜ないほうがいいです.',
    examples: [
      { ja: '本番で試してはいけません。', romaji: 'Honban de tameshite wa ikemasen.', en: 'You must not test in production.', register: 'polite' },
    ],
  }),

  /* ---------------- unit: adjectives ---------------- */
  P({
    id: 'n5-i-adj', level: 'N5', unit: 'Adjectives',
    title: 'い-adjectives', formation: 'Ends in い; conjugates by itself',
    meaning: 'descriptive words that carry their own tense',
    explain: 'い-adjectives conjugate like verbs — they hold tense and negation without help. 高い → 高くない → 高かった. This surprises English speakers, who expect adjectives to be inert.',
    examples: [
      { ja: 'このコードは読みにくいです。', romaji: 'Kono koodo wa yominikui desu.', en: 'This code is hard to read.', register: 'polite' },
      { ja: '難しくなかったです。', romaji: 'Muzukashiku nakatta desu.', en: 'It was not difficult.', register: 'polite' },
    ],
    contrast: ['n5-na-adj'],
  }),
  P({
    id: 'n5-na-adj', level: 'N5', unit: 'Adjectives',
    title: 'な-adjectives', formation: 'Takes な before a noun; uses です/だ for tense',
    meaning: 'adjectives that behave like nouns',
    explain: 'な-adjectives are grammatically nouns wearing an adjective hat. They cannot conjugate themselves, so the copula does it for them: 便利だ → 便利じゃない → 便利だった.',
    examples: [
      { ja: '便利なツールです。', romaji: 'Benri na tsuuru desu.', en: 'It is a convenient tool.', register: 'polite' },
    ],
    contrast: ['n5-i-adj'],
  }),

  /* ---------------- unit: existence, wanting, ability ---------------- */
  P({
    id: 'n5-aru-iru', level: 'N5', unit: 'Existence and having',
    title: 'あります / います', formation: 'Noun が + あります (things) / います (living)',
    meaning: 'there is / to have',
    explain: 'Japanese splits existence by animacy: います for people and animals, あります for objects and abstractions. Meetings, problems and deadlines all take あります.',
    examples: [
      { ja: '質問があります。', romaji: 'Shitsumon ga arimasu.', en: 'I have a question.', register: 'polite' },
      { ja: '佐藤さんは会議室にいます。', romaji: 'Satou-san wa kaigishitsu ni imasu.', en: 'Sato is in the meeting room.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-tai', level: 'N5', unit: 'Existence and having',
    title: '〜たい', formation: 'Verb stem + たい', meaning: 'want to do',
    explain: 'Expresses your own desire, and conjugates as an い-adjective. Important limit: you cannot use it about someone else\'s wants — for that you need 〜たがっている. Saying 部長は帰りたいです is a claim about your boss\'s inner state, which is presumptuous.',
    examples: [
      { ja: '日本で働きたいです。', romaji: 'Nihon de hatarakitai desu.', en: 'I want to work in Japan.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-suki', level: 'N5', unit: 'Existence and having',
    title: '〜が好き / 上手 / 下手', formation: 'Noun + が + 好き/上手/下手',
    meaning: 'like / good at / bad at',
    explain: 'These take が, not を, because grammatically they are adjectives describing the thing, not verbs acting on it. Note that saying you are 上手 at something about yourself sounds boastful — Japanese speakers deflect compliments here almost reflexively.',
    examples: [
      { ja: 'Go言語が好きです。', romaji: 'Go gengo ga suki desu.', en: 'I like Go.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-koto-ga-dekiru', level: 'N5', unit: 'Existence and having',
    title: '〜ことができます', formation: 'Dictionary form + ことができます', meaning: 'can do',
    explain: 'The explicit way to express ability. There is also a shorter potential form (書ける) taught at N4; this longer one is slightly more formal and very common in writing.',
    examples: [
      { ja: '日本語を読むことができます。', romaji: 'Nihongo o yomu koto ga dekimasu.', en: 'I can read Japanese.', register: 'polite' },
    ],
  }),

  /* ---------------- unit: connecting ideas ---------------- */
  P({
    id: 'n5-kara-reason', level: 'N5', unit: 'Connecting ideas',
    title: '〜から (reason)', formation: 'Plain or polite clause + から', meaning: 'because',
    explain: 'Gives a reason, with the reason first: A から B — "because A, B". English puts the reason second, which is a persistent source of scrambled sentences early on.',
    examples: [
      { ja: 'バグがあるから、リリースできません。', romaji: 'Bagu ga aru kara, ririisu dekimasen.', en: 'Because there is a bug, we cannot release.', register: 'polite' },
    ],
    contrast: ['n5-node'],
  }),
  P({
    id: 'n5-node', level: 'N5', unit: 'Connecting ideas',
    title: '〜ので', formation: 'Plain clause + ので (な after な-adj/noun)', meaning: 'because (softer)',
    explain: 'Same job as から but gentler and more objective — it presents the reason as circumstance rather than argument. In business Japanese ので is usually the safer choice, especially when the reason inconveniences someone.',
    examples: [
      { ja: '会議がありますので、後で確認します。', romaji: 'Kaigi ga arimasu node, ato de kakunin shimasu.', en: 'I have a meeting, so I will check later.', register: 'business' },
    ],
    contrast: ['n5-kara-reason'],
    register: 'Prefer ので upward. から can sound like you are justifying yourself.',
  }),
  P({
    id: 'n5-ga-but', level: 'N5', unit: 'Connecting ideas',
    title: '〜が / 〜けど (but)', formation: 'Clause + が (formal) / けど (casual)', meaning: 'but, although',
    explain: 'Contrast. Also used as a soft opener that trails off — 「すみませんが…」 — which is one of the most useful moves in Japanese: you state the situation, add が, and let the listener infer the request.',
    examples: [
      { ja: '確認しましたが、問題ありませんでした。', romaji: 'Kakunin shimashita ga, mondai arimasen deshita.', en: 'I checked, but there was no problem.', register: 'business' },
    ],
  }),
  P({
    id: 'n5-mae-ato', level: 'N5', unit: 'Connecting ideas',
    title: '〜前に / 〜てから', formation: 'Dictionary + 前に / て-form + から', meaning: 'before / after doing',
    explain: 'Sequencing. Note 前に always takes the dictionary form regardless of when it happened — the tense lives at the end of the sentence, not in the middle.',
    examples: [
      { ja: 'デプロイする前にテストします。', romaji: 'Depuroi suru mae ni tesuto shimasu.', en: 'I test before deploying.', register: 'polite' },
      { ja: 'レビューしてからマージします。', romaji: 'Rebyuu shite kara maaji shimasu.', en: 'I merge after reviewing.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-toki', level: 'N5', unit: 'Connecting ideas',
    title: '〜とき', formation: 'Plain form + とき', meaning: 'when',
    explain: 'Marks the moment something happens. The tense on the clause before とき is relative to the main verb, not to now — 日本に行くとき means "when I go / before arriving", 行ったとき means "once I had arrived".',
    examples: [
      { ja: '困ったときは聞いてください。', romaji: 'Komatta toki wa kiite kudasai.', en: 'When you are stuck, please ask.', register: 'polite' },
    ],
  }),

  /* ---------------- unit: asking and offering ---------------- */
  P({
    id: 'n5-mashou', level: 'N5', unit: 'Asking and offering',
    title: '〜ましょう / 〜ましょうか', formation: 'Verb stem + ましょう', meaning: "let's / shall I?",
    explain: 'Proposes joint action, or offers to do something. ましょうか as a question is the standard way to volunteer — 手伝いましょうか, shall I help?',
    examples: [
      { ja: '会議を始めましょう。', romaji: 'Kaigi o hajimemashou.', en: "Let's start the meeting.", register: 'polite' },
    ],
  }),
  P({
    id: 'n5-onegai', level: 'N5', unit: 'Asking and offering',
    title: '〜をお願いします', formation: 'Noun + をお願いします', meaning: 'I request X, please',
    explain: 'The workhorse request of Japanese working life. Attaches to a noun rather than a verb, which makes it enormously flexible: レビューをお願いします, 確認をお願いします. Ending an email with よろしくお願いします is near-mandatory.',
    examples: [
      { ja: 'レビューをお願いします。', romaji: 'Rebyuu o onegai shimasu.', en: 'Please review this.', register: 'business' },
    ],
    register: 'Safe in almost every direction. Learn this early and use it constantly.',
  }),
  P({
    id: 'n5-counters', level: 'N5', unit: 'Numbers and counting',
    title: 'Counters', formation: 'Number + counter suffix', meaning: 'counting requires a classifier',
    explain: 'You cannot count bare nouns. Every category has a counter: 〜つ for general things, 〜人 for people, 〜枚 for flat objects, 〜本 for long ones, 〜個 for small ones. There are dozens; you need about eight, and 〜つ covers you awkwardly but comprehensibly when you forget.',
    examples: [
      { ja: 'バグが三つあります。', romaji: 'Bagu ga mittsu arimasu.', en: 'There are three bugs.', register: 'polite' },
      { ja: '三人で作業します。', romaji: 'Sannin de sagyou shimasu.', en: 'Three of us will work on it.', register: 'polite' },
    ],
  }),
  P({
    id: 'n5-time', level: 'N5', unit: 'Numbers and counting',
    title: 'Telling time and dates', formation: '〜時 〜分 / 〜月〜日',
    meaning: 'clock and calendar',
    explain: 'Mostly regular, with irregular readings you simply have to know: 四時 is よじ not よんじ, 九時 is くじ, 一日 as a date is ついたち. Dates run largest to smallest — year, month, day — which matches how addresses and names work too.',
    examples: [
      { ja: '四時から会議です。', romaji: 'Yoji kara kaigi desu.', en: 'The meeting is from four.', register: 'polite' },
    ],
  }),
]
