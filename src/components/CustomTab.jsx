import { useState } from 'react'
import { ListPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import * as A from '../lib/store'
import { muscleLabel } from '../data/muscles'
import { fmtRest } from '../lib/format'
import ExerciseForm from './ExerciseForm'
import { SettingsButton, Sheet } from './ui'

export default function CustomTab({ state, act, onOpenSettings }) {
  const [form, setForm] = useState(null) // { mode: 'new' } | { mode: 'edit', item }
  const [adding, setAdding] = useState(null) // custom exercise being added to a day
  const [added, setAdded] = useState('')

  return (
    <>
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Exercises</h1>
          <p className="text-sm text-zinc-400">Your own movements, ready to add to any day</p>
        </div>
        <SettingsButton onClick={onOpenSettings} />
      </header>

      <button
        onClick={() => setForm({ mode: 'new' })}
        className="mb-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950"
      >
        <Plus size={22} /> New exercise
      </button>

      {added && <p className="mb-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{added}</p>}

      {state.customExercises.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          <ListPlus className="mx-auto mb-3" size={32} />
          Create exercises with your own sets, rep ranges and rest times. They also appear as swap options for the same muscle.
        </div>
      ) : (
        <ul className="space-y-2">
          {state.customExercises.map((c) => (
            <li key={c.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="font-semibold">{c.name}</div>
              <div className="mt-0.5 text-sm text-zinc-400">
                {c.sets} × {c.reps} · Rest {fmtRest(c.rest)} · {muscleLabel(c.muscle)}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setAdding(c)} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-500/15 text-sm font-semibold text-cyan-300">
                  <Plus size={16} /> Add to day
                </button>
                <button onClick={() => setForm({ mode: 'edit', item: c })} className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-800 text-zinc-300" aria-label="Edit">
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => confirm(`Delete "${c.name}"? (It stays in any day it was added to.)`) && act(A.removeCustom, c.id)}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <ExerciseForm
          title={form.mode === 'new' ? 'New custom exercise' : 'Edit custom exercise'}
          submitLabel={form.mode === 'new' ? 'Create' : 'Save'}
          initial={form.item}
          onClose={() => setForm(null)}
          onSubmit={(data) => {
            if (form.mode === 'new') act(A.addCustom, data)
            else act(A.updateCustom, form.item.id, data)
            setForm(null)
          }}
        />
      )}

      {adding && (
        <Sheet title={`Add "${adding.name}" to…`} onClose={() => setAdding(null)}>
          <ul className="space-y-2">
            {state.plan.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => {
                    const { id: _id, ...data } = adding
                    act(A.addExercise, d.id, data)
                    setAdded(`Added ${adding.name} to ${d.name}.`)
                    setAdding(null)
                  }}
                  className="flex min-h-14 w-full flex-col justify-center rounded-xl bg-zinc-800/70 px-4 py-2 text-left active:bg-zinc-700"
                >
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-sm text-zinc-400">{d.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </>
  )
}
