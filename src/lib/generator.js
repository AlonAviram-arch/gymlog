// Turns program templates / workout focuses into concrete plan days for a given
// equipment profile and goal.
import { MOVEMENTS } from '../data/movements'
import { EQUIPMENT, FOCUSES, LENGTHS } from '../data/programs'
import { defaultCardioMetrics } from '../data/cardio'
import { uid } from './format'

/** Default sets / reps / rest for a movement kind and training goal. */
export function scheme(kind, goal) {
  const s = (sets, reps, rest) => ({ sets, reps, rest })
  switch (kind) {
    case 'heavy':
      return goal === 'strength' ? s(3, '3-5', 180) : goal === 'conditioning' ? s(3, '6-8', 120) : s(3, '5-6', 180)
    case 'compound':
      return goal === 'strength'
        ? s(4, '5-6', 150)
        : goal === 'conditioning'
          ? s(3, '12-15', 60)
          : goal === 'general'
            ? s(3, '8-12', 90)
            : s(3, '8-10', 120)
    case 'iso':
      return goal === 'strength' ? s(3, '8-10', 90) : goal === 'conditioning' ? s(3, '15-20', 45) : s(3, '12-15', 60)
    case 'core':
      return s(3, '10-15', 60)
    case 'carry':
      return { ...s(3, '30-45s', 60), unit: 'sec' }
    case 'cardio':
      return { ...s(1, '20 min', 0), type: 'cardio' }
    case 'intervals':
      return { ...s(6, '40s on / 20s off', 20), type: 'cardio', metrics: ['duration'] }
    default:
      return s(3, '8-12', 90)
  }
}

/** Parses 'squat@1' / ['squat@1', 5, '5', 180] / 'lateral+triceps'. */
function parseSlot(spec) {
  const [ref, sets, reps, rest] = Array.isArray(spec) ? spec : [spec]
  return ref.split('+').map((part) => {
    const [key, hint] = part.split('@')
    if (!MOVEMENTS[key]) throw new Error(`Unknown movement slot "${key}"`)
    return { key, hint: hint ? Number(hint) : 0, override: sets ? { sets, reps, rest } : null }
  })
}

const allowed = (key, equipment) => MOVEMENTS[key].options.filter((o) => EQUIPMENT[equipment].kits.includes(o.kit))

/**
 * Pick an option for a slot: the `hint`-th preferred option that the equipment allows
 * and that isn't already used today (falls back to the nearest available one).
 */
export function pickOption(key, equipment, used, { hint = 0, random = false, after = null } = {}) {
  const pool = allowed(key, equipment).filter((o) => !used.has(o.id))
  if (!pool.length) return null
  if (random) return pool[Math.floor(Math.random() * pool.length)]
  if (after) {
    // Next option after the current one (for per-exercise "shuffle").
    const all = allowed(key, equipment)
    const i = all.findIndex((o) => o.id === after)
    for (let k = 1; k <= all.length; k++) {
      const o = all[(i + k) % all.length]
      if (!used.has(o.id)) return o
    }
    return null
  }
  // hint counts over the full preference list; map to the closest allowed option
  const full = MOVEMENTS[key].options
  const wanted = full[Math.min(hint, full.length - 1)]
  return pool.find((o) => o.id === wanted.id) ?? pool[Math.min(hint, pool.length - 1)] ?? pool[0]
}

/** Movement option → plan exercise. */
export function toExercise(key, option, goal, override, superset = null) {
  const slot = MOVEMENTS[key]
  const base = scheme(slot.kind, goal)
  const s = { ...base, ...(override ?? {}) }
  const cardio = s.type === 'cardio'
  return {
    id: uid(),
    name: option.name,
    muscle: slot.muscle,
    sets: s.sets,
    reps: String(s.reps),
    rest: s.rest,
    unit: s.unit ?? 'reps',
    superset,
    type: cardio ? 'cardio' : 'strength',
    ...(cardio ? { metrics: s.metrics ?? defaultCardioMetrics(option.name) } : {}),
    libId: option.id,
    media: option.media,
    slot: key, // lets the builder re-shuffle within the same movement pattern
  }
}

/** One day's slot list → exercises (slots with no option for this equipment are skipped). */
export function buildExercises(slotSpecs, equipment, goal, { random = false } = {}) {
  const used = new Set()
  const out = []
  for (const spec of slotSpecs) {
    const parts = parseSlot(spec)
    const group = parts.length > 1 ? uid() : null
    const picked = []
    for (const p of parts) {
      const o = pickOption(p.key, equipment, used, { hint: p.hint, random })
      if (!o) continue
      used.add(o.id)
      picked.push(toExercise(p.key, o, goal, p.override, group))
    }
    // Superset: first movement goes straight into the second.
    if (picked.length > 1) picked.slice(0, -1).forEach((e) => (e.rest = 0))
    else if (picked.length === 1) picked[0].superset = null
    out.push(...picked)
  }
  return out
}

/** Program template → plan days. */
export function buildProgram(program, equipment = program.equipment, goal = program.goal) {
  return program.days.map((d, i) => ({
    id: uid(),
    name: `Day ${i + 1}`,
    title: d.title,
    exercises: buildExercises(d.slots, equipment, goal),
  }))
}

/** Single workout for a focus. */
export function buildFocusWorkout(focusKey, { equipment = 'gym', goal = 'muscle', length = 'standard', random = false } = {}) {
  const focus = FOCUSES[focusKey]
  return buildExercises(focus.slots, equipment, goal, { random }).slice(0, LENGTHS[length].count)
}

/** Swap one generated exercise for the next option in the same movement pattern. */
export function reshuffleExercise(list, index, equipment, goal) {
  const ex = list[index]
  if (!ex.slot) return list
  const used = new Set(list.map((e) => e.libId))
  const o = pickOption(ex.slot, equipment, used, { after: ex.libId })
  if (!o) return list
  const next = [...list]
  next[index] = { ...toExercise(ex.slot, o, goal, { sets: ex.sets, reps: ex.reps, rest: ex.rest }, ex.superset), id: ex.id }
  return next
}

/** How many of a program's slots this equipment can't cover (shown as a hint). */
export function missingSlots(program, equipment) {
  let n = 0
  for (const d of program.days) for (const spec of d.slots) for (const p of parseSlot(spec)) if (!allowed(p.key, equipment).length) n++
  return n
}
