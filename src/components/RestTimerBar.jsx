import { BellRing, Pause, Play, SkipForward, X } from 'lucide-react'
import { fmtClock } from '../lib/format'

/** Sticky rest timer that floats above the bottom nav. */
export default function RestTimerBar({ timer }) {
  if (timer.status === 'idle') return null

  const wrap = 'fixed inset-x-0 z-40 px-3 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)]'

  if (timer.status === 'done') {
    return (
      <div className={wrap}>
        <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-emerald-500 p-3 pl-4 text-zinc-950 shadow-2xl shadow-emerald-500/30">
          <BellRing size={26} className="shrink-0 animate-bounce" />
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold">Rest over — next set!</div>
            {timer.label && <div className="truncate text-sm opacity-80">{timer.label}</div>}
          </div>
          <button onClick={timer.skip} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-zinc-950/15" aria-label="Dismiss">
            <X size={22} />
          </button>
        </div>
      </div>
    )
  }

  const paused = timer.status === 'paused'
  const btn =
    'grid h-12 w-11 shrink-0 place-items-center rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-200 active:bg-zinc-700'

  return (
    <div className={wrap}>
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/95 shadow-2xl backdrop-blur">
        <div className="h-1.5 bg-zinc-800" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(timer.progress * 100)}>
          <div
            className={`h-full transition-[width] duration-200 ease-linear ${paused ? 'bg-zinc-500' : 'bg-cyan-400'}`}
            style={{ width: `${timer.progress * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 p-2.5">
          <div className="min-w-0 flex-1 pl-1">
            <div className={`font-mono text-3xl leading-none font-bold tabular-nums ${paused ? 'text-zinc-500' : 'text-zinc-50'}`}>
              {fmtClock(timer.remaining)}
            </div>
            <div className="mt-1 truncate text-xs text-zinc-400">{paused ? 'Paused' : timer.label || 'Resting'}</div>
          </div>
          <button onClick={() => timer.adjust(-15)} className={btn} aria-label="Minus 15 seconds">
            −15
          </button>
          <button onClick={() => timer.adjust(15)} className={btn} aria-label="Plus 15 seconds">
            +15
          </button>
          <button onClick={timer.togglePause} className={btn} aria-label={paused ? 'Resume' : 'Pause'}>
            {paused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button onClick={timer.skip} className={`${btn} text-cyan-300`} aria-label="Skip rest">
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
