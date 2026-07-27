import { useState } from 'react'
import Calendar from '../components/Calendar'
import { QUICK_TAGS } from '../constants'
import { useLanguage } from '../i18n/LanguageContext'

export default function CalendarPage({
  year, month, entries, habits, moods, profile,
  onDayClick, onMonthChange,
}) {
  const { t, months, weekdays } = useLanguage()
  const [tagFilter, setTagFilter] = useState(null)

  const filteredEntries = tagFilter
    ? Object.fromEntries(Object.entries(entries).filter(([, e]) => e.tags?.includes(tagFilter)))
    : entries

  return (
    <div className="page calendar-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('nav.calendar')}</h1>
          <p className="page-subtitle">{months[month]} {year}</p>
        </div>
      </div>

      <div className="tag-filter-bar">
        <button className={`quick-tag ${!tagFilter ? 'active' : ''}`} onClick={() => setTagFilter(null)}>
          {t('calendar.allTags')}
        </button>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            className={`quick-tag ${tagFilter === tag ? 'active' : ''}`}
            onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
          >
            {t(`tags.${tag}`)}
          </button>
        ))}
      </div>

      <Calendar
        year={year}
        month={month}
        entries={filteredEntries}
        allEntries={entries}
        tagFilter={tagFilter}
        habits={habits}
        moods={moods}
        profile={profile}
        months={months}
        weekdays={weekdays}
        onDayClick={onDayClick}
        onMonthChange={onMonthChange}
      />
    </div>
  )
}
