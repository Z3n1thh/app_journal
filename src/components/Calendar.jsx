import {
  CYCLE_PHASES,
  ENERGY_LEVELS,
  dateKey,
  getDaysInMonth,
  getFirstDayOfMonth,
  todayKey,
  emptyDayEntry,
} from '../constants'
import { useLanguage } from '../i18n/LanguageContext'

function predictCyclePhase(dateStr, profile) {
  if (!profile?.lastPeriodStart || !profile?.cycleLength) return null

  const target = new Date(dateStr + 'T12:00:00')
  const lastStart = new Date(profile.lastPeriodStart + 'T12:00:00')
  const diffDays = Math.floor((target - lastStart) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return null

  const dayInCycle = diffDays % profile.cycleLength
  const periodLen = profile.periodLength || 5

  if (dayInCycle < periodLen) return 'period'
  if (dayInCycle < Math.floor(profile.cycleLength * 0.45)) return 'follicular'
  if (dayInCycle < Math.floor(profile.cycleLength * 0.55)) return 'ovulation'
  return 'luteal'
}

export default function Calendar({
  year, month, entries, allEntries, tagFilter, habits, moods, profile, months, weekdays, onDayClick, onMonthChange,
}) {
  const { t } = useLanguage()
  const source = allEntries || entries
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = todayKey()
  const showCycle = profile?.gender === 'female'

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="cal-cell empty" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(year, month, day)
    const entry = source[key] || emptyDayEntry()
    const dimmed = tagFilter && !(source[key]?.tags || []).includes(tagFilter)
    const mood = moods.find((m) => m.id === entry.mood)
    const energy = ENERGY_LEVELS.find((e) => e.id === entry.energy)
    const cyclePhase = entry.cyclePhase || (showCycle ? predictCyclePhase(key, profile) : null)
    const cycle = CYCLE_PHASES.find((p) => p.id === cyclePhase)
    const completedHabits = habits.filter((h) => entry.habits?.[h.id]).length
    const donePriorities = (entry.priorities || []).filter(Boolean).length
    const isToday = key === today
    const hasData = entry.mood || entry.note || entry.gratitude || entry.cyclePhase ||
      Object.values(entry.habits || {}).some(Boolean) || entry.tags?.length ||
      donePriorities > 0

    cells.push(
      <button
        key={key}
        type="button"
        className={`cal-cell day ${isToday ? 'today' : ''} ${hasData ? 'has-data' : ''} ${dimmed ? 'dimmed' : ''}`}
        onClick={() => onDayClick(key)}
        aria-label={`${months[month]} ${day}${isToday ? ` (${t('calendar.today')})` : ''}${mood ? `, ${t(`moods.${mood.id}`)}` : ''}`}
        aria-current={isToday ? 'date' : undefined}
      >
        <span className="day-number">{day}</span>

        {mood && (
          <span className="day-mood" title={t(`moods.${mood.id}`)}>
            {mood.emoji}
          </span>
        )}

        {energy && (
          <span className="day-energy" title={t(`energy.${energy.id}`)}>
            {energy.emoji}
          </span>
        )}

        {showCycle && cycle && (
          <span className="day-cycle-wrap" title={t(`cycle.${cycle.id}`)}>
            <span className="day-cycle" style={{ backgroundColor: cycle.color }} />
            {mood && <span className="day-cycle-mood">{mood.emoji}</span>}
          </span>
        )}

        {completedHabits > 0 && (
          <span className="day-habits">{completedHabits}/{habits.length}</span>
        )}

        {entry.gratitude && <span className="day-gratitude-dot" title={entry.gratitude} />}
        {entry.note && <span className="day-note-dot" title="Notes" />}
      </button>
    )
  }

  const prevMonth = () => {
    if (month === 0) onMonthChange(year - 1, 11)
    else onMonthChange(year, month - 1)
  }

  const nextMonth = () => {
    if (month === 11) onMonthChange(year + 1, 0)
    else onMonthChange(year, month + 1)
  }

  return (
    <div className="calendar" id="calendar-export">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth} aria-label={t('calendar.prev')}>‹</button>
        <h2 className="cal-title">{months[month]} {year}</h2>
        <button className="cal-nav-btn" onClick={nextMonth} aria-label={t('calendar.next')}>›</button>
      </div>

      <div className="cal-weekdays">
        {weekdays.map((d) => (
          <span key={d} className="cal-weekday">{d}</span>
        ))}
      </div>

      <div className="cal-grid">{cells}</div>

      <div className="cal-legend">
        <div className="legend-group">
          <span className="legend-title">{t('calendar.mood')}</span>
          {moods.map((m) => (
            <span key={m.id} className="legend-item">
              {m.emoji} {m.label || t(`moods.${m.id}`)}
            </span>
          ))}
        </div>
        {showCycle && (
          <div className="legend-group">
            <span className="legend-title">{t('calendar.cycle')}</span>
            {CYCLE_PHASES.map((p) => (
              <span key={p.id} className="legend-item">
                {p.emoji} {t(`cycle.${p.id}`)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { predictCyclePhase }
