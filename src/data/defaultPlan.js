// Rest is stored in seconds. `superset` groups adjacent exercises visually;
// the first movement in a superset has 0 rest (go straight to the second one).
// `unit` is 'reps' or 'sec' (timed holds). `defaultWeight` pre-fills the first session.

const ex = (id, name, muscle, sets, reps, rest, extra = {}) => ({
  id,
  name,
  muscle,
  sets,
  reps,
  rest,
  unit: 'reps',
  superset: null,
  ...extra,
})

export const DEFAULT_PLAN = [
  {
    id: 'day1',
    name: 'Day 1',
    title: 'Quads, Chest, Hamstrings & Glutes',
    exercises: [
      ex('d1-1', 'Barbell Back Squats', 'quads', 3, '6-8', 150),
      ex('d1-2', 'Flat Dumbbell Bench Press', 'chest', 3, '8-10', 120),
      ex('d1-3', 'Romanian Deadlifts', 'hamstrings', 3, '8-10', 120),
      ex('d1-4', 'Barbell or Dumbbell Hip Thrusts', 'glutes', 3, '8-10', 120),
      ex('d1-5', 'Lat Pulldowns', 'lats', 3, '8-10', 120),
      ex('d1-6', 'Cable Lateral Raises', 'side-delts', 3, '12-15', 0, { superset: 'd1-ss' }),
      ex('d1-7', 'Triceps Cable Pushdowns', 'triceps', 3, '12-15', 90, { superset: 'd1-ss' }),
    ],
  },
  {
    id: 'day2',
    name: 'Day 2',
    title: 'Back, Hamstrings & Glutes',
    exercises: [
      ex('d2-1', 'Trap Bar / Barbell Deadlifts', 'hinge', 3, '5', 180),
      ex('d2-2', 'Incline Dumbbell Bench Press', 'chest', 3, '8-10', 120),
      ex('d2-3', 'Seated Cable Rows', 'mid-back', 3, '8-10', 120),
      ex('d2-4', 'Leg Press or Hack Squat', 'quads', 3, '10-12', 120),
      ex('d2-5', 'Incline Dumbbell Curls', 'biceps', 3, '10-12', 0, { superset: 'd2-ss' }),
      ex('d2-6', 'Cable Face Pulls', 'rear-delts', 3, '12-15', 90, { superset: 'd2-ss' }),
    ],
  },
  {
    id: 'day3',
    name: 'Day 3',
    title: 'Shoulders, Glutes & Arms',
    exercises: [
      ex('d3-1', 'Overhead Dumbbell Press', 'shoulders', 3, '8-10', 120),
      ex('d3-2', 'Bulgarian Split Squats', 'glutes', 3, '8-10/leg', 90),
      ex('d3-3', 'Neutral-Grip Pull-ups / Lat Pulldown', 'lats', 3, '8-10', 120),
      ex('d3-4', 'Hyperextensions (45° Bench, Rounded Back)', 'glutes', 3, '10-12', 90),
      ex('d3-5', 'Cable Rope Hammer Curls', 'biceps', 3, '10-12', 0, { superset: 'd3-ss' }),
      ex('d3-6', 'Overhead Triceps Extensions', 'triceps', 3, '10-12', 90, { superset: 'd3-ss' }),
    ],
  },
  {
    id: 'home',
    name: 'Home',
    title: 'Forearms (10kg DBs)',
    exercises: [
      ex('h-1', 'Dumbbell Wrist Curls (Palms Up)', 'forearms', 3, '15-20', 60, { defaultWeight: 10 }),
      ex('h-2', 'Reverse DB Wrist Curls (Palms Down)', 'forearms', 3, '15-20', 60, { defaultWeight: 10 }),
      ex('h-3', "Dumbbell Farmer's Holds / Carries", 'forearms', 3, '45-60s', 60, { unit: 'sec', defaultWeight: 10 }),
    ],
  },
]
