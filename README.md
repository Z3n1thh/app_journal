# Bujo Mood Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-Policy-blue.svg)](./PRIVACY.md)
[![Terms](https://img.shields.io/badge/Terms-of%20Use-lightgrey.svg)](./TERMS.md)

A bullet-journal style mood tracker with calendar layout, habit tracking, and optional menstrual cycle monitoring.

> **Not medical advice.** Mood, cycle, health, and AI features are for personal journaling only — see [TERMS.md](./TERMS.md).

## Features

- **Onboarding** — Welcome flow asks for your name and gender
- **Menstrual cycle tracking** — For female users, track period, follicular, ovulation, and luteal phases with automatic predictions
- **Calendar view** — Bujo-inspired monthly calendar to log moods, habits, tags, and notes per day
- **Dark mode** — Toggle in the header or Settings (saved automatically)
- **Backup & restore** — Download JSON backup, copy to clipboard, import from file or paste
- **Quick log** — One-tap mood and energy for today from the sidebar
- **Monthly focus** — Set a monthly intention (classic bujo spread)
- **Daily bujo fields** — Top 3 priorities, gratitude line, energy level, quick tags
- **Streaks** — Logging streak and best habit streak
- **Full CRUD** — Add, edit, and remove entries for any day; manage custom habits
- **Local persistence** — All data saved in your browser via localStorage

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Usage

1. Complete the onboarding steps on first launch
2. Click any day on the calendar to log your mood, habits, tags, and notes
3. Use **Habits** to add, edit, or remove tracked habits
4. Use **Settings** to update your profile, toggle dark mode, or backup/restore data
5. Navigate months with the arrow buttons

### Backup

In **Settings → Backup & restore**:
- **Download backup** — saves a `.json` file to your device
- **Copy to clipboard** — paste into notes or cloud storage
- **Import file / Paste backup** — restore from a previous export
- Check **Merge** to combine with existing data instead of replacing it

## Legal & compliance

| Document | Purpose |
|----------|---------|
| [LICENSE](./LICENSE) | MIT license for **this project’s** source code |
| [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) | Licenses & attribution for dependencies, fonts, and APIs |
| [PRIVACY.md](./PRIVACY.md) | What data stays local vs optional third-party services |
| [TERMS.md](./TERMS.md) | Terms of use, warranties disclaimer, **not medical advice** |
| [SECURITY.md](./SECURITY.md) | How to report issues; never commit API keys |

### Third-party services used by the app

- **Open-Meteo** — optional weather (attribution: Weather data by Open-Meteo.com)
- **Google Fonts** — Inter & Caveat (SIL OFL)
- **Supabase / OpenAI / Anthropic** — optional; you supply your own keys/project
- **Capacitor / Capgo Health** — native builds (MIT / MPL-2.0)

API keys must never be committed to GitHub. Enter them only in Settings on your device.

## Live demo

https://z3n1thh.github.io/app_journal/
