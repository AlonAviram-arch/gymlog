import { ArrowDown, ArrowUp, Check, Minus, Pencil, Plus, Shuffle, Timer, Trash2 } from 'lucide-react'
import { muscleLabel } from '../data/muscles'
import { fmtRest } from '../lib/format'

function lastSummary(last, unit) {
  if (!last?.length) return null
  return last.map((s) => `${s.weight ?? '–'}×${s.reps ?? '–'}${unit === 'sec' ? 's' : ''}`).join(', ')
}

export default function ExerciseCard({
  ex,
  sets,
  last,
  editing,
  disabled,
  isFirst,
  isLast,
  onChangeSet,
  onToggleDone,
  onStartRest,
  onAddSet,
  onRemoveSet,
  onSuggest,
  onMove,
  onEdit,
  onRemove,
}) {
  const doneCount = sets.filter((s) => s.done).length
  const allDone = doneCount === sets.length && sets.length > 0
  const summary = lastSummary(last, ex.unit)

  return (
    <article className={`rounded-2xl border p-3.5 ${allDone ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] leading-snug font-semibold">{ex.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">
              {ex.sets} × {ex.reps}
            </span>
            <span className="text-zinc-600">•</span>
            <span>{muscleLabel(ex.muscle)}</span>
          </div>
        </div>
        {!editing && (
          <span className={`mt-0.5 shrink-0 text-sm font-semibold tabular-nums ${allDone ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {doneCount}/{sets.length}
          </span>
        )}
      </header>

      <div className="mt-3 flex gap-2">
        <button
          onClick={onStartRest}
          disabled={!ex.rest}
          className="flex h-10 items-center gap-1.5 rounded-full bg-cyan-500/10 px-3.5 text-sm font-medium text-cyan-300 active:bg-cyan-500/20 disabled:bg-zinc-800 disabled:text-zinc-500"
          aria-label={`Start ${fmtRest(ex.rest)} rest timer`}
        >
          <Timer size={16} />
          {ex.rest ? `Rest ${fmtRest(ex.rest)}` : 'No rest → next'}
        </button>
        <button
          onClick={onSuggest}
          className="flex h-10 items-center gap-1.5 rounded-full bg-zinc-800 px-3.5 text-sm font-medium text-zinc-300 active:bg-zinc-700"
        >
          <Shuffle size={16} />
          Alternative
        </button>
      </div>

      {editing ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <IconBtn onClick={() => onMove(-1)} disabled={isFirst} label="Move up" text="Up" icon={ArrowUp} />
          <IconBtn onClick={() => onMove(1)} disabled={isLast} label="Move down" text="Down" icon={ArrowDown} />
          <IconBtn onClick={onEdit} label="Edit targets" text="Edit" icon={Pencil} />
          <IconBtn onClick={onRemove} label="Remove exercise" text="Remove" icon={Trash2} danger />
        </div>
      ) : (
        <>
          {summary && <p className="mt-3 truncate text-xs text-zinc-500">Last: {summary}</p>}
          <ol className="mt-2 space-y-1.5">
            {sets.map((s, i) => (
              <li
                key={i}
                className={`flex items-center gap-1 rounded-xl py-1 pr-1 pl-2 ${s.done ? 'bg-emerald-500/10' : 'bg-zinc-800/40'}`}
              >
                <span className="w-6 shrink-0 text-center text-sm font-semibold text-zinc-500" aria-hidden="true">
                  {i + 1}
                </span>
                <NumInput
                  value={s.weight}
                  onChange={(v) => onChangeSet(i, { weight: v })}
                  mode="decimal"
                  label={`Set ${i + 1} weight`}
                  disabled={disabled}
                  done={s.done}
                />
                <span className="text-xs whitespace-nowrap text-zinc-500">kg ×</span>
                <NumInput
                  value={s.reps}
                  onChange={(v) => onChangeSet(i, { reps: v })}
                  mode="numeric"
                  label={`Set ${i + 1} ${ex.unit === 'sec' ? 'seconds' : 'reps'}`}
                  disabled={disabled}
                  done={s.done}
                  narrow
                />
                <span className="w-7 text-xs text-zinc-500">{ex.unit === 'sec' ? 'sec' : 'reps'}</span>
                <button
                  onClick={() => onToggleDone(i)}
                  disabled={disabled}
                  className={`ml-auto grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 transition ${
                    s.done ? 'border-emerald-500 bg-emerald-500 text-zinc-950' : 'border-zinc-600 text-zinc-500 active:bg-zinc-700'
                  } disabled:opacity-40`}
                  aria-label={s.done ? `Undo set ${i + 1}` : `Complete set ${i + 1}`}
                  aria-pressed={s.done}
                >
                  <Check size={24} strokeWidth={3} />
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={onRemoveSet}
              disabled={disabled || sets.length <= 1}
              className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs text-zinc-400 active:bg-zinc-800 disabled:opacity-30"
            >
              <Minus size={14} /> Set
            </button>
            <button
              onClick={onAddSet}
              disabled={disabled}
              className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs text-zinc-400 active:bg-zinc-800 disabled:opacity-30"
            >
              <Plus size={14} /> Set
            </button>
          </div>
        </>
      )}
    </article>
  )
}

function NumInput({ value, onChange, mode, label, disabled, done, narrow }) {
  return (
    <input
      type="text"
      inputMode={mode}
      pattern={mode === 'numeric' ? '[0-9]*' : undefined}
      value={value}
      placeholder="–"
      aria-label={label}
      disabled={disabled}
      onFocus={(e) => e.target.select()}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
      className={`h-12 ${narrow ? 'w-13' : 'w-16'} shrink-0 rounded-lg border bg-zinc-950 text-center text-lg font-semibold tabular-nums outline-none focus:border-emerald-500 ${
        done ? 'border-emerald-500/30 text-emerald-200' : 'border-zinc-700 text-zinc-100'
      } disabled:opacity-40`}
    />
  )
}

function IconBtn({ onClick, disabled, label, text, icon: Icon, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-12 flex-col items-center justify-center rounded-xl text-[11px] disabled:opacity-30 ${
        danger ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-300'
      }`}
    >
      <Icon size={18} />
      {text}
    </button>
  )
}
