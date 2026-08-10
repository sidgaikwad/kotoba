import { P, type GrammarPoint } from './types'

/**
 * N1 — formal, written, and literary register.
 *
 * Worth stating plainly: much of N1 is *recognition* grammar. You need to
 * parse it in a contract, a legal notice or a 論文; you will rarely produce
 * it in speech, and producing some of it casually would sound absurd. The
 * lessons here mark which side of that line each point sits on.
 */
export const N1: GrammarPoint[] = [
  P({ id: 'n1-nakuhaikanai', level: 'N1', unit: 'Obligation and inevitability',
    title: '〜ずにはいられない', formation: 'ない-stem + ずにはいられない', meaning: 'cannot help but',
    explain: 'Irresistible impulse. Literary and emotional; you will read it far more than say it.',
    examples: [{ ja: '心配せずにはいられません。', romaji: 'Shinpai sezu ni wa iraremasen.', en: 'I cannot help worrying.', register: 'written' }] }),

  P({ id: 'n1-beki', level: 'N1', unit: 'Obligation and inevitability',
    title: '〜べき / 〜べからず', formation: 'Dictionary form + べき', meaning: 'ought to / must not',
    explain: 'Moral or logical obligation. Note するべき and すべき are both used, the latter more formal. べからず is archaic and survives on signage.',
    examples: [{ ja: '設計段階で検討すべきでした。', romaji: 'Sekkei dankai de kentou subeki deshita.', en: 'It should have been considered at the design stage.', register: 'written' }] }),

  P({ id: 'n1-made-mo-nai', level: 'N1', unit: 'Obligation and inevitability',
    title: '〜までもない', formation: 'Dictionary form + までもない', meaning: 'there is no need to go so far as',
    explain: 'Dismisses an unnecessary step. 言うまでもなく — "needless to say" — is the common frozen form.',
    examples: [{ ja: '言うまでもなく、テストは必須です。', romaji: 'Iu made mo naku, tesuto wa hissu desu.', en: 'Needless to say, tests are mandatory.', register: 'written' }] }),

  P({ id: 'n1-yoginakusareru', level: 'N1', unit: 'Obligation and inevitability',
    title: '〜を余儀なくされる', formation: 'Noun + を余儀なくされる', meaning: 'be forced into',
    explain: 'Heavily formal passive of compulsion. Appears in incident notices and press releases when something unavoidable happened.',
    examples: [{ ja: 'サービス停止を余儀なくされました。', romaji: 'Saabisu teishi o yoginaku saremashita.', en: 'We were forced to suspend the service.', register: 'written' }] }),

  P({ id: 'n1-niataranai', level: 'N1', unit: 'Judgement',
    title: '〜に当たらない / 〜には及ばない', formation: 'Dictionary form + に当たらない', meaning: 'not worth doing; no need to',
    explain: 'Downplays a reaction as excessive. 驚くには当たらない — hardly surprising.',
    examples: [{ ja: '驚くには当たりません。', romaji: 'Odoroku ni wa atarimasen.', en: 'It is hardly surprising.', register: 'written' }] }),

  P({ id: 'n1-kiwamarinai', level: 'N1', unit: 'Judgement',
    title: '〜極まりない / 〜の極み', formation: 'な-adj + 極まりない', meaning: 'extremely, in the extreme',
    explain: 'Superlative intensity, formal and often negative.',
    examples: [{ ja: '危険極まりない操作です。', romaji: 'Kiken kiwamarinai sousa desu.', en: 'It is an extremely dangerous operation.', register: 'written' }] }),

  P({ id: 'n1-ni-taenai', level: 'N1', unit: 'Judgement',
    title: '〜に堪えない / 〜に足る', formation: 'Noun + に堪えない / に足る', meaning: 'unbearable to / worthy of',
    explain: 'A matched pair of evaluations. 信頼に足る — worthy of trust.',
    examples: [{ ja: '信頼に足るデータではありません。', romaji: 'Shinrai ni taru deeta dewa arimasen.', en: 'It is not data worthy of trust.', register: 'written' }] }),

  P({ id: 'n1-tomonatte', level: 'N1', unit: 'Formal cause and correlation',
    title: '〜に伴って / 〜につれて', formation: 'Noun / dictionary form + に伴って / につれて', meaning: 'as X proceeds, Y',
    explain: 'Correlated change. に伴って is more formal and appears in specifications.',
    examples: [{ ja: '利用者の増加に伴い、負荷が上がっています。', romaji: 'Riyousha no zouka ni tomonai, fuka ga agatte imasu.', en: 'As users increase, load is rising.', register: 'written' }] }),

  P({ id: 'n1-yue-ni', level: 'N1', unit: 'Formal cause and correlation',
    title: '〜ゆえに / 〜がゆえに', formation: 'Plain form / Noun + ゆえに', meaning: 'therefore, because of',
    explain: 'Literary causal. Frequent in academic and legal writing, essentially never in speech.',
    examples: [{ ja: '仕様が曖昧であるがゆえに、解釈が分かれました。', romaji: 'Shiyou ga aimai de aru ga yue ni, kaishaku ga wakaremashita.', en: 'Because the spec was ambiguous, interpretations diverged.', register: 'written' }] }),

  P({ id: 'n1-ni-sokushite', level: 'N1', unit: 'Formal cause and correlation',
    title: '〜に即して / 〜に沿って', formation: 'Noun + に即して / に沿って', meaning: 'in line with, in conformity to',
    explain: 'Adherence to a standard, policy or plan. Standard in compliance and process documents.',
    examples: [{ ja: '規約に即して対応いたします。', romaji: 'Kiyaku ni sokushite taiou itashimasu.', en: 'We will act in accordance with the terms.', register: 'business' }] }),

  P({ id: 'n1-wo-toshite', level: 'N1', unit: 'Formal cause and correlation',
    title: '〜を経て / 〜をもって', formation: 'Noun + を経て / をもって', meaning: 'after passing through / as of, by means of',
    explain: 'をもって with a date announces an effective moment — 本日をもって, "as of today" — and is how companies announce endings.',
    examples: [{ ja: '本日をもって、旧APIを廃止いたします。', romaji: 'Honjitsu o motte, kyuu API o haishi itashimasu.', en: 'As of today, the old API is discontinued.', register: 'business' }] }),

  P({ id: 'n1-nashini', level: 'N1', unit: 'Conditions, formal',
    title: '〜なしに / 〜なくして', formation: 'Noun + なしに / なくして', meaning: 'without',
    explain: 'Formal negative condition. 許可なしに — without permission.',
    examples: [{ ja: '承認なしに変更してはなりません。', romaji: 'Shounin nashi ni henkou shite wa narimasen.', en: 'Changes must not be made without approval.', register: 'written' }] }),

  P({ id: 'n1-ba-koso', level: 'N1', unit: 'Conditions, formal',
    title: '〜ばこそ / 〜てこそ', formation: 'ば-form + こそ / て-form + こそ', meaning: 'precisely because; only by doing',
    explain: 'Emphatic causal. Often used to frame something difficult as worthwhile.',
    examples: [{ ja: '検証してこそ、安心してリリースできます。', romaji: 'Kenshou shite koso, anshin shite ririisu dekimasu.', en: 'Only by verifying can we release with confidence.', register: 'written' }] }),

  P({ id: 'n1-to-ieba', level: 'N1', unit: 'Discourse management',
    title: '〜といえば / 〜というと / 〜といったら', formation: 'Noun + といえば', meaning: 'speaking of',
    explain: 'Topic pivot. といえば picks up something just mentioned and turns the conversation toward it — a polite way to change subject.',
    examples: [{ ja: 'リリースといえば、日程は決まりましたか。', romaji: 'Ririisu to ieba, nittei wa kimarimashita ka.', en: 'Speaking of the release, has the date been decided?', register: 'business' }] }),

  P({ id: 'n1-hakanaranai', level: 'N1', unit: 'Discourse management',
    title: '〜にほかならない / 〜に過ぎない', formation: 'Plain form + にほかならない', meaning: 'is nothing other than / is merely',
    explain: 'A rhetorical pair for asserting and for minimising. Both are argumentative register.',
    examples: [{ ja: 'これは設計の問題にほかなりません。', romaji: 'Kore wa sekkei no mondai ni hoka narimasen.', en: 'This is nothing other than a design problem.', register: 'written' }] }),

  P({ id: 'n1-tokoro-da', level: 'N1', unit: 'Discourse management',
    title: '〜ところだった / 〜ところを', formation: 'Dictionary form + ところだった', meaning: 'nearly happened / while in a state',
    explain: 'A near-miss, or a courtesy formula. お忙しいところを恐れ入りますが is standard email padding.',
    examples: [{ ja: 'お忙しいところを恐れ入ります。', romaji: 'Oisogashii tokoro o osoreirimasu.', en: 'I am sorry to trouble you while you are busy.', register: 'business' }] }),

  P({ id: 'n1-nari', level: 'N1', unit: 'Literary forms',
    title: '〜なり / 〜や否や', formation: 'Dictionary form + なり / や否や', meaning: 'the moment that',
    explain: 'Literary immediacy. Recognition only — using these in speech would be theatrical.',
    examples: [{ ja: '報告を受けるや否や、対応を開始しました。', romaji: 'Houkoku o ukeru ya inaya, taiou o kaishi shimashita.', en: 'The moment we received the report, we began responding.', register: 'written' }] }),

  P({ id: 'n1-tsutsu', level: 'N1', unit: 'Literary forms',
    title: '〜つつ / 〜つつある', formation: 'Verb stem + つつ / つつある', meaning: 'while; in the process of',
    explain: 'つつある marks a change in progress and is common in reports — 回復しつつあります, "is recovering".',
    examples: [{ ja: '状況は改善しつつあります。', romaji: 'Joukyou wa kaizen shitsutsu arimasu.', en: 'The situation is improving.', register: 'business' }] }),

  P({ id: 'n1-mono-wo', level: 'N1', unit: 'Literary forms',
    title: '〜ものを / 〜ところが', formation: 'Plain form + ものを', meaning: 'if only… but',
    explain: 'Regret with reproach. Literary and emotionally loaded.',
    examples: [{ ja: '相談してくれればよかったものを。', romaji: 'Soudan shite kurereba yokatta mono o.', en: 'If only you had consulted me.', register: 'written' }] }),

  P({ id: 'n1-kagiri-da', level: 'N1', unit: 'Literary forms',
    title: '〜限りだ / 〜てやまない', formation: 'Adj + 限りだ / て-form + やまない', meaning: 'utterly; unceasingly',
    explain: 'Formal emotional intensifiers, common in ceremonial speech and end-of-year greetings.',
    examples: [{ ja: '今後のご活躍を祈ってやみません。', romaji: 'Kongo no gokatsuyaku o inotte yamimasen.', en: 'I wish you continued success.', register: 'business' }] }),

  P({ id: 'n1-keigo-teichougo', level: 'N1', unit: 'Register mastery',
    title: '謙譲語Ⅱ (丁重語) in full', formation: '参る, おる, いたす, 申す, 存じる',
    meaning: 'humility aimed at the listener, not a third party',
    explain: 'The category the old three-way model could not express, and the reason 敬語の指針 revised it in 2007. 伺う needs a respectable target; 参る does not — Osaka cannot be respected, so the humility must be pointed at whoever is listening.',
    examples: [{ ja: '明日、大阪に参ります。', romaji: 'Ashita, Oosaka ni mairimasu.', en: 'I am going to Osaka tomorrow.', register: 'business' }],
    contrast: ['n3-keigo-kenjougo'] }),

  P({ id: 'n1-ingin-burei', level: 'N1', unit: 'Register mastery',
    title: '慇懃無礼 — politeness as an insult', formation: 'Excessive keigo where warmth was expected',
    meaning: 'over-politeness reads as cold or sarcastic',
    explain: 'Using elaborate keigo with someone who expects a normal register creates distance deliberately, and native speakers read it as hostility. This is why "more polite is safer" is wrong, and why register has to be calibrated rather than maximised.',
    examples: [{ ja: 'さようでございますか。', romaji: 'Sayou de gozaimasu ka.', en: 'Is that so. (icy if said to a teammate)', register: 'business' }],
    register: 'The most advanced register skill is knowing when to come down, not up.' }),

  P({ id: 'n1-chat-register', level: 'N1', unit: 'Register mastery',
    title: 'Workplace chat register', formation: 'です・ます with light punctuation, few honorifics',
    meaning: 'the undocumented middle register',
    explain: 'Internal Slack is neither keigo nor casual. It sits at plain です・ます with a warmer tone than email, occasional ！ and emoji, and almost no 尊敬語. No authoritative source documents this — the description here is inferred from public Japanese engineering writing and should be treated as a working model, not a fact.',
    examples: [{ ja: '対応しました！確認お願いします🙏', romaji: 'Taiou shimashita! Kakunin onegai shimasu.', en: 'Handled it! Please take a look.', register: 'business' }],
    register: 'Inferred, tier T3. Correct this against real workplace observation.' }),

  P({ id: 'n1-hearing-no', level: 'N1', unit: 'Register mastery',
    title: 'Hearing a refusal', formation: 'ちょっと… / 難しいですね / 検討させてください',
    meaning: 'how "no" is actually delivered',
    explain: 'Direct refusal damages the relationship, so it is delivered as difficulty, hesitation, or a promise to consider. 検討します frequently means no. Treating these as solvable objections and returning with a fix is the classic foreign-engineer failure mode.',
    examples: [{ ja: 'うーん、ちょっと難しいですね。', romaji: 'Uun, chotto muzukashii desu ne.', en: 'Hmm, that would be difficult. (= no)', register: 'business' }],
    register: 'Learning to hear no matters more than learning to say it.' }),
]
