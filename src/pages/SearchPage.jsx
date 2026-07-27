import { useState } from 'react'
import { searchEntries, groupResultsByMonth } from '../utils/search'
import { formatDisplayDate, QUICK_TAGS } from '../constants'
import { useLanguage } from '../i18n/LanguageContext'

export default function SearchPage({ entries, moods, onDayClick }) {
  const { t, months } = useLanguage()
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [moodFilter, setMoodFilter] = useState('')

  const hasFilters = query || from || to || selectedTags.length || moodFilter
  const results = hasFilters
    ? searchEntries(entries, query, moods, { from, to, tags: selectedTags, mood: moodFilter || undefined })
    : []
  const grouped = groupResultsByMonth(results, months)

  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  return (
    <div className="page search-page">
      <div className="page-header">
        <h1 className="page-title">{t('search.title')}</h1>
      </div>

      <input
        type="search"
        className="bujo-input search-input"
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        aria-label={t('search.title')}
      />

      <div className="search-filters card">
        <div className="search-filter-row">
          <label className="field-label">{t('search.from')}
            <input type="date" className="bujo-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field-label">{t('search.to')}
            <input type="date" className="bujo-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="field-label">{t('search.moodFilter')}
            <select className="bujo-input" value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)}>
              <option value="">{t('calendar.allTags')}</option>
              {moods.map((m) => (
                <option key={m.id} value={m.id}>{m.emoji} {m.label || t(`moods.${m.id}`)}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="tag-filter-bar">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`quick-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {t(`tags.${tag}`)}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <p className="search-count">{t('search.results', { n: results.length })}</p>
      )}

      <div className="search-results">
        {hasFilters && results.length === 0 && (
          <div className="card empty-state"><p>{t('search.noResults')}</p></div>
        )}
        {Object.entries(grouped).map(([monthLabel, monthResults]) => (
          <section key={monthLabel} className="search-month-group">
            <h2 className="search-month-title">{monthLabel}</h2>
            {monthResults.map(([key, entry]) => {
              const mood = moods.find((m) => m.id === entry.mood)
              return (
                <button key={key} className="search-result card" onClick={() => onDayClick(key)}>
                  <div className="search-result-header">
                    <span>{formatDisplayDate(key, months)}</span>
                    {mood && <span>{mood.emoji}</span>}
                  </div>
                  {entry.gratitude && <p className="search-snippet">{entry.gratitude}</p>}
                  {entry.note && <p className="search-snippet">{entry.note}</p>}
                  {entry.tags?.length > 0 && (
                    <div className="tag-list">
                      {entry.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  )}
                </button>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
