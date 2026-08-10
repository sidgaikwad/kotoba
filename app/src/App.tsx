import { useEffect, useState } from 'react'
import { HomeScreen } from './screens/Home'
import { LearnScreen } from './screens/Learn'
import { LessonScreen } from './screens/Lesson'
import { NotesScreen } from './screens/Notes'
import { ReviewScreen } from './screens/Review'
import { StatsScreen } from './screens/Stats'
import { Shell, useRoute } from './ui'
import { currentStreak, totals } from './db/client'

export default function App() {
  const [parts, go] = useRoute()
  const [due, setDue] = useState(0)
  const [streak, setStreak] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Re-read the badge counts on every navigation, so finishing a review or a
  // lesson is reflected immediately rather than on next launch.
  useEffect(() => {
    Promise.all([totals(), currentStreak()])
      .then(([t, s]) => { setDue(t?.due ?? 0); setStreak(s) })
      .catch((e) => setError(String(e)))
  }, [parts.join('/')])

  const [head, arg] = parts
  const active = head === 'lesson' ? 'learn' : (head ?? '')

  return (
    <Shell active={active} go={go} due={due} streak={streak}>
      {error && (
        <div className="border-l-3 border-bad bg-paper-2 px-4 py-3 mb-6 text-sm rounded-r">
          <strong>Database error.</strong> {error}
          <div className="text-ink-3 text-xs mt-1">
            Expected when this build is opened outside the desktop shell — there is no Tauri IPC in a
            plain browser.
          </div>
        </div>
      )}

      {!head && <HomeScreen go={go} />}
      {head === 'learn' && <LearnScreen go={go} />}
      {head === 'lesson' && arg && <LessonScreen slug={arg} go={go} />}
      {head === 'review' && <ReviewScreen go={go} />}
      {head === 'notes' && <NotesScreen />}
      {head === 'stats' && <StatsScreen />}
    </Shell>
  )
}
