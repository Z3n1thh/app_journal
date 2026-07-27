export const TRIGGER_KEYWORDS = {
  work: ['work', 'job', 'jobb', 'arbete', 'office', 'kontor'],
  sleep: ['sleep', 'sömn', 'sova', 'tired', 'trött', 'insomnia'],
  fight: ['fight', 'bråk', 'argument', 'conflict', 'konflikt'],
  stress: ['stress', 'stressad', 'anxiety', 'ångest', 'worried'],
  social: ['social', 'friends', 'vänner', 'party', 'fest'],
  health: ['sick', 'sjuk', 'pain', 'smärta', 'health'],
  family: ['family', 'familj', 'parent', 'barn', 'child'],
}
export const MOOD_SCORE = { great: 5, good: 4, okay: 3, low: 2, bad: 1 }
export const ENERGY_SCORE = { high: 3, medium: 2, low: 1 }

export function computeInsights(entries, habits, moods, month, year) {
  const monthEntries = Object.entries(entries).filter(([key]) => {
    const [y, m] = key.split('-').map(Number)
    return y === year && m === month + 1
  })

  const moodCounts = {}
  const energyCounts = {}
  let totalSleep = 0
  let sleepCount = 0
  let totalWater = 0
  let waterCount = 0
  const habitTotals = Object.fromEntries(habits.map((h) => [h.id, 0]))

  monthEntries.forEach(([, e]) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
    if (e.energy) energyCounts[e.energy] = (energyCounts[e.energy] || 0) + 1
    if (e.sleepHours != null) { totalSleep += e.sleepHours; sleepCount++ }
    if (e.waterGlasses != null) { totalWater += e.waterGlasses; waterCount++ }
    habits.forEach((h) => { if (e.habits?.[h.id]) habitTotals[h.id]++ })
  })

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
  const daysLogged = monthEntries.length
  const habitRate = daysLogged > 0
    ? Math.round((Object.values(habitTotals).reduce((a, b) => a + b, 0) / (daysLogged * habits.length)) * 100)
    : 0

  const pairs = monthEntries.filter(([, e]) => e.mood && e.energy)
  let correlation = null
  if (pairs.length >= 3) {
    const avg = pairs.reduce((s, [, e]) => s + (MOOD_SCORE[e.mood] || 3) - (ENERGY_SCORE[e.energy] || 2), 0) / pairs.length
    correlation = avg > 0.3 ? 'positive' : avg < -0.3 ? 'negative' : 'neutral'
  }

  return {
    daysLogged,
    moodCounts,
    energyCounts,
    topMood: topMood ? { id: topMood[0], count: topMood[1] } : null,
    avgSleep: sleepCount ? (totalSleep / sleepCount).toFixed(1) : null,
    avgWater: waterCount ? (totalWater / waterCount).toFixed(1) : null,
    habitTotals,
    habitRate,
    correlation,
    correlations: computeCorrelations(monthEntries, habits),
    moodTrend: getMoodTrend(entries, 30, month, year),
    tagInsights: getTagInsights(monthEntries),
    triggerInsights: getTriggerInsights(monthEntries),
    medicationInsights: getMedicationInsights(monthEntries),
    weatherInsights: getWeatherInsights(monthEntries),
    heatmap: getHabitHeatmap(entries, habits, month, year),
  }
}

export function getMoodTrend(entries, days = 30, refMonth = null, refYear = null) {
  const end = refYear != null && refMonth != null
    ? new Date(refYear, refMonth + 1, 0, 12)
    : new Date()
  end.setHours(12, 0, 0, 0)
  const points = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const mood = entries[key]?.mood
    points.push({
      key,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      score: mood ? MOOD_SCORE[mood] : null,
    })
  }
  return points
}

export function getHabitHeatmap(entries, habits, month, year) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid = habits.map((h) => ({
    habit: h,
    days: Array.from({ length: daysInMonth }, (_, i) => {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
      return !!entries[key]?.habits?.[h.id]
    }),
  }))
  return grid
}

