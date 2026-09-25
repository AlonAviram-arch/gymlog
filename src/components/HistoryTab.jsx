import { useMemo, useState } from 'react'
import { ChevronDown, Settings, Trash2, TrendingUp } from 'lucide-react'
import { deleteSession } from '../lib/store'
import { fmtDate, fmtDuration } from '../lib/format'
import { SettingsButton, inputCls } from './ui'
import ProgressChart from './ProgressChart'

const fmtSet = (s, unit) => `${s.weight ?? '–'} kg × ${s.reps ?? '–'}${unit === 'sec' ? 's' : ''}`

export default function HistoryTab({ state, act, onOpenSettings }) {
  const [view, setView] = useState('progress')

  return (
    <>
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-sm text-zinc-400">{state.history.length} workouts logged</p>
        </div>
        <SettingsButton onClick={onOpenSettings} />
      </header>
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-zinc-900 p-1">
        {[
          ['progress', 'Progress'],
          ['sessions', 'Sessions'],
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
      {state.history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          <TrendingUp className="mx-auto mb-3" size={32} />
          Finish a workout and your progress shows up here.
        </div>
      ) : view === 'progress' ? (
        <Progress history={state.history} />
      ) : (
        <Sessions history={state.history} onDelete={(id) => confirm('Delete this workout from history?') && act(deleteSession, id)} />
      )}
    </>
  )
}

function Progress({ history }) {
  // Exercise names, most recently trained first.
  const names = useMemo(() => {
    const seen = new Map()
    for (let i = history.length - 1; i >= 0; i--) for (const e of history[i].exercises) if (!seen.has(e.name)) seen.set(e.name, e.unit)
    return [...seen.keys()]
  }, [history])
  const [name, setName] = useState(names[0])
  const selected = names.includes(name) ? name : names[0]

  const sessions = history
    .map((h) => ({ ts: h.finishedAt, ex: h.exercises.find((e) => e.name === selected) }))
    .filter((s) => s.ex)
  const unit = sessions[0]?.ex.unit
  const useWeight = sessions.some((s) => s.ex.sets.some((x) => x.weight != null))

  const points = sessions.map(({ ts, ex }) => {
    const top = [...ex.sets].sort((a, b) => (useWeight ? (b.weight ?? 0) - (a.weight ?? 0) || (b.reps ?? 0) - (a.reps ?? 0) : (b.reps ?? 0) - (a.reps ?? 0)))[0]
    return { ts, value: (useWeight ? top.weight : top.reps) ?? 0, detail: fmtSet(top, unit), top }
  })
  const best = points.reduce((a, p) => (p.value > a.value ? p : a), points[0])
  const latest = points[points.length - 1]
  const volume = (ex) => ex.sets.reduce((n, s) => n + (s.weight ?? 0) * (s.reps ?? 0), 0)

  return (
    <div className="space-y-4">
      <select className={inputCls} value={selected} onChange={(e) => setName(e.target.value)} aria-label="Exercise">
        {names.map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Best" value={best.detail} accent />
        <Stat label="Latest" value={latest.detail} />
        <Stat label="Sessions" value={points.length} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
        <div className="mb-2 text-sm font-medium text-zinc-300">Top set {useWeight ? 'weight (kg)' : unit === 'sec' ? '(seconds)' : '(reps)'}</div>
        <ProgressChart points={points} unitLabel={useWeight ? 'weight' : 'reps'} />
      </div>

      <ul className="space-y-2">
        {[...sessions].reverse().map(({ ts, ex }) => (
          <li key={ts} className="rounded-xl bg-zinc-900 px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{fmtDate(ts, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              {volume(ex) > 0 && <span className="text-zinc-500">{Math.round(volume(ex))} kg vol</span>}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ex.sets.map((s, i) => (
                <span key={i} className="rounded-md bg-zinc-800 px-2 py-0.5 text-sm text-zinc-300 tabular-nums">
                  {fmtSet(s, ex.unit)}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-zinc-900 p-3">
      <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{label}</div>
      <div className={`mt-0.5 text-sm leading-tight font-semibold tabular-nums ${accent ? 'text-emerald-400' : 'text-zinc-100'}`}>{value}</div>
    </div>
  )
}

function Sessions({ history, onDelete }) {
  const [open, setOpen] = useState(null)
  return (
    <ul className="space-y-2">
      {[...history].reverse().map((h) => {
        const isOpen = open === h.id
        const sets = h.exercises.reduce((n, e) => n + e.sets.length, 0)
        return (
          <li key={h.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <button onClick={() => setOpen(isOpen ? null : h.id)} className="flex w-full items-center gap-3 p-4 text-left">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{h.dayName}</div>
                <div className="text-sm text-zinc-400">
                  {fmtDate(h.finishedAt, { weekday: 'short', month: 'short', day: 'numeric' })} · {fmtDuration(h.finishedAt - h.startedAt)} · {sets} sets
                </div>
              </div>
              <ChevronDown className={`text-zinc-500 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="border-t border-zinc-800 px-4 pt-3 pb-4">
                {h.exercises.map((e) => (
                  <div key={e.name} className="mb-3">
                    <div className="text-sm font-medium">{e.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {e.sets.map((s, i) => (
                        <span key={i} className="rounded-md bg-zinc-800 px-2 py-0.5 text-sm text-zinc-300 tabular-nums">
                          {fmtSet(s, e.unit)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => onDelete(h.id)} className="mt-1 flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-red-400 active:bg-red-500/10">
                  <Trash2 size={16} /> Delete workout
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
