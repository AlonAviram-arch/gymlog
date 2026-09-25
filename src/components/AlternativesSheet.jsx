import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { ALTERNATIVES } from '../data/alternatives'
import { MUSCLES, muscleLabel } from '../data/muscles'
import { Sheet, inputCls } from './ui'

export default function AlternativesSheet({ exercise, customExercises, onPick, onClose }) {
  const [muscle, setMuscle] = useState(exercise.muscle in MUSCLES ? exercise.muscle : 'other')
  const [custom, setCustom] = useState('')

  const catalog = ALTERNATIVES[muscle] ?? []
  const mine = customExercises.filter((c) => c.muscle === muscle).map((c) => c.name)
  const options = [...new Set([...mine, ...catalog])].filter((n) => n !== exercise.name)

  return (
    <Sheet title="Swap exercise" onClose={onClose}>
      <p className="mb-4 text-sm text-zinc-400">
        Replacing <span className="font-medium text-zinc-200">{exercise.name}</span>. Sets, reps and rest stay the same.
      </p>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase">Muscle target</span>
        <select className={inputCls} value={muscle} onChange={(e) => setMuscle(e.target.value)}>
          {Object.entries(MUSCLES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
              {k === exercise.muscle ? ' (current)' : ''}
            </option>
          ))}
        </select>
      </label>

      <ul className="space-y-2">
        {options.map((name) => (
          <li key={name}>
            <button
              onClick={() => onPick(name, muscle)}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-zinc-800/70 px-4 text-left active:bg-zinc-700"
            >
              <span className="flex-1">{name}</span>
              {mine.includes(name) && <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-300">Custom</span>}
              <ChevronRight size={18} className="text-zinc-500" />
            </button>
          </li>
        ))}
        {!options.length && <li className="py-4 text-center text-sm text-zinc-500">No alternatives for {muscleLabel(muscle)} yet.</li>}
      </ul>

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (custom.trim()) onPick(custom.trim(), muscle)
        }}
      >
        <input className={inputCls} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Or type any exercise…" />
        <button disabled={!custom.trim()} className="h-12 shrink-0 rounded-xl bg-emerald-500 px-4 font-semibold text-zinc-950 disabled:opacity-40">
          Use
        </button>
      </form>
    </Sheet>
  )
}
