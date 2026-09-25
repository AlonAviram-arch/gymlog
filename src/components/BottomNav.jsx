import { Dumbbell, History, Library } from 'lucide-react'

const TABS = [
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'history', label: 'History', icon: History },
  { id: 'library', label: 'Exercises', icon: Library },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                active ? 'text-emerald-400' : 'text-zinc-500'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
