import { useCallback, useEffect, useRef, useState } from 'react'
import { playDoubleBeep, unlockAudio, vibrate } from '../lib/alerts'

// Timestamp-based countdown, so it stays accurate when the tab is throttled.
// status: 'idle' | 'running' | 'paused' | 'done'
const IDLE = { status: 'idle', endAt: 0, remaining: 0, duration: 0, label: '' }

export function useRestTimer(settings) {
  const [t, setT] = useState(IDLE)
  const [, force] = useState(0)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  // Tick while running; fire alerts exactly once when it hits zero.
  useEffect(() => {
    if (t.status !== 'running') return
    const id = setInterval(() => {
      if (Date.now() >= t.endAt) {
        setT((cur) => (cur.status === 'running' ? { ...cur, status: 'done', remaining: 0 } : cur))
        if (settingsRef.current.sound) playDoubleBeep()
        if (settingsRef.current.vibrate) vibrate()
      } else {
        force((n) => n + 1)
      }
    }, 200)
    return () => clearInterval(id)
  }, [t.status, t.endAt])

  // Auto-hide the "rest over" banner.
  useEffect(() => {
    if (t.status !== 'done') return
    const id = setTimeout(() => setT(IDLE), 6000)
    return () => clearTimeout(id)
  }, [t.status])

  // Keep the screen awake while resting (timers stop when the phone locks).
  useEffect(() => {
    if (t.status !== 'running' || !('wakeLock' in navigator)) return
    let lock = null
    let cancelled = false
    navigator.wakeLock
      .request('screen')
      .then((l) => (cancelled ? l.release() : (lock = l)))
      .catch(() => {})
    return () => {
      cancelled = true
      lock?.release().catch(() => {})
    }
  }, [t.status])

  const start = useCallback((seconds, label = '') => {
    if (!seconds) return
    unlockAudio() // we're inside a tap handler – unlock audio for the later beep
    setT({ status: 'running', endAt: Date.now() + seconds * 1000, remaining: seconds * 1000, duration: seconds * 1000, label })
  }, [])

  const adjust = useCallback((seconds) => {
    const delta = seconds * 1000
    setT((cur) => {
      if (cur.status === 'running') {
        const endAt = Math.max(Date.now(), cur.endAt + delta)
        return { ...cur, endAt, duration: Math.max(1000, cur.duration + delta) }
      }
      if (cur.status === 'paused') {
        const remaining = Math.max(1000, cur.remaining + delta)
        return { ...cur, remaining, duration: Math.max(remaining, cur.duration + delta) }
      }
      return cur
    })
  }, [])

  const togglePause = useCallback(() => {
    setT((cur) => {
      if (cur.status === 'running') return { ...cur, status: 'paused', remaining: Math.max(0, cur.endAt - Date.now()) }
      if (cur.status === 'paused') return { ...cur, status: 'running', endAt: Date.now() + cur.remaining }
      return cur
    })
  }, [])

  const skip = useCallback(() => setT(IDLE), [])

  const remaining = t.status === 'running' ? Math.max(0, t.endAt - Date.now()) : t.remaining
  const progress = t.duration ? remaining / t.duration : 0

  return { ...t, remaining, progress, start, adjust, togglePause, skip }
}
