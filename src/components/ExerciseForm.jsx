import { useState } from 'react'
import { Dumbbell, HeartPulse } from 'lucide-react'
import { MUSCLES } from '../data/muscles'
import { CARDIO_METRICS, METRIC_KEYS, defaultCardioMetrics } from '../data/cardio'
import { REST_PRESETS, fmtRest } from '../lib/format'
import { Field, Sheet, inputCls } from './ui'

const EMPTY = { name: '', muscle: 'other', type: 'strength', sets: 3, reps: '8-10', rest: 90, unit: 'reps', metrics: null }

/**
 * Create / edit an exercise's targets.
 * - `quickPicks` (custom library) fills the form in one tap.
 * - `days` shows an "Add to" day picker; onSubmit then receives (data, dayId).
 */
export default function ExerciseForm({ title, submitLabel = 'Save', initial, quickPicks = [], days, onSubmit, onClose }) {
  const [f, setF] = useState(() => ({ ...EMPTY, ...initial, metrics: initial?.metrics ?? null }))
  const [dayId, setDayId] = useState(days?.[0]?.id)
  const set = (k) => (e) => setF((cur) => ({ ...cur, [k]: e.target.value }))
  const cardio = f.type === 'cardio'
  const metrics = f.metrics ?? defaultCardioMetrics(f.name)
  const valid = f.name.trim() && Number(f.sets) > 0 && String(f.reps).trim() && (!cardio || metrics.length)

  const setType = (type) =>
    setF((cur) =>
      type === cur.type
        ? cur
        : type === 'cardio'
          ? { ...cur, type, muscle: 'cardio', sets: 1, reps: '20 min', rest: 0 }
          : { ...cur, type, muscle: cur.muscle === 'cardio' ? 'other' : cur.muscle, sets: 3, reps: '8-10', rest: 90 },
    )

  const toggleMetric = (m) =>
    setF((cur) => {
      const list = cur.metrics ?? defaultCardioMetrics(cur.name)
      return { ...cur, metrics: list.includes(m) ? list.filter((x) => x !== m) : METRIC_KEYS.filter((k) => k === m || list.includes(k)) }
    })

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    const data = {
      name: f.name.trim(),
      muscle: f.muscle,
      type: f.type,
      sets: Math.min(10, Math.max(1, parseInt(f.sets, 10) || 1)),
      reps: String(f.reps).trim(),
      rest: Math.max(0, parseInt(f.rest, 10) || 0),
      unit: cardio ? 'reps' : f.unit,
      ...(cardio ? { metrics } : { metrics: undefined }),
      ...(f.libId ? { libId: f.libId } : {}),
      ...(f.media ? { media: f.media } : {}),
    }
    onSubmit(data, dayId)
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
                onClick={() => setF({ ...EMPTY, ...c, metrics: c.metrics ?? null })}
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
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-800 p-1" role="radiogroup" aria-label="Exercise type">
          {[
            ['strength', 'Strength', Dumbbell],
            ['cardio', 'Cardio', HeartPulse],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={f.type === id}
              onClick={() => setType(id)}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${
                f.type === id ? (id === 'cardio' ? 'bg-cyan-500 text-zinc-950' : 'bg-emerald-500 text-zinc-950') : 'text-zinc-400'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <Field label="Exercise name">
          <input
            className={inputCls}
            value={f.name}
            onChange={set('name')}
            placeholder={cardio ? 'e.g. Treadmill Incline Walk' : 'e.g. Cable Crunches'}
            autoFocus={!initial?.name}
          />
        </Field>

        {days && (
          <Field label="Add to">
            <select className={inputCls} value={dayId} onChange={(e) => setDayId(e.target.value)}>
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.title}
                </option>
              ))}
            </select>
          </Field>
        )}

        {cardio ? (
          <>
            <div>
              <span className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase">What to log each round</span>
              <div className="flex flex-wrap gap-2">
                {METRIC_KEYS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={metrics.includes(m)}
                    onClick={() => toggleMetric(m)}
                    className={`min-h-10 rounded-full border px-3.5 text-sm ${
                      metrics.includes(m) ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {CARDIO_METRICS[m].label} <span className="text-xs opacity-60">{CARDIO_METRICS[m].unit}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target">
                <input className={inputCls} value={f.reps} onChange={set('reps')} placeholder="30 min" />
              </Field>
              <Field label="Rounds">
                <input className={inputCls} type="number" inputMode="numeric" min="1" max="10" value={f.sets} onChange={set('sets')} />
              </Field>
            </div>
            <p className="-mt-2 text-xs text-zinc-500">
              Put minutes in the target (e.g. "30 min") to get a countdown button. Use rounds for intervals.
            </p>
          </>
        ) : (
          <>
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
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={cardio ? 'Rest between rounds' : 'Rest'}>
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
          {!cardio && (
            <Field label="Tracked as">
              <select className={inputCls} value={f.unit} onChange={set('unit')}>
                <option value="reps">kg × reps</option>
                <option value="sec">kg × seconds</option>
              </select>
            </Field>
          )}
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
