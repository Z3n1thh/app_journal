import { useLanguage } from '../i18n/LanguageContext'

export default function MonthCompare({ comparison, moods }) {
  const { t, months } = useLanguage()
  if (!comparison) return null
  const { current, previous, prevMonth, prevYear } = comparison

  const renderMoodBars = (data) => (
    <div className="compare-moods">
      {Object.entries(data.moodCounts || {}).map(([id, count]) => {
        const mood = moods.find((m) => m.id === id)
        const total = Object.values(data.moodCounts).reduce((a, b) => a + b, 0) || 1
        return (
          <div key={id} className="mood-chart-row">
            <span className="mood-chart-emoji">{mood?.emoji}</span>
            <div className="mood-chart-bar-wrap">
              <div className="mood-chart-bar" style={{ width: `${(count / total) * 100}%`, backgroundColor: mood?.color }} />
            </div>
            <span className="mood-chart-count">{count}</span>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="card month-compare">
      <h3>{t('insights.compare')}</h3>
      <div className="compare-grid">
        <div className="compare-col">
          <h4>{t('insights.lastMonth')} — {months[prevMonth]} {prevYear}</h4>
          <p>{previous.daysLogged} {t('insights.daysLogged')} · {previous.habitRate}% {t('insights.habitRate')}</p>
          {renderMoodBars(previous)}
        </div>
        <div className="compare-col">
          <h4>{t('insights.thisMonth')}</h4>
          <p>{current.daysLogged} {t('insights.daysLogged')} · {current.habitRate}% {t('insights.habitRate')}</p>
          {renderMoodBars(current)}
        </div>
      </div>
    </div>
  )
}