export function computeCorrelations(monthEntries, habits) {
  const results = []
  const withMood = monthEntries.filter(([, e]) => e.mood)

  const sleepEntries = withMood.filter(([, e]) => e.sleepHours != null)
  if (sleepEntries.length >= 3) {
    const avgSleepGood = avg(sleepEntries.filter(([, e]) => MOOD_SCORE[e.mood] >= 4).map(([, e]) => e.sleepHours))
    const avgSleepLow = avg(sleepEntries.filter(([, e]) => MOOD_SCORE[e.mood] <= 2).map(([, e]) => e.sleepHours))
    if (avgSleepGood && avgSleepLow && avgSleepGood - avgSleepLow >= 0.5) {
      results.push({ type: 'sleep', message: 'sleepPositive', detail: `${avgSleepGood.toFixed(1)}h vs ${avgSleepLow.toFixed(1)}h` })
    }
  }

  habits.forEach((h) => {
    const withHabit = withMood.filter(([, e]) => e.habits?.[h.id])
    const without = withMood.filter(([, e]) => !e.habits?.[h.id])
    if (withHabit.length >= 2 && without.length >= 2) {
      const scoreWith = avg(withHabit.map(([, e]) => MOOD_SCORE[e.mood]))
      const scoreWithout = avg(without.map(([, e]) => MOOD_SCORE[e.mood]))
      if (scoreWith - scoreWithout >= 0.5) {
        results.push({ type: 'habit', message: 'habitPositive', habitId: h.id, emoji: h.emoji, delta: (scoreWith - scoreWithout).toFixed(1) })
      }
    }
  })

  const cycleEntries = withMood.filter(([, e]) => e.cyclePhase)
  const byPhase = {}
  cycleEntries.forEach(([, e]) => {
    if (!byPhase[e.cyclePhase]) byPhase[e.cyclePhase] = []
    byPhase[e.cyclePhase].push(MOOD_SCORE[e.mood])
  })
  Object.entries(byPhase).forEach(([phase, scores]) => {
    if (scores.length >= 2) {
      const phaseAvg = avg(scores)
      const overall = avg(withMood.map(([, e]) => MOOD_SCORE[e.mood]))
      if (Math.abs(phaseAvg - overall) >= 0.4) {
        results.push({ type: 'cycle', message: phaseAvg < overall ? 'cycleLower' : 'cycleHigher', phase })
      }
    }
  })

  return results
}

function getWeatherInsights(monthEntries) {
  const byCondition = {}
  monthEntries.forEach(([, e]) => {
    if (!e.mood || !e.weather?.condition) return
    const c = e.weather.condition
    if (!byCondition[c]) byCondition[c] = []
    byCondition[c].push(MOOD_SCORE[e.mood])
  })
  return Object.entries(byCondition)
    .filter(([, scores]) => scores.length >= 2)
    .map(([condition, scores]) => ({
      condition,
      avg: avg(scores),
      count: scores.length,
    }))
    .sort((a, b) => b.avg - a.avg)
}

export function getTriggerInsights(monthEntries) {
  const lowMood = monthEntries.filter(([, e]) => e.mood && MOOD_SCORE[e.mood] <= 2 && e.triggers?.trim())
  const counts = {}
  lowMood.forEach(([, e]) => {
    const text = e.triggers.toLowerCase()
    Object.entries(TRIGGER_KEYWORDS).forEach(([key, words]) => {
      if (words.some((w) => text.includes(w))) {
        counts[key] = (counts[key] || 0) + 1
      }
    })
  })
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

export function getMedicationInsights(monthEntries) {
  const counts = {}
  monthEntries.forEach(([, e]) => {
    (e.medications || []).forEach((med) => {
      counts[med] = (counts[med] || 0) + 1
    })
  })
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

function avg(arr) {
  if (!arr.length) return null
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function getTagInsights(monthEntries) {
  const tagScores = {}
  monthEntries.forEach(([, e]) => {
    if (!e.mood) return
    ;(e.tags || []).forEach((tag) => {
      if (!tagScores[tag]) tagScores[tag] = []
      tagScores[tag].push(MOOD_SCORE[e.mood])
    })
  })
  return Object.entries(tagScores)
    .map(([tag, scores]) => ({ tag, avg: avg(scores), count: scores.length }))
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.avg - a.avg)
}

export function computeYearReview(entries, habits, year) {
  const yearEntries = Object.entries(entries).filter(([key]) => key.startsWith(`${year}-`))
  const moodCounts = {}
  const monthCounts = Array(12).fill(0)
  let bestStreak = 0
  let currentStreak = 0
  const habitTotals = Object.fromEntries(habits.map((h) => [h.id, 0]))

  yearEntries.sort().forEach(([key, e]) => {
    const m = Number(key.split('-')[1]) - 1
    if (e.mood) {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
      monthCounts[m]++
    }
    const hasLog = e.mood || e.note || e.gratitude || Object.values(e.habits || {}).some(Boolean)
    if (hasLog) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
    habits.forEach((h) => { if (e.habits?.[h.id]) habitTotals[h.id]++ })
  })

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
  const bestMonth = monthCounts.indexOf(Math.max(...monthCounts))
  const topHabit = Object.entries(habitTotals).sort((a, b) => b[1] - a[1])[0]

  return {
    daysLogged: yearEntries.length,
    topMood: topMood ? { id: topMood[0], count: topMood[1] } : null,
    bestMonth,
    bestMonthCount: monthCounts[bestMonth] || 0,
    bestStreak,
    topHabitId: topHabit?.[0],
    topHabitCount: topHabit?.[1] || 0,
    moodCounts,
  }
}
