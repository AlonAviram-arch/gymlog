export const MUSCLES = {
  quads: 'Quads',
  chest: 'Chest',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  hinge: 'Posterior Chain (Hinge)',
  lats: 'Back – Lats (Vertical Pull)',
  'mid-back': 'Back – Mid (Horizontal Pull)',
  'lower-back': 'Lower Back',
  traps: 'Traps',
  shoulders: 'Shoulders (Press)',
  'side-delts': 'Side Delts',
  'rear-delts': 'Rear Delts',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms & Grip',
  abs: 'Abs & Core',
  calves: 'Calves',
  adductors: 'Adductors / Abductors',
  cardio: 'Cardio',
  other: 'Other',
}

export const muscleLabel = (key) => MUSCLES[key] ?? MUSCLES.other
