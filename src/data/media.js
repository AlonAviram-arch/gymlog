// Exercise demo media (animated GIFs + 180×180 thumbnails).
//
// The media is © Gym visual (https://gymvisual.com/) and is hosted in the exercises-dataset
// repo with the rights holder's permission. Their terms forbid redistribution, so this app
// never copies the files into its own repo/build: it loads them from the dataset repo at
// runtime (the service worker then keeps a per-device cache for offline use) and always
// shows the attribution below next to the media.

export const MEDIA_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
export const MEDIA_CREDIT = { text: '© Gym visual', url: 'https://gymvisual.com/' }

export const gifUrl = (media) => (media ? `${MEDIA_BASE}videos/${media}.gif` : null)
export const thumbUrl = (media) => (media ? `${MEDIA_BASE}images/${media}.jpg` : null)

/** Demo media for the pre-loaded plan, matched by name (older saved plans carry no media id). */
const DEFAULT_MEDIA = {
  'Barbell Back Squats': '0043-qXTaZnJ', // Barbell Full Squat
  'Flat Dumbbell Bench Press': '0289-SpYC0Kp', // Dumbbell Bench Press
  'Romanian Deadlifts': '0085-wQ2c4XD', // Barbell Romanian Deadlift
  'Lat Pulldowns': '2330-LEprlgG', // Cable Lat Pulldown Full Range Of Motion
  'Cable Lateral Raises': '0178-goJ6ezq', // Cable Lateral Raise
  'Triceps Cable Pushdowns': '0201-3ZflifB', // Cable Pushdown
  'Trap Bar / Barbell Deadlifts': '0811-jQGwmxN', // Trap Bar Deadlift
  'Incline Dumbbell Bench Press': '0314-ns0SIbU', // Dumbbell Incline Bench Press
  'Seated Cable Rows': '0861-fUBheHs', // Cable Seated Row
  'Leg Press or Hack Squat': '0739-10Z2DXU', // Sled 45° Leg Press
  'Incline Dumbbell Curls': '0318-ae9UoXQ', // Dumbbell Incline Curl
  'Cable Face Pulls': '0203-wqNPGCg', // Cable Rear Delt Row (With Rope)
  'Overhead Dumbbell Press': '0426-A6wtbuL', // Dumbbell Standing Overhead Press
  'Bulgarian Split Squats': '0410-qx4fgX7', // Dumbbell Single Leg Split Squat
  'Neutral-Grip Pull-ups / Lat Pulldown': '0015-vrhHa6D', // Assisted Parallel Close Grip Pull-Up
  'Hyperextensions (45° Bench, Rounded Back)': '0489-zhMwOwE', // Hyperextension
  'Cable Rope Hammer Curls': '0165-HPlPoQA', // Cable Hammer Curl (With Rope)
  'Overhead Triceps Extensions': '0194-2IxROQ1', // Cable Overhead Triceps Extension (Rope Attachment)
  'Dumbbell Wrist Curls (Palms Up)': '0401-2dImyQ8', // Dumbbell Seated Palms Up Wrist Curl
  'Reverse DB Wrist Curls (Palms Down)': '0385-BLCvwr2', // Dumbbell Reverse Wrist Curl
  "Dumbbell Farmer's Holds / Carries": '2133-qPEzJjA', // Farmers Walk
  'Treadmill Incline Walk': '3666-rjiM4L3', // Walking On Incline Treadmill
}

/** Media id for a plan exercise: its own (added from the library) or the default match. */
export const mediaFor = (ex) => ex.media ?? DEFAULT_MEDIA[ex.name] ?? null

/** Warms the service-worker cache so these demos work offline. Returns how many loaded. */
export async function prefetchMedia(mediaIds) {
  const urls = [...new Set(mediaIds.filter(Boolean))].flatMap((m) => [gifUrl(m), thumbUrl(m)])
  const results = await Promise.allSettled(urls.map((u) => fetch(u, { mode: 'cors' }).then((r) => r.ok || Promise.reject())))
  return { ok: results.filter((r) => r.status === 'fulfilled').length, total: urls.length }
}
