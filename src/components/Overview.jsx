import { useMemo, useState } from 'react'
import { Flame, Target, Trophy } from 'lucide-react'
import { activityGrid, muscleDistribution, overview } from '../lib/stats'
import { muscleLabel } from '../data/muscles'
import { fmtDate } from '../lib/format'

// Sequential single-hue ramp for the activity calendar (brighter = more sets on a dark surface).
const LEVELS = ['bg-zinc-800', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-300']

export default function Overview({ history, weeklyGoal }) {
  const o = useMemo(() => overview(history, weeklyGoal), [history, weeklyGoal])
  const grid = useMemo(() => activityGrid(history), [history])
  const muscles = useMemo(() => muscleDistribution(history), [history])
  const [cell, setCell] = useState(null)
  const maxSets = muscles[0]?.[1] ?? 1

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Tile icon={Target} label="This week" value={`${o.thisWeek}/${weeklyGoal}`} sub="workouts" accent={o.thisWeek >= weeklyGoal} />
        <Tile icon={Flame} label="Streak" value={`${o.streak} wk`} sub={`best ${o.bestStreak} wk`} />
        <Tile
          icon={Trophy}
          label="On goal"
          value={o.consistency == null ? '–' : `${o.consistency}%`}
          sub={o.consistencyWeeks ? `of last ${o.consistencyWeeks} wk` : 'after 1 wk'}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Tile label="Workouts" value={o.total} />
        <Tile label="Volume" value={o.volume >= 1000 ? `${(o.volume / 1000).toFixed(1)} t` : `${Math.round(o.volume)} kg`} />
        <Tile
          label={o.cardioMinutes ? 'Cardio' : 'Time'}
          value={o.cardioMinutes ? `${Math.round(o.cardioMinutes)} min` : `${o.hours.toFixed(1)} h`}
        />
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
        <h3 className="mb-2 text-sm font-medium text-zinc-300">Activity · last 18 weeks</h3>
        <div className="flex gap-[3px]" role="grid" aria-label="Workout activity calendar">
          <div className="mr-1 grid grid-rows-7 gap-[3px] text-[9px] leading-none text-zinc-500">
            {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
              <span key={i} className="flex h-full items-center">
                {d}
              </span>
            ))}
          </div>
          {grid.map((col, c) => (
            <div key={c} className="grid flex-1 grid-rows-7 gap-[3px]" role="row">
              {col.map((d) => (
                <button
                  key={d.ts}
                  role="gridcell"
                  disabled={d.future}
                  onClick={() => setCell(d)}
                  aria-label={`${fmtDate(d.ts)}: ${d.sets} sets`}
                  className={`aspect-square w-full rounded-[3px] ${d.future ? 'invisible' : LEVELS[d.level]} ${
                    cell?.ts === d.ts ? 'ring-2 ring-zinc-100' : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-400">
          <span className="min-w-0 truncate">
            {cell
              ? `${fmtDate(cell.ts, { weekday: 'short', month: 'short', day: 'numeric' })} · ${
                  cell.workouts.length ? `${cell.workouts.map((w) => w.split(' · ')[0]).join(', ')} · ${cell.sets} sets` : 'rest day'
                }`
              : 'Tap a day for details'}
          </span>
          <span className="flex shrink-0 items-center gap-1" aria-hidden="true">
            Less
            {LEVELS.map((l) => (
              <span key={l} className={`h-2.5 w-2.5 rounded-[2px] ${l}`} />
            ))}
            More
          </span>
        </div>
      </section>

      {muscles.length > 0 && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
          <h3 className="mb-3 text-sm font-medium text-zinc-300">Sets per muscle · last 30 days</h3>
          <ul className="space-y-2">
            {muscles.map(([m, n]) => (
              <li key={m} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-2 text-sm">
                <span className="truncate text-zinc-300">{muscleLabel(m)}</span>
                <span className="h-2.5 rounded-r bg-zinc-800">
                  <span className="block h-full rounded-r bg-emerald-500" style={{ width: `${(n / maxSets) * 100}%` }} />
                </span>
                <span className="text-right text-zinc-400 tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-xl bg-zinc-900 p-3">
      <div className="flex items-center gap-1 text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
        {Icon && <Icon size={12} />}
        {label}
      </div>
      <div className={`mt-0.5 text-lg leading-tight font-semibold tabular-nums ${accent ? 'text-emerald-400' : 'text-zinc-100'}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-zinc-500">{sub}</div>}
    </div>
  )
}
