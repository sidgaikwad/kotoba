import { useEffect, useState, type ReactNode } from 'react'

/* ================= tiny hash router ================= */
/* Five screens in a desktop window. A routing library would be more
   machinery than the problem has. */

export function useRoute(): [string[], (to: string) => void] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [parts, setParts] = useState<string[]>(read)

  useEffect(() => {
    const on = () => setParts(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  return [parts, (to: string) => { window.location.hash = to }]
}

/* ================= primitives ================= */

export function Button({
  children, onClick, variant = 'solid', className = '', ...rest
}: {
  children: ReactNode; onClick?: () => void
  variant?: 'solid' | 'ghost' | 'quiet'; className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'font-sans text-sm font-semibold px-4 py-2 rounded-md cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default'
  const styles = {
    solid: 'bg-accent text-paper hover:opacity-90',
    ghost: 'border border-accent text-accent hover:bg-paper-2',
    quiet: 'text-ink-2 hover:text-ink hover:bg-paper-2',
  }[variant]
  return (
    <button className={`${base} ${styles} ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-rule rounded-lg bg-paper-2 ${className}`}>{children}</div>
  )
}

export function Stat({ label, value, accent, sub }: {
  label: string; value: ReactNode; accent?: boolean; sub?: string
}) {
  return (
    <Panel className="px-4 py-4">
      <div className={`text-2xl font-semibold tabular-nums leading-none ${accent ? 'text-accent' : ''}`}>
        {value}
      </div>
      <div className="text-ink-3 text-[0.68rem] uppercase tracking-widest mt-2">{label}</div>
      {sub && <div className="text-ink-3 text-xs mt-1">{sub}</div>}
    </Panel>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-xs uppercase tracking-widest text-ink-3 m-0">{children}</h2>
      {right}
    </div>
  )
}

/** Japanese text with optional reading and gloss. Used everywhere. */
export function JA({ text, reading, gloss, size = 'md', tone }: {
  text: string; reading?: string; gloss?: string
  size?: 'md' | 'lg' | 'xl'; tone?: 'good' | 'bad' | 'flag'
}) {
  const sz = { md: 'text-lg', lg: 'text-2xl', xl: 'text-4xl' }[size]
  const border = tone
    ? { good: 'border-good', bad: 'border-bad', flag: 'border-flag' }[tone]
    : 'border-rule'
  return (
    <div className={`border-l-2 ${border} pl-3 py-1 my-2`}>
      <div className={`ja ${sz} leading-relaxed`}>{text}</div>
      {reading && <div className="text-ink-3 text-sm font-sans">{reading}</div>}
      {gloss && <div className="text-ink-2 text-sm italic mt-0.5">{gloss}</div>}
    </div>
  )
}

/* ================= shell ================= */

const NAV = [
  { to: '', label: 'Home' },
  { to: 'learn', label: 'Learn' },
  { to: 'review', label: 'Review' },
  { to: 'notes', label: 'Notes' },
  { to: 'stats', label: 'Progress' },
]

export function Shell({ active, go, due, streak, children }: {
  active: string; go: (to: string) => void
  due: number; streak: number; children: ReactNode
}) {
  return (
    <div className="flex min-h-full">
      <nav
        data-tauri-drag-region
        className="w-52 shrink-0 border-r border-rule bg-paper-2 pt-12 px-3 pb-6 flex flex-col"
      >
        <div className="px-2 mb-8">
          <div className="text-xl font-semibold leading-none">Kotoba</div>
          <div className="ja text-ink-3 text-xs mt-1">日本語</div>
        </div>

        {NAV.map((n) => (
          <button
            key={n.to}
            onClick={() => go(n.to)}
            className={`text-left font-sans text-sm px-3 py-2 rounded-md mb-1 cursor-pointer transition-colors flex justify-between items-center
              ${active === n.to ? 'bg-accent text-paper font-semibold' : 'text-ink-2 hover:bg-rule/40'}`}
          >
            {n.label}
            {n.to === 'review' && due > 0 && (
              <span className={`text-xs tabular-nums px-1.5 py-0.5 rounded
                ${active === n.to ? 'bg-paper/25' : 'bg-accent text-paper'}`}>{due}</span>
            )}
          </button>
        ))}

        <div className="mt-auto px-3 pt-4 border-t border-rule">
          <div className="text-2xl font-semibold tabular-nums leading-none">{streak}</div>
          <div className="text-ink-3 text-[0.6rem] uppercase tracking-widest mt-1">day streak</div>
        </div>
      </nav>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 pt-12 pb-16">{children}</div>
      </main>
    </div>
  )
}
