import { useMemo, useState } from 'react'
import { ChevronRight, Dumbbell, Plus, Search, Trash2, Trophy } from 'lucide-react'
import * as A from '../lib/store'
import {
  REP_TARGETS,
  bestLift,
  heaviestLift,
  dailyBest,
  exercisesWithLifts,
  knownExerciseNames,
  liftE1rm,
  liftsFor,
  prStatus,
  repMaxes,
} from '../lib/records'
import { useExerciseLibrary, isCardioEntry } from '../data/library'
import { fmtDate, toNum } from '../lib/format'
import ProgressChart from './ProgressChart'
import { Field, Sheet, inputCls } from './ui'

const fmtDay = (ts) => fmtDate(ts, { month: 'short', day: 'numeric', year: 'numeric' })

/** History → Records: log single lifts and see progress per exercise. */
export default function RecordsView({ state, act }) {
  const [logging, setLogging] = useState(null) // null | { name? }
  const [open, setOpen] = useState(null) // exercise name
  const names = useMemo(() => exercisesWithLifts(state), [state])

  return (
    <>
      <button
        onClick={() => setLogging({})}
        className="mb-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950"
      >
        <Plus size={22} /> Log a lift
      </button>

      {names.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          <Trophy className="mx-auto mb-3" size={32} />
          Log a weight for any exercise to start tracking your records. Sets from finished workouts appear here too.
        </div>
      ) : (
        <ul className="space-y-2">
          {names.map((name) => (
            <RecordRow key={name} state={state} name={name} onOpen={() => setOpen(name)} />
          ))}
        </ul>
      )}

      {open && (
        <RecordDetail
          state={state}
          act={act}
          name={open}
          onClose={() => setOpen(null)}
          onLog={() => {
            setLogging({ name: open })
            setOpen(null)
          }}
        />
      )}
      {logging && (
        <LogLiftSheet
          state={state}
          initialName={logging.name}
          onClose={() => setLogging(null)}
          onSave={(rec) => {
            act(A.addRecord, rec)
            setLogging(null)
            setOpen(rec.name)
          }}
        />
      )}
    </>
  )
}

function RecordRow({ state, name, onOpen }) {
  const lifts = liftsFor(state, name)
  const best = bestLift(lifts)
  const heavy = heaviestLift(lifts)
  const last = lifts[lifts.length - 1]
  return (
    <li>
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left active:bg-zinc-800"
      >
        <div className="min-w-0 flex-1">
          <div className="leading-snug font-semibold">{name}</div>
          <div className="mt-0.5 text-sm text-zinc-300 tabular-nums">
            Heaviest{' '}
            <span className="font-semibold text-emerald-400">
              {heavy.weight} kg × {heavy.reps}
            </span>
            <span className="text-zinc-500"> · ≈ {liftE1rm(best)} kg 1RM</span>
          </div>
          <div className="text-xs text-zinc-500">
            {lifts.length} lift{lifts.length === 1 ? '' : 's'} · last {fmtDay(last.ts)}
          </div>
        </div>
        <ChevronRight className="shrink-0 text-zinc-600" size={20} />
      </button>
    </li>
  )
}

