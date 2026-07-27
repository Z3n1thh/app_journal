export const DEFAULT_MOODS = [
  { id: 'great', emoji: '😄', color: '#4ade80' },
  { id: 'good', emoji: '🙂', color: '#86efac' },
  { id: 'okay', emoji: '😐', color: '#fbbf24' },
  { id: 'low', emoji: '😔', color: '#fb923c' },
  { id: 'bad', emoji: '😢', color: '#f87171' },
]

export const MOODS = DEFAULT_MOODS

export const CYCLE_PHASES = [
  { id: 'period', emoji: '🩸', color: '#e879a9' },
  { id: 'follicular', emoji: '🌱', color: '#86efac' },
  { id: 'ovulation', emoji: '✨', color: '#fbbf24' },
  { id: 'luteal', emoji: '🌙', color: '#a78bfa' },
]

export const ENERGY_LEVELS = [
  { id: 'high', emoji: '⚡' },
  { id: 'medium', emoji: '🔋' },
  { id: 'low', emoji: '🪫' },
]

export const QUICK_TAGS = ['work', 'social', 'rest', 'stress', 'exercise', 'sick']

export const DEFAULT_HABITS = [
  { id: 'water', labelKey: 'water', emoji: '💧' },
  { id: 'exercise', labelKey: 'exercise', emoji: '🏃' },
  { id: 'sleep', labelKey: 'sleep', emoji: '🌙' },
  { id: 'journal', labelKey: 'journal', emoji: '📓' },
]

export const DEFAULT_HABIT_LABELS = {
  en: { water: 'Water', exercise: 'Exercise', sleep: 'Sleep 7h+', journal: 'Journal' },
  es: { water: 'Agua', exercise: 'Ejercicio', sleep: 'Dormir 7h+', journal: 'Diario' },
  fr: { water: 'Eau', exercise: 'Sport', sleep: 'Dormir 7h+', journal: 'Journal' },
  de: { water: 'Wasser', exercise: 'Sport', sleep: '7h+ Schlaf', journal: 'Tagebuch' },
  nl: { water: 'Water', exercise: 'Sport', sleep: '7u+ slaap', journal: 'Journal' },
  sv: { water: 'Vatten', exercise: 'Träning', sleep: 'Sömn 7h+', journal: 'Dagbok' },
}

export function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export function formatDisplayDate(key, months) {
  const { year, month, day } = parseDateKey(key)
  return `${months[month]} ${day}, ${year}`
}

export function todayKey() {
  const now = new Date()
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate())
}

export const DEFAULT_ROUTINES = {
  morning: ['Stretch', 'Water', 'Plan day'],
  evening: ['Journal', 'Skincare', 'Wind down'],
}

export function emptyDayEntry() {
  return {
    mood: null,
    note: '',
    habits: {},
    cyclePhase: null,
    tags: [],
    gratitude: '',
    energy: null,
    priorities: ['', '', ''],
    sleepHours: null,
    steps: null,
    healthSynced: false,
    waterGlasses: null,
    triggers: '',
    photo: null,
    voiceNote: null,
    promptAnswer: '',
    medications: [],
    weather: null,
    routineChecks: { morning: {}, evening: {} },
  }
}

export function getDaysInMonthFromYM(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getWeekDates(ref = new Date()) {
  const d = new Date(ref)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const dates = []
  for (let i = 0; i < 7; i++) {
    const cur = new Date(d)
    cur.setDate(d.getDate() + i)
    dates.push(dateKey(cur.getFullYear(), cur.getMonth(), cur.getDate()))
  }
  return dates
}

export function prevDayKey(key) {
  const { year, month, day } = parseDateKey(key)
  const d = new Date(year, month, day - 1)
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

export function getLoggingStreak(entries) {
  if (Object.keys(entries).length === 0) return 0
  let streak = 0
  const check = new Date()
  check.setHours(12, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const key = dateKey(check.getFullYear(), check.getMonth(), check.getDate())
    const entry = entries[key]
    const hasLog = entry && (entry.mood || entry.note || entry.gratitude ||
      Object.values(entry.habits || {}).some(Boolean))
    if (hasLog) {
      streak++
      check.setDate(check.getDate() - 1)
    } else if (i === 0) {
      check.setDate(check.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function getHabitStreak(entries, habitId) {
  let streak = 0
  const check = new Date()
  check.setHours(12, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const key = dateKey(check.getFullYear(), check.getMonth(), check.getDate())
    if (entries[key]?.habits?.[habitId]) {
      streak++
      check.setDate(check.getDate() - 1)
    } else if (i === 0) {
      check.setDate(check.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function getHabitLabel(habit, lang) {
  if (habit.label) return habit.label
  const labels = DEFAULT_HABIT_LABELS[lang] || DEFAULT_HABIT_LABELS.en
  return labels[habit.labelKey] || habit.labelKey || 'Habit'
}

export function getMoodLabel(mood, t) {
  if (mood.label) return mood.label
  return t(`moods.${mood.id}`)
}
