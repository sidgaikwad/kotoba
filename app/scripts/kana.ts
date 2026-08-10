/**
 * The kana dataset — the true starting point of the course.
 *
 * Mnemonics here are written for this course. Tofugu's and other published
 * mnemonic sets are copyrighted; none are reproduced.
 *
 * Order follows the traditional 五十音 (gojūon) table, which is not arbitrary:
 * it is organised by consonant row and vowel column, and seeing that grid is
 * itself part of learning to read. Japanese dictionaries, train timetables and
 * form fields are all ordered by it.
 */

export type Kana = {
  /** hiragana */ h: string
  /** katakana */ k: string
  /** romaji   */ r: string
  /** memory hook for the hiragana shape */ mh: string
  /** memory hook for the katakana shape */ mk: string
}

/** The five vowels. Every other sound is a consonant plus one of these. */
export const VOWELS: Kana[] = [
  { h: 'あ', k: 'ア', r: 'a', mh: 'An "A" with an extra loop tacked on the bottom right.', mk: 'A capital A that has lost its crossbar and leans left.' },
  { h: 'い', k: 'イ', r: 'i', mh: 'Two vertical strokes, like the two dots of a lowercase "i" stretched out.', mk: 'A single leaning stroke with a tick — half of the hiragana.' },
  { h: 'う', k: 'ウ', r: 'u', mh: 'A face in profile looking down — the "oo" of someone unimpressed.', mk: 'The same profile, squared off, wearing a hat.' },
  { h: 'え', k: 'エ', r: 'e', mh: 'A stick figure of an exotic bird with a long neck.', mk: 'A capital I lying between two floors — an Elevator shaft.' },
  { h: 'お', k: 'オ', r: 'o', mh: 'Almost identical to あ but with a little tail flick on top.', mk: 'A cross with a tail — an Origami crane mid-fold.' },
]

export const K_ROW: Kana[] = [
  { h: 'か', k: 'カ', r: 'ka', mh: 'A cutting Knife with a sparkle of light beside it.', mk: 'The same knife, without the sparkle.' },
  { h: 'き', k: 'キ', r: 'ki', mh: 'A Key with two teeth on the shaft.', mk: 'The same key, teeth simplified to a cross.' },
  { h: 'く', k: 'ク', r: 'ku', mh: 'A bird beak Cutting into something.', mk: 'The same beak with a lid on top.' },
  { h: 'け', k: 'ケ', r: 'ke', mh: 'A Keg with a tap sticking out to the left.', mk: 'A slanted cross, like a check mark gone wrong.' },
  { h: 'こ', k: 'コ', r: 'ko', mh: 'Two Cords lying parallel.', mk: 'The same two cords, joined into a bracket.' },
]

export const S_ROW: Kana[] = [
  { h: 'さ', k: 'サ', r: 'sa', mh: 'Looks like き but with one tooth — a Salmon with a hook.', mk: 'Three strokes, like a Sand rake.' },
  { h: 'し', k: 'シ', r: 'shi', mh: 'A single hook — a fishing line dropping and curving.', mk: 'Two dots and a rising sweep. The sweep goes UP from bottom-left.' },
  { h: 'す', k: 'ス', r: 'su', mh: 'A loop with a long tail — a Swing hanging down.', mk: 'A simple slide going down to the left.' },
  { h: 'せ', k: 'セ', r: 'se', mh: 'A mouth open, teeth showing — Say it.', mk: 'The same shape, one stroke fewer.' },
  { h: 'そ', k: 'ソ', r: 'so', mh: 'A zigzag stitch — Sewing thread.', mk: 'Two strokes, the long one sweeping DOWN from top-right.' },
]

