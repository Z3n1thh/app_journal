export function searchEntries(entries, query, moods, filters = {}) {
  const q = query.trim().toLowerCase()
  const { from, to, tags = [], mood: moodFilter } = filters
  const hasFilters = !!(from || to || tags.length > 0 || moodFilter)
  if (!q && !hasFilters) return []

  const moodIds = q ? moods.filter((m) =>
    m.id.includes(q) ||
    (m.label && m.label.toLowerCase().includes(q)) ||
    m.emoji.includes(q)
  ).map((m) => m.id) : []

  return Object.entries(entries)
    .filter(([key, e]) => {
      if (from && key < from) return false
      if (to && key > to) return false
      if (moodFilter && e.mood !== moodFilter) return false
      if (tags.length > 0 && !tags.some((tag) => e.tags?.includes(tag))) return false
      if (!q) return true
      if (key.includes(q)) return true
      if (e.mood && moodIds.includes(e.mood)) return true
      if (e.note?.toLowerCase().includes(q)) return true
      if (e.gratitude?.toLowerCase().includes(q)) return true
      if (e.tags?.some((tag) => tag.toLowerCase().includes(q))) return true
      if (e.priorities?.some((p) => p.toLowerCase().includes(q))) return true
      if (e.energy?.includes(q)) return true
      return false
    })
    .sort(([a], [b]) => b.localeCompare(a))
}

export function groupResultsByMonth(results, months) {
  const groups = {}
  for (const [key, entry] of results) {
    const [, m] = key.split('-').map(Number)
    const label = months[m - 1] || key.slice(0, 7)
    if (!groups[label]) groups[label] = []
    groups[label].push([key, entry])
  }
  return groups
}
