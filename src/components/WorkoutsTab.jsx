import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Flag, HeartPulse, Home, LayoutGrid, Link2, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import * as A from '../lib/store'
import { fmtAgo, fmtDuration } from '../lib/format'
import { entryToExercise } from '../data/library'
import AlternativesSheet from './AlternativesSheet'
import ExerciseBrowser, { PlanExerciseDemo } from './ExerciseBrowser'
import { mediaFor } from '../data/media'
import ExerciseCard from './ExerciseCard'
import ExerciseForm from './ExerciseForm'
import ProgramsView from './ProgramsView'
import { SettingsButton, Sheet } from './ui'

export default function WorkoutsTab({ state, act, timer, openDayId, setOpenDayId, onOpenSettings, onFinished }) {
  const [programs, setPrograms] = useState(false)
  const day = state.plan.find((d) => d.id === openDayId)
  if (programs)
    return (
      <ProgramsView
        state={state}
        act={act}
        onBack={() => setPrograms(false)}
        onOpenDay={(id) => {
          setPrograms(false)
          setOpenDayId(id)
        }}
      />
    )
  if (day)
    return (
      <DayView
        day={day}
        state={state}
        act={act}
        timer={timer}
        onBack={() => setOpenDayId(null)}
        onOpenDay={setOpenDayId}
        onFinished={onFinished}
      />
    )
  return <DayList state={state} onOpen={setOpenDayId} onOpenSettings={onOpenSettings} onOpenPrograms={() => setPrograms(true)} />
}

