// Program templates and single-workout focuses, written in terms of movement slots
// (see movements.js). The generator turns them into concrete exercises for the
// equipment you have.
//
// Slot syntax inside a day:
//   'squat'          → preferred option for the slot, default sets/reps for the goal
//   'squat@1'        → the 2nd preferred option (e.g. leg press instead of back squat)
//   ['squat', 5, '5', 180]  → explicit sets, reps, rest (seconds)
//   'lateral+triceps' → superset (first movement no rest, go straight to the second)

export const EQUIPMENT = {
  gym: { label: 'Full gym', kits: ['barbell', 'machine', 'cable', 'dumbbell', 'kettlebell', 'band', 'bodyweight'] },
  dumbbell: { label: 'Dumbbells', kits: ['dumbbell', 'kettlebell', 'band', 'bodyweight'] },
  bodyweight: { label: 'Bodyweight', kits: ['bodyweight', 'band'] },
}

export const GOALS = {
  muscle: 'Build muscle',
  strength: 'Strength',
  general: 'General fitness',
  conditioning: 'Conditioning',
}

export const LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export const PROGRAMS = [
  {
    id: 'fb3',
    name: 'Full Body 3×',
    tagline: 'Hit everything three times a week. The best starting point.',
    perWeek: 3,
    level: 'beginner',
    goal: 'muscle',
    equipment: 'gym',
    days: [
      { title: 'Full Body A', slots: ['squat', 'hpush', 'hpull', 'glute', 'lateral', 'core'] },
      { title: 'Full Body B', slots: ['deadlift', 'vpush', 'vpull', 'lunge', 'biceps+triceps', 'core2'] },
      { title: 'Full Body C', slots: ['squat@1', 'ipush', 'vpull@1', 'hinge', 'reardelt', 'calves'] },
    ],
  },
  {
    id: 'fb2',
    name: 'Full Body 2× Minimalist',
    tagline: 'Two efficient sessions for busy weeks.',
    perWeek: 2,
    level: 'beginner',
    goal: 'general',
    equipment: 'gym',
    days: [
      { title: 'Full Body A', slots: ['squat', 'hpush', 'hpull', 'hinge', 'core'] },
      { title: 'Full Body B', slots: ['deadlift', 'vpush', 'vpull', 'lunge', 'core2'] },
    ],
  },
  {
    id: 'ul4',
    name: 'Upper / Lower 4×',
    tagline: 'Each muscle twice a week with room for volume.',
    perWeek: 4,
    level: 'intermediate',
    goal: 'muscle',
    equipment: 'gym',
    days: [
      { title: 'Upper A', slots: ['hpush', 'hpull', 'vpush', 'vpull', 'lateral+triceps', 'biceps'] },
      { title: 'Lower A', slots: ['squat', 'hinge', 'legext', 'legcurl', 'calves', 'core'] },
      { title: 'Upper B', slots: ['ipush', 'vpull@1', 'hpull@3', 'fly', 'reardelt', 'hammer+triceps2'] },
      { title: 'Lower B', slots: ['deadlift', 'lunge', 'glute', 'legcurl@1', 'calves@1', 'core2'] },
    ],
  },
  {
    id: 'ppl3',
    name: 'Push / Pull / Legs',
    tagline: 'The classic split: pressing, pulling and leg days.',
    perWeek: 3,
    level: 'intermediate',
    goal: 'muscle',
    equipment: 'gym',
    days: [
      { title: 'Push', slots: ['hpush', 'vpush', 'ipush', 'lateral', 'triceps', 'triceps2'] },
      { title: 'Pull', slots: ['vpull', 'hpull', 'reardelt', 'biceps', 'hammer', 'shrug'] },
      { title: 'Legs', slots: ['squat', 'hinge', 'lunge', 'legext', 'legcurl', 'calves'] },
    ],
  },
  {
    id: 'ppl6',
    name: 'Push / Pull / Legs 6×',
    tagline: 'High-frequency PPL with A/B variations.',
    perWeek: 6,
    level: 'advanced',
    goal: 'muscle',
    equipment: 'gym',
    days: [
      { title: 'Push A', slots: ['hpush', 'vpush', 'ipush@1', 'lateral', 'triceps', 'triceps2'] },
      { title: 'Pull A', slots: ['deadlift', 'vpull', 'hpull', 'reardelt', 'biceps', 'hammer'] },
      { title: 'Legs A', slots: ['squat', 'hinge', 'legext', 'legcurl', 'calves', 'core'] },
      { title: 'Push B', slots: ['vpush@1', 'ipush', 'hpush@2', 'fly', 'lateral@1', 'triceps@2'] },
      { title: 'Pull B', slots: ['vpull@1', 'hpull@1', 'hpull@3', 'reardelt@1', 'biceps@2', 'shrug'] },
      { title: 'Legs B', slots: ['squat@1', 'lunge', 'glute', 'legcurl@1', 'calves@1', 'core2'] },
    ],
  },
  {
    id: 'bro5',
    name: 'Body-Part Split 5×',
    tagline: 'One muscle group per day, bodybuilding style.',
    perWeek: 5,
    level: 'intermediate',
    goal: 'muscle',
    equipment: 'gym',
    days: [
      { title: 'Chest', slots: ['hpush', 'ipush', 'hpush@2', 'fly', 'fly@1', 'core'] },
      { title: 'Back', slots: ['deadlift', 'vpull', 'hpull', 'hpull@3', 'vpull@4', 'lowerback'] },
      { title: 'Legs', slots: ['squat', 'squat@1', 'hinge', 'legext', 'legcurl', 'calves'] },
      { title: 'Shoulders', slots: ['vpush', 'lateral', 'reardelt', 'lateral@1', 'shrug', 'core2'] },
      { title: 'Arms', slots: ['biceps', 'triceps', 'hammer', 'triceps2', 'biceps@2', 'carry'] },
    ],
  },
  {
    id: 'glute4',
    name: 'Glutes & Lower-Body Focus',
    tagline: 'Three lower-body days with an emphasis on glutes, plus one upper day.',
    perWeek: 4,
    level: 'intermediate',
    goal: 'muscle',
    equipment: 'gym',
    days: [
      { title: 'Glutes & Quads', slots: ['glute', 'squat@1', 'lunge', 'legext', 'glute2', 'core'] },
      { title: 'Upper Body', slots: ['hpush', 'vpull', 'hpull', 'vpush', 'lateral+triceps', 'biceps'] },
      { title: 'Glutes & Hamstrings', slots: ['hinge', 'glute@1', 'legcurl', 'lunge@2', 'glute2@1', 'calves'] },
      { title: 'Glute Pump', slots: ['glute', 'squat', 'lunge@3', 'glute2', 'legcurl@1', 'core2'] },
    ],
  },
  {
    id: 'str3',
    name: 'Strength Basics A/B',
    tagline: 'Heavy compound lifts. Alternate A and B, three sessions a week.',
    perWeek: 3,
    level: 'beginner',
    goal: 'strength',
    equipment: 'gym',
    days: [
      { title: 'Workout A', slots: [['squat', 5, '5', 180], ['hpush', 5, '5', 180], ['hpull@1', 5, '5', 150], 'core'] },
      { title: 'Workout B', slots: [['squat', 5, '5', 180], ['vpush@1', 5, '5', 180], ['deadlift', 1, '5', 180], 'vpull'] },
    ],
  },
  {
    id: 'db3',
    name: 'Dumbbell Full Body 3×',
    tagline: 'Everything with a pair of dumbbells and a bench. Great for home.',
    perWeek: 3,
    level: 'beginner',
    goal: 'general',
    equipment: 'dumbbell',
    days: [
      { title: 'Dumbbell A', slots: ['squat', 'hpush', 'hpull', 'hinge', 'lateral', 'core'] },
      { title: 'Dumbbell B', slots: ['lunge', 'vpush', 'hpull@1', 'glute', 'biceps+triceps', 'core2'] },
      { title: 'Dumbbell C', slots: ['squat@1', 'ipush', 'hpull', 'hinge@1', 'reardelt', 'carry'] },
    ],
  },
  {
    id: 'bw3',
    name: 'Bodyweight Anywhere',
    tagline: 'No equipment besides a pull-up bar. Includes short conditioning finishers.',
    perWeek: 3,
    level: 'beginner',
    goal: 'general',
    equipment: 'bodyweight',
    days: [
      { title: 'Bodyweight A', slots: ['squat', 'hpush', 'hpull', 'lunge', 'core', 'intervals'] },
      { title: 'Bodyweight B', slots: ['vpush', 'vpull', 'glute', 'triceps', 'core2', 'intervals@1'] },
      { title: 'Bodyweight C', slots: ['lunge@1', 'ipush', 'hpull', 'squat@1', 'core@1', 'steady'] },
    ],
  },
  {
    id: 'hybrid4',
    name: 'Lift + Cardio Hybrid',
    tagline: 'Two full-body lifting days and two cardio days, for strength and endurance.',
    perWeek: 4,
    level: 'intermediate',
    goal: 'conditioning',
    equipment: 'gym',
    days: [
      { title: 'Strength A', slots: ['squat', 'hpush', 'hpull', 'core', 'intervals'] },
      { title: 'Zone 2 Cardio', slots: [['steady', 1, '40 min', 0], 'core2'] },
      { title: 'Strength B', slots: ['deadlift', 'vpush', 'vpull', 'lunge', 'intervals@1'] },
      { title: 'Cardio & Core', slots: [['steady@1', 1, '30 min', 0], 'core', 'core2@2', 'carry'] },
    ],
  },
]

