import { useEffect, useRef, useState } from 'react'

const FOCUS_MIN = 25
const BREAK_MIN = 5

/**
 * Focus timer, embedded in the study session rather than sitting beside it.
 *
 * Honest about the evidence, because the prompt asked for that: the *spacing*
 * and *retrieval* this app is built on have strong experimental support. The
 * specific 25/5 split does not — it is a productivity convention, not a
 * finding. What it reliably does is make time-on-task visible and give you a
 * pre-committed stopping point, which is worth having even if the exact
 * numbers are arbitrary. Treat 25 as a default, not a dose.
 */
export function Pomodoro() {
  const [running, setRunning] = useState(false)
  const [onBreak, setOnBreak] = useState(false)
  const [left, setLeft] = useState(FOCUS_MIN * 60)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1
        const nextBreak = !onBreak
        setOnBreak(nextBreak)
        return (nextBreak ? BREAK_MIN : FOCUS_MIN) * 60
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running, onBreak])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      {onBreak && running && (
        <span className="text-[0.6rem] uppercase tracking-widest text-good font-sans font-bold">break</span>
      )}
      <button
        onClick={() => setRunning((r) => !r)}
        className={`font-mono text-sm tabular-nums px-2.5 py-1 rounded border cursor-pointer transition-colors
          ${running ? 'border-accent text-accent' : 'border-rule text-ink-3 hover:text-ink'}`}
        title={running ? 'Pause focus timer' : 'Start focus timer'}
      >
        {mm}:{ss}
      </button>
    </div>
  )
}

/**
 * Within-session fatigue detection.
 *
 * Compares recent accuracy against the earlier part of the session. Grinding
 * on while accuracy decays does not just waste the session — it encodes the
 * failures, so you come back tomorrow slightly worse at the material than when
 * you sat down. The app should say so rather than let you keep going.
 */
export function useFatigue(window = 6, dropPoints = 30) {
  const results = useRef<boolean[]>([])
  const [tired, setTired] = useState(false)

  function record(ok: boolean) {
    results.current.push(ok)
    const all = results.current
    if (all.length < window * 2) return

    const recent = all.slice(-window)
    const earlier = all.slice(0, -window)
    const pct = (a: boolean[]) => (a.filter(Boolean).length / a.length) * 100

    setTired(pct(earlier) - pct(recent) >= dropPoints)
  }

  return { tired, record, reset: () => { results.current = []; setTired(false) } }
}
