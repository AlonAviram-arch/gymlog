import { useRef, useState } from 'react'
import { BellRing, CalendarCheck, Download, Film, Minus, Plus, RotateCcw, Trash2, Upload, Vibrate, Volume2 } from 'lucide-react'
import * as A from '../lib/store'
import { playDoubleBeep, vibrate } from '../lib/alerts'
import { mediaFor, prefetchMedia } from '../data/media'
import { Sheet, Toggle } from './ui'

export default function SettingsSheet({ state, act, onClose }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)
  const [mediaMsg, setMediaMsg] = useState(null)
  const goal = state.settings.weeklyGoal ?? 3

  const downloadDemos = async () => {
    const ids = state.plan.flatMap((d) => d.exercises.map(mediaFor))
    setMediaMsg({ ok: true, text: 'Downloading…' })
    const r = await prefetchMedia(ids)
    setMediaMsg(
      r.ok === r.total
        ? { ok: true, text: `Saved ${r.total / 2} demos for offline use.` }
        : { ok: false, text: `Saved ${r.ok} of ${r.total} files. Check your connection and try again.` },
    )
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gymlog-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMsg({ ok: true, text: 'Backup downloaded.' })
  }

  const importData = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const next = A.parseImport(await file.text())
      if (!confirm(`Replace all current data with this backup (${next.history.length} workouts)?`)) return
      act(A.replaceState, next)
      setMsg({ ok: true, text: 'Backup restored.' })
    } catch (err) {
      setMsg({ ok: false, text: `Import failed: ${err.message}` })
    }
  }

  const row = 'flex min-h-14 w-full items-center gap-3 rounded-xl bg-zinc-800/60 px-4 text-left active:bg-zinc-700'

  return (
    <Sheet title="Settings" onClose={onClose}>
      <Section title="Rest timer alerts">
        <Toggle label="Double-beep sound" icon={Volume2} checked={state.settings.sound} onChange={(v) => act(A.setSetting, 'sound', v)} />
        <Toggle label="Vibration" icon={Vibrate} checked={state.settings.vibrate} onChange={(v) => act(A.setSetting, 'vibrate', v)} />
        <button
          className={row}
          onClick={() => {
            playDoubleBeep()
            vibrate()
          }}
        >
          <BellRing size={20} className="text-zinc-400" /> Test alert
        </button>
      </Section>

      <Section title="Goal">
        <div className="flex min-h-14 items-center gap-3 rounded-xl bg-zinc-800/60 px-4">
          <CalendarCheck size={20} className="text-zinc-400" />
          <span className="flex-1">Workouts per week</span>
          <button
            onClick={() => act(A.setSetting, 'weeklyGoal', Math.max(1, goal - 1))}
            className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-700"
            aria-label="Decrease weekly goal"
          >
            <Minus size={16} />
          </button>
          <span className="w-6 text-center text-lg font-semibold tabular-nums">{goal}</span>
          <button
            onClick={() => act(A.setSetting, 'weeklyGoal', Math.min(7, goal + 1))}
            className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-700"
            aria-label="Increase weekly goal"
          >
            <Plus size={16} />
          </button>
        </div>
      </Section>

      <Section title="Exercise demos">
        <button className={row} onClick={downloadDemos}>
          <Film size={20} className="text-cyan-400" /> Download plan demos for offline
        </button>
        {mediaMsg && <p className={`px-1 text-sm ${mediaMsg.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{mediaMsg.text}</p>}
        <p className="px-1 text-xs text-zinc-500">Demos you open are also saved automatically. Animations © Gym visual (gymvisual.com).</p>
      </Section>

      <Section title="Backup">
        <button className={row} onClick={exportData}>
          <Download size={20} className="text-emerald-400" /> Export data (JSON)
        </button>
        <button className={row} onClick={() => fileRef.current?.click()}>
          <Upload size={20} className="text-cyan-400" /> Import data (JSON)
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
        {msg && <p className={`px-1 text-sm ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>}
      </Section>

      <Section title="Danger zone">
        <button
          className={row}
          onClick={() =>
            confirm(
              'Load the Starter Plan (the example plan the app came with)? Your current plan is saved under My plans, and history is kept.',
            ) && act(A.resetPlan)
          }
        >
          <RotateCcw size={20} className="text-amber-400" /> Load the starter plan
        </button>
        <button className={row} onClick={() => confirm('Delete ALL workout history? Export a backup first!') && act(A.clearHistory)}>
          <Trash2 size={20} className="text-red-400" /> Clear history
        </button>
      </Section>

      <p className="mt-2 text-center text-xs text-zinc-600">All data is stored on this device only.</p>
    </Sheet>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