/** Focuses for the single-workout builder, in order of priority (length trims the tail). */
export const FOCUSES = {
  full: { label: 'Full Body', slots: ['squat', 'hpush', 'hpull', 'hinge', 'vpush', 'core', 'lateral', 'biceps'] },
  upper: { label: 'Upper Body', slots: ['hpush', 'hpull', 'vpush', 'vpull', 'lateral', 'triceps', 'biceps', 'reardelt'] },
  lower: { label: 'Lower Body', slots: ['squat', 'hinge', 'lunge', 'legcurl', 'glute', 'calves', 'legext', 'core'] },
  push: { label: 'Push', slots: ['hpush', 'vpush', 'ipush', 'lateral', 'triceps', 'fly', 'triceps2', 'core'] },
  pull: { label: 'Pull', slots: ['vpull', 'hpull', 'reardelt', 'biceps', 'hpull@3', 'hammer', 'shrug', 'lowerback'] },
  legs: { label: 'Legs', slots: ['squat', 'hinge', 'lunge', 'legext', 'legcurl', 'calves', 'glute', 'core2'] },
  glutes: { label: 'Glutes', slots: ['glute', 'hinge', 'lunge', 'glute2', 'squat@1', 'legcurl', 'glute2@1', 'core'] },
  chestback: { label: 'Chest & Back', slots: ['hpush', 'hpull', 'ipush', 'vpull', 'fly', 'reardelt', 'hpush@2', 'core'] },
  shoulders: { label: 'Shoulders', slots: ['vpush', 'lateral', 'reardelt', 'shrug', 'lateral@1', 'vpush@3', 'core2'] },
  arms: { label: 'Arms', slots: ['biceps', 'triceps', 'hammer', 'triceps2', 'biceps@2', 'triceps@2', 'carry'] },
  core: { label: 'Core', slots: ['core', 'core2', 'lowerback', 'core@1', 'core2@1', 'carry'] },
  conditioning: { label: 'Conditioning', slots: ['intervals', 'steady', 'intervals@1', 'core', 'carry'] },
}

export const LENGTHS = { short: { label: 'Short', count: 4 }, standard: { label: 'Standard', count: 6 }, long: { label: 'Long', count: 8 } }
