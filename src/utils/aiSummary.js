import { generateWeeklySummary } from './summary'
import { getWeekDates, getHabitLabel } from '../constants'
import { MOOD_SCORE } from './insights'

export function buildWeeklyContext(entries, habits, moods, t, lang) {
  const dates = getWeekDates()
  const weekEntries = dates.map((k) => ({ date: k, ...(entries[k] || {}) }))
  const logged = weekEntries.filter((e) => e.mood || e.note || e.gratitude)

  const moodCounts = {}
  logged.forEach((e) => { if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1 })

  const sleepVals = logged.filter((e) => e.sleepHours != null).map((e) => e.sleepHours)
  const avgSleep = sleepVals.length
    ? (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1)
    : null

  const habitTotals = {}
  logged.forEach((e) => {
    habits.forEach((h) => { if (e.habits?.[h.id]) habitTotals[h.id] = (habitTotals[h.id] || 0) + 1 })
  })

  const tags = {}
  logged.forEach((e) => (e.tags || []).forEach((tag) => { tags[tag] = (tags[tag] || 0) + 1 }))

  const ruleLines = generateWeeklySummary(entries, habits, moods, t, lang)

  return {
    dates,
    daysLogged: logged.length,
    moodCounts: Object.fromEntries(
      Object.entries(moodCounts).map(([id, count]) => {
        const mood = moods.find((m) => m.id === id)
        return [mood ? `${mood.emoji} ${t(`moods.${id}`)}` : id, count]
      }),
    ),
    avgSleep,
    habits: Object.fromEntries(
      Object.entries(habitTotals).map(([id, count]) => {
        const h = habits.find((x) => x.id === id)
        return [h ? getHabitLabel(h, lang) : id, count]
      }),
    ),
    tags,
    lowMoodDays: logged.filter((e) => e.mood && MOOD_SCORE[e.mood] <= 2).length,
    highMoodDays: logged.filter((e) => e.mood && MOOD_SCORE[e.mood] >= 4).length,
    gratitudeDays: logged.filter((e) => e.gratitude?.trim()).length,
    ruleLines,
  }
}

function buildPrompt(context, lang) {
  const langName = lang === 'sv' ? 'Swedish' : 'English'
  return `You are a supportive wellness journal assistant. Write a warm, concise weekly reflection (3-5 short bullet points) based on this mood tracker data. Respond in ${langName}. Do not invent data not present. Be encouraging but honest.

Data:
${JSON.stringify(context, null, 2)}

Format: plain text, one insight per line starting with "• ".`
}

export async function generateAISummary(entries, habits, moods, t, lang, config) {
  if (!config?.enabled || !config?.apiKey?.trim()) return null

  const context = buildWeeklyContext(entries, habits, moods, t, lang)
  if (context.daysLogged === 0) return null

  const prompt = buildPrompt(context, lang)
  const provider = config.provider || 'openai'

  try {
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: config.model || 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      const text = data.content?.[0]?.text?.trim()
      return text ? text.split('\n').filter(Boolean) : null
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        max_tokens: 400,
        messages: [
          { role: 'system', content: 'You are a supportive wellness journal assistant.' },
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim()
    return text ? text.split('\n').filter(Boolean) : null
  } catch {
    return null
  }
}
