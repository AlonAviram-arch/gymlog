import { useState } from 'react'
import * as A from '../lib/store'
import { entryToExercise } from '../data/library'
import CustomExercises from './CustomExercises'
import ExerciseBrowser, { ExerciseDetail } from './ExerciseBrowser'
import ExerciseForm from './ExerciseForm'
import { SettingsButton } from './ui'

export default function ExercisesTab({ state, act, onOpenSettings }) {
  const [view, setView] = useState('library')
  const [detail, setDetail] = useState(null) // library entry being viewed
  const [adding, setAdding] = useState(null) // library entry being added to a day
  const [notice, setNotice] = useState('')

  // Entries without instructions (cardio presets) go straight to the add form.
  const pick = (entry) => (entry.steps.length ? setDetail(entry) : setAdding(entry))

  return (
    <>
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
          <p className="text-sm text-zinc-400">Browse the library or build your own</p>
        </div>
        <SettingsButton onClick={onOpenSettings} />
      </header>

      <div className="mb-4 grid grid-cols-2 rounded-xl bg-zinc-900 p-1">
        {[
          ['library', 'Library'],
          ['custom', `My Custom${state.customExercises.length ? ` (${state.customExercises.length})` : ''}`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`h-11 rounded-lg text-sm font-semibold ${view === id ? 'bg-zinc-700 text-zinc-50' : 'text-zinc-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {notice && (
        <p className="mb-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" role="status">
          {notice}
        </p>
      )}

      {view === 'library' ? <ExerciseBrowser onPick={pick} showInfo={false} /> : <CustomExercises state={state} act={act} />}

      {detail && (
        <ExerciseDetail
          entry={detail}
          actionLabel="Add to workout plan"
          onClose={() => setDetail(null)}
          onAction={() => {
            setAdding(detail)
            setDetail(null)
          }}
        />
      )}

      {adding && (
        <ExerciseForm
          title="Add to workout plan"
          submitLabel="Add exercise"
          initial={entryToExercise(adding)}
          days={state.plan}
          onClose={() => setAdding(null)}
          onSubmit={(data, dayId) => {
            act(A.addExercise, dayId, data)
            const day = state.plan.find((d) => d.id === dayId)
            setNotice(`Added ${data.name} to ${day?.name ?? 'your plan'}.`)
            setAdding(null)
          }}
        />
      )}
    </>
  )
}