export const T_ROW: Kana[] = [
  { h: 'た', k: 'タ', r: 'ta', mh: 'A "t" beside a "c" — Tacos.', mk: 'Like ク with an extra slash through it.' },
  { h: 'ち', k: 'チ', r: 'chi', mh: 'A "5" flipped — Cheerleaders form a five.', mk: 'A "+" with a slanted top — a Cheese slicer.' },
  { h: 'つ', k: 'ツ', r: 'tsu', mh: 'A curling wave — a Tsunami.', mk: 'Two dots and a sweep, like シ but the dots sit on TOP and the sweep goes down.' },
  { h: 'て', k: 'テ', r: 'te', mh: 'A hand pointing — Telling you where to go.', mk: 'A Telephone pole with two crossbars.' },
  { h: 'と', k: 'ト', r: 'to', mh: 'A Toe with a thorn stuck in it.', mk: 'The same toe, simplified to a "T" on its side.' },
]

export const N_ROW: Kana[] = [
  { h: 'な', k: 'ナ', r: 'na', mh: 'A cross with a knot at the bottom — Nailed down.', mk: 'Just the cross — half of the hiragana.' },
  { h: 'に', k: 'ニ', r: 'ni', mh: 'A vertical line plus two horizontals — a Needle and thread.', mk: 'Two horizontal lines. The number 2 in kanji is 二 — and "ni" IS two.' },
  { h: 'ぬ', k: 'ヌ', r: 'nu', mh: 'Noodles with a loop of pasta at the end.', mk: 'Like ス but with the top stroke crossing through.' },
  { h: 'ね', k: 'ネ', r: 'ne', mh: 'A cat with a curled tail — the tail is the giveaway.', mk: 'A cross with a slash — like ウ pulled apart.' },
  { h: 'の', k: 'ノ', r: 'no', mh: 'A single spiral — a "no entry" swirl.', mk: 'One diagonal stroke. The simplest kana there is.' },
]

export const H_ROW: Kana[] = [
  { h: 'は', k: 'ハ', r: 'ha', mh: 'A vertical line with "は" — looks like the letters "l" and "d".', mk: 'Two strokes forming a mountain outline.' },
  { h: 'ひ', k: 'ヒ', r: 'hi', mh: 'A wide smile — He is laughing.', mk: 'Like a lowercase "t" rotated — a Heel of a boot.' },
  { h: 'ふ', k: 'フ', r: 'fu', mh: 'A person sitting cross-legged, arms out — Fuji mountain.', mk: 'A single hook, like the top of a "7".' },
  { h: 'へ', k: 'ヘ', r: 'he', mh: 'A gentle hill. Identical in both alphabets.', mk: 'The same hill — hiragana and katakana look the same.' },
  { h: 'ほ', k: 'ホ', r: 'ho', mh: 'Like は with an extra bar — a Home with a chimney.', mk: 'A cross with two legs — a Holy cross on a stand.' },
]

export const M_ROW: Kana[] = [
  { h: 'ま', k: 'マ', r: 'ma', mh: 'Two bars and a loop — Mama tying her hair.', mk: 'A hook inside an angle.' },
  { h: 'み', k: 'ミ', r: 'mi', mh: 'The number 21 squashed together — Mi is 21.', mk: 'Three strokes. 三 is the kanji for three, and this looks like it.' },
  { h: 'む', k: 'ム', r: 'mu', mh: 'A cow face with a tail — Moo.', mk: 'A simple angle, like a "4" without the stem.' },
  { h: 'め', k: 'メ', r: 'me', mh: 'Like ぬ but without the loop — an eye with a lash.', mk: 'An "X" — X Marks the spot.' },
  { h: 'も', k: 'モ', r: 'mo', mh: 'A fishing hook with two barbs — More fish.', mk: 'The same hook, straightened out.' },
]

export const Y_ROW: Kana[] = [
  { h: 'や', k: 'ヤ', r: 'ya', mh: 'A Yak with horns and a tail.', mk: 'The same yak, simplified.' },
  { h: 'ゆ', k: 'ユ', r: 'yu', mh: 'A fish with a hook through it — Unique catch.', mk: 'A "U" squared off.' },
  { h: 'よ', k: 'ヨ', r: 'yo', mh: 'A yo-yo on a string.', mk: 'Three lines forming an "E" backwards.' },
]

