import { useRef, useState } from 'react'
import { BellRing, Download, RotateCcw, Trash2, Upload, Vibrate, Volume2 } from 'lucide-react'
import * as A from '../lib/store'
import { playDoubleBeep, vibrate } from '../lib/alerts'
import { Sheet, Toggle } from './ui'

export default function SettingsSheet({ state, act, onClose }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

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
          onClick={() => confirm('Reset all days to the original 3-day split? History is kept.') && act(A.resetPlan)}
        >
          <RotateCcw size={20} className="text-amber-400" /> Reset plan to default
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
