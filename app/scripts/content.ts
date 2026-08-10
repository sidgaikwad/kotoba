/**
 * Course content as data.
 *
 * Lessons are teaching first. `predict` blocks force a commitment before the
 * explanation lands; `practice` blocks sit mid-lesson while the idea is warm.
 * A lesson that is only a quiz at the end has tested the learner without ever
 * having taught them.
 *
 * Sourcing: the register model follows 敬語の指針 (文化審議会答申, 2007-02-02).
 * No copyrighted textbook material is reproduced anywhere here; every example
 * sentence is written for this course.
 */

export type Block =
  | { kind: 'prose'; html: string }
  | { kind: 'example'; ja: string; reading?: string; gloss?: string; tone?: 'good' | 'bad' | 'flag'; note?: string }
  | { kind: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { kind: 'callout'; tone?: 'note' | 'warn'; html: string }
  | { kind: 'predict'; html: string; reveal: string }
  | { kind: 'practice'; question: string; options: { html: string; ok?: boolean }[]; explain: string }
  | { kind: 'source'; tier: string; title: string; url: string; html: string }

export type LessonDef = {
  slug: string
  title: string
  summary: string
  ordinal: number
  minutes: number
  concepts: string[]
  blocks: Block[]
}

const KEIGO_PDF = 'https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf'

/* ============================================================
   LESSON 1
   ============================================================ */

export const lesson01: LessonDef = {
  slug: 'cost-of-wrong-register',
  title: 'The cost of the wrong register',
  summary:
    'Why politeness is the thing that will actually hold you back at work, and why you will never '
    + 'notice yourself getting it wrong.',
  ordinal: 1,
  minutes: 8,
  concepts: ['uchi-soto-flip'],
  blocks: [
    {
      kind: 'prose',
      html: `<p>You already know Japanese has politeness levels. Everyone knows that. What almost
        nobody tells you before they arrive is which errors actually cost something.</p>
        <p>Grammar errors are <strong>loud</strong>. If you conjugate a verb wrong, comprehension
        breaks, someone asks what you meant, and you find out immediately. Loud errors fix
        themselves — the world gives you a feedback loop for free.</p>
        <p>Register errors are <strong>silent</strong>. The sentence is grammatical. Everyone
        understands you perfectly. Nobody corrects you, because correcting a foreigner's politeness
        would itself be rude. You simply come across slightly wrong, every day, for years.</p>`,
    },
    {
      kind: 'callout',
      tone: 'warn',
      html: `<p><strong>This is the whole reason the course is ordered the way it is.</strong>
        Time spent on a silent-failure skill is worth more than the same time spent on a loud one.
        Your kana will fix itself through sheer volume. Your register will not.</p>`,
    },
    {
      kind: 'predict',
      html: `<p>You are three weeks into your job at <strong>株式会社ミナト</strong>. The phone
        rings — a client from 株式会社ケイヨウ. They ask for your department head,
        <strong>田中部長</strong>, who has stepped out.</p>
        <p>You know 田中部長 outranks you enormously. You want to be respectful. Which do you say?</p>
        <p class="ja" style="line-height:2.2">
          A. 田中部長はいらっしゃいません<br>
          B. 田中はただいま外出しております<br>
          C. 田中部長は今おりません<br>
          D. 田中さんは外出されています
        </p>`,
      reveal: `<p><strong>B.</strong> And if you picked A, C, or D — which almost every English
        speaker does — you did the polite-looking thing and got it exactly backwards.</p>
        <p>The instinct that betrayed you is a reasonable one: <em>he is senior, so I should elevate
        him.</em> That instinct is correct inside the building and wrong on this phone call.</p>`,
    },
    {
      kind: 'prose',
      html: `<p>Japanese constantly divides the world into <span class="ja">内</span>
        <em>uchi</em> — my side — and <span class="ja">外</span> <em>soto</em> — outside.</p>
        <p>The critical thing, and the thing that makes this hard: <strong>the boundary moves
        depending on who you are talking to.</strong> It is not a fixed org chart. It is redrawn
        fresh in every conversation.</p>`,
    },
    {
      kind: 'table',
      caption: 'The same person, two conversations',
      headers: ['You are speaking to', '田中部長 counts as', 'So you say'],
      rows: [
        ['A colleague inside ミナト', '<span class="ja">外</span> — above you', '<span class="ja">田中部長はいらっしゃいます</span>'],
        ['A client at ケイヨウ', '<span class="ja">内</span> — your own side', '<span class="ja">田中はおります</span>'],
      ],
    },
    {
      kind: 'prose',
      html: `<p>Talking to a client, your whole company collapses into <em>your side</em>. 田中 is
        now on the same side of the line as you are — so he gets exactly what you give yourself:
        no title, no <span class="ja">さん</span>, and humble verbs.</p>
        <p>Elevating your own boss in front of a customer says <em>my company outranks yours</em>.
        Nobody will tell you that you did it.</p>`,
    },
    {
      kind: 'example',
      ja: '田中はただいま外出しております。',
      reading: 'Tanaka wa tadaima gaishutsu shite orimasu.',
      gloss: 'Tanaka is out at the moment.',
      tone: 'good',
      note: 'Note that you are still extremely polite — to the client. What changed is how you refer to your own side.',
    },
    {
      kind: 'example',
      ja: '田中部長はいらっしゃいません。',
      reading: 'Tanaka-buchou wa irasshaimasen.',
      gloss: 'Department Head Tanaka is not here. (to a client — wrong)',
      tone: 'bad',
      note: 'Grammatical, fluent, and it quietly insults the customer.',
    },
    {
      kind: 'practice',
      question: `<p>Same call. The client asks when 田中 will be back, and you want to say he will
        return at 3. Which is right?</p>`,
      options: [
        { html: '<span class="ja">田中は3時に戻ります</span>', ok: true },
        { html: '<span class="ja">田中部長は3時にお戻りになります</span>' },
        { html: '<span class="ja">田中さんは3時に戻られます</span>' },
        { html: '<span class="ja">田中部長は3時に帰ってきます</span>' },
      ],
      explain: `<p>Once 田中 is <span class="ja">内</span>, everything honorific about him has to
        go — the title, the <span class="ja">さん</span>, <span class="ja">お戻りになる</span>,
        <span class="ja">戻られる</span>. Plain verb, polite ending toward the client.</p>
        <p>Notice you did not need any new vocabulary to get this right. You needed to know
        <em>which side the line was on</em>.</p>`,
    },
    {
      kind: 'prose',
      html: `<p>This is what the rest of the register track is for. Not memorising polite words —
        working out, in the moment, who is on which side and what that obliges you to say.</p>
        <p>The next lesson gives you the structural model that makes all of it derivable instead of
        memorised.</p>`,
    },
    {
      kind: 'source',
      tier: 'T1',
      title: '敬語の指針 — 文化審議会答申, 2007',
      url: KEIGO_PDF,
      html: `<p>The Japanese government's own framework for this. You are not expected to read it
        yet. Open it and notice only one thing: politeness was confusing enough that a national
        council was convened to rule on it.</p>`,
    },
  ],
}

/* ============================================================
   LESSON 2
   ============================================================ */

export const lesson02: LessonDef = {
  slug: 'two-dials',
  title: 'Two dials, not one',
  summary:
    'English has a single politeness knob. Japanese has two, and they move independently. Almost '
    + 'every register mistake you will make is a confusion between them.',
  ordinal: 2,
  minutes: 12,
  concepts: ['two-dials', 'sonkeigo-verbs', 'kenjougo-verbs', 'kenjougo-1-vs-2', 'nijuu-keigo'],
  blocks: [
    {
      kind: 'predict',
      html: `<p>You are chatting with <strong>鈴木さん</strong> — your peer, someone you get lunch
        with. You want to ask whether <strong>田中部長</strong> has already gone home.</p>
        <p class="ja" style="font-size:1.5rem;line-height:2">田中部長、もう帰られた？</p>
        <p><strong>Is this sentence polite, or casual?</strong> Commit before you look.</p>`,
      reveal: `<p><strong>Both. At the same time, on different dials.</strong></p>
        <ul>
          <li><span class="ja">帰られた</span> — honorific. It elevates 田中部長.</li>
          <li><span class="ja">〜た？</span> — plain, casual. It is relaxed toward 鈴木さん.</li>
        </ul>
        <p>You are being deferential about the person you are <em>discussing</em> while being
        informal with the person you are <em>talking to</em>. English cannot do this in one
        sentence. That is the entire lesson.</p>`,
    },
    {
      kind: 'prose',
      html: `<p>If you answered "polite", or "casual", or "somewhere in between", you reached for a
        single scale. That scale does not exist in Japanese. There are two, and they are
        independent.</p>`,
    },
    {
      kind: 'table',
      caption: 'The two dials',
      headers: ['', 'Dial 1 — Addressee', 'Dial 2 — Referent'],
      rows: [
        ['<strong>Points at</strong>', 'Whoever is listening or reading', 'Whoever is being talked <em>about</em>'],
        ['<strong>Machinery</strong>', '<span class="ja">丁寧語</span> — the <span class="ja">です・ます</span> layer', '<span class="ja">尊敬語</span> raises them · <span class="ja">謙譲語</span> lowers me'],
        ['<strong>Lives</strong>', 'On the sentence ending', 'In the verb stem, or a different verb entirely'],
        ['<strong>Answers</strong>', 'How formal is this conversation?', 'Who outranks whom in what I am describing?'],
      ],
    },
    {
      kind: 'table',
      caption: 'Every combination is legal — 行く',
      headers: ['', 'Dial 2 neutral', 'Dial 2 raise them', 'Dial 2 lower me'],
      rows: [
        ['<strong>Dial 1 plain</strong>', '<span class="ja">行く</span>', '<span class="ja">いらっしゃる</span>', '<span class="ja">伺う</span>'],
        ['<strong>Dial 1 polite</strong>', '<span class="ja">行きます</span>', '<span class="ja">いらっしゃいます</span>', '<span class="ja">伺います</span>'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warn',
      html: `<p><strong>Look at the top-right cell.</strong> <span class="ja">いらっしゃる</span> —
        honorific about someone, plain toward your listener. English speakers assume that cell
        cannot exist. You will live in it constantly: talking to a friend about your boss.</p>`,
    },
    {
      kind: 'prose',
      html: `<h3>Why a spec is written in plain form and is still formal</h3>
        <p>An internal <span class="ja">仕様書</span> uses <span class="ja">だ・である</span>.
        Beginners read that as informal and are baffled, because a spec is obviously a formal
        document.</p>
        <p>Dial 1 resolves it: <strong><span class="ja">丁寧語</span> is deference toward a
        listener.</strong> A document has no listener in the room. There is nobody to be polite
        <em>to</em>, so Dial 1 sits at zero — while the document stays entirely formal.</p>`,
    },
    {
      kind: 'practice',
      question: `<p>So which of these is true?</p>`,
      options: [
        { html: 'Plain form is informal; polite form is formal' },
        { html: 'Formality and politeness are different measurements', ok: true },
        { html: 'Documents are simply an exception to the rule' },
        { html: '<span class="ja">である</span> is a kind of keigo' },
      ],
      explain: `<p>Delete the equation <em>plain = informal</em> now, or it will mislead you for
        years. <span class="ja">です・ます</span> measures deference to a listener. Formality is a
        separate property of the situation and the channel.</p>`,
    },
    {
      kind: 'prose',
      html: `<h3>Why you humble your own boss to a client</h3>
        <p>Dial 2 does not ask "who is senior?" It asks "<em>whose side is each person on, right
        now?</em>" — which is the 内/外 boundary from the last lesson, now with a name for the
        machinery it drives.</p>`,
    },
    {
      kind: 'example',
      ja: '田中はただいま外出しております。',
      reading: 'Tanaka wa tadaima gaishutsu shite orimasu.',
      gloss: 'To a client. Dial 1 high — polite to them. Dial 2 humble — 田中 is mine now.',
      tone: 'good',
    },
    {
      kind: 'example',
      ja: '田中部長はいらっしゃいません。',
      reading: 'Tanaka-buchou wa irasshaimasen.',
      gloss: 'To a client: wrong. Elevating your own side above the customer.',
      tone: 'bad',
      note: 'Dial 1 is identical in both sentences. Only Dial 2 flipped, because the boundary of "my side" moved.',
    },
    {
      kind: 'prose',
      html: `<h3>Why 二重敬語 is an error rather than extra safety</h3>
        <p><span class="ja">おっしゃられる</span> is <span class="ja">おっしゃる</span> — already
        Dial 2 — plus <span class="ja">-られる</span>, Dial 2 again. It turns one dial twice. That
        is not more respect; it is a mechanism misfiring, the way a doubled negation is not a
        stronger no.</p>`,
    },
    {
      kind: 'practice',
      question: `<p>Which is the double honorific?</p>`,
      options: [
        { html: '<span class="ja">部長がおっしゃいました</span>' },
        { html: '<span class="ja">部長が言われました</span>' },
        { html: '<span class="ja">部長がおっしゃられました</span>', ok: true },
        { html: '<span class="ja">部長がお話しになりました</span>' },
      ],
      explain: `<p>You will hear native speakers say <span class="ja">おっしゃられる</span> daily,
        and 敬語の指針 still names it as something to avoid. Both facts are true — hold both.</p>
        <p>The useful takeaway is not the individual form. It is that <strong>more is not
        safer</strong>. Piling politeness on signals that you do not know how the mechanism works.</p>`,
    },
    {
      kind: 'prose',
      html: `<h3>The payoff: why there are five categories, not three</h3>
        <p>Once Dial 2 exists as its own thing, the split that confuses everyone becomes derivable.
        <span class="ja">謙譲語</span> lowers you — but <em>toward whom?</em> There are two
        different answers, so there are two different categories.</p>`,
    },
    {
      kind: 'table',
      headers: ['', '<span class="ja">謙譲語Ⅰ</span>', '<span class="ja">謙譲語Ⅱ</span> (丁重語)'],
      rows: [
        ['<strong>Lowers me toward</strong>', 'A third party in the sentence', 'The listener'],
        ['<strong>Needs</strong>', 'A target worthy of respect', 'Nothing — just a listener'],
        ['<strong>Example</strong>', '<span class="ja">部長のところに伺います</span>', '<span class="ja">大阪に参ります</span>'],
        ['<strong>Why</strong>', 'Elevates 部長 by lowering my approach to him', 'Osaka cannot be respected — the humility is aimed at <em>you</em>'],
      ],
    },
    {
      kind: 'practice',
      question: `<p>You are going to Osaka tomorrow and telling your manager. Which is right?</p>`,
      options: [
        { html: '<span class="ja">明日、大阪に伺います</span>' },
        { html: '<span class="ja">明日、大阪に参ります</span>', ok: true },
        { html: '<span class="ja">明日、大阪にいらっしゃいます</span>' },
        { html: '<span class="ja">明日、大阪にお越しになります</span>' },
      ],
      explain: `<p><span class="ja">伺う</span> is 謙譲語Ⅰ and needs a respectable <em>target</em> —
        you visit a person, not a city. The last two are 尊敬語 aimed at yourself, which elevates
        you: the most embarrassing register error available.</p>
        <p>You did not memorise that. You derived it by asking who the humility was pointed at.</p>`,
    },
    {
      kind: 'prose',
      html: `<p>The old three-category model had no slot for 謙譲語Ⅱ, which is why 文化審議会
        replaced it in 2007. Every textbook still printing three categories is teaching a model the
        Japanese government retired.</p>
        <p>The cards for this lesson are now unlocked. Reading this once is not remembering it.</p>`,
    },
    {
      kind: 'source',
      tier: 'T1',
      title: '敬語の指針 — 第2章 敬語の種類',
      url: KEIGO_PDF,
      html: `<p>Read <strong>第2章</strong> only. You now have the model that makes its five-way
        table readable rather than arbitrary.</p>`,
    },
  ],
}

export const LESSONS = [lesson01, lesson02]
