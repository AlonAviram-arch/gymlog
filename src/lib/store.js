// App state lives in one localStorage key. Every action is a pure function
// (state, ...args) => newState, applied in App via setState.
import { DEFAULT_PLAN } from '../data/defaultPlan'
import { toNum, uid } from './format'

const KEY = 'gymlog:v1'
const VERSION = 2

const clone = (x) => JSON.parse(JSON.stringify(x))

export function initialState() {
  return {
    version: VERSION,
    plan: clone(DEFAULT_PLAN),
    customExercises: [],
    // chronological: [{ id, dayId, dayName, startedAt, finishedAt, exercises: [{ name, muscle, unit, type, metrics, sets: [{ weight, reps } | { duration, speed, … }] }] }]
    history: [],
    active: null, // { dayId, startedAt, logs: { [exerciseId]: [{ weight, reps, done } | { duration, …, done }] } }
    settings: { sound: true, vibrate: true, weeklyGoal: 3 },
  }
}

/** Upgrades data saved by older app versions. */
function migrate(plan, fromVersion) {
  // v2: add the Cardio day.
  if (fromVersion < 2 && !plan.some((d) => d.id === 'cardio')) plan = [...plan, clone(DEFAULT_PLAN.find((d) => d.id === 'cardio'))]
  return plan
}

function normalize(data) {
  const base = initialState()
  const plan = Array.isArray(data.plan) && data.plan.length ? migrate(data.plan, data.version ?? 1) : base.plan
  return {
    ...base,
    ...data,
    version: VERSION,
    settings: { ...base.settings, ...(data.settings ?? {}) },
    customExercises: Array.isArray(data.customExercises) ? data.customExercises : [],
    history: Array.isArray(data.history) ? data.history : [],
    plan,
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return normalize(JSON.parse(raw))
  } catch {
    /* corrupted or unavailable storage – fall back to defaults */
  }
  return initialState()
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* quota exceeded / private mode */
  }
}

export function parseImport(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.plan) || !Array.isArray(data.history)) {
    throw new Error('Not a GymLog backup file (missing plan/history).')
  }
  return normalize(data)
}

/* ---------- derived helpers ---------- */

/** Most recent logged sets for an exercise name, or null. */
export function lastSessionSets(history, name) {
  for (let i = history.length - 1; i >= 0; i--) {
    const e = history[i].exercises.find((x) => x.name === name)
    if (e?.sets.length) return e.sets
  }
  return null
}

/** Logged fields per set: kg × reps for strength, the chosen metrics for cardio. */
export const fieldsOf = (ex) => (ex.type === 'cardio' ? (ex.metrics?.length ? ex.metrics : ['duration']) : ['weight', 'reps'])

/** Copy of a set's values (as input strings) with done reset. */
function carry(fields, src, ex) {
  const row = { done: false }
  for (const f of fields) {
    const v = src ? src[f] : f === 'weight' ? ex.defaultWeight : null
    row[f] = v != null ? String(v) : ''
  }
  return row
}

/** Initial set rows for an exercise, auto-filled from the previous session. */
export function prefillSets(ex, history) {
  const last = lastSessionSets(history, ex.name)
  const fields = fieldsOf(ex)
  return Array.from({ length: ex.sets }, (_, i) => carry(fields, last ? (last[i] ?? last[last.length - 1]) : null, ex))
}

export function setsFor(state, dayId, ex) {
  const logged = state.active?.dayId === dayId ? state.active.logs[ex.id] : null
  return logged ?? prefillSets(ex, state.history)
}

/* ---------- active session ---------- */

function withSets(s, dayId, ex, fn) {
  const active = s.active?.dayId === dayId ? s.active : { dayId, startedAt: Date.now(), logs: {} }
  const sets = fn([...(active.logs[ex.id] ?? prefillSets(ex, s.history))])
  return { ...s, active: { ...active, logs: { ...active.logs, [ex.id]: sets } } }
}

export const updateSet = (s, dayId, ex, idx, patch) =>
  withSets(s, dayId, ex, (sets) => {
    sets[idx] = { ...sets[idx], ...patch }
    return sets
  })

export const addSet = (s, dayId, ex) =>
  withSets(s, dayId, ex, (sets) => {
    return [...sets, carry(fieldsOf(ex), sets[sets.length - 1] ?? null, ex)]
  })

export const removeSet = (s, dayId, ex) => withSets(s, dayId, ex, (sets) => (sets.length > 1 ? sets.slice(0, -1) : sets))

