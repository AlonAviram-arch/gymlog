import { useState } from 'react'
import { MUSCLES } from '../data/muscles'
import { REST_PRESETS, fmtRest } from '../lib/format'
import { Field, Sheet, inputCls } from './ui'

const EMPTY = { name: '', muscle: 'other', sets: 3, reps: '8-10', rest: 90, unit: 'reps' }

/**
 * Create / edit an exercise's targets. `quickPicks` (custom library) lets the user
 * fill the form in one tap when adding to a day.
 */
export default function ExerciseForm({ title, submitLabel = 'Save', initial, quickPicks = [], onSubmit, onClose }) {
  const [f, setF] = useState({ ...EMPTY, ...initial })
  const set = (k) => (e) => setF((cur) => ({ ...cur, [k]: e.target.value }))
  const valid = f.name.trim() && Number(f.sets) > 0 && String(f.reps).trim()

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    onSubmit({
      name: f.name.trim(),
      muscle: f.muscle,
      sets: Math.min(10, Math.max(1, parseInt(f.sets, 10) || 1)),
      reps: String(f.reps).trim(),
      rest: Math.max(0, parseInt(f.rest, 10) || 0),
      unit: f.unit,
    })
  }

  return (
    <Sheet title={title} onClose={onClose}>
      {quickPicks.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">From your custom exercises</div>
          <div className="flex flex-wrap gap-2">
            {quickPicks.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setF({ ...EMPTY, ...c })}
                className={`min-h-10 rounded-full border px-3 text-sm ${
                  f.name === c.name ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-zinc-700 text-zinc-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <Field label="Exercise name">
          <input className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. Cable Crunches" autoFocus={!initial?.name} />
        </Field>
        <Field label="Muscle target">
          <select className={inputCls} value={f.muscle} onChange={set('muscle')}>
            {Object.entries(MUSCLES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sets">
            <input className={inputCls} type="number" inputMode="numeric" min="1" max="10" value={f.sets} onChange={set('sets')} />
          </Field>
          <Field label={f.unit === 'sec' ? 'Target seconds' : 'Target reps'}>
            <input className={inputCls} value={f.reps} onChange={set('reps')} placeholder={f.unit === 'sec' ? '45-60s' : '8-10'} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rest">
            <select className={inputCls} value={f.rest} onChange={set('rest')}>
              {[...new Set([...REST_PRESETS, Number(f.rest)])]
                .sort((a, b) => a - b)
                .map((s) => (
                  <option key={s} value={s}>
                    {s === 0 ? 'No rest' : fmtRest(s)}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Tracked as">
            <select className={inputCls} value={f.unit} onChange={set('unit')}>
              <option value="reps">kg × reps</option>
              <option value="sec">kg × seconds</option>
            </select>
          </Field>
        </div>
        <button
          disabled={!valid}
          className="h-14 w-full rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950 disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </form>
    </Sheet>
  )
}
