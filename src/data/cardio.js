// Cardio exercises log a configurable set of metrics per round instead of kg × reps.
export const CARDIO_METRICS = {
  duration: { label: 'Time', unit: 'min', mode: 'decimal', total: true },
  speed: { label: 'Speed', unit: 'km/h', mode: 'decimal' },
  incline: { label: 'Incline', unit: '%', mode: 'decimal' },
  distance: { label: 'Distance', unit: 'km', mode: 'decimal', total: true },
  level: { label: 'Level', unit: 'lvl', mode: 'numeric' },
  calories: { label: 'Calories', unit: 'kcal', mode: 'numeric', total: true },
}
export const METRIC_KEYS = Object.keys(CARDIO_METRICS)

/** Sensible metric set for a cardio machine / activity. */
export function defaultCardioMetrics(name = '', equip = '') {
  const s = `${name} ${equip}`.toLowerCase()
  if (/treadmill/.test(s)) return ['duration', 'speed', 'incline', 'distance']
  if (/bike|cycle|elliptical|stepmill|stair|ergometer|skierg|row/.test(s)) return ['duration', 'level', 'distance']
  return ['duration', 'distance']
}

/** "30 min", "20-30 min" → 30 (upper bound, minutes), else null. */
export function targetMinutes(target) {
  const m = String(target ?? '').match(/(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?\s*min/i)
  if (!m) return null
  return parseFloat(m[2] ?? m[1])
}

// Common gym cardio that the dataset doesn't cover by these names.
export const CARDIO_PRESETS = [
  ['Treadmill Incline Walk', 'treadmill'],
  ['Treadmill Run', 'treadmill'],
  ['Treadmill Walk', 'treadmill'],
  ['Stationary Bike', 'stationary bike'],
  ['Spin Bike Intervals', 'stationary bike'],
  ['Rowing Machine', 'rowing machine'],
  ['Stair Climber', 'stepmill machine'],
  ['Elliptical Trainer', 'elliptical machine'],
  ['Assault / Air Bike', 'stationary bike'],
  ['Outdoor Run', 'body weight'],
  ['Outdoor Walk', 'body weight'],
  ['Swimming', 'body weight'],
].map(([name, equip], i) => ({
  id: `cardio-${i}`,
  name,
  body: 'cardio',
  equip,
  target: 'cardiovascular system',
  secondary: ['quads', 'glutes', 'hamstrings', 'calves'],
  steps: [],
  preset: true,
}))
