import { useEffect } from 'react'
import { Settings, X } from 'lucide-react'

/** Bottom sheet modal. */
export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="pb-safe flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl border-t border-zinc-800 bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-zinc-800 text-zinc-300" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-500'

export function Toggle({ checked, onChange, label, icon: Icon }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-zinc-800/60 px-4 text-left"
      role="switch"
      aria-checked={checked}
    >
      {Icon && <Icon size={20} className="text-zinc-400" />}
      <span className="flex-1">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-zinc-600'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  )
}

export function SettingsButton({ onClick }) {
  return (
    <button onClick={onClick} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-900 text-zinc-300" aria-label="Settings">
      <Settings size={22} />
    </button>
  )
}
