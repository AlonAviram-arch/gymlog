// Builds src/data/movements.js: curated exercise options per movement pattern, resolved
// against src/data/exerciseDb.json (names + demo media ids). Programs and the workout
// builder pick from these, filtered by the equipment you have.
//
// Usage: npm run build:movements   (after build:exercises)
import fs from 'node:fs'

const db = JSON.parse(fs.readFileSync(new URL('../src/data/exerciseDb.json', import.meta.url), 'utf8'))
const byId = Object.fromEntries(db.map((e) => [e.id, e]))

// Options are listed in order of preference for a full gym. [datasetId, optional display name]
const SLOTS = {
  squat: {
    label: 'Squat',
    muscle: 'quads',
    kind: 'compound',
    options: [
      ['0043', 'Barbell Back Squat'],
      ['0739', 'Leg Press'],
      ['0042'],
      ['0046'],
      ['3281'],
      ['1760'],
      ['0413'],
      ['0534'],
      ['1685'],
      ['0514'],
    ],
  },
  hinge: {
    label: 'Hip hinge',
    muscle: 'hamstrings',
    kind: 'compound',
    options: [
      ['0085', 'Romanian Deadlift'],
      ['0811'],
      ['1459', 'Dumbbell Romanian Deadlift'],
      ['0432'],
      ['0549'],
      ['0044'],
      ['3013', 'Glute Bridge (Floor)'],
    ],
  },
  deadlift: {
    label: 'Deadlift',
    muscle: 'hinge',
    kind: 'heavy',
    options: [['0032', 'Barbell Deadlift'], ['0811'], ['1459', 'Dumbbell Romanian Deadlift'], ['0549'], ['3561']],
  },
  lunge: {
    label: 'Single-leg',
    muscle: 'glutes',
    kind: 'compound',
    options: [['0410', 'Bulgarian Split Squat'], ['0336'], ['0431'], ['0381', 'Dumbbell Reverse Lunge'], ['0054'], ['1460'], ['2368']],
  },
  glute: {
    label: 'Glute bridge / thrust',
    muscle: 'glutes',
    kind: 'compound',
    options: [
      ['3562', 'Barbell Hip Thrust (Bench)'],
      ['1409'],
      ['2286', 'Machine Hip Extension'],
      ['2808'],
      ['3523', 'Single-Bench Glute Bridge'],
      ['3561'],
    ],
  },
  glute2: {
    label: 'Glute isolation',
    muscle: 'glutes',
    kind: 'iso',
    options: [['0228', 'Cable Glute Kickback'], ['0196', 'Cable Pull-Through'], ['2808'], ['0991'], ['3561']],
  },
  legcurl: {
    label: 'Leg curl',
    muscle: 'hamstrings',
    kind: 'iso',
    options: [['0599', 'Seated Leg Curl'], ['0586', 'Lying Leg Curl'], ['0496', 'Nordic-Style Leg Curl (Bench)'], ['0697']],
  },
  legext: { label: 'Leg extension', muscle: 'quads', kind: 'iso', options: [['0585', 'Leg Extension'], ['3007'], ['1489']] },
  calves: {
    label: 'Calves',
    muscle: 'calves',
    kind: 'iso',
    options: [['1383', 'Hack Calf Raise'], ['0594', 'Seated Calf Raise'], ['0417'], ['0409'], ['1373']],
  },
  hpush: {
    label: 'Horizontal press',
    muscle: 'chest',
    kind: 'compound',
    options: [['0025'], ['0289'], ['0577', 'Machine Chest Press'], ['0748'], ['1298'], ['0662']],
  },
  ipush: {
    label: 'Incline press',
    muscle: 'chest',
    kind: 'compound',
    options: [['0314'], ['0047'], ['1299', 'Machine Incline Press'], ['0279', 'Decline Push-Up (Feet Up)']],
  },
  fly: { label: 'Chest fly', muscle: 'chest', kind: 'iso', options: [['0227', 'Cable Fly'], ['0596', 'Pec Deck'], ['0308'], ['0251']] },
  vpush: {
    label: 'Overhead press',
    muscle: 'shoulders',
    kind: 'compound',
    options: [
      ['0426', 'Dumbbell Overhead Press'],
      ['0091'],
      ['0603', 'Machine Shoulder Press'],
      ['0405'],
      ['2137'],
      ['0553', 'Kettlebell Overhead Press'],
      ['0997'],
      ['3662', 'Pike Push-Up'],
    ],
  },
  lateral: { label: 'Lateral raise', muscle: 'side-delts', kind: 'iso', options: [['0178'], ['0334'], ['0584', 'Machine Lateral Raise']] },
  reardelt: {
    label: 'Rear delts',
    muscle: 'rear-delts',
    kind: 'iso',
    options: [['0203', 'Cable Face Pull (Rope)'], ['0602', 'Reverse Pec Deck'], ['0378'], ['1022', 'Band Rear Delt Row']],
  },
  vpull: {
    label: 'Vertical pull',
    muscle: 'lats',
    kind: 'compound',
    options: [['2330', 'Lat Pulldown'], ['0652'], ['0017'], ['1326'], ['0375'], ['1013', 'Band Pulldown']],
  },
  hpull: {
    label: 'Row',
    muscle: 'mid-back',
    kind: 'compound',
    options: [
      ['0861'],
      ['0027'],
      ['1350', 'Machine Row'],
      ['0327', 'Chest-Supported Dumbbell Row'],
      ['0292', 'One-Arm Dumbbell Row'],
      ['0541'],
      ['0499'],
    ],
  },
  biceps: {
    label: 'Biceps curl',
    muscle: 'biceps',
    kind: 'iso',
    options: [['0318'], ['0031'], ['0868'], ['0447'], ['0294'], ['0968', 'Band Biceps Curl']],
  },
  hammer: { label: 'Hammer curl', muscle: 'biceps', kind: 'iso', options: [['0165', 'Cable Rope Hammer Curl'], ['0313']] },
  triceps: {
    label: 'Triceps pushdown',
    muscle: 'triceps',
    kind: 'iso',
    options: [['0200', 'Rope Pushdown'], ['0201', 'Cable Pushdown'], ['0061', 'Skull Crusher'], ['0333'], ['0283'], ['0814']],
  },
  triceps2: {
    label: 'Overhead triceps',
    muscle: 'triceps',
    kind: 'iso',
    options: [['0194', 'Overhead Cable Triceps Extension'], ['2188'], ['0129']],
  },
  shrug: { label: 'Shrug', muscle: 'traps', kind: 'iso', options: [['0095'], ['0406'], ['1018']] },
  core: {
    label: 'Core',
    muscle: 'abs',
    kind: 'core',
    options: [['0175', 'Cable Crunch'], ['0472'], ['0857', 'Ab Wheel Rollout'], ['0276'], ['0872']],
  },
  core2: {
    label: 'Core stability',
    muscle: 'abs',
    kind: 'core',
    options: [['0979', 'Pallof Press'], ['2963'], ['0464'], ['0687'], ['0620']],
  },
  lowerback: { label: 'Lower back', muscle: 'lower-back', kind: 'iso', options: [['0489'], ['0573', 'Machine Back Extension']] },
  carry: { label: 'Loaded carry', muscle: 'forearms', kind: 'carry', options: [['2133', "Farmer's Walk"]] },
  steady: {
    label: 'Steady cardio',
    muscle: 'cardio',
    kind: 'cardio',
    options: [
      ['3666', 'Treadmill Incline Walk'],
      ['0798', 'Stationary Bike'],
      ['2141', 'Elliptical'],
      ['2311', 'Stair Climber'],
      ['0685', 'Run'],
    ],
  },
  intervals: { label: 'Intervals', muscle: 'cardio', kind: 'intervals', options: [['1160'], ['2612'], ['0630'], ['3361'], ['3223']] },
}

