import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Dices, Link2, Pencil, Plus, Shuffle, Trash2, X } from 'lucide-react'
import * as A from '../lib/store'
import { EQUIPMENT, FOCUSES, GOALS, LENGTHS, LEVELS, PROGRAMS } from '../data/programs'
import { buildFocusWorkout, buildProgram, missingSlots, reshuffleExercise } from '../lib/generator'
import { fmtDate, fmtRest, uid } from '../lib/format'
import { Thumb } from './ExerciseMedia'
import { Sheet } from './ui'

/** Programs catalog, single-workout builder and saved plans. */
export default function ProgramsView({ state, act, onBack, onOpenDay }) {
  const [tab, setTab] = useState('programs')
  return (
    <>
      <header className="sticky top-0 z-20 -mx-4 -mt-[env(safe-area-inset-top)] mb-3 flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-950/95 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur">
        <button
          onClick={onBack}
          className="grid h-12 w-12 place-items-center rounded-full text-zinc-300 active:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="flex-1 text-lg font-semibold">Programs & Workouts</h1>
      </header>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          ['programs', 'Programs'],
          ['build', 'Builder'],
          ['mine', 'My plans'],
        ]}
      />

      <div className="mt-4">
        {tab === 'programs' && <ProgramCatalog state={state} act={act} onDone={onBack} />}
        {tab === 'build' && <WorkoutBuilder act={act} onOpenDay={onOpenDay} />}
        {tab === 'mine' && <MyPlans state={state} act={act} />}
      </div>
    </>
  )
}

/* ---------------- Programs ---------------- */

