import { Clock, Dumbbell, HeartPulse, Layers, Trophy } from 'lucide-react'
import { fmtDuration } from '../lib/format'
import { Sheet } from './ui'

/** "Workout complete" recap shown after finishing a session (inspired by LogPress). */
export default function WorkoutSummary({ entry, summary, onClose }) {
  const s = summary
  const delta = s.volumeDelta
  return (
    <Sheet title="Workout complete 🎉" onClose={onClose}>
      <p className="-mt-1 mb-4 text-sm text-zinc-400">{entry.dayName}</p>

      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Clock} label="Duration" value={fmtDuration(s.duration)} />
        <Stat icon={Layers} label="Sets" value={`${s.sets} · ${s.exercises} ex`} />
        {s.volume > 0 && (
          <Stat
            icon={Dumbbell}
            label="Volume"
            value={`${Math.round(s.volume).toLocaleString()} kg`}
            sub={delta != null ? `${delta >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(delta * 100))}% vs last time` : s.equivalent}
            good={delta != null && delta >= 0}
          />
        )}
        {s.cardioMinutes > 0 && <Stat icon={HeartPulse} label="Cardio" value={`${Math.round(s.cardioMinutes)} min`} />}
      </div>
      {s.volume > 0 && delta != null && s.equivalent && <p className="mt-2 text-center text-sm text-zinc-400">You moved {s.equivalent}.</p>}

      {s.prs.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-300">
            <Trophy size={18} /> {s.prs.length} personal record{s.prs.length === 1 ? '' : 's'}
          </h3>
          <ul className="space-y-2">
            {s.prs.map((p) => (
              <li key={p.name} className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-zinc-300">
                  {p.kind === 'weight' ? 'Heaviest weight' : 'Best estimated 1RM'}: <b className="text-amber-200">{p.value} kg</b>{' '}
                  <span className="text-zinc-500">(was {p.previous} kg)</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button onClick={onClose} className="mt-6 h-14 w-full rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950">
        Done
      </button>
    </Sheet>
  )
}

function Stat({ icon: Icon, label, value, sub, good }) {
  return (
    <div className="rounded-xl bg-zinc-800/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Icon size={14} /> {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
      {sub && <div className={`text-xs ${good ? 'text-emerald-400' : 'text-zinc-500'}`}>{sub}</div>}
    </div>
  )
}
