// Web Audio synth beeps (no audio files) + vibration.
let ctx = null

/** Must run inside a user gesture at least once (iOS / Chrome autoplay policy). */
export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
}

export function playDoubleBeep() {
  unlockAudio()
  if (!ctx) return
  const start = ctx.currentTime + 0.05
  for (const offset of [0, 0.28]) {
    const t = start + offset
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(1046, t) // C6 – cuts through gym noise
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01)
    gain.gain.setValueAtTime(0.3, t + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.22)
  }
}

export function vibrate() {
  try {
    navigator.vibrate?.([200, 100, 200])
  } catch {
    /* unsupported (e.g. iOS Safari) */
  }
}