export const R_ROW: Kana[] = [
  { h: 'ら', k: 'ラ', r: 'ra', mh: 'A person leaning back in a Recliner.', mk: 'A hook under a bar — like a "7" with a hat.' },
  { h: 'り', k: 'リ', r: 'ri', mh: 'Two strokes, one curving — a Reed bending.', mk: 'Two straight strokes. Nearly the same as hiragana.' },
  { h: 'る', k: 'ル', r: 'ru', mh: 'A loop at the bottom — a Route that loops back.', mk: 'Two strokes like a small "n" opening upward.' },
  { h: 'れ', k: 'レ', r: 're', mh: 'Like ね but the tail flicks out instead of curling.', mk: 'A single check mark.' },
  { h: 'ろ', k: 'ロ', r: 'ro', mh: 'Like る without the loop — a Road with a bend.', mk: 'A perfect square — a Room.' },
]

export const W_N_ROW: Kana[] = [
  { h: 'わ', k: 'ワ', r: 'wa', mh: 'Like ね and れ, but this one has a soft rounded belly.', mk: 'Like ウ without the tick on top.' },
  { h: 'を', k: 'ヲ', r: 'wo', mh: 'A person throwing something over their shoulder. Only ever used as a particle.', mk: 'Rare. You may never need to write it.' },
  { h: 'ん', k: 'ン', r: 'n', mh: 'A single stroke that dips and rises — the only kana that is a consonant alone.', mk: 'One dot and a rising sweep. Compare シ — the sweep direction is the tell.' },
]

/** The base 46, in table order. */
export const GOJUON = [
  ...VOWELS, ...K_ROW, ...S_ROW, ...T_ROW, ...N_ROW,
  ...H_ROW, ...M_ROW, ...Y_ROW, ...R_ROW, ...W_N_ROW,
]

/**
 * Dakuten (゛) and handakuten (゜). These are not new characters to memorise —
 * they are a *modification*, which is the useful thing to understand: two
 * strokes voice the consonant. k→g, s→z, t→d, h→b. A circle makes h→p.
 */
export const DAKUTEN: { h: string; k: string; r: string; from: string }[] = [
  { h: 'が', k: 'ガ', r: 'ga', from: 'か' }, { h: 'ぎ', k: 'ギ', r: 'gi', from: 'き' },
  { h: 'ぐ', k: 'グ', r: 'gu', from: 'く' }, { h: 'げ', k: 'ゲ', r: 'ge', from: 'け' },
  { h: 'ご', k: 'ゴ', r: 'go', from: 'こ' },
  { h: 'ざ', k: 'ザ', r: 'za', from: 'さ' }, { h: 'じ', k: 'ジ', r: 'ji', from: 'し' },
  { h: 'ず', k: 'ズ', r: 'zu', from: 'す' }, { h: 'ぜ', k: 'ゼ', r: 'ze', from: 'せ' },
  { h: 'ぞ', k: 'ゾ', r: 'zo', from: 'そ' },
  { h: 'だ', k: 'ダ', r: 'da', from: 'た' }, { h: 'ぢ', k: 'ヂ', r: 'ji', from: 'ち' },
  { h: 'づ', k: 'ヅ', r: 'zu', from: 'つ' }, { h: 'で', k: 'デ', r: 'de', from: 'て' },
  { h: 'ど', k: 'ド', r: 'do', from: 'と' },
  { h: 'ば', k: 'バ', r: 'ba', from: 'は' }, { h: 'び', k: 'ビ', r: 'bi', from: 'ひ' },
  { h: 'ぶ', k: 'ブ', r: 'bu', from: 'ふ' }, { h: 'べ', k: 'ベ', r: 'be', from: 'へ' },
  { h: 'ぼ', k: 'ボ', r: 'bo', from: 'ほ' },
  { h: 'ぱ', k: 'パ', r: 'pa', from: 'は' }, { h: 'ぴ', k: 'ピ', r: 'pi', from: 'ひ' },
  { h: 'ぷ', k: 'プ', r: 'pu', from: 'ふ' }, { h: 'ぺ', k: 'ペ', r: 'pe', from: 'へ' },
  { h: 'ぽ', k: 'ポ', r: 'po', from: 'ほ' },
]

