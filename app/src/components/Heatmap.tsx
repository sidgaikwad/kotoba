import type { StudyDay } from '../db/client'

const DAY_MS = 86_400_000
const WEEKS = 53

/**
 * GitHub-style contribution grid.
 *
 * Intensity is driven by *reviews completed*, not by minutes with the app
 * open — time-in-app is the metric that rewards leaving a window in the
 * background, and it is exactly the kind of vanity signal this app should
 * not have.
 */
export function Heatmap({ days }: { days: StudyDay[] }) {
  const byDay = new Map(days.map((d) => [d.day, d]))

  // Grid ends on today and runs back to the Sunday 52 weeks earlier, so the
  // rightmost column is the current, partial week.
  const today = new Date(new Date().toLocaleDateString('en-CA'))
  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay()))

  const cells: { iso: string; d?: StudyDay; future: boolean }[] = []
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const date = new Date(end.getTime() - i * DAY_MS)
    const iso = date.toLocaleDateString('en-CA')
    cells.push({ iso, d: byDay.get(iso), future: date > today })
  }

  const peak = Math.max(1, ...days.map((d) => d.reviews))

  return (
    <div className="overflow-x-auto">
      <div
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateRows: 'repeat(7, 11px)', width: 'max-content' }}
      >
        {cells.map(({ iso, d, future }) => (
          <div
            key={iso}
            title={
              future
                ? ''
                : `${iso} — ${d?.reviews ?? 0} review${d?.reviews === 1 ? '' : 's'}${
                    d?.counted_for_streak ? ' · streak day' : ''
                  }`
            }
            className="rounded-[2px]"
            style={{
              width: 11,
              height: 11,
              background: future
                ? 'transparent'
                : intensity(d?.reviews ?? 0, peak),
              outline: d?.counted_for_streak
                ? '1px solid color-mix(in srgb, var(--color-accent) 55%, transparent)'
                : 'none',
              outlineOffset: -1,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function intensity(reviews: number, peak: number): string {
  if (reviews === 0) return 'var(--color-rule)'
  // Four steps, on a sqrt curve so one good day doesn't flatten everything else.
  const step = Math.min(4, Math.ceil((Math.sqrt(reviews) / Math.sqrt(peak)) * 4))
  const pct = [0, 28, 48, 70, 100][step]
  return `color-mix(in srgb, var(--color-accent) ${pct}%, var(--color-rule))`
}