function DayList({ state, onOpen, onOpenSettings, onOpenPrograms }) {
  const activeDay = state.active && state.plan.find((d) => d.id === state.active.dayId)
  const lastDone = (dayId) => [...state.history].reverse().find((h) => h.dayId === dayId)?.finishedAt

  return (
    <>
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gym<span className="text-emerald-400">Log</span>
          </h1>
          <p className="text-sm text-zinc-400">{state.planName}</p>
        </div>
        <SettingsButton onClick={onOpenSettings} />
      </header>

      {activeDay && (
        <button
          onClick={() => onOpen(activeDay.id)}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-left"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <div className="flex-1">
            <div className="font-semibold text-emerald-300">Session in progress</div>
            <div className="text-sm text-zinc-300">
              {activeDay.name} · {fmtDuration(Date.now() - state.active.startedAt)}
            </div>
          </div>
          <span className="font-semibold text-emerald-300">Resume</span>
        </button>
      )}

      <button
        onClick={onOpenPrograms}
        className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-left active:bg-cyan-500/15"
      >
        <LayoutGrid size={24} className="shrink-0 text-cyan-300" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-cyan-200">Programs & workout builder</div>
          <div className="text-sm text-zinc-400">Full body, upper/lower, PPL, glutes, home… or build one session</div>
        </div>
        <ChevronRight className="shrink-0 text-cyan-300/60" />
      </button>

      {!state.plan.length && (
        <p className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
          Your plan is empty. Pick a program or build a workout above.
        </p>
      )}

      <ul className="space-y-3">
        {state.plan.map((d) => {
          const last = lastDone(d.id)
          const isHome = d.id === 'home'
          const isCardio = d.id === 'cardio'
          return (
            <li key={d.id}>
              <button
                onClick={() => onOpen(d.id)}
                className="flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left active:bg-zinc-800"
              >
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold ${
                    isHome || isCardio ? 'bg-cyan-500/15 text-cyan-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  {isHome ? <Home size={24} /> : isCardio ? <HeartPulse size={24} /> : d.name.replace(/\D/g, '') || (d.title || d.name)[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{d.name}</div>
                  <div className="leading-snug font-semibold">{d.title}</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    {d.exercises.length} exercises · {last ? `Last: ${fmtAgo(last)}` : 'Not done yet'}
                  </div>
                </div>
                <ChevronRight className="text-zinc-600" />
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** Groups adjacent exercises sharing a superset id. */
function groupExercises(list) {
  const groups = []
  for (const ex of list) {
    const prev = groups[groups.length - 1]
    if (ex.superset && prev?.superset === ex.superset) prev.items.push(ex)
    else groups.push({ superset: ex.superset, items: [ex] })
  }
  return groups
}

/** Re-renders every `ms` while `on` (for the live session clock). */
function useTick(on, ms = 1000) {
  const [, set] = useState(0)
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => set((n) => n + 1), ms)
    return () => clearInterval(id)
  }, [on, ms])
}

const fmtElapsed = (ms) => {
  const t = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(t / 3600)
  const mm = String(Math.floor((t % 3600) / 60)).padStart(h ? 2 : 1, '0')
  const ss = String(t % 60).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function DayView({ day, state, act, timer, onBack, onOpenDay, onFinished }) {
  const [editing, setEditing] = useState(false)
  const [swapEx, setSwapEx] = useState(null)
  const [demoEx, setDemoEx] = useState(null)
  const [form, setForm] = useState(null) // { mode: 'add', initial? } | { mode: 'edit', ex }
  const [picking, setPicking] = useState(false) // library picker for "Add exercise"

  const isActiveHere = state.active?.dayId === day.id
  useTick(isActiveHere)
  const otherDay = state.active && !isActiveHere ? state.plan.find((d) => d.id === state.active.dayId) : null
  const blocked = Boolean(otherDay) || (state.active && !otherDay && !isActiveHere)

  const allSets = day.exercises.map((ex) => A.setsFor(state, day.id, ex))
  const totalSets = allSets.reduce((n, s) => n + s.length, 0)
  const doneSets = isActiveHere ? allSets.reduce((n, s) => n + s.filter((x) => x.done).length, 0) : 0

  const toggleDone = (ex, i) => {
    const sets = A.setsFor(state, day.id, ex)
    const nowDone = !sets[i].done
    act(A.updateSet, day.id, ex, i, { done: nowDone })
    if (nowDone && ex.rest) timer.start(ex.rest, `${ex.name} · ${ex.type === 'cardio' ? 'Round' : 'Set'} ${i + 1}`)
  }

  const finish = () => {
    if (!doneSets) {
      if (confirm('No sets completed yet. Discard this session?')) act(A.discardWorkout)
      return
    }
    if (!confirm(`Finish workout and save ${doneSets} completed set${doneSets === 1 ? '' : 's'}?`)) return
    const next = A.finishWorkout(state)
    act(A.replaceState, next)
    timer.skip()
    onBack()
    if (next.history.length > state.history.length) onFinished?.(next.history[next.history.length - 1], state.history)
  }

  const discard = () => {
    if (confirm('Discard this session? Logged sets will be lost.')) {
      act(A.discardWorkout)
      timer.skip()
    }
  }

  const index = (ex) => day.exercises.findIndex((e) => e.id === ex.id)

  const renderCard = (ex) => (
    <ExerciseCard
      key={ex.id}
      ex={ex}
      sets={A.setsFor(state, day.id, ex)}
      last={A.lastSessionSets(state.history, ex.name)}
      editing={editing}
      disabled={blocked}
      isFirst={index(ex) === 0}
      isLast={index(ex) === day.exercises.length - 1}
      onChangeSet={(i, patch) => act(A.updateSet, day.id, ex, i, patch)}
      onToggleDone={(i) => toggleDone(ex, i)}
      onStartRest={() => timer.start(ex.rest, ex.name)}
      onStartCountdown={(sec) => timer.start(sec, ex.name, 'cardio')}
      onAddSet={() => act(A.addSet, day.id, ex)}
      onRemoveSet={() => act(A.removeSet, day.id, ex)}
      onSuggest={() => setSwapEx(ex)}
      onDemo={() => setDemoEx(ex)}
      onMove={(dir) => act(A.moveExercise, day.id, ex.id, dir)}
      onEdit={() => setForm({ mode: 'edit', ex })}
      onRemove={() => confirm(`Remove "${ex.name}" from ${day.name}?`) && act(A.removeExercise, day.id, ex.id)}
    />
  )

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
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{day.name}</div>
          <h1 className="truncate leading-tight font-semibold">{day.title}</h1>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className={`flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ${
            editing ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          <Pencil size={15} />
          {editing ? 'Done' : 'Edit'}
        </button>
      </header>

      {!editing && (
        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-xs text-zinc-400">
            <span>
              {isActiveHere ? (
                <span className="font-mono text-sm font-semibold text-zinc-200 tabular-nums">
                  ⏱ {fmtElapsed(Date.now() - state.active.startedAt)}
                </span>
              ) : (
                'Log a set to start the session'
              )}
            </span>
            <span className="tabular-nums">
              {doneSets}/{totalSets} sets
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {otherDay && (
        <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="text-amber-200">
            You have an unfinished session on <b>{otherDay.name}</b>. Finish or discard it before logging here.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => onOpenDay(otherDay.id)} className="h-11 flex-1 rounded-xl bg-amber-500 font-semibold text-zinc-950">
              Go to {otherDay.name}
            </button>
            <button
              onClick={() => confirm(`Discard the ${otherDay.name} session?`) && act(A.discardWorkout)}
              className="h-11 flex-1 rounded-xl bg-zinc-800 font-semibold text-zinc-200"
            >
              Discard it
            </button>
          </div>
        </div>
      )}
      {blocked && !otherDay && (
        <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          An unfinished session belongs to a day that no longer exists.{' '}
          <button className="font-semibold underline" onClick={() => act(A.discardWorkout)}>
            Discard it
          </button>
        </div>
      )}

      <div className="space-y-3">
        {editing
          ? day.exercises.map(renderCard)
          : groupExercises(day.exercises).map((g) =>
              g.items.length > 1 ? (
                <section key={g.items[0].id} className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-1.5">
                  <div className="flex items-center gap-1.5 px-2.5 pt-1.5 pb-2 text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                    <Link2 size={14} /> Superset · alternate sets, rest after the last movement
                  </div>
                  <div className="space-y-1.5">{g.items.map(renderCard)}</div>
                </section>
              ) : (
                renderCard(g.items[0])
              ),
            )}
        {!day.exercises.length && <p className="py-10 text-center text-zinc-500">No exercises. Tap Edit → Add exercise.</p>}
      </div>

      {editing && (
        <>
          <button
            onClick={() => setPicking(true)}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-700 font-semibold text-zinc-300 active:bg-zinc-900"
          >
            <Plus size={20} /> Add exercise
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const title = prompt('Day name', day.title)
                if (title?.trim()) act(A.updateDay, day.id, { title: title.trim() })
              }}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-300"
            >
              <Pencil size={16} /> Rename day
            </button>
            <button
              onClick={() => {
                if (!confirm(`Delete "${day.title}" from your plan? Its workout history is kept.`)) return
                act(A.removeDay, day.id)
                onBack()
              }}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-500/10 text-sm font-semibold text-red-400"
            >
              <Trash2 size={16} /> Delete day
            </button>
          </div>
        </>
      )}

      {!editing && isActiveHere && (
        <div className="mt-6 flex gap-2">
          <button
            onClick={discard}
            className="flex h-14 items-center gap-2 rounded-2xl bg-zinc-800 px-5 font-semibold text-zinc-300"
            aria-label="Discard session"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={finish}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-bold text-zinc-950"
          >
            <Flag size={20} /> Finish Workout
          </button>
        </div>
      )}

      {demoEx && <PlanExerciseDemo ex={demoEx} media={mediaFor(demoEx)} onClose={() => setDemoEx(null)} />}

      {swapEx && (
        <AlternativesSheet
          exercise={swapEx}
          customExercises={state.customExercises}
          onClose={() => setSwapEx(null)}
          onPick={(name, muscle, entry) => {
            // Swapping between strength and cardio adopts the new type's defaults.
            const next = entry && entryToExercise(entry)
            const typeChanged = next && (next.type === 'cardio') !== (swapEx.type === 'cardio')
            act(
              A.replaceExercise,
              day.id,
              swapEx.id,
              name,
              muscle,
              typeChanged ? next : next ? { media: next.media, libId: next.libId } : {},
            )
            setSwapEx(null)
          }}
        />
      )}

      {picking && (
        <Sheet title={`Add to ${day.name}`} onClose={() => setPicking(false)}>
          <button
            onClick={() => {
              setPicking(false)
              setForm({ mode: 'add' })
            }}
            className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-700 text-sm font-semibold text-zinc-300"
          >
            <Plus size={18} /> Create your own{state.customExercises.length ? ' / use My Custom' : ''}
          </button>
          <ExerciseBrowser
            pickLabel="Add this exercise"
            onPick={(entry) => {
              setPicking(false)
              setForm({ mode: 'add', initial: entryToExercise(entry) })
            }}
          />
        </Sheet>
      )}

      {form?.mode === 'add' && (
        <ExerciseForm
          title={`Add to ${day.name}`}
          submitLabel="Add exercise"
          initial={form.initial}
          quickPicks={form.initial ? [] : state.customExercises}
          onClose={() => setForm(null)}
          onSubmit={(data) => {
            act(A.addExercise, day.id, data)
            setForm(null)
          }}
        />
      )}
      {form?.mode === 'edit' && (
        <ExerciseForm
          title="Edit exercise"
          initial={form.ex}
          onClose={() => setForm(null)}
          onSubmit={(data) => {
            act(A.updateExercise, day.id, form.ex.id, data)
            setForm(null)
          }}
        />
      )}
    </>
  )
}
