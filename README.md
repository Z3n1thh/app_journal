# Bujo Mood Tracker

A bullet-journal style mood tracker with calendar layout, habit tracking, and optional menstrual cycle monitoring.

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