const KIT = {
  barbell: 'barbell',
  'ez barbell': 'barbell',
  'trap bar': 'barbell',
  'olympic barbell': 'barbell',
  'smith machine': 'machine',
  'leverage machine': 'machine',
  'sled machine': 'machine',
  assisted: 'machine',
  'elliptical machine': 'machine',
  'stepmill machine': 'machine',
  'stationary bike': 'machine',
  cable: 'cable',
  dumbbell: 'dumbbell',
  kettlebell: 'kettlebell',
  band: 'band',
  'resistance band': 'band',
  'body weight': 'bodyweight',
  rope: 'bodyweight',
  weighted: 'bodyweight',
  'wheel roller': 'bodyweight',
  'stability ball': 'bodyweight',
}

const out = {}
for (const [key, slot] of Object.entries(SLOTS)) {
  out[key] = {
    label: slot.label,
    muscle: slot.muscle,
    kind: slot.kind,
    options: slot.options.map(([id, name]) => {
      const e = byId[id]
      if (!e) throw new Error(`${key}: dataset id ${id} not found`)
      const kit = KIT[e.equip]
      if (!kit) throw new Error(`${key}: unknown equipment "${e.equip}" for ${id}`)
      return { id, name: name ?? e.name, kit, media: e.media }
    }),
  }
}

const header = `// GENERATED by scripts/build-movements.mjs — edit the SLOTS table there, then run \`npm run build:movements\`.
// Curated exercise options per movement pattern (dataset ids, display names, equipment kit, demo media).
`
fs.writeFileSync(
  new URL('../src/data/movements.js', import.meta.url),
  `${header}export const MOVEMENTS = ${JSON.stringify(out, null, 2)}\n`,
)
console.log(`wrote ${Object.keys(out).length} movement slots, ${Object.values(out).reduce((n, s) => n + s.options.length, 0)} options`)
