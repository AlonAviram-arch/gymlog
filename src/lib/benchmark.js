// Compares a set you're logging with the same set from your last session.
import { toNum } from './format'
import { e1rm } from './stats'

const fmtNum = (n) => String(Math.round(Math.abs(n) * 100) / 100)
const signed = (n, unit) => `${n > 0 ? '+' : '−'}${fmtNum(n)}${unit}`

const CARDIO_ORDER = [
  ['distance', ' km'],
  ['duration', ' min'],
  ['speed', ' km/h'],
  ['incline', '%'],
  ['level', ' lvl'],
  ['calories', ' kcal'],
]

/**
 * → { dir: 'up' | 'down' | 'same', text } or null when there's nothing to compare.
 * Strength: weight first, then reps; mixed changes are judged by estimated 1RM.
 */
export function compareSet(cur, prev, ex) {
  if (!prev) return null
  if (ex.type === 'cardio') {
    const parts = []
    let dir = null
    for (const [m, unit] of CARDIO_ORDER) {
      const a = toNum(cur[m])
      const b = prev[m]
      if (a == null || b == null) continue
      const d = a - b
      if (Math.abs(d) < 1e-9) continue
      dir ??= d > 0 ? 'up' : 'down'
      if (parts.length < 2) parts.push(signed(d, unit))
    }
    if (!dir) return hasAny(cur, CARDIO_ORDER) ? { dir: 'same', text: 'matched' } : null
    return { dir, text: parts.join(', ') }
  }

  const w = toNum(cur.weight)
  const r = toNum(cur.reps)
  if (r == null) return null
  const pw = prev.weight ?? 0
  const pr = prev.reps ?? 0
  const dw = (w ?? 0) - pw
  const dr = r - pr
  const repUnit = ex.unit === 'sec' ? 's' : Math.abs(dr) === 1 ? ' rep' : ' reps'
  if (dw === 0 && dr === 0) return { dir: 'same', text: 'matched' }
  const parts = []
  if (dw !== 0) parts.push(signed(dw, ' kg'))
  if (dr !== 0) parts.push(signed(dr, repUnit))
  let dir
  if (dw >= 0 && dr >= 0) dir = 'up'
  else if (dw <= 0 && dr <= 0) dir = 'down'
  else dir = e1rm(w, r) >= e1rm(pw, pr) ? 'up' : 'down'
  return { dir, text: parts.join(', ') }
}

function hasAny(cur, order) {
  return order.some(([m]) => toNum(cur[m]) != null)
}
