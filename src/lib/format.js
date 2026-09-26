export const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID?.()) || Date.now().toString(36) + Math.random().toString(36).slice(2, 10)

/** Rest seconds → pill label, e.g. 150 → "2:30", 45 → "45s". */
export function fmtRest(sec) {
  if (!sec) return 'No rest'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Milliseconds → "MM:SS". */
export function fmtClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function fmtDate(ts, opts = { month: 'short', day: 'numeric' }) {
  return new Date(ts).toLocaleDateString(undefined, opts)
}

export function fmtAgo(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return fmtDate(ts)
}

/** "Mon, Sep 22 · 4 days ago" */
export function fmtWhen(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000)
  const ago = days < 7 ? fmtAgo(ts) : days < 60 ? `${Math.round(days / 7)} wk ago` : `${Math.round(days / 30)} mo ago`
  return `${fmtDate(ts, { weekday: 'short', month: 'short', day: 'numeric' })} · ${ago}`
}

export function fmtDuration(ms) {
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

/** "80" → 80, "" → null. Accepts comma decimals ("72,5"). */
export function toNum(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const CARDIO_UNITS = { duration: ' min', speed: ' km/h', incline: '%', distance: ' km', level: ' lvl', calories: ' kcal' }

/** One logged set → "80×8", "10×45s" or "30 min · 5.5 km/h · 12%". */
export function fmtSetShort(set, ex) {
  if (ex.type === 'cardio') {
    const parts = (ex.metrics ?? Object.keys(CARDIO_UNITS))
      .filter((m) => set[m] != null && set[m] !== '')
      .map((m) => `${set[m]}${CARDIO_UNITS[m] ?? ''}`)
    return parts.join(' · ') || '–'
  }
  return `${set.weight ?? '–'}×${set.reps ?? '–'}${ex.unit === 'sec' ? 's' : ''}`
}

/** Like fmtSetShort but spelled out for history lists: "80 kg × 8". */
export function fmtSetLong(set, ex) {
  if (ex.type === 'cardio') return fmtSetShort(set, ex)
  return `${set.weight ?? '–'} kg × ${set.reps ?? '–'}${ex.unit === 'sec' ? 's' : ''}`
}

export const REST_PRESETS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240]
