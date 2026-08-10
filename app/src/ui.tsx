import { useEffect, useState, type ReactNode } from 'react'

/* ================= tiny hash router ================= */

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

/* ================= colour system ================= */

/** Units cycle through these so the path reads as a journey, not a list. */
export const UNIT_COLORS = ['grape', 'coral', 'matcha', 'sky', 'gold', 'sakura'] as const
export type UnitColor = (typeof UNIT_COLORS)[number]

export const colorFor = (i: number): UnitColor => UNIT_COLORS[i % UNIT_COLORS.length]

const BG: Record<UnitColor, string> = {
  grape: 'bg-grape', coral: 'bg-coral', matcha: 'bg-matcha',
  sky: 'bg-sky', gold: 'bg-gold', sakura: 'bg-sakura',
}
const TEXT: Record<UnitColor, string> = {
  grape: 'text-grape', coral: 'text-coral', matcha: 'text-matcha',
  sky: 'text-sky', gold: 'text-gold', sakura: 'text-sakura',
}
export const bgOf = (c: UnitColor) => BG[c]
export const textOf = (c: UnitColor) => TEXT[c]

/* ================= primitives ================= */

export function Button({
  children, onClick, variant = 'solid', size = 'md', className = '', ...rest
}: {
  children: ReactNode; onClick?: () => void
  variant?: 'solid' | 'ghost' | 'quiet' | 'success'
  size?: 'md' | 'lg'; className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'font-sans font-bold rounded-xl cursor-pointer transition-all active:translate-y-px disabled:opacity-40 disabled:cursor-default'
  const sz = size === 'lg' ? 'px-7 py-3.5 text-base' : 'px-5 py-2.5 text-sm'
  const styles = {
    solid: 'bg-grape text-white shadow-[0_3px_0_0_color-mix(in_srgb,var(--color-grape)_65%,black)] hover:brightness-110 active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--color-grape)_65%,black)]',
    success: 'bg-matcha text-white shadow-[0_3px_0_0_color-mix(in_srgb,var(--color-matcha)_65%,black)] hover:brightness-110',
    ghost: 'border-2 border-rule text-ink-2 hover:border-grape hover:text-grape bg-surface',
    quiet: 'text-ink-3 hover:text-ink hover:bg-sunk',
  }[variant]
  return (
    <button className={`${base} ${sz} ${styles} ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}

export function Card({ children, className = '', pad = true }: {
  children: ReactNode; className?: string; pad?: boolean
}) {
  return (
    <div className={`bg-surface rounded-2xl shadow-[var(--shadow-card)] ${pad ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}

/** Unpadded surface, for callers that set their own padding. */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface rounded-2xl shadow-[var(--shadow-card)] ${className}`}>{children}</div>
  )
}

export function Stat({ label, value, color = 'grape', icon }: {
  label: string; value: ReactNode; color?: UnitColor; icon?: string
}) {
  return (
    <Card className="text-center">
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <div className={`text-3xl font-bold tabular-nums leading-none ${textOf(color)}`}>{value}</div>
      <div className="text-ink-3 text-[0.68rem] uppercase tracking-widest mt-2 font-sans font-semibold">
        {label}
      </div>
    </Card>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-xs uppercase tracking-widest text-ink-3 m-0 font-sans font-bold">{children}</h2>
      {right}
    </div>
  )
}

export function Progress({ pct, color = 'grape', height = 10 }: {
  pct: number; color?: UnitColor; height?: number
}) {
  return (
    <div className="bg-rule rounded-full overflow-hidden" style={{ height }}>
      <div
        className={`h-full ${bgOf(color)} rounded-full transition-all duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  )
}

/** Circular progress used on the lesson path nodes. */
export function Ring({ pct, size = 64, color = 'grape', children }: {
  pct: number; size?: number; color?: UnitColor; children?: ReactNode
}) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-rule)" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="5" strokeLinecap="round"
          stroke={`var(--color-${color})`}
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, pct)) / 100}
          className="transition-all duration-500"
        />
      </svg>
      {children}
    </div>
  )
}

/** Japanese text with reading and gloss. */
export function JA({ text, reading, gloss, size = 'md', tone, note }: {
  text: string; reading?: string; gloss?: string
  size?: 'md' | 'lg' | 'xl'; tone?: 'good' | 'bad' | 'flag'; note?: string
}) {
  const sz = { md: 'text-xl', lg: 'text-3xl', xl: 'text-5xl' }[size]
  const accent = tone
    ? { good: 'border-matcha bg-matcha/8', bad: 'border-berry bg-berry/8', flag: 'border-gold bg-gold/8' }[tone]
    : 'border-grape/40 bg-grape/5'
  return (
    <div className={`border-l-4 ${accent} rounded-r-xl pl-4 pr-3 py-3 my-3`}>
      <div className={`ja ${sz} leading-relaxed`}>{text}</div>
      {reading && <div className="text-ink-3 text-sm font-sans mt-0.5">{reading}</div>}
      {gloss && <div className="text-ink-2 text-sm italic mt-1">{gloss}</div>}
      {note && <div className="text-ink-2 text-sm mt-2 pt-2 border-t border-rule">{note}</div>}
    </div>
  )
}

/* ================= shell ================= */

const NAV = [
  { to: '', label: 'Home', icon: '🏠' },
  { to: 'learn', label: 'Learn', icon: '📖' },
  { to: 'remember', label: 'Remember', icon: '🧠' },
  { to: 'notes', label: 'Notes', icon: '📝' },
  { to: 'stats', label: 'Progress', icon: '📊' },
]

export function Shell({ active, go, due, streak, children }: {
  active: string; go: (to: string) => void
  due: number; streak: number; children: ReactNode
}) {
  return (
    <div className="flex min-h-full">
      <nav
        data-tauri-drag-region
        className="w-56 shrink-0 bg-surface border-r border-rule pt-11 px-3 pb-5 flex flex-col"
      >
        <div className="px-3 mb-7">
          <div className="text-2xl font-bold leading-none tracking-tight">
            Kotoba
          </div>
          <div className="ja text-ink-3 text-xs mt-1">ことば</div>
        </div>

        {NAV.map((n) => {
          const on = active === n.to
          return (
            <button
              key={n.to}
              onClick={() => go(n.to)}
              className={`text-left font-sans text-sm font-semibold px-3 py-2.5 rounded-xl mb-1 cursor-pointer
                transition-all flex items-center gap-2.5
                ${on ? 'bg-grape text-white shadow-[var(--shadow-pop)]' : 'text-ink-2 hover:bg-sunk'}`}
            >
              <span className="text-base leading-none">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.to === 'remember' && due > 0 && (
                <span className={`text-[0.7rem] font-bold tabular-nums px-1.5 py-0.5 rounded-full
                  ${on ? 'bg-white/25' : 'bg-coral text-white'}`}>{due}</span>
              )}
            </button>
          )
        })}

        <div className="mt-auto mx-1 px-3 py-3 rounded-xl bg-gradient-to-br from-gold/20 to-coral/15">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold tabular-nums leading-none">{streak}</span>
          </div>
          <div className="text-ink-3 text-[0.6rem] uppercase tracking-widest mt-1 font-sans font-bold">
            day streak
          </div>
        </div>
      </nav>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-9 pt-11 pb-16">{children}</div>
      </main>
    </div>
  )
}
