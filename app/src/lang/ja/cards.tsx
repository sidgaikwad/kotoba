import type { ReactNode } from 'react'
import { JA } from '../../ui'

/* ============================================================
   JAPANESE CARD RENDERERS — the extension side of the seam.

   The core hands us a card with an opaque `type` string and an opaque
   `extra` JSON payload. It has no idea what any of these mean. Adding a
   card type here requires no migration and no change to core.ts —
   that is the seam working rather than a claim that it does.
   ============================================================ */

type Card = {
  type: string
  prompt: string
  answer: string
  extra: string | null
  direction: string
}

type Extra = {
  gloss?: string
  from?: string
  to?: string
  dial?: number
  why?: string
  correct?: string
  distractors?: string[]
  dial1?: string
  dial2?: string
}

const parse = (raw: string | null): Extra => {
  if (!raw) return {}
  try { return JSON.parse(raw) as Extra } catch { return {} }
}

const DIAL_NAME: Record<string, string> = {
  plain: 'plain (dial 1 off)',
  teineigo: '丁寧語 — polite to the listener',
  sonkeigo: '尊敬語 — raises the referent',
  kenjougo: '謙譲語 — lowers me',
  kenjougo1: '謙譲語Ⅰ — lowers me toward a third party',
  kenjougo2: '謙譲語Ⅱ — lowers me toward the listener',
}

export function renderCard(card: Card, revealed: boolean): ReactNode {
  const x = parse(card.extra)

  switch (card.type) {
    /* Transform one rung of the register ladder into another.
       The card type that carries this whole course. */
    case 'register-transform': {
      const [base, target] = card.prompt.split('→').map((s) => s.trim())
      return (
        <Frame
          hint={x.gloss ? `“${x.gloss}”` : undefined}
          question={
            <div>
              <div className="ja text-4xl leading-tight">{base}</div>
              <div className="mt-3 font-sans text-sm text-ink-2">
                → <strong className="ja">{target}</strong>
              </div>
              {x.to && (
                <div className="text-ink-3 text-xs font-sans mt-1">{DIAL_NAME[x.to] ?? x.to}</div>
              )}
            </div>
          }
          answer={revealed && (
            <div>
              <div className="ja text-3xl text-accent leading-tight">{card.answer}</div>
              {x.dial && (
                <p className="text-sm text-ink-2 mt-3">
                  Dial {x.dial} only. The addressee dial is untouched — this same form takes
                  either <span className="ja">〜ます</span> or a plain ending depending on who you
                  are talking to.
                </p>
              )}
            </div>
          )}
        />
      )
    }

    /* Pick the correct form for a described social situation. */
    case 'register-choice':
      return (
        <Frame
          question={<div className="text-lg leading-relaxed">{card.prompt}</div>}
          answer={revealed && (
            <div>
              <JA text={card.answer} tone="good" size="lg" />
              {x.distractors?.length ? (
                <div className="mt-4">
                  <div className="text-[0.65rem] uppercase tracking-widest text-ink-3 font-sans mb-1">
                    Not these
                  </div>
                  {x.distractors.map((d) => (
                    <div key={d} className="ja text-ink-3 text-base line-through decoration-bad/50">{d}</div>
                  ))}
                </div>
              ) : null}
              {x.why && <p className="text-sm text-ink-2 mt-4">{x.why}</p>}
            </div>
          )}
        />
      )

    /* Spot what is wrong with a grammatical-but-incorrect utterance. */
    case 'error-detection':
      return (
        <Frame
          hint="Something here is wrong. What, and why?"
          question={<div className="text-lg leading-relaxed">{card.prompt}</div>}
          answer={revealed && (
            <div>
              <p className="m-0 mb-3">{card.answer}</p>
              {x.correct && <JA text={x.correct} tone="good" size="lg" gloss="Correct form" />}
            </div>
          )}
        />
      )

    /* Name which dials are engaged in a real sentence. The reasoning card. */
    case 'register-analysis':
      return (
        <Frame
          hint="Which dials are turned, and toward whom?"
          question={<div className="text-lg leading-relaxed">{card.prompt}</div>}
          answer={revealed && (
            <div>
              <p className="m-0 mb-3">{card.answer}</p>
              {(x.dial1 || x.dial2) && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Dial n={1} label="Addressee" value={x.dial1} />
                  <Dial n={2} label="Referent" value={x.dial2} />
                </div>
              )}
            </div>
          )}
        />
      )

    default:
      return (
        <Frame
          question={<div className="text-lg">{card.prompt}</div>}
          answer={revealed && <div className="ja text-2xl text-accent">{card.answer}</div>}
        />
      )
  }
}

function Frame({ hint, question, answer }: {
  hint?: string; question: ReactNode; answer: ReactNode
}) {
  return (
    <div>
      {hint && <div className="text-ink-3 text-sm italic mb-3">{hint}</div>}
      <div className="border border-rule rounded-lg bg-paper-2 px-6 py-8">{question}</div>
      {answer && (
        <div className="border border-accent/40 rounded-lg bg-paper-2 px-6 py-6 mt-3">{answer}</div>
      )}
    </div>
  )
}

function Dial({ n, label, value }: { n: number; label: string; value?: string }) {
  return (
    <div className="border border-rule rounded-md px-3 py-2 bg-paper">
      <div className="text-[0.6rem] uppercase tracking-widest text-ink-3 font-sans">
        Dial {n} · {label}
      </div>
      <div className="ja text-sm mt-1">{value ?? '—'}</div>
    </div>
  )
}
