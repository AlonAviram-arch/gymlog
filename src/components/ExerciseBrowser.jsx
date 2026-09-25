import { useMemo, useState } from 'react'
import { ChevronDown, HeartPulse, Info, Loader2, Plus, Search, X } from 'lucide-react'
import { DATASET_CREDIT, isCardioEntry, targetLabel, useExerciseLibrary } from '../data/library'
import { muscleLabel } from '../data/muscles'
import { DemoGif, Thumb } from './ExerciseMedia'
import { Sheet } from './ui'

const PAGE = 40

const titleCase = (s) => s.replace(/(^|\s)([a-z])/g, (_, p, c) => p + c.toUpperCase())

function countBy(list, fn) {
  const m = new Map()
  for (const x of list) m.set(fn(x), (m.get(fn(x)) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

/**
 * Searchable, filterable exercise library.
 * onPick(entry) fires on row tap. With showInfo, an ⓘ button opens the detail sheet.
 */
export default function ExerciseBrowser({ onPick, pickLabel = 'Select', initialTargets = [], showInfo = true }) {
  const { lib, error } = useExerciseLibrary()
  const [q, setQ] = useState('')
  const [targets, setTargets] = useState(() => new Set(initialTargets))
  const [equips, setEquips] = useState(() => new Set())
  // Pre-filtered pickers (swaps) include secondary muscles: the dataset tags e.g. most squats as glutes-first.
  const [secondary, setSecondary] = useState(initialTargets.length > 0)
  const [panel, setPanel] = useState(initialTargets.length ? 'muscle' : null)
  const [allEquip, setAllEquip] = useState(false)
  const [limit, setLimit] = useState(PAGE)
  const [detail, setDetail] = useState(null)

  const targetCounts = useMemo(() => (lib ? countBy(lib, (e) => e.target) : []), [lib])
  const equipCounts = useMemo(() => (lib ? countBy(lib, (e) => e.equip) : []), [lib])

  const results = useMemo(() => {
    if (!lib) return []
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    return lib.filter((e) => {
      if (equips.size && !equips.has(e.equip)) return false
      if (targets.size && !targets.has(e.target) && !(secondary && e.secondary.some((m) => targets.has(m)))) return false
      if (words.length) {
        const hay = `${e.name} ${e.equip} ${e.target}`.toLowerCase()
        return words.every((w) => hay.includes(w))
      }
      return true
    })
  }, [lib, q, targets, equips, secondary])

  const toggle = (setter) => (value) => {
    setLimit(PAGE)
    setter((cur) => {
      const next = new Set(cur)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }
  const toggleTarget = toggle(setTargets)
  const toggleEquip = toggle(setEquips)
  const clearAll = () => {
    setTargets(new Set())
    setEquips(new Set())
    setQ('')
    setLimit(PAGE)
  }

  if (error)
    return <p className="py-8 text-center text-red-400">Couldn't load the exercise library. Open the app online once to cache it.</p>
  if (!lib)
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-zinc-500">
        <Loader2 className="animate-spin" size={20} /> Loading library…
      </div>
    )

  // Cardio first in the muscle list — it's a common quick filter.
  const muscleChips = [...targetCounts].sort((a, b) => (b[0] === 'cardiovascular system') - (a[0] === 'cardiovascular system'))
  const equipChips = allEquip ? equipCounts : equipCounts.slice(0, 10)
  const active = targets.size + equips.size

  return (
    <div>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setLimit(PAGE)
          }}
          placeholder={`Search ${lib.length.toLocaleString()} exercises…`}
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 pr-11 pl-10 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-500"
          aria-label="Search exercises"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute top-0 right-0 grid h-12 w-11 place-items-center text-zinc-400"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <PanelButton
          label="Muscle"
          count={targets.size}
          open={panel === 'muscle'}
          onClick={() => setPanel(panel === 'muscle' ? null : 'muscle')}
        />
        <PanelButton
          label="Equipment"
          count={equips.size}
          open={panel === 'equip'}
          onClick={() => setPanel(panel === 'equip' ? null : 'equip')}
        />
      </div>

      {panel === 'muscle' && (
        <div className="mt-2 rounded-xl bg-zinc-900 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            {muscleChips.map(([t, n]) => (
              <Chip key={t} on={targets.has(t)} onClick={() => toggleTarget(t)} count={n} cyan={t === 'cardiovascular system'}>
                {targetLabel(t)}
              </Chip>
            ))}
          </div>
          <label className="mt-2.5 flex min-h-10 items-center gap-2.5 px-1 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={secondary}
              onChange={(e) => setSecondary(e.target.checked)}
              className="h-5 w-5 accent-emerald-500"
            />
            Also match secondary muscles
          </label>
        </div>
      )}
      {panel === 'equip' && (
        <div className="mt-2 rounded-xl bg-zinc-900 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            {equipChips.map(([eq, n]) => (
              <Chip key={eq} on={equips.has(eq)} onClick={() => toggleEquip(eq)} count={n}>
                {titleCase(eq)}
              </Chip>
            ))}
          </div>
          {equipCounts.length > 10 && (
            <button onClick={() => setAllEquip(!allEquip)} className="mt-2 h-9 px-1 text-sm font-medium text-emerald-400">
              {allEquip ? 'Show fewer' : `Show all ${equipCounts.length}`}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex min-h-8 items-center justify-between text-sm">
        <span className="text-zinc-400">
          {results.length.toLocaleString()} exercise{results.length === 1 ? '' : 's'}
        </span>
        {(active > 0 || q) && (
          <button onClick={clearAll} className="h-8 px-1 font-medium text-emerald-400">
            Clear filters
          </button>
        )}
      </div>
      {active > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {[...targets].map((t) => (
            <ActiveChip key={t} onRemove={() => toggleTarget(t)}>
              {targetLabel(t)}
            </ActiveChip>
          ))}
          {[...equips].map((eq) => (
            <ActiveChip key={eq} onRemove={() => toggleEquip(eq)}>
              {titleCase(eq)}
            </ActiveChip>
          ))}
        </div>
      )}

      <ul className="mt-3 space-y-1.5">
        {results.slice(0, limit).map((e) => (
          <li key={e.id} className="flex items-stretch gap-1.5">
            <button
              onClick={() => onPick(e)}
              className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl bg-zinc-800/60 px-3.5 py-2 text-left active:bg-zinc-700"
            >
              {e.media ? <Thumb media={e.media} /> : isCardioEntry(e) && <HeartPulse size={18} className="shrink-0 text-cyan-400" />}
              <span className="min-w-0 flex-1">
                <span className="block leading-snug font-medium">{e.name}</span>
                <span className="block truncate text-xs text-zinc-400">
                  {targetLabel(e.target)} · {titleCase(e.equip)}
                </span>
              </span>
              <Plus size={18} className="shrink-0 text-emerald-400" aria-hidden="true" />
            </button>
            {showInfo && (e.steps.length > 0 || e.secondary.length > 0) && (
              <button
                onClick={() => setDetail(e)}
                className="grid w-11 shrink-0 place-items-center rounded-xl bg-zinc-800/60 text-zinc-400 active:bg-zinc-700"
                aria-label={`How to do ${e.name}`}
              >
                <Info size={18} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {results.length > limit && (
        <button onClick={() => setLimit(limit + PAGE * 2)} className="mt-3 h-12 w-full rounded-xl bg-zinc-900 font-medium text-zinc-300">
          Show more ({(results.length - limit).toLocaleString()} left)
        </button>
      )}
      {results.length === 0 && <p className="py-8 text-center text-zinc-500">No exercises match these filters.</p>}

      <p className="mt-5 text-center text-xs text-zinc-600">
        <a href={DATASET_CREDIT.url} target="_blank" rel="noreferrer" className="underline">
          {DATASET_CREDIT.text}
        </a>
      </p>

      {detail && (
        <ExerciseDetail
          entry={detail}
          actionLabel={pickLabel}
          onAction={() => {
            setDetail(null)
            onPick(detail)
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

/** Demo for a plan exercise: GIF + instructions from the library (loaded on demand). */
export function PlanExerciseDemo({ ex, media, onClose }) {
  const { lib } = useExerciseLibrary()
  const entry = lib?.find((e) => (ex.libId ? e.id === ex.libId : e.media === media))
  return (
    <ExerciseDetail
      entry={{
        name: ex.name,
        media,
        target: entry?.target ?? 'other',
        label: ex.type === 'cardio' ? null : muscleLabel(ex.muscle), // your plan's muscle, not the dataset's
        equip: entry?.equip ?? '',
        secondary: entry?.secondary ?? [],
        steps: entry?.steps ?? [],
        preset: !entry,
        demoOf: entry && entry.name !== ex.name ? entry.name : null,
      }}
      onClose={onClose}
    />
  )
}

export function ExerciseDetail({ entry, actionLabel, onAction, onClose }) {
  return (
    <Sheet title={entry.name} onClose={onClose}>
      {entry.media && (
        <div className="mb-4">
          <DemoGif media={entry.media} name={entry.name} />
          {entry.demoOf && <p className="mt-1 text-center text-xs text-zinc-500">Demo: {entry.demoOf}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {(entry.label || entry.target !== 'other') && !(entry.label === null && isCardioEntry(entry)) && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{entry.label ?? targetLabel(entry.target)}</span>
        )}
        {entry.equip && <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">{titleCase(entry.equip)}</span>}
        {isCardioEntry(entry) && <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm text-cyan-300">Cardio</span>}
      </div>
      {entry.secondary.length > 0 && (
        <p className="mt-3 text-sm text-zinc-400">
          <span className="text-zinc-300">Also works:</span> {entry.secondary.map((m) => targetLabel(m)).join(', ')}
        </p>
      )}
      {entry.steps.length > 0 && (
        <ol className="mt-4 space-y-2.5">
          {entry.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-zinc-200">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      )}
      {onAction && (
        <button onClick={onAction} className="mt-6 h-14 w-full rounded-2xl bg-emerald-500 text-lg font-semibold text-zinc-950">
          {actionLabel}
        </button>
      )}
      {!entry.preset && (
        <p className="mt-3 text-center text-xs text-zinc-600">
          <a href={DATASET_CREDIT.url} target="_blank" rel="noreferrer" className="underline">
            {DATASET_CREDIT.text}
          </a>
        </p>
      )}
    </Sheet>
  )
}

function PanelButton({ label, count, open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      className={`flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold ${
        open || count ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-800 text-zinc-300'
      }`}
    >
      {label}
      {count > 0 && <span className="rounded-full bg-emerald-500 px-1.5 text-xs text-zinc-950">{count}</span>}
      <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

function Chip({ on, onClick, count, cyan, children }) {
  const onCls = cyan ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`min-h-9 rounded-full border px-3 text-sm ${on ? onCls : 'border-zinc-700 text-zinc-300'}`}
    >
      {children} <span className="text-xs opacity-50">{count}</span>
    </button>
  )
}

function ActiveChip({ onRemove, children }) {
  return (
    <button onClick={onRemove} className="flex min-h-8 items-center gap-1 rounded-full bg-zinc-800 pr-2 pl-3 text-xs text-zinc-200">
      {children} <X size={14} />
    </button>
  )
}
