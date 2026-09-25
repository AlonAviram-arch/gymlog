import { useRef, useState } from 'react'
import { fmtDate } from '../lib/format'

const W = 340
const H = 180
const PAD = { l: 36, r: 14, t: 14, b: 26 }

/**
 * Single-series line chart of the top set per session.
 * points: [{ ts, value, detail }]. Tap / drag to inspect a point.
 */
export default function ProgressChart({ points, unitLabel }) {
  const ref = useRef(null)
  const [hover, setHover] = useState(null)
  if (points.length === 0) return null

  // Round the y-range to a "nice" step so ticks read 80 / 82.5 / 85, not 82.1 / 85.4.
  const values = points.map((p) => p.value)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const step = [1, 2, 2.5, 5, 10, 20, 25, 50, 100].find((s) => s * 2 >= (hi - lo) * 1.2) ?? 100
  let min = Math.max(0, Math.floor(lo / step) * step)
  let max = min + step * 2
  while (max < hi) max += step * 2
  if (lo === hi) {
    // Single value: center it (29 / 30 / 31).
    min = Math.max(0, lo - step)
    max = min + step * 2
  } else {
    if (lo === min && min >= step) min -= step
    if (hi === max) max += step
  }

  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const x = (i) => PAD.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw)
  const y = (v) => PAD.t + ih - ((v - min) / (max - min)) * ih
  const ticks = [0, 0.5, 1].map((f) => min + (max - min) * f)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')

  const pick = (e) => {
    const box = ref.current.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    let best = 0
    points.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i
    })
    setHover(best)
  }

  const hp = hover != null ? points[hover] : null
  const labelIdx = new Set([0, points.length - 1])

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerDown={pick}
        onPointerMove={pick}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Top set ${unitLabel} per session`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-zinc-800" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(t) + 3.5} textAnchor="end" className="fill-zinc-500 text-[10px] tabular-nums">
              {Math.round(t * 10) / 10}
            </text>
          </g>
        ))}
        {[...labelIdx].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor={points.length === 1 ? 'middle' : i === 0 ? 'start' : 'end'}
            className="fill-zinc-500 text-[10px]"
          >
            {fmtDate(points[i].ts)}
          </text>
        ))}
        {hp && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} className="stroke-zinc-600" strokeDasharray="3 3" />}
        <path d={path} fill="none" className="stroke-emerald-400" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={hover === i ? 6 : 4} className="fill-emerald-400 stroke-zinc-900" strokeWidth="2" />
        ))}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-zinc-700 bg-zinc-950/95 px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            transform: `translateX(${x(hover) > W / 2 ? 'calc(-100% - 8px)' : '8px'})`,
          }}
        >
          <div className="text-zinc-400">{fmtDate(hp.ts, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="font-semibold text-zinc-100">{hp.detail}</div>
        </div>
      )}
    </div>
  )
}