function RecordDetail({ state, act, name, onClose, onLog }) {
  const [metric, setMetric] = useState('weight')
  const lifts = liftsFor(state, name)
  if (!lifts.length) {
    // last entry was just deleted
    return (
      <Sheet title={name} onClose={onClose}>
        <p className="py-6 text-center text-zinc-500">No lifts logged for this exercise.</p>
        <LogButton onClick={onLog} />
      </Sheet>
    )
  }
  const best = bestLift(lifts)
  const heavy = heaviestLift(lifts)
  const maxes = repMaxes(lifts)
  const points = dailyBest(lifts, metric)

  return (
    <Sheet title={name} onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-zinc-800/60 p-3">
          <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Heaviest lift</div>
          <div className="mt-0.5 text-lg font-semibold text-emerald-400 tabular-nums">
            {heavy.weight} kg × {heavy.reps}
          </div>
          <div className="text-xs text-zinc-500">{fmtDay(heavy.ts)}</div>
        </div>
        <div className="rounded-xl bg-zinc-800/60 p-3">
          <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Best est. 1RM</div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums">≈ {liftE1rm(best)} kg</div>
          <div className="text-xs text-zinc-500 tabular-nums">
            from {best.weight} × {best.reps}
          </div>
        </div>
      </div>

      <h3 className="mt-5 mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Rep maxes (heaviest for at least N reps)</h3>
      <div className="grid grid-cols-6 gap-1.5">
        {REP_TARGETS.map((n) => (
          <div key={n} className="rounded-lg bg-zinc-800/60 px-1 py-2 text-center">
            <div className="text-[11px] text-zinc-500">{n}RM</div>
            <div className={`text-sm font-semibold tabular-nums ${maxes[n] ? 'text-zinc-100' : 'text-zinc-600'}`}>
              {maxes[n] ? maxes[n].weight : '–'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-300">{metric === 'weight' ? 'Top weight (kg)' : 'Est. 1RM (kg)'}</span>
          <div className="grid grid-cols-2 rounded-lg bg-zinc-800 p-0.5 text-xs font-semibold" role="radiogroup" aria-label="Chart metric">
            {[
              ['weight', 'Weight'],
              ['e1rm', 'Est. 1RM'],
            ].map(([id, label]) => (
              <button
                key={id}
                role="radio"
                aria-checked={metric === id}
                onClick={() => setMetric(id)}
                className={`h-8 rounded-md px-2.5 whitespace-nowrap ${metric === id ? 'bg-zinc-600 text-zinc-50' : 'text-zinc-400'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <ProgressChart points={points} unitLabel={metric === 'weight' ? 'weight' : 'estimated one-rep max'} />
      </div>

      <LogButton onClick={onLog} />

      <h3 className="mt-5 mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">All lifts</h3>
      <ul className="space-y-1.5">
        {[...lifts].reverse().map((l, i) => {
          const idx = lifts.length - 1 - i
          const pr = prStatus(l, lifts.slice(0, idx))
          return (
            <li key={`${l.ts}-${idx}`} className="flex items-center gap-2 rounded-xl bg-zinc-800/50 py-2 pr-1.5 pl-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-medium tabular-nums">
                  {l.weight} kg × {l.reps}
                  {pr && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                      <Trophy size={11} /> {pr.rep ? `${l.reps}-rep PR` : 'Best 1RM'}
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-zinc-500">
                  {fmtDay(l.ts)} · {l.source === 'log' ? 'logged' : 'workout'}
                  {l.note ? ` · ${l.note}` : ''}
                </div>
              </div>
              {l.source === 'log' ? (
                <button
                  onClick={() => confirm('Delete this logged lift?') && act(A.deleteRecord, l.id)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-500 active:bg-zinc-700"
                  aria-label={`Delete ${l.weight} kg × ${l.reps}`}
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <Dumbbell size={15} className="mr-3 shrink-0 text-zinc-600" aria-label="from a workout" />
              )}
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}

function LogButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 font-semibold text-emerald-300"
    >
      <Plus size={18} /> Log a lift for this exercise
    </button>
  )
}

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function LogLiftSheet({ state, initialName, onClose, onSave }) {
  const [name, setName] = useState(initialName ?? '')
  const [picking, setPicking] = useState(!initialName)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [date, setDate] = useState(todayStr)
  const [note, setNote] = useState('')

  if (picking) return <ExercisePicker state={state} onClose={onClose} onPick={(n) => (setName(n), setPicking(false))} />

  const w = toNum(weight)
  const r = parseInt(reps, 10)
  const valid = name && w != null && w >= 0 && r > 0 && r <= 100 && date
  const lifts = liftsFor(state, name)
  // noon local time keeps the entry on the chosen calendar day; today's entries use the current time
  const ts = date === todayStr() ? Date.now() : new Date(`${date}T12:00:00`).getTime()
  const pr = valid
    ? prStatus(
        { weight: w, reps: r },
        lifts.filter((l) => l.ts <= ts),
      )
    : null
  const best = bestLift(lifts)

  return (
    <Sheet title="Log a lift" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) onSave({ name, weight: w, reps: r, date: ts, note: note.trim() })
        }}
      >
        <Field label="Exercise">
          <button type="button" onClick={() => setPicking(true)} className={`${inputCls} flex items-center justify-between text-left`}>
            <span className="truncate font-medium">{name}</span>
            <span className="shrink-0 text-sm text-emerald-400">Change</span>
          </button>
        </Field>
        {best && (
          <p className="-mt-2 text-xs text-zinc-500 tabular-nums">
            Current best: {best.weight} kg × {best.reps} (≈ {liftE1rm(best)} kg 1RM)
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Weight (kg)">
            <input
              className={`${inputCls} text-center text-xl font-semibold`}
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^0-9.,]/g, ''))}
              placeholder="100"
              autoFocus
            />
          </Field>
          <Field label="Reps">
            <input
              className={`${inputCls} text-center text-xl font-semibold`}
              inputMode="numeric"
              pattern="[0-9]*"
              value={reps}
              onChange={(e) => setReps(e.target.value.replace(/\D/g, ''))}
              placeholder="5"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[1, 3, 5, 8, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setReps(String(n))}
              className={`min-h-9 rounded-full border px-3.5 text-sm ${
                reps === String(n) ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200' : 'border-zinc-700 text-zinc-300'
              }`}
            >
              {n} rep{n === 1 ? '' : 's'}
            </button>
          ))}
        </div>
        <Field label="Date">
          <input className={inputCls} type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Note (optional)">
          <input
            className={inputCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. belt, paused, felt easy"
            maxLength={80}
          />
        </Field>

        {valid && (
          <p className="rounded-xl bg-zinc-800/60 px-3 py-2 text-sm text-zinc-300 tabular-nums" role="status">
            ≈ {liftE1rm({ weight: w, reps: r })} kg estimated 1RM
            {pr && (
              <span className="ml-2 inline-flex items-center gap-1 font-semibold text-amber-300">
                <Trophy size={14} /> {pr.rep ? `New ${r}-rep PR!` : 'New best estimated 1RM!'}
              </span>
            )}
          </p>
        )}

        <button
          disabled={!valid}
          className="h-14 w-full rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950 disabled:opacity-40"
        >
          Save lift
        </button>
      </form>
    </Sheet>
  )
}

/** Pick an exercise: your own (plan, history, records) first, then the library, or any typed name. */
function ExercisePicker({ state, onPick, onClose }) {
  const [q, setQ] = useState('')
  const { lib } = useExerciseLibrary()
  const mine = useMemo(() => knownExerciseNames(state), [state])
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const match = (n) => words.every((w) => n.toLowerCase().includes(w))
  const mineShown = mine.filter(match)
  const mineSet = new Set(mine)
  const libShown = words.length && lib ? lib.filter((e) => !isCardioEntry(e) && !mineSet.has(e.name) && match(e.name)).slice(0, 30) : []
  const typed = q.trim()
  const exact = typed && [...mine, ...libShown.map((e) => e.name)].some((n) => n.toLowerCase() === typed.toLowerCase())
  const row = 'flex min-h-12 w-full items-center rounded-xl bg-zinc-800/60 px-3.5 py-2 text-left active:bg-zinc-700'

  return (
    <Sheet title="Choose an exercise" onClose={onClose}>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your exercises and the library…"
          className={`${inputCls} pl-10`}
          aria-label="Search exercises"
          autoFocus
        />
      </div>

      {typed && !exact && (
        <button onClick={() => onPick(typed)} className={`${row} mt-3 border border-dashed border-zinc-700 bg-transparent`}>
          <Plus size={16} className="mr-2 shrink-0 text-emerald-400" /> Use “{typed}”
        </button>
      )}

      {mineShown.length > 0 && (
        <>
          <h3 className="mt-4 mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Your exercises</h3>
          <ul className="space-y-1.5">
            {mineShown.map((n) => (
              <li key={n}>
                <button onClick={() => onPick(n)} className={row}>
                  {n}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {libShown.length > 0 && (
        <>
          <h3 className="mt-4 mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Library</h3>
          <ul className="space-y-1.5">
            {libShown.map((e) => (
              <li key={e.id}>
                <button onClick={() => onPick(e.name)} className={row}>
                  {e.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {!words.length && <p className="mt-4 text-center text-xs text-zinc-500">Type to search all 1,300+ library exercises.</p>}
    </Sheet>
  )
}