export function finishWorkout(s) {
  const a = s.active
  if (!a) return s
  const day = s.plan.find((d) => d.id === a.dayId)
  const exercises = (day?.exercises ?? [])
    .map((ex) => {
      const fields = fieldsOf(ex)
      return {
        name: ex.name,
        muscle: ex.muscle,
        unit: ex.unit,
        ...(ex.type === 'cardio' ? { type: 'cardio', metrics: fields } : {}),
        sets: (a.logs[ex.id] ?? []).filter((x) => x.done).map((x) => Object.fromEntries(fields.map((f) => [f, toNum(x[f])]))),
      }
    })
    .filter((e) => e.sets.length)
  if (!exercises.length) return { ...s, active: null }
  const entry = {
    id: uid(),
    dayId: a.dayId,
    dayName: day ? `${day.name} · ${day.title}` : 'Workout',
    startedAt: a.startedAt,
    finishedAt: Date.now(),
    exercises,
  }
  return { ...s, history: [...s.history, entry], active: null }
}

export const discardWorkout = (s) => ({ ...s, active: null })

/* ---------- plan editing ---------- */

const mapDay = (s, dayId, fn) => ({ ...s, plan: s.plan.map((d) => (d.id === dayId ? { ...d, exercises: fn(d.exercises) } : d)) })

function dropLog(s, exId) {
  if (!s.active?.logs[exId]) return s
  const logs = { ...s.active.logs }
  delete logs[exId]
  return { ...s, active: { ...s.active, logs } }
}

export const removeExercise = (s, dayId, exId) =>
  dropLog(
    mapDay(s, dayId, (list) => list.filter((e) => e.id !== exId)),
    exId,
  )

export const moveExercise = (s, dayId, exId, dir) =>
  mapDay(s, dayId, (list) => {
    const i = list.findIndex((e) => e.id === exId)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return list
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })

export const addExercise = (s, dayId, data) => mapDay(s, dayId, (list) => [...list, { unit: 'reps', superset: null, ...data, id: uid() }])

/** Edit targets (sets/reps/rest/name…). Renaming resets the in-progress log; changing sets resizes it. */
export function updateExercise(s, dayId, exId, patch) {
  const day = s.plan.find((d) => d.id === dayId)
  const old = day?.exercises.find((e) => e.id === exId)
  const next = mapDay(s, dayId, (list) => list.map((e) => (e.id === exId ? { ...e, ...patch } : e)))
  if (old && patch.name && patch.name !== old.name) return dropLog(next, exId)
  const log = next.active?.dayId === dayId ? next.active.logs[exId] : null
  if (log && patch.sets && patch.sets !== log.length) {
    const last = log[log.length - 1]
    const resized = Array.from({ length: patch.sets }, (_, i) => log[i] ?? { ...last, done: false })
    return { ...next, active: { ...next.active, logs: { ...next.active.logs, [exId]: resized } } }
  }
  return next
}

/**
 * Swap to an alternative movement: keeps sets/reps/rest/superset, gets a fresh id + log.
 * `patch` may carry extra fields (e.g. type/metrics when swapping strength ↔ cardio).
 */
export const replaceExercise = (s, dayId, exId, name, muscle, patch = {}) =>
  dropLog(
    mapDay(s, dayId, (list) =>
      list.map((e) =>
        e.id === exId
          ? { ...e, id: uid(), name, muscle: muscle ?? e.muscle, defaultWeight: undefined, media: null, libId: undefined, ...patch }
          : e,
      ),
    ),
    exId,
  )

export const resetPlan = (s) => ({ ...s, plan: clone(DEFAULT_PLAN), active: null })

/* ---------- custom exercises ---------- */

export const addCustom = (s, data) => ({ ...s, customExercises: [...s.customExercises, { ...data, id: uid() }] })
export const updateCustom = (s, id, patch) => ({
  ...s,
  customExercises: s.customExercises.map((c) => (c.id === id ? { ...c, ...patch } : c)),
})
export const removeCustom = (s, id) => ({ ...s, customExercises: s.customExercises.filter((c) => c.id !== id) })

/* ---------- history & settings ---------- */

export const deleteSession = (s, id) => ({ ...s, history: s.history.filter((h) => h.id !== id) })
export const clearHistory = (s) => ({ ...s, history: [] })
export const setSetting = (s, key, value) => ({ ...s, settings: { ...s.settings, [key]: value } })
export const replaceState = (_s, next) => next
