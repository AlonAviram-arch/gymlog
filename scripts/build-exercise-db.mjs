// Builds src/data/exerciseDb.json from the exercises-dataset by Hasan Emir Yıldırım
// (https://github.com/hasaneyldrm/exercises-dataset, MIT License for the data/text).
// Only English text fields are kept. Media (images/GIFs, © Gym visual) is NOT copied: we store each
// exercise's media id, and the app loads the GIF from the dataset repo at runtime (see src/data/media.js).
//
// Usage: npm run build:exercises            (downloads from GitHub)
//        npm run build:exercises -- ./exercises.json   (use a local copy)
import fs from 'node:fs'

const SRC = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json'
const OUT = new URL('../src/data/exerciseDb.json', import.meta.url)

const local = process.argv[2]
const raw = local ? JSON.parse(fs.readFileSync(local, 'utf8')) : await (await fetch(SRC)).json()

// Map free-text secondary muscles onto the dataset's `target` vocabulary so one
// muscle filter can match both primary and secondary involvement.
const SYNONYMS = {
  quadriceps: 'quads',
  shoulders: 'delts',
  deltoids: 'delts',
  'rear deltoids': 'delts',
  'rotator cuff': 'delts',
  chest: 'pectorals',
  'upper chest': 'pectorals',
  trapezius: 'traps',
  rhomboids: 'upper back',
  back: 'upper back',
  'latissimus dorsi': 'lats',
  core: 'abs',
  abdominals: 'abs',
  'lower abs': 'abs',
  obliques: 'abs',
  'lower back': 'spine',
  soleus: 'calves',
  'inner thighs': 'adductors',
  groin: 'adductors',
  'wrist flexors': 'forearms',
  'wrist extensors': 'forearms',
  wrists: 'forearms',
  'grip muscles': 'forearms',
  brachialis: 'biceps',
}

const titleCase = (s) =>
  s
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|[\s(/-])([a-z])/g, (_, p, c) => p + c.toUpperCase())

const seen = new Set()
const out = []
for (const x of raw) {
  const name = titleCase(x.name.replace(/\s*\((male|female)\)\s*/gi, ' ').replace(/в°/g, '°'))
  if (/\bpov\b/i.test(name) || seen.has(name.toLowerCase())) continue // camera-angle duplicates
  seen.add(name.toLowerCase())
  const secondary = [...new Set((x.secondary_muscles ?? []).map((m) => SYNONYMS[m.toLowerCase()] ?? m.toLowerCase()))].filter(
    (m) => m !== x.target,
  )
  out.push({
    id: x.id,
    name,
    body: x.body_part,
    equip: x.equipment,
    target: x.target,
    secondary,
    steps: x.instruction_steps?.en ?? [],
    media: x.gif_url?.match(/([^/]+)\.gif$/)?.[1] ?? null, // e.g. "0001-2gPfomN"
  })
}
out.sort((a, b) => a.name.localeCompare(b.name))

fs.writeFileSync(OUT, JSON.stringify(out))
console.log(`wrote ${out.length} exercises (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB) → src/data/exerciseDb.json`)
