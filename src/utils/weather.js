const WMO_CODES = {
  0: 'clear', 1: 'clear', 2: 'cloudy', 3: 'overcast',
  45: 'fog', 48: 'fog', 51: 'drizzle', 53: 'drizzle', 55: 'drizzle',
  61: 'rain', 63: 'rain', 65: 'rain', 71: 'snow', 73: 'snow', 75: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain', 95: 'storm', 96: 'storm', 99: 'storm',
}

import { MOOD_SCORE } from './insights'

export async function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 },
    )
  })
}

export async function fetchWeatherForDate(lat, lon, dateKey) {
  if (lat == null || lon == null) return null
  const today = new Date().toISOString().slice(0, 10)
  const isPast = dateKey < today
  try {
    const url = isPast
      ? `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateKey}&end_date=${dateKey}&daily=weather_code,temperature_2m_mean`
      : `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (isPast) {
      const code = data.daily?.weather_code?.[0]
      const temp = data.daily?.temperature_2m_mean?.[0]
      return { temp: temp != null ? Math.round(temp) : null, condition: WMO_CODES[code] || 'unknown' }
    }
    return {
      temp: data.current?.temperature_2m != null ? Math.round(data.current.temperature_2m) : null,
      condition: WMO_CODES[data.current?.weather_code] || 'unknown',
    }
  } catch {
    return null
  }
}

export function getWeatherInsights(monthEntries) {
  const byCondition = {}
  monthEntries.forEach(([, e]) => {
    if (!e.mood || !e.weather?.condition) return
    const c = e.weather.condition
    if (!byCondition[c]) byCondition[c] = []
    byCondition[c].push(MOOD_SCORE[e.mood] || 3)
  })
  return Object.entries(byCondition)
    .filter(([, scores]) => scores.length >= 2)
    .map(([condition, scores]) => ({
      condition,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length,
    }))
    .sort((a, b) => b.avg - a.avg)
}
