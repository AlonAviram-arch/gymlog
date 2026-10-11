// Lift records: manually logged lifts (state.records) combined with the strength sets
// from finished workouts, so one view shows your progress on a single exercise.
import { e1rm } from './stats'

export const REP_TARGETS = [1, 3, 5, 8, 10, 12]

const round1 = (n) => Math.round(n * 10) / 10

/** Every lift of one exercise, oldest first: [{ ts, weight, reps, source, id?, note? }]. */
export function liftsFor(state, name) {
  const out = []
  for (const h of state.history) {
    for (const e of h.exercises) {
      if (e.name !== name || e.type === 'cardio' || e.unit === 'sec') continue
      for (const s of e.sets)
        if (s.weight != null && s.reps) out.push({ ts: h.finishedAt, weight: s.weight, reps: s.reps, source: 'workout' })
    }
  }
  for (const r of state.records)
    if (r.name === name) out.push({ ts: r.date, weight: r.weight, reps: r.reps, source: 'log', id: r.id, note: r.note })
  return out.sort((a, b) => a.ts - b.ts)
}

/** Names of exercises that have at least one lift, most recent first. */
export function exercisesWithLifts(state) {
  const latest = new Map()
  const bump = (name, ts) => latest.set(name, Math.max(latest.get(name) ?? 0, ts))
  for (const h of state.history)
    for (const e of h.exercises)
      if (e.type !== 'cardio' && e.unit !== 'sec' && e.sets.some((s) => s.weight != null && s.reps)) bump(e.name, h.finishedAt)
  for (const r of state.records) bump(r.name, r.date)
  return [...latest.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name)
}

/** Names you can log against without opening the library: plan, saved plans, custom, history, records. */
export function knownExerciseNames(state) {
  const names = new Set(exercisesWithLifts(state))
  const addDays = (days) => days.forEach((d) => d.exercises.forEach((e) => e.type !== 'cardio' && names.add(e.name)))
  addDays(state.plan)
  state.savedPlans.forEach((p) => addDays(p.days))
  state.customExercises.forEach((c) => c.type !== 'cardio' && names.add(c.name))
  return [...names]
}

export const liftE1rm = (l) => round1(e1rm(l.weight, l.reps))

/** Best lift by estimated 1RM (ties → heavier weight). */
export function bestLift(lifts) {
  return lifts.reduce((a, l) => (!a || liftE1rm(l) > liftE1rm(a) || (liftE1rm(l) === liftE1rm(a) && l.weight > a.weight) ? l : a), null)
}

/** Heaviest lift (ties → more reps). */
export function heaviestLift(lifts) {
  return lifts.reduce((a, l) => (!a || l.weight > a.weight || (l.weight === a.weight && l.reps > a.reps) ? l : a), null)
}

/** Heaviest weight done for at least N reps, for each rep target: { 1: { weight, ts } | null, 3: … }. */
export function repMaxes(lifts) {
  const out = {}
  for (const n of REP_TARGETS) {
    let best = null
    for (const l of lifts) if (l.reps >= n && (!best || l.weight > best.weight)) best = l
    out[n] = best
  }
  return out
}

/**
 * Is `lift` a personal record against `earlier` lifts?
 * → { rep: true if heaviest ever for ≥ this many reps, est: true if best estimated 1RM } (null if nothing to beat).
 */
export function prStatus(lift, earlier) {
  if (!earlier.length) return null
  const rep = !earlier.some((l) => l.reps >= lift.reps && l.weight >= lift.weight)
  const est = liftE1rm(lift) > Math.max(...earlier.map(liftE1rm))
  return rep || est ? { rep, est } : null
}

/** One chart point per day: the best lift that day by the chosen metric ('weight' | 'e1rm'). */
export function dailyBest(lifts, metric) {
  const value = (l) => (metric === 'e1rm' ? liftE1rm(l) : l.weight)
  const byDay = new Map()
  for (const l of lifts) {
    const d = new Date(l.ts)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const cur = byDay.get(key)
    if (!cur || value(l) > value(cur) || (value(l) === value(cur) && l.reps > cur.reps)) byDay.set(key, l)
  }
  return [...byDay.values()]
    .sort((a, b) => a.ts - b.ts)
    .map((l) => ({
      ts: l.ts,
      value: value(l),
      detail: `${l.weight} kg × ${l.reps}${metric === 'e1rm' ? ` (≈ ${liftE1rm(l)} kg 1RM)` : ''}`,
    }))
}

/** Manual records as pseudo history entries, so workout PR detection counts them too. */
export function recordsAsHistory(records) {
  return records.map((r) => ({ finishedAt: r.date, exercises: [{ name: r.name, sets: [{ weight: r.weight, reps: r.reps }] }] }))
}
