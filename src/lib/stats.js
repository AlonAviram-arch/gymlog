// Training analytics, adapted from ideas in LogPress (github.com/hasaneyldrm/logpress-public, MIT):
// totals, streaks, consistency score, activity calendar and muscle-group distribution —
// computed locally from history. Streaks are counted in weeks (not days) so rest days
// in a 3-day split don't break them.

const DAY = 86400000

/** Local-midnight Monday of the week containing ts. */
export function weekStart(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.getTime()
}

export const dayKey = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

const isCardio = (e) => e.type === 'cardio'

export function entryVolume(entry) {
  let v = 0
  for (const e of entry.exercises) if (!isCardio(e)) for (const s of e.sets) v += (s.weight ?? 0) * (s.reps ?? 0)
  return v
}

export const entrySets = (entry) => entry.exercises.reduce((n, e) => n + e.sets.length, 0)

export function entryCardioMinutes(entry) {
  let m = 0
  for (const e of entry.exercises) if (isCardio(e)) for (const s of e.sets) m += s.duration ?? 0
  return m
}

/** Epley estimated one-rep max. */
export const e1rm = (w, r) => (w && r ? w * (1 + r / 30) : 0)

function bestOf(sets) {
  let weight = 0
  let est = 0
  for (const s of sets) {
    weight = Math.max(weight, s.weight ?? 0)
    est = Math.max(est, e1rm(s.weight, s.reps))
  }
  return { weight, est }
}

/**
 * Personal records set by `entry` compared to all earlier history.
 * Returns [{ name, kind: 'weight' | 'e1rm', value, previous }].
 */
export function findPRs(entry, earlier) {
  const prs = []
  for (const e of entry.exercises) {
    if (isCardio(e)) continue
    const prevSets = earlier.flatMap((h) => h.exercises.filter((x) => x.name === e.name).flatMap((x) => x.sets))
    if (!prevSets.length) continue // first time isn't a record
    const now = bestOf(e.sets)
    const before = bestOf(prevSets)
    if (now.weight > before.weight) prs.push({ name: e.name, kind: 'weight', value: now.weight, previous: before.weight })
    else if (now.est > before.est + 0.01)
      prs.push({ name: e.name, kind: 'e1rm', value: Math.round(now.est * 10) / 10, previous: Math.round(before.est * 10) / 10 })
  }
  return prs
}

// Fun equivalents for total volume (LogPress shows cars / monkeys / turtles).
const EQUIVALENTS = [
  { kg: 1500, one: 'car', many: 'cars' },
  { kg: 480, one: 'grand piano', many: 'grand pianos' },
  { kg: 270, one: 'grizzly bear', many: 'grizzly bears' },
  { kg: 30, one: 'golden retriever', many: 'golden retrievers' },
]
export function volumeEquivalent(kg) {
  const eq = EQUIVALENTS.find((e) => kg >= e.kg)
  if (!eq) return null
  const n = Math.round((kg / eq.kg) * 10) / 10
  return `≈ ${n} ${n === 1 ? eq.one : eq.many}`
}

/** Summary for the "Workout complete" screen. */
export function sessionSummary(entry, earlier) {
  const prevSameDay = [...earlier].reverse().find((h) => h.dayId === entry.dayId)
  const volume = entryVolume(entry)
  const prevVolume = prevSameDay ? entryVolume(prevSameDay) : null
  return {
    duration: entry.finishedAt - entry.startedAt,
    exercises: entry.exercises.length,
    sets: entrySets(entry),
    volume,
    volumeDelta: prevVolume ? (volume - prevVolume) / prevVolume : null,
    cardioMinutes: entryCardioMinutes(entry),
    prs: findPRs(entry, earlier),
    equivalent: volumeEquivalent(volume),
  }
}

/** Dashboard numbers for the History → Overview tab. */
export function overview(history, weeklyGoal, now = Date.now()) {
  const perWeek = new Map()
  for (const h of history) {
    const w = weekStart(h.finishedAt)
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1)
  }
  const thisWeek = weekStart(now)
  const prevWeek = (w) => weekStart(w - 3 * DAY) // any time in the previous week

  // Current streak: consecutive weeks with ≥1 workout, ending this week (or last week
  // if this week has none yet — the week isn't over).
  let streak = 0
  let w = perWeek.has(thisWeek) ? thisWeek : prevWeek(thisWeek)
  while (perWeek.has(w)) {
    streak++
    w = prevWeek(w)
  }
  let best = 0
  let run = 0
  const first = history.length ? weekStart(history[0].finishedAt) : thisWeek
  for (let x = first; x <= thisWeek; x = weekStart(x + 8 * DAY)) {
    run = perWeek.has(x) ? run + 1 : 0
    best = Math.max(best, run)
  }

  // Consistency: share of the last (up to) 8 complete weeks that hit the weekly goal.
  const weeks = []
  for (let x = prevWeek(thisWeek); x >= first && weeks.length < 8; x = prevWeek(x)) weeks.push(x)
  const hit = weeks.filter((x) => (perWeek.get(x) ?? 0) >= weeklyGoal).length
  const consistency = weeks.length ? Math.round((hit / weeks.length) * 100) : null

  let volume = 0
  let minutes = 0
  let cardio = 0
  for (const h of history) {
    volume += entryVolume(h)
    minutes += (h.finishedAt - h.startedAt) / 60000
    cardio += entryCardioMinutes(h)
  }

  return {
    total: history.length,
    thisWeek: perWeek.get(thisWeek) ?? 0,
    streak,
    bestStreak: best,
    consistency,
    consistencyWeeks: weeks.length,
    volume,
    hours: minutes / 60,
    cardioMinutes: cardio,
  }
}

/** Sets per muscle group over the last `days` days, largest first. */
export function muscleDistribution(history, days = 30, now = Date.now()) {
  const since = now - days * DAY
  const m = new Map()
  for (const h of history) {
    if (h.finishedAt < since) continue
    for (const e of h.exercises) m.set(e.muscle ?? 'other', (m.get(e.muscle ?? 'other') ?? 0) + e.sets.length)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

/**
 * GitHub-style activity grid: `weeks` columns × 7 rows (Mon–Sun), oldest first.
 * Each cell: { ts, sets, workouts, level 0–4, future }.
 */
export function activityGrid(history, weeks = 18, now = Date.now()) {
  const byDay = new Map()
  for (const h of history) {
    const k = dayKey(h.finishedAt)
    const cur = byDay.get(k) ?? { sets: 0, workouts: [] }
    cur.sets += entrySets(h)
    cur.workouts.push(h.dayName)
    byDay.set(k, cur)
  }
  const start = weekStart(now) - (weeks - 1) * 7 * DAY
  const cols = []
  for (let c = 0; c < weeks; c++) {
    const col = []
    for (let r = 0; r < 7; r++) {
      const d = new Date(start)
      d.setDate(d.getDate() + c * 7 + r)
      const ts = d.getTime()
      const info = byDay.get(dayKey(ts))
      const sets = info?.sets ?? 0
      const level = sets === 0 ? 0 : sets < 6 ? 1 : sets < 12 ? 2 : sets < 18 ? 3 : 4
      col.push({ ts, sets, workouts: info?.workouts ?? [], level, future: ts > now })
    }
    cols.push(col)
  }
  return cols
}
