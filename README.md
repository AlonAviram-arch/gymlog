# GymLog: Offline Workout Tracker

A lightweight, mobile-first **Progressive Web App** for planning and logging workouts: pick a ready-made program (full body, upper/lower, push/pull/legs, glutes, home…), build single sessions by muscle focus, and track every set against last time. It runs entirely in the browser, works offline, and stores everything in `localStorage`. Add it to your phone's home screen and use it at the gym like a native app. No account, no server, no tracking.

---

## Features

| Area | What you get |
| --- | --- |
| **Programs** | 26 ready-made plans in 7 styles: **full body** (2×, 3×, 4×, 30-minute, machine starter, dumbbell, bodyweight), **upper/lower** (4×, Upper/Lower/Full 3×, PHUL, dumbbell, bodyweight), **push/pull/legs** (3×, 6×, PPL + Upper/Lower 5×), **body-part splits** (5-day, Arnold 6×, upper-body focus), **glutes & legs** (Glute Builder, Glutes & Lower-Body Focus), **strength** (Strength Basics A/B, Powerlifting Basics) and **cardio & conditioning** (Lift + Cardio Hybrid, Fat-Loss Circuits, Cardio Base, Athletic & Functional). Filter by equipment, days/week, style and goal. Every program adapts to **full gym, dumbbells only, or bodyweight**, and sets/reps/rest adapt to your goal. Use one as your plan, or add its days to your current plan. |
| **Workout builder** | Build a single session by focus (Full Body, Upper, Lower, Push, Pull, Legs, Glutes, Chest & Back, Shoulders, Arms, Core, Conditioning), equipment, goal and length. Reshuffle one exercise or all of them, then add it to your plan. |
| **Multiple plans** | Switching to a program saves your current plan under **My plans**, so you can switch back anytime. Rename plans, and rename, delete or add days. A small example **Starter Plan** is loaded on first launch so you can try the app right away. |
| **Exercise library** | 1,300+ exercises from the [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset), plus common gym cardio. Search by name, **filter by muscle** (optionally including secondary muscles) and **by equipment** (30 types), read step-by-step instructions, and add any exercise to any day. |
| **Exercise demos** | Animated GIF demos in the library, and a thumbnail on every workout card. Tap it for the demo plus step-by-step instructions. Demos you open (or all your plan's demos, from Settings) are cached for offline use. |
| **Workout complete** | After finishing: duration, sets, volume vs. last time, a fun weight comparison, and any **personal records** (heaviest weight or best estimated 1RM). A live session clock runs while you train. |
| **Overview dashboard** | History → Overview: workouts this week vs. your weekly goal, **week streak**, consistency (weeks on goal), total volume/time/cardio, a GitHub-style **activity calendar** and **sets per muscle** for the last 30 days. |
| **Cardio logging** | Treadmill incline walks, bikes, rowers and more. Each round logs the fields you choose (time, speed, incline, distance, level, calories) instead of kg × reps. A "Timer 30 min" button counts down your cardio block. |
| **Active workout tracker** | One-handed checklist with per-set **kg × reps** inputs and big ✓ buttons. |
| **Last-time benchmark** | Each exercise shows its last session (date + every set), and each set shows last time's result with a live ▲/▼ comparison as you log. Sets pre-fill with last time's numbers. |
| **Rest timer** | Checking off a set starts that exercise's prescribed rest. A sticky bar shows **MM:SS**, a progress bar, and **−15s / +15s / Pause / Skip**. Tap any rest pill to start the timer manually. |
| **Alerts** | Double-beep synthesized with the Web Audio API (no audio files), plus `navigator.vibrate([200, 100, 200])`. The screen stays awake while resting (Wake Lock API). |
| **Supersets** | Grouped visually. The first movement has no rest, and the rest timer runs after the second. |
| **Plan management** | Per day: reorder (↑/↓), remove, edit sets/reps/rest, or add exercises. |
| **Suggest alternative** | Swap any exercise for curated suggestions for the same muscle, your own custom exercises, the full library pre-filtered to that muscle, or any name you type. |
| **Custom exercises** | Build a personal library (name, muscle, sets, rep range, rest, reps/seconds) and add items to any day. |
| **History & progress** | Per-exercise chart of your top set over time (for cardio: time, distance, speed or incline per session), best/latest stats, per-session set lists, and a full session log with delete. |
| **Backup** | Export or import all data as JSON from Settings (⚙). |
| **Offline PWA** | Service worker precaches the app. It installs to the home screen and runs with no connection. |

**Design:** dark by default (zinc background, emerald/cyan accents), sticky bottom nav (**Workouts · History · Exercises**), 44–56 px touch targets, 16 px inputs (no iOS zoom on focus), safe-area aware for notched phones.

---

## Tech stack

- **[Vite](https://vite.dev/)**: dev server and build
- **[React](https://react.dev/)**: UI
- **[Tailwind CSS v4](https://tailwindcss.com/)**: styling via `@tailwindcss/vite`
- **[Lucide React](https://lucide.dev/)**: icons
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)**: web manifest and Workbox service worker
- Browser APIs: `localStorage`, Web Audio, Vibration, Screen Wake Lock

---

## Example starter plan

On first launch the app loads a small example plan, the **Starter Plan**, so there's something to log right away. It's just a sample: replace it from **Workouts → Programs & workout builder** (it's kept under **My plans**), or bring it back later from **⚙ Settings → Load the starter plan**.

<details>
<summary>What's in the Starter Plan</summary>

### Day 1: Quads, Chest, Hamstrings & Glutes

| # | Exercise | Sets × Reps | Rest |
| --- | --- | --- | --- |
| 1 | Barbell Back Squats | 3 × 6–8 | 2.5 min |
| 2 | Flat Dumbbell Bench Press | 3 × 8–10 | 2 min |
| 3 | Romanian Deadlifts | 3 × 8–10 | 2 min |
| 4 | Barbell or Dumbbell Hip Thrusts | 3 × 8–10 | 2 min |
| 5 | Lat Pulldowns | 3 × 8–10 | 2 min |
| 6a | **Superset:** Cable Lateral Raises | 3 × 12–15 | none, go to 6b |
| 6b | **Superset:** Triceps Cable Pushdowns | 3 × 12–15 | 90 s |

### Day 2: Back, Hamstrings & Glutes

| # | Exercise | Sets × Reps | Rest |
| --- | --- | --- | --- |
| 1 | Trap Bar / Barbell Deadlifts | 3 × 5 | 3 min |
| 2 | Incline Dumbbell Bench Press | 3 × 8–10 | 2 min |
| 3 | Seated Cable Rows | 3 × 8–10 | 2 min |
| 4 | Leg Press or Hack Squat | 3 × 10–12 | 2 min |
| 5a | **Superset:** Incline Dumbbell Curls | 3 × 10–12 | none, go to 5b |
| 5b | **Superset:** Cable Face Pulls | 3 × 12–15 | 90 s |

### Day 3: Shoulders, Glutes & Arms

| # | Exercise | Sets × Reps | Rest |
| --- | --- | --- | --- |
| 1 | Overhead Dumbbell Press | 3 × 8–10 | 2 min |
| 2 | Bulgarian Split Squats | 3 × 8–10 / leg | 90 s |
| 3 | Neutral-Grip Pull-ups / Lat Pulldown | 3 × 8–10 | 2 min |
| 4 | Hyperextensions (45° Bench, Rounded Back) | 3 × 10–12 | 90 s |
| 5a | **Superset:** Cable Rope Hammer Curls | 3 × 10–12 | none, go to 5b |
| 5b | **Superset:** Overhead Triceps Extensions | 3 × 10–12 | 90 s |

### Home Routine: Forearms (10 kg dumbbells)

| # | Exercise | Sets × Reps | Rest |
| --- | --- | --- | --- |
| 1 | Dumbbell Wrist Curls (Palms Up) | 3 × 15–20 | 60 s |
| 2 | Reverse DB Wrist Curls (Palms Down) | 3 × 15–20 | 60 s |
| 3 | Dumbbell Farmer's Holds / Carries | 3 × 45–60 s | 60 s |

### Cardio: Treadmill & Conditioning

| # | Exercise | Target | Logged per round |
| --- | --- | --- | --- |
| 1 | Treadmill Incline Walk | 30 min | time, speed, incline, distance |

Add more cardio from **Exercises → Library** (use the *Cardio* muscle filter), or add a cardio exercise to the end of any lifting day.

> The original program doesn't specify superset or forearm rest times. The 90 s and 60 s values above are defaults you can change with **Edit → ✎** on any exercise.

</details>

---

## Local setup

**Prerequisites:** [Node.js](https://nodejs.org/) 20.19+ or 22+ (includes npm).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (also reachable from your phone on the same Wi-Fi)
npm run dev
```

Open the `Local:` URL on your computer. To try it on your phone, open the `Network:` URL (e.g. `http://192.168.1.20:5173`) on a phone connected to the same Wi-Fi.

Other scripts:

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally (service worker enabled)
npm run icons     # regenerate the PNG app icons in public/
npm run build:exercises   # re-download the exercise library into src/data/exerciseDb.json
npm run build:movements   # regenerate src/data/movements.js (exercise options per movement pattern)
```

> **Note:** browsers only enable service workers (offline mode and install) on **HTTPS** or `localhost`. The LAN `http://192.168…` address is fine for testing the UI. For a real home-screen install, deploy it (see below).

### Project structure

```
├── index.html                 # PWA meta tags (theme color, iOS standalone, icons)
├── vite.config.js             # React + Tailwind + PWA manifest/service worker
├── public/                    # favicon.svg, pwa-192/512.png, apple-touch-icon.png
├── scripts/generate-icons.mjs # zero-dependency PNG icon generator
├── scripts/build-exercise-db.mjs # builds the exercise library (text + media ids) from the dataset
├── scripts/build-movements.mjs   # curated exercise options per movement pattern → src/data/movements.js
├── .github/workflows/deploy.yml  # GitHub Pages deployment
└── src/
    ├── App.jsx                # state, tabs, timer wiring
    ├── data/                  # defaultPlan.js, programs.js (program templates & focuses), movements.js,
    │                          # alternatives.js, muscles.js, cardio.js, media.js,
    │                          # library.js + exerciseDb.json (the exercise library, lazy-loaded)
    ├── lib/                   # store.js (state + actions), generator.js (programs → plan days),
    │                          # stats.js (PRs, streaks, calendar), alerts.js, format.js
    ├── hooks/useRestTimer.js  # timestamp-based countdown, alerts, wake lock
    └── components/            # WorkoutsTab, ExerciseCard, RestTimerBar, HistoryTab, ProgressChart,
                               # ExercisesTab, ExerciseBrowser, CustomExercises, AlternativesSheet,
                               # ExerciseForm, SettingsSheet
```

---

## Push to GitHub

```bash
# inside the project folder
git init
git add .
git commit -m "Initial commit: GymLog PWA"
git branch -M main

# create an empty repo on github.com first (no README), then:
git remote add origin https://github.com/<your-username>/gymlog.git
git push -u origin main
```

With the [GitHub CLI](https://cli.github.com/) you can do it in one step instead: `gh repo create gymlog --public --source=. --push`

### Deploy free on GitHub Pages (HTTPS)

The repo includes `.github/workflows/deploy.yml`, which builds and publishes on every push to `main`.

1. On GitHub, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the workflow from the **Actions** tab).
4. Your app will be live at `https://<your-username>.github.io/gymlog/`.

The Vite `base` is set to `./`, so the build works under any sub-path. Netlify, Vercel or Cloudflare Pages also work: set the build command to `npm run build` and the output directory to `dist`.

---

## Install on your phone (PWA)

Open the HTTPS URL of your deployment on your phone, then:

### iPhone / iPad (Safari)

1. Tap the **Share** button (square with arrow).
2. Scroll down and tap **Add to Home Screen**.
3. Tap **Add**. GymLog now opens full-screen from its icon.

### Android (Chrome)

1. Tap the **⋮** menu.
2. Tap **Install app** (or **Add to Home screen**).
3. Confirm. The app appears in your launcher and app drawer.

After the first load everything is cached, so the app works in airplane mode. New versions download automatically the next time you open it online.

### Platform notes

- **Vibration:** iOS Safari does not support `navigator.vibrate`, so iPhones get the beep only. Android vibrates.
- **Sound on iPhone:** Web Audio is muted when the ring/silent switch is on silent.
- **Background timers:** phones pause web apps when the screen locks. GymLog keeps the screen awake while a rest timer runs (Wake Lock). The timer is timestamp-based, so it shows the correct time when you come back, but the beep can't fire while the phone is locked.
- **Your data lives on the device.** Clearing Safari/Chrome site data or deleting the home-screen app can erase it. Use **⚙ Settings → Export data** regularly to keep a JSON backup, and **Import data** to restore it or move it to another device.

---

## Data format

All state is stored under the `localStorage` key `gymlog:v1` (settings include `weeklyGoal`, default 3). The export file has the same shape:

```jsonc
{
  "version": 1,
  "plan": [{ "id": "day1", "name": "Day 1", "title": "…", "exercises": [{ "id": "…", "name": "…", "muscle": "quads", "sets": 3, "reps": "6-8", "rest": 150, "unit": "reps", "superset": null }] }],
  "customExercises": [],
  "history": [{ "id": "…", "dayId": "day1", "dayName": "…", "startedAt": 0, "finishedAt": 0,
                "exercises": [{ "name": "Barbell Back Squats", "muscle": "quads", "unit": "reps", "sets": [{ "weight": 80, "reps": 8 }] }] }],
  "active": null,
  "settings": { "sound": true, "vibrate": true }
}
```

Cardio exercises have `"type": "cardio"` and a `"metrics"` list (e.g. `["duration", "speed", "incline", "distance"]`), and their logged sets use those keys (`{ "duration": 30, "speed": 5.5, "incline": 12, "distance": 2.7 }`). Data from older versions is upgraded automatically on load (the Cardio day is added, and your history is kept).

History is matched by **exercise name**. If you swap an exercise out and later swap it back, its history and auto-fill values return too.

---

## Credits

- Exercise library data (names, muscles, equipment, instructions) comes from **[exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)** by Hasan Emir Yıldırım, used under the MIT License:

  > Copyright (c) 2026 Hasan Emir Yıldırım. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation and data files (the "Software"), to deal in the Software without restriction… The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  The full license text is in [`src/data/EXERCISE-DATA-LICENSE.txt`](src/data/EXERCISE-DATA-LICENSE.txt).
- Exercise animations and thumbnails are **© Gym visual — https://gymvisual.com/**, hosted in the exercises-dataset repo with the rights holder's permission. Gym visual's terms prohibit redistribution, so this repo and its build **do not contain any of the media**. The app loads each GIF from the dataset repo at runtime (180×180, with attribution shown next to it), and the service worker keeps a per-device cache for offline use. See [`src/data/media.js`](src/data/media.js).
- The session summary, personal records, streak/consistency stats and activity calendar are adapted from ideas in **[LogPress](https://github.com/hasaneyldrm/logpress-public)** by Hasan Emir Yıldırım (MIT). They were reimplemented for this offline web app, and streaks are counted weekly so rest days don't break them.
