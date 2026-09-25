import { useCallback, useEffect, useState } from 'react'
import { loadState, saveState } from './lib/store'
import { useRestTimer } from './hooks/useRestTimer'
import BottomNav from './components/BottomNav'
import ExercisesTab from './components/ExercisesTab'
import HistoryTab from './components/HistoryTab'
import RestTimerBar from './components/RestTimerBar'
import SettingsSheet from './components/SettingsSheet'
import WorkoutsTab from './components/WorkoutsTab'
import WorkoutSummary from './components/WorkoutSummary'
import { sessionSummary } from './lib/stats'

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('workouts')
  const [openDayId, setOpenDayId] = useState(() => loadState().active?.dayId ?? null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [finished, setFinished] = useState(null) // { entry, summary } after finishing a workout
  const timer = useRestTimer(state.settings)

  useEffect(() => saveState(state), [state])

  // act(action, ...args) applies a pure store action.
  const act = useCallback((fn, ...args) => setState((s) => fn(s, ...args)), [])

  const changeTab = (id) => {
    if (id === tab && id === 'workouts') setOpenDayId(null)
    setTab(id)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased">
      <main className="pt-safe mx-auto max-w-lg px-4 pb-48">
        {tab === 'workouts' && (
          <WorkoutsTab
            state={state}
            act={act}
            timer={timer}
            openDayId={openDayId}
            setOpenDayId={(id) => {
              setOpenDayId(id)
              window.scrollTo({ top: 0 })
            }}
            onOpenSettings={() => setSettingsOpen(true)}
            onFinished={(entry, earlier) => setFinished({ entry, summary: sessionSummary(entry, earlier) })}
          />
        )}
        {tab === 'history' && <HistoryTab state={state} act={act} onOpenSettings={() => setSettingsOpen(true)} />}
        {tab === 'library' && <ExercisesTab state={state} act={act} onOpenSettings={() => setSettingsOpen(true)} />}
      </main>
      <RestTimerBar timer={timer} />
      <BottomNav tab={tab} onChange={changeTab} />
      {finished && <WorkoutSummary entry={finished.entry} summary={finished.summary} onClose={() => setFinished(null)} />}
      {settingsOpen && <SettingsSheet state={state} act={act} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
