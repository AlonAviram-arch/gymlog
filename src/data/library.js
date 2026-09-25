// Exercise library: the exercises-dataset (loaded lazily, ~800 KB) + cardio presets.
import { useEffect, useState } from 'react'
import { CARDIO_PRESETS, defaultCardioMetrics } from './cardio'

export const DATASET_CREDIT = {
  text: 'Exercise data: exercises-dataset by Hasan Emir Yıldırım (MIT)',
  url: 'https://github.com/hasaneyldrm/exercises-dataset',
}

/** Display names for the dataset's `target` muscles (the muscle filter). */
export const TARGET_LABELS = {
  pectorals: 'Chest',
  delts: 'Shoulders',
  lats: 'Lats',
  'upper back': 'Upper Back',
  traps: 'Traps',
  spine: 'Lower Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs & Core',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  adductors: 'Adductors',
  abductors: 'Abductors',
  'serratus anterior': 'Serratus',
  'levator scapulae': 'Neck',
  'cardiovascular system': 'Cardio',
}
export const targetLabel = (t) => TARGET_LABELS[t] ?? t

/** Dataset target → this app's muscle key (used when adding to the plan). */
const TARGET_TO_MUSCLE = {
  pectorals: 'chest',
  delts: 'shoulders',
  lats: 'lats',
  'upper back': 'mid-back',
  traps: 'traps',
  spine: 'lower-back',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  abs: 'abs',
  'serratus anterior': 'abs',
  quads: 'quads',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  calves: 'calves',
  adductors: 'adductors',
  abductors: 'adductors',
  'cardiovascular system': 'cardio',
}

/** App muscle key → dataset targets (used to pre-filter alternatives). */
export const MUSCLE_TO_TARGETS = {
  quads: ['quads'],
  chest: ['pectorals'],
  hamstrings: ['hamstrings'],
  glutes: ['glutes'],
  hinge: ['glutes', 'hamstrings', 'spine'],
  lats: ['lats'],
  'mid-back': ['upper back'],
  'lower-back': ['spine'],
  traps: ['traps'],
  shoulders: ['delts'],
  'side-delts': ['delts'],
  'rear-delts': ['delts'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearms'],
  abs: ['abs'],
  calves: ['calves'],
  adductors: ['adductors', 'abductors'],
  cardio: ['cardiovascular system'],
}

export const isCardioEntry = (e) => e.target === 'cardiovascular system' || e.body === 'cardio'

/** Library entry → plan exercise fields (targets can be edited before adding). */
export function entryToExercise(e) {
  if (isCardioEntry(e)) {
    return {
      name: e.name,
      muscle: 'cardio',
      type: 'cardio',
      metrics: defaultCardioMetrics(e.name, e.equip),
      sets: 1,
      reps: '20 min',
      rest: 0,
      unit: 'reps',
      libId: e.id,
      media: e.media ?? null,
    }
  }
  return {
    name: e.name,
    muscle: TARGET_TO_MUSCLE[e.target] ?? 'other',
    type: 'strength',
    sets: 3,
    reps: '8-12',
    rest: 90,
    unit: 'reps',
    libId: e.id,
    media: e.media ?? null,
  }
}

let cache = null
let pending = null

function load() {
  if (cache) return Promise.resolve(cache)
  pending ??= import('./exerciseDb.json').then((m) => (cache = [...CARDIO_PRESETS, ...m.default]))
  return pending
}

/** Returns the full library array, or null while it loads. */
export function useExerciseLibrary() {
  const [lib, setLib] = useState(cache)
  const [error, setError] = useState(null)
  useEffect(() => {
    if (cache) return
    let alive = true
    load()
      .then((l) => alive && setLib(l))
      .catch((e) => {
        pending = null
        if (alive) setError(e)
      })
    return () => {
      alive = false
    }
  }, [])
  return { lib, error }
}
