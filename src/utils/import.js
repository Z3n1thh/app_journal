import { emptyDayEntry } from '../constants'

const DAYLIO_MOOD_MAP = {
  'rad': 'great', 'good': 'good', 'meh': 'okay', 'bad': 'bad', 'awful': 'bad',
  'grymt': 'great', 'bra': 'good', 'ok': 'okay', 'dåligt': 'low', 'hemskt': 'bad',
}

export function parseDaylioCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('empty')
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('datum'))
  const moodIdx = headers.findIndex((h) => h.includes('mood') || h.includes('humör') || h.includes('stämning'))
  const noteIdx = headers.findIndex((h) => h.includes('note') || h.includes('anteckning') || h.includes('comment'))
  if (dateIdx < 0) throw new Error('format')

  const entries = {}
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    const rawDate = cols[dateIdx]?.trim()
    if (!rawDate) continue
    const key = normalizeDateKey(rawDate)
    if (!key) continue
    const existing = entries[key] || emptyDayEntry()
    if (moodIdx >= 0 && cols[moodIdx]) {
      const moodRaw = cols[moodIdx].trim().toLowerCase()
      existing.mood = DAYLIO_MOOD_MAP[moodRaw] || moodRaw
    }
    if (noteIdx >= 0 && cols[noteIdx]) {
      existing.note = [existing.note, cols[noteIdx].trim()].filter(Boolean).join('\n')
    }
    entries[key] = existing
  }
  return entries
}

function parseCSVLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; continue }
    cur += ch
  }
  result.push(cur)
  return result
}

function normalizeDateKey(raw) {
  const m = raw.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  const m2 = raw.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/)
  if (m2) return `${m2[3]}-${m2[2].padStart(2, '0')}-${m2[1].padStart(2, '0')}`
  return null
}