/**
 * Yōon — a full-size kana plus a small ゃ/ゅ/ょ, pronounced as ONE beat.
 * きや kiya is three beats; きゃ kya is one. That distinction is phonemic.
 */
export const YOON: { h: string; k: string; r: string }[] = [
  { h: 'きゃ', k: 'キャ', r: 'kya' }, { h: 'きゅ', k: 'キュ', r: 'kyu' }, { h: 'きょ', k: 'キョ', r: 'kyo' },
  { h: 'しゃ', k: 'シャ', r: 'sha' }, { h: 'しゅ', k: 'シュ', r: 'shu' }, { h: 'しょ', k: 'ショ', r: 'sho' },
  { h: 'ちゃ', k: 'チャ', r: 'cha' }, { h: 'ちゅ', k: 'チュ', r: 'chu' }, { h: 'ちょ', k: 'チョ', r: 'cho' },
  { h: 'にゃ', k: 'ニャ', r: 'nya' }, { h: 'にゅ', k: 'ニュ', r: 'nyu' }, { h: 'にょ', k: 'ニョ', r: 'nyo' },
  { h: 'ひゃ', k: 'ヒャ', r: 'hya' }, { h: 'ひゅ', k: 'ヒュ', r: 'hyu' }, { h: 'ひょ', k: 'ヒョ', r: 'hyo' },
  { h: 'みゃ', k: 'ミャ', r: 'mya' }, { h: 'みゅ', k: 'ミュ', r: 'myu' }, { h: 'みょ', k: 'ミョ', r: 'myo' },
  { h: 'りゃ', k: 'リャ', r: 'rya' }, { h: 'りゅ', k: 'リュ', r: 'ryu' }, { h: 'りょ', k: 'リョ', r: 'ryo' },
  { h: 'ぎゃ', k: 'ギャ', r: 'gya' }, { h: 'ぎゅ', k: 'ギュ', r: 'gyu' }, { h: 'ぎょ', k: 'ギョ', r: 'gyo' },
  { h: 'じゃ', k: 'ジャ', r: 'ja' },  { h: 'じゅ', k: 'ジュ', r: 'ju' },  { h: 'じょ', k: 'ジョ', r: 'jo' },
  { h: 'びゃ', k: 'ビャ', r: 'bya' }, { h: 'びゅ', k: 'ビュ', r: 'byu' }, { h: 'びょ', k: 'ビョ', r: 'byo' },
  { h: 'ぴゃ', k: 'ピャ', r: 'pya' }, { h: 'ぴゅ', k: 'ピュ', r: 'pyu' }, { h: 'ぴょ', k: 'ピョ', r: 'pyo' },
]

/** Pairs learners reliably confuse. The scheduler keeps these apart. */
export const CONFUSABLE: [string, string, string][] = [
  ['し', 'つ', 'Both are a sweep with a curve; し has no dots, つ is a single wide curl.'],
  ['シ', 'ツ', 'THE classic. シ sweeps UP from bottom-left; ツ sweeps DOWN from top-right.'],
  ['ソ', 'ン', 'ソ (so) sweeps down steeply; ン (n) rises from the bottom.'],
  ['ね', 'れ', 'ね curls into a full loop; れ flicks outward.'],
  ['わ', 'ね', 'わ has a rounded belly, ね has a curled tail.'],
  ['る', 'ろ', 'る ends in a loop; ろ just stops.'],
  ['さ', 'き', 'き has two crossbars, さ has one.'],
  ['ま', 'も', 'ま has two crossbars above the loop; も has them through the hook.'],
  ['ク', 'タ', 'タ (ta) has an extra slash inside.'],
  ['ス', 'ヌ', 'ヌ (nu) has the top stroke crossing through.'],
  ['フ', 'ワ', 'ワ (wa) has a left leg; フ (fu) does not.'],
  ['ロ', '口', 'ロ is katakana "ro"; 口 is the kanji for mouth. Nearly identical.'],
]