function ProgramCatalog({ state, act, onDone }) {
  const [days, setDays] = useState('any')
  const [goal, setGoal] = useState('any')
  const [equipment, setEquipment] = useState('gym')
  const [open, setOpen] = useState(null)

  const list = PROGRAMS.map((p) => {
    const slots = p.days.reduce((n, d) => n + d.slots.length, 0)
    return { p, missing: missingSlots(p, equipment), slots }
  })
    .filter(({ p, missing, slots }) => missing / slots <= 0.25)
    .filter(({ p }) => days === 'any' || (days === '5+' ? p.perWeek >= 5 : p.perWeek === Number(days)))
    .filter(({ p }) => goal === 'any' || p.goal === goal)
    // Programs designed for this equipment first
    .sort((a, b) => (b.p.equipment === equipment) - (a.p.equipment === equipment))

  return (
    <>
      <div className="space-y-2.5">
        <FilterRow
          label="I have"
          value={equipment}
          onChange={setEquipment}
          options={Object.entries(EQUIPMENT).map(([k, v]) => [k, v.label])}
        />
        <FilterRow
          label="Days / week"
          value={days}
          onChange={setDays}
          options={[
            ['any', 'Any'],
            ['2', '2'],
            ['3', '3'],
            ['4', '4'],
            ['5+', '5–6'],
          ]}
        />
        <FilterRow label="Goal" value={goal} onChange={setGoal} options={[['any', 'Any'], ...Object.entries(GOALS)]} />
      </div>

      <ul className="mt-4 space-y-3">
        {list.map(({ p, missing }) => (
          <li key={p.id}>
            <button
              onClick={() => setOpen(p)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left active:bg-zinc-800"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-lg font-bold text-emerald-300">
                  {p.perWeek}×
                </div>
                <div className="min-w-0 flex-1">
                  <div className="leading-snug font-semibold">{p.name}</div>
                  <div className="mt-0.5 text-xs text-zinc-400">
                    {p.perWeek} days/wk · {LEVELS[p.level]} · {GOALS[p.goal]}
                  </div>
                </div>
                <ChevronRight className="mt-3 shrink-0 text-zinc-600" size={20} />
              </div>
              <p className="mt-2 text-sm text-zinc-300">{p.tagline}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {p.days.map((d) => (
                  <span key={d.title} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                    {d.title}
                  </span>
                ))}
                {p.equipment !== equipment && (
                  <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs text-cyan-300">
                    Adapted for {EQUIPMENT[equipment].label.toLowerCase()}
                    {missing ? ` · ${missing} skipped` : ''}
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}
        {!list.length && <li className="py-8 text-center text-zinc-500">No programs match these filters.</li>}
      </ul>

      {open && (
        <ProgramDetail
          program={open}
          initialEquipment={equipment}
          state={state}
          onClose={() => setOpen(null)}
          onApply={(mode, name, builtDays) => {
            if (mode === 'replace') act(A.applyPlan, name, builtDays)
            else act(A.appendDays, builtDays)
            setOpen(null)
            onDone()
          }}
        />
      )}
    </>
  )
}

function ProgramDetail({ program, initialEquipment, state, onClose, onApply }) {
  const [equipment, setEquipment] = useState(initialEquipment)
  const [goal, setGoal] = useState(program.goal)
  const days = useMemo(() => buildProgram(program, equipment, goal), [program, equipment, goal])

  const replace = () => {
    const warn = state.active ? '\n\nYour in-progress session will be discarded.' : ''
    if (
      confirm(
        `Switch to "${program.name}"?\n\nYour current plan "${state.planName}" is saved under My plans, so you can switch back anytime.${warn}`,
      )
    )
      onApply('replace', program.name, days)
  }

  return (
    <Sheet title={program.name} onClose={onClose}>
      <p className="-mt-1 text-sm text-zinc-300">{program.tagline}</p>
      <p className="mt-1 text-xs text-zinc-500">
        {program.perWeek} days/week · {LEVELS[program.level]}
        {program.id === 'str3' ? ' · alternate A and B' : ''}
      </p>

      <div className="mt-4 space-y-2.5">
        <FilterRow
          label="Equipment"
          value={equipment}
          onChange={setEquipment}
          options={Object.entries(EQUIPMENT).map(([k, v]) => [k, v.label])}
        />
        <FilterRow label="Goal" value={goal} onChange={setGoal} options={Object.entries(GOALS)} />
      </div>

      <ol className="mt-4 space-y-3">
        {days.map((d, i) => (
          <li key={d.id} className="rounded-2xl bg-zinc-800/50 p-3">
            <div className="mb-2 text-sm font-semibold">
              <span className="text-zinc-500">Day {i + 1} · </span>
              {d.title}
            </div>
            <ExerciseList exercises={d.exercises} />
          </li>
        ))}
      </ol>

      <div className="mt-5 space-y-2">
        <button onClick={replace} className="h-14 w-full rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950">
          Use as my plan
        </button>
        <button onClick={() => onApply('append', null, days)} className="h-12 w-full rounded-2xl bg-zinc-800 font-semibold text-zinc-200">
          Add these {days.length} days to my current plan
        </button>
      </div>
    </Sheet>
  )
}

/* ---------------- Single workout builder ---------------- */

function WorkoutBuilder({ act, onOpenDay }) {
  const [focus, setFocus] = useState('full')
  const [equipment, setEquipment] = useState('gym')
  const [goal, setGoal] = useState('muscle')
  const [length, setLength] = useState('standard')
  const [exercises, setExercises] = useState([])

  const generate = (random = false) => setExercises(buildFocusWorkout(focus, { equipment, goal, length, random }))
  useEffect(() => generate(false), [focus, equipment, goal, length]) // eslint-disable-line react-hooks/exhaustive-deps

  const add = () => {
    const id = uid()
    act(A.appendDays, [{ id, name: 'Workout', title: FOCUSES[focus].label, exercises }])
    onOpenDay(id)
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Focus">
        {Object.entries(FOCUSES).map(([k, f]) => (
          <button
            key={k}
            role="radio"
            aria-checked={focus === k}
            onClick={() => setFocus(k)}
            className={`min-h-12 rounded-xl border px-2 text-sm font-medium ${
              focus === k ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200' : 'border-zinc-800 bg-zinc-900 text-zinc-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        <FilterRow
          label="Equipment"
          value={equipment}
          onChange={setEquipment}
          options={Object.entries(EQUIPMENT).map(([k, v]) => [k, v.label])}
        />
        <FilterRow label="Goal" value={goal} onChange={setGoal} options={Object.entries(GOALS)} />
        <FilterRow
          label="Length"
          value={length}
          onChange={setLength}
          options={Object.entries(LENGTHS).map(([k, v]) => [k, `${v.label} (${v.count})`])}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h3 className="font-semibold">
          {FOCUSES[focus].label} · {exercises.length} exercises
        </h3>
        <button
          onClick={() => generate(true)}
          className="flex h-10 items-center gap-1.5 rounded-full bg-zinc-800 px-3.5 text-sm font-medium text-zinc-200"
        >
          <Dices size={16} /> Shuffle all
        </button>
      </div>

      <ul className="mt-2 space-y-1.5">
        {exercises.map((e, i) => (
          <li key={e.id} className="flex items-center gap-2.5 rounded-xl bg-zinc-900 py-2 pr-1.5 pl-2.5">
            <Thumb media={e.media} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm leading-snug font-medium">{e.name}</div>
              <div className="text-xs text-zinc-400">
                {e.sets} × {e.reps}
                {e.rest ? ` · Rest ${fmtRest(e.rest)}` : ''}
              </div>
            </div>
            <button
              onClick={() => setExercises((l) => reshuffleExercise(l, i, equipment, goal))}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-400 active:bg-zinc-800"
              aria-label={`Swap ${e.name}`}
            >
              <Shuffle size={17} />
            </button>
            <button
              onClick={() => setExercises((l) => l.filter((x) => x.id !== e.id))}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-500 active:bg-zinc-800"
              aria-label={`Remove ${e.name}`}
            >
              <X size={17} />
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={add}
        disabled={!exercises.length}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950 disabled:opacity-40"
      >
        <Plus size={20} /> Add to my plan & open
      </button>
      <p className="mt-2 text-center text-xs text-zinc-500">You can edit, reorder or delete it like any other day.</p>
    </>
  )
}

/* ---------------- My plans ---------------- */

function MyPlans({ state, act }) {
  const rename = () => {
    const name = prompt('Plan name', state.planName)
    if (name) act(A.renamePlan, name)
  }
  const switchTo = (p) => {
    const warn = state.active ? '\n\nYour in-progress session will be discarded.' : ''
    if (confirm(`Switch to "${p.name}"? Your current plan is saved here too.${warn}`)) act(A.switchPlan, p.id)
  }

  return (
    <>
      <section className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2">
          <Check size={18} className="text-emerald-400" />
          <span className="text-xs font-medium tracking-wide text-emerald-300 uppercase">Current plan</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <h3 className="flex-1 text-lg font-semibold">{state.planName}</h3>
          <button
            onClick={rename}
            className="grid h-10 w-10 place-items-center rounded-lg text-zinc-400 active:bg-zinc-800"
            aria-label="Rename plan"
          >
            <Pencil size={17} />
          </button>
        </div>
        <DayChips days={state.plan} />
      </section>

      <h3 className="mt-6 mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Saved plans</h3>
      {state.savedPlans.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
          When you switch to a program, your current plan is saved here so you can come back to it.
        </p>
      ) : (
        <ul className="space-y-2">
          {state.savedPlans.map((p) => (
            <li key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-zinc-500">Saved {fmtDate(p.savedAt, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <DayChips days={p.days} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => switchTo(p)}
                  className="h-11 flex-1 rounded-xl bg-emerald-500/15 text-sm font-semibold text-emerald-300"
                >
                  Switch to this plan
                </button>
                <button
                  onClick={() => confirm(`Delete saved plan "${p.name}"? Workout history is kept.`) && act(A.deleteSavedPlan, p.id)}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-400"
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/* ---------------- shared bits ---------------- */

function DayChips({ days }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {days.map((d) => (
        <span key={d.id} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
          {d.title}
        </span>
      ))}
      {!days.length && <span className="text-xs text-zinc-500">No days</span>}
    </div>
  )
}

function ExerciseList({ exercises }) {
  let prevGroup = null
  return (
    <ul className="space-y-1.5">
      {exercises.map((e) => {
        const linked = e.superset && e.superset === prevGroup
        prevGroup = e.superset
        return (
          <li key={e.id} className="flex items-center gap-2.5">
            <Thumb media={e.media} size={36} />
            <span className="min-w-0 flex-1 text-sm leading-snug">
              {linked && <Link2 size={12} className="mr-1 inline text-cyan-400" aria-label="superset with previous" />}
              {e.name}
            </span>
            <span className="shrink-0 text-xs text-zinc-400 tabular-nums">
              {e.sets}×{e.reps}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="grid rounded-xl bg-zinc-900 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`h-11 rounded-lg px-1 text-sm font-semibold ${value === id ? 'bg-zinc-700 text-zinc-50' : 'text-zinc-400'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function FilterRow({ label, value, onChange, options }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([id, text]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-pressed={value === id}
            className={`min-h-9 rounded-full border px-3 text-sm ${
              value === id ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200' : 'border-zinc-700 text-zinc-300'
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
