import { P, type GrammarPoint } from './types'

/** N3 — the level where you stop translating and start expressing nuance. */
export const N3: GrammarPoint[] = [
  P({ id: 'n3-tokorodesu', level: 'N3', unit: 'Precise timing',
    title: '〜ところです', formation: 'Dictionary/ている/た + ところ', meaning: 'just about to / in the middle of / just did',
    explain: 'Pins an action to a precise moment. 見るところ — about to look. 見ているところ — looking right now. 見たところ — just finished. Extremely useful for status updates.',
    examples: [{ ja: '今、調べているところです。', romaji: 'Ima, shirabete iru tokoro desu.', en: 'I am looking into it right now.', register: 'business' }] }),

  P({ id: 'n3-bakari', level: 'N3', unit: 'Precise timing',
    title: '〜たばかり', formation: 'た-form + ばかり', meaning: 'only just did',
    explain: 'Subjectively recent — how recent depends on the speaker, not the clock. 入社したばかり can cover a year if you feel new.',
    examples: [{ ja: '入社したばかりです。', romaji: 'Nyuusha shita bakari desu.', en: 'I only just joined.', register: 'business' }] }),

  P({ id: 'n3-uchi-ni', level: 'N3', unit: 'Precise timing',
    title: '〜うちに', formation: 'Plain form + うちに', meaning: 'while, before it changes',
    explain: 'Do it during a window that will close. Carries a quiet warning that the opportunity is temporary.',
    examples: [{ ja: '忘れないうちにメモします。', romaji: 'Wasurenai uchi ni memo shimasu.', en: 'I will note it down before I forget.', register: 'business' }] }),

  P({ id: 'n3-tabi-ni', level: 'N3', unit: 'Precise timing',
    title: '〜たびに', formation: 'Dictionary form + たびに', meaning: 'every time',
    explain: 'Each occurrence, usually with a consistent consequence.',
    examples: [{ ja: 'デプロイするたびに確認します。', romaji: 'Depuroi suru tabi ni kakunin shimasu.', en: 'I check every time we deploy.', register: 'business' }] }),

  P({ id: 'n3-you-ni-naru', level: 'N3', unit: 'Change and progression',
    title: '〜ようになる', formation: 'Dictionary/potential + ようになる', meaning: 'come to be able to, reach the point of',
    explain: 'Gradual change of state or ability. The natural way to describe progress in a skill — including this one.',
    examples: [{ ja: '日本語が読めるようになりました。', romaji: 'Nihongo ga yomeru you ni narimashita.', en: 'I have become able to read Japanese.', register: 'polite' }] }),

  P({ id: 'n3-you-ni-suru', level: 'N3', unit: 'Change and progression',
    title: '〜ようにする', formation: 'Dictionary/ない + ようにする', meaning: 'make an effort to',
    explain: 'Deliberate habit-building, as opposed to ようになる which just happens. Common in retrospectives: 次からは〜ようにします.',
    examples: [{ ja: '次からはテストを書くようにします。', romaji: 'Tsugi kara wa tesuto o kaku you ni shimasu.', en: 'From now on I will make sure to write tests.', register: 'business' }],
    contrast: ['n3-you-ni-naru'] }),

  P({ id: 'n3-tsuzukeru', level: 'N3', unit: 'Change and progression',
    title: '〜続ける / 〜始める / 〜終わる', formation: 'Verb stem + 続ける/始める/終わる', meaning: 'keep / start / finish doing',
    explain: 'Compound verbs marking phase. They attach to the stem, not the て-form.',
    examples: [{ ja: '調査を続けます。', romaji: 'Chousa o tsuzukemasu.', en: 'I will keep investigating.', register: 'business' }] }),

  P({ id: 'n3-tame-ni', level: 'N3', unit: 'Purpose and cause',
    title: '〜ために', formation: 'Dictionary form / Noun の + ために', meaning: 'in order to; because of',
    explain: 'Purpose with a volitional verb, cause with a non-volitional one. 直すために — in order to fix. 障害のために — owing to an outage.',
    examples: [{ ja: '障害のため、リリースを延期します。', romaji: 'Shougai no tame, ririisu o enki shimasu.', en: 'Due to an outage, we are postponing the release.', register: 'business' }] }),

  P({ id: 'n3-you-ni-purpose', level: 'N3', unit: 'Purpose and cause',
    title: '〜ように (purpose)', formation: 'Potential / ない form + ように', meaning: 'so that',
    explain: 'Purpose with a non-volitional outcome — something you cannot directly control. Contrast ために, which needs a deliberate action.',
    examples: [{ ja: '間違えないように、二回確認します。', romaji: 'Machigaenai you ni, nikai kakunin shimasu.', en: 'I check twice so as not to make a mistake.', register: 'business' }],
    contrast: ['n3-tame-ni'] }),

  P({ id: 'n3-sei-okage', level: 'N3', unit: 'Purpose and cause',
    title: '〜せいで / 〜おかげで', formation: 'Plain form / Noun の + せいで / おかげで', meaning: 'because of (blame) / thanks to (credit)',
    explain: 'Both mean "because", but they assign moral weight. せいで blames; おかげで credits. Using せいで about a colleague in writing is a real accusation.',
    examples: [{ ja: '佐藤さんのおかげで解決しました。', romaji: 'Satou-san no okage de kaiketsu shimashita.', en: 'Thanks to Sato, it is resolved.', register: 'business' }],
    register: 'おかげさまで is the set humble phrase for "thanks to you" — use it liberally.' }),

  P({ id: 'n3-noni-purpose', level: 'N3', unit: 'Purpose and cause',
    title: '〜のに (for the purpose of)', formation: 'Dictionary form + のに', meaning: 'for doing X',
    explain: 'Distinct from the frustrated のに. Here it names a use: このツールは検証するのに便利です.',
    examples: [{ ja: 'デバッグするのに便利です。', romaji: 'Debaggu suru no ni benri desu.', en: 'It is handy for debugging.', register: 'business' }],
    contrast: ['n4-noni-although'] }),

  P({ id: 'n3-kotoni-suru', level: 'N3', unit: 'Decisions',
    title: '〜ことにする / 〜ことになる', formation: 'Dictionary/ない + ことにする / ことになる', meaning: 'decide to / it has been decided',
    explain: 'The pair distinguishes your decision from one handed to you. ことになりました is how Japanese announces outcomes without naming who decided — which is itself culturally significant.',
    examples: [{ ja: '来月から新しいチームに移ることになりました。', romaji: 'Raigetsu kara atarashii chiimu ni utsuru koto ni narimashita.', en: 'It has been decided I move to a new team next month.', register: 'business' }] }),

  P({ id: 'n3-hazu-ga-nai', level: 'N3', unit: 'Certainty',
    title: '〜はずがない / 〜わけがない', formation: 'Plain form + はずがない / わけがない', meaning: 'there is no way that',
    explain: 'Strong denial based on reasoning. わけがない is blunter and more emotional.',
    examples: [{ ja: 'そんなはずはありません。', romaji: 'Sonna hazu wa arimasen.', en: 'That cannot be right.', register: 'business' }] }),

  P({ id: 'n3-ni-chigainai', level: 'N3', unit: 'Certainty',
    title: '〜に違いない', formation: 'Plain form + に違いない', meaning: 'must be, no doubt',
    explain: 'High-confidence inference. Written and somewhat emphatic; in speech でしょう or はず is more common.',
    examples: [{ ja: '設定ミスに違いありません。', romaji: 'Settei misu ni chigai arimasen.', en: 'It must be a configuration mistake.', register: 'business' }] }),

  P({ id: 'n3-rashii', level: 'N3', unit: 'Certainty',
    title: '〜らしい', formation: 'Plain form + らしい', meaning: 'seems, apparently; typical of',
    explain: 'Hearsay-flavoured inference, and separately "characteristic of" — 彼らしい, "that is just like him".',
    examples: [{ ja: '原因はライブラリの更新らしいです。', romaji: 'Gen\'in wa raiburari no koushin rashii desu.', en: 'Apparently the cause was a library update.', register: 'business' }] }),

  P({ id: 'n3-ba-yokatta', level: 'N3', unit: 'Regret and hindsight',
    title: '〜ばよかった', formation: 'ば-form + よかった', meaning: 'I should have',
    explain: 'Regret about the past. Common in postmortems, where owning a miss plainly is valued.',
    examples: [{ ja: '先にテストすればよかったです。', romaji: 'Saki ni tesuto sureba yokatta desu.', en: 'I should have tested first.', register: 'business' }] }),

  P({ id: 'n3-nakereba-yokatta', level: 'N3', unit: 'Regret and hindsight',
    title: '〜なければよかった', formation: 'ない-form + ければよかった', meaning: 'I should not have',
    explain: 'The negative counterpart. Pairs with 〜てしまう for a full apology.',
    examples: [{ ja: '急いでデプロイしなければよかったです。', romaji: 'Isoide depuroi shinakereba yokatta desu.', en: 'I should not have rushed the deploy.', register: 'business' }] }),

  P({ id: 'n3-kke', level: 'N3', unit: 'Conversational moves',
    title: '〜っけ', formation: 'Plain form + っけ', meaning: 'what was it again?',
    explain: 'Retrieving something you once knew. Casual only — never to a superior.',
    examples: [{ ja: '会議、何時だっけ？', romaji: 'Kaigi, nanji dakke?', en: 'What time was the meeting again?', register: 'casual' }] }),

  P({ id: 'n3-janai-ka', level: 'N3', unit: 'Conversational moves',
    title: '〜んじゃないですか', formation: 'Plain form + んじゃないですか', meaning: 'is it not the case that…?',
    explain: 'Proposes an idea while leaving the other person room to disagree. One of the most useful softening devices in a design discussion.',
    examples: [{ ja: 'キャッシュが原因なんじゃないですか。', romaji: 'Kyasshu ga gen\'in nanja nai desu ka.', en: 'Could the cache not be the cause?', register: 'business' }],
    register: 'Disagreeing as a question rather than a statement is standard practice.' }),

  P({ id: 'n3-no-desu', level: 'N3', unit: 'Conversational moves',
    title: '〜んです / 〜のです', formation: 'Plain form + んです', meaning: 'explanatory',
    explain: 'Frames a statement as an explanation of the situation. Leaving it out where it is expected makes you sound abrupt; adding it where it is not makes you sound defensive.',
    examples: [{ ja: '実は、まだ終わっていないんです。', romaji: 'Jitsu wa, mada owatte inai n desu.', en: 'Actually, it is not finished yet.', register: 'business' }] }),

  P({ id: 'n3-temo', level: 'N3', unit: 'Concession',
    title: '〜ても', formation: 'て-form + も', meaning: 'even if',
    explain: 'Concessive conditional. With question words it becomes "no matter what": 何をしても.',
    examples: [{ ja: '再起動しても直りませんでした。', romaji: 'Saikidou shite mo naorimasen deshita.', en: 'Even restarting did not fix it.', register: 'business' }] }),

  P({ id: 'n3-kuseni', level: 'N3', unit: 'Concession',
    title: '〜くせに', formation: 'Plain form + くせに', meaning: 'even though (critical)',
    explain: 'Concessive with contempt. Almost never appropriate at work — included so you recognise it when someone is being rude.',
    examples: [{ ja: '知らないくせに言うな。', romaji: 'Shiranai kuse ni iu na.', en: "Don't talk when you don't know.", register: 'casual' }],
    register: 'Recognise it; do not produce it.' }),

  P({ id: 'n3-ni-yotte', level: 'N3', unit: 'Formal connectives',
    title: '〜によって', formation: 'Noun + によって', meaning: 'by means of; depending on; by (agent)',
    explain: 'Three jobs: agent in a passive sentence, method, and variation. Very frequent in written and technical Japanese.',
    examples: [{ ja: '環境によって動作が異なります。', romaji: 'Kankyou ni yotte dousa ga kotonarimasu.', en: 'Behaviour differs depending on the environment.', register: 'written' }] }),

  P({ id: 'n3-ni-taishite', level: 'N3', unit: 'Formal connectives',
    title: '〜に対して', formation: 'Noun + に対して', meaning: 'toward; in contrast to',
    explain: 'Direction of an attitude or action, or a contrast between two things.',
    examples: [{ ja: 'ユーザーに対して通知を送ります。', romaji: 'Yuuzaa ni taishite tsuuchi o okurimasu.', en: 'We send a notification to users.', register: 'written' }] }),

  P({ id: 'n3-ni-tsuite', level: 'N3', unit: 'Formal connectives',
    title: '〜について / 〜に関して', formation: 'Noun + について / に関して', meaning: 'regarding',
    explain: 'Topic marker for formal writing. に関して is a register step above について and appears in email subject lines constantly.',
    examples: [{ ja: '本件について、ご相談があります。', romaji: 'Honken ni tsuite, gosoudan ga arimasu.', en: 'I would like to consult you regarding this matter.', register: 'business' }] }),

  P({ id: 'n3-toshite', level: 'N3', unit: 'Formal connectives',
    title: '〜として', formation: 'Noun + として', meaning: 'as, in the capacity of',
    explain: 'Role or classification.',
    examples: [{ ja: 'エンジニアとして参加します。', romaji: 'Enjinia to shite sanka shimasu.', en: 'I am joining as an engineer.', register: 'business' }] }),

  P({ id: 'n3-bakari-de-naku', level: 'N3', unit: 'Formal connectives',
    title: '〜だけでなく', formation: 'Noun / plain + だけでなく', meaning: 'not only… but also',
    explain: 'Additive. だけでなく〜も is the standard pairing.',
    examples: [{ ja: '速度だけでなく、安定性も改善しました。', romaji: 'Sokudo dake de naku, anteisei mo kaizen shimashita.', en: 'We improved not only speed but stability.', register: 'business' }] }),

  P({ id: 'n3-kekka', level: 'N3', unit: 'Formal connectives',
    title: '〜た結果 / 〜たところ', formation: 'た-form + 結果 / ところ', meaning: 'as a result of doing; upon doing',
    explain: 'Reporting an investigation and what it turned up — the exact structure of a 障害報告.',
    examples: [{ ja: '調査した結果、設定ミスが原因でした。', romaji: 'Chousa shita kekka, settei misu ga gen\'in deshita.', en: 'As a result of investigating, a config mistake was the cause.', register: 'business' }] }),

  P({ id: 'n3-keigo-sonkeigo', level: 'N3', unit: 'Keigo in earnest',
    title: '尊敬語 — raising the other person', formation: 'いらっしゃる, なさる, おっしゃる, ご覧になる, 召し上がる',
    meaning: 'honorific verbs',
    explain: 'Dial 2, upward. Applied to the actions of someone you are elevating — never to your own. The irregular forms are worth knowing cold; everything else uses お〜になる.',
    examples: [{ ja: '部長がおっしゃいました。', romaji: 'Buchou ga osshaimashita.', en: 'The department head said so.', register: 'business' }],
    contrast: ['n3-keigo-kenjougo'] }),

  P({ id: 'n3-keigo-kenjougo', level: 'N3', unit: 'Keigo in earnest',
    title: '謙譲語 — lowering yourself', formation: '伺う, 申す, 拝見する, いたす, おる',
    meaning: 'humble verbs',
    explain: 'Dial 2, downward, applied to your own actions. Splits into Ⅰ (lowers you toward a third party) and Ⅱ (lowers you toward the listener) — 伺う needs a respectable target, 参る does not.',
    examples: [{ ja: '明日、伺います。', romaji: 'Ashita, ukagaimasu.', en: 'I will visit tomorrow.', register: 'business' }],
    contrast: ['n3-keigo-sonkeigo'] }),

  P({ id: 'n3-itadakemasu', level: 'N3', unit: 'Keigo in earnest',
    title: '〜ていただけますか', formation: 'て-form + いただけますか / いただけませんか', meaning: 'could I ask you to',
    explain: 'The request ladder in business Japanese. Each step is softer: 〜てください → 〜ていただけますか → 〜ていただけませんか → 〜ていただけないでしょうか. Upward, start at least at the second.',
    examples: [{ ja: 'ご確認いただけますでしょうか。', romaji: 'Gokakunin itadakemasu deshou ka.', en: 'Could I ask you to confirm?', register: 'business' }],
    register: 'The negative question form is softer than the positive. Counterintuitive but reliable.' }),

  P({ id: 'n3-osoreirimasu', level: 'N3', unit: 'Keigo in earnest',
    title: 'Cushion phrases', formation: '恐れ入りますが / お手数ですが / 申し訳ございませんが',
    meaning: 'softeners placed before a request',
    explain: 'A bare request, however polite the verb, still lands abruptly. Japanese puts a cushion in front acknowledging the imposition. Omitting it is one of the most common foreign-speaker tells.',
    examples: [{ ja: 'お手数ですが、ご確認をお願いいたします。', romaji: 'Otesuu desu ga, gokakunin o onegai itashimasu.', en: 'Sorry for the trouble, but please confirm.', register: 'business' }],
    register: 'Near-mandatory in email. Learn three and rotate them.' }),
]
