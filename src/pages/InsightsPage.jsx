import MonthCompare from '../components/MonthCompare'
import WeeklySummary from '../components/WeeklySummary'
import { compareMonths } from '../utils/summary'
import { computeInsights } from '../utils/insights'
import { getDaysInMonthFromYM } from '../constants'
import MoodTrendChart from '../components/MoodTrendChart'
import HabitHeatmap from '../components/HabitHeatmap'
import YearReview from '../components/YearReview'
import { useLanguage } from '../i18n/LanguageContext'

export default function InsightsPage({ entries, habits, moods, profile, year, month, onMonthChange }) {
  const { t, months } = useLanguage()
  const insights = computeInsights(entries, habits, moods, month, year)
  const comparison = compareMonths(entries, habits, moods, month, year)
  const daysInMonth = getDaysInMonthFromYM(year, month)

  const prev = () => month === 0 ? onMonthChange(year - 1, 11) : onMonthChange(year, month - 1)
  const next = () => month === 11 ? onMonthChange(year + 1, 0) : onMonthChange(year, month + 1)

  const topMood = insights.topMood ? moods.find((m) => m.id === insights.topMood.id) : null

  return (
    <div className="page insights-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('insights.title')}</h1>
          <p className="page-subtitle">{months[month]} {year}</p>
        </div>
        <div className="week-nav">
          <button className="bujo-btn ghost" onClick={prev}>‹</button>
          <button className="bujo-btn ghost" onClick={next}>›</button>
        </div>
      </div>

      <YearReview entries={entries} habits={habits} moods={moods} year={year} />
      <WeeklySummary entries={entries} habits={habits} moods={moods} profile={profile} />

      {insights.daysLogged === 0 ? (
        <div className="card empty-state"><span className="empty-icon">📊</span><p>{t('insights.noData')}</p></div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-card-value">{insights.daysLogged}</span>
              <span className="stat-card-label">{t('insights.daysLogged')}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-value">{insights.habitRate}%</span>
              <span className="stat-card-label">{t('insights.habitRate')}</span>
            </div>
            {insights.avgSleep && (
              <div className="stat-card">
                <span className="stat-card-value">{insights.avgSleep}h</span>
                <span className="stat-card-label">{t('insights.avgSleep')}</span>
              </div>
            )}
            {insights.avgWater && (
              <div className="stat-card">
                <span className="stat-card-value">{insights.avgWater}</span>
                <span className="stat-card-label">{t('insights.avgWater')}</span>
              </div>
            )}
          </div>

          <div className="card">
            <h3>{t('insights.moodTrend')}</h3>
            <MoodTrendChart points={insights.moodTrend} />
          </div>

          <MonthCompare comparison={comparison} moods={moods} />

          {topMood && (
            <div className="card">
              <h3>{t('insights.topMood')}</h3>
              <p className="insight-highlight">{topMood.emoji} {t(`moods.${topMood.id}`)} — {insights.topMood.count}×</p>
            </div>
          )}

          <div className="card">
            <h3>{t('tracking.moodSummary')}</h3>
            <div className="mood-chart">
              {Object.entries(insights.moodCounts).map(([id, count]) => {
                const mood = moods.find((m) => m.id === id)
                if (!mood) return null
                const total = Object.values(insights.moodCounts).reduce((a, b) => a + b, 0)
                return (
                  <div key={id} className="mood-chart-row">
                    <span className="mood-chart-emoji">{mood.emoji}</span>
                    <span className="mood-chart-label">{t(`moods.${id}`)}</span>
                    <div className="mood-chart-bar-wrap">
                      <div className="mood-chart-bar" style={{ width: `${(count / total) * 100}%`, backgroundColor: mood.color }} />
                    </div>
                    <span className="mood-chart-count">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card">
            <h3>{t('insights.heatmap')}</h3>
            <HabitHeatmap grid={insights.heatmap} daysInMonth={daysInMonth} />
          </div>

          {insights.correlation && (
            <div className="card">
              <h3>{t('insights.moodEnergy')}</h3>
              <p>{t(`insights.${insights.correlation}`)}</p>
            </div>
          )}

          {insights.correlations?.length > 0 && (
            <div className="card">
              <h3>{t('insights.correlations')}</h3>
              <ul className="correlation-list">
                {insights.correlations.map((c, i) => (
                  <li key={i}>
                    {c.type === 'habit' && `${c.emoji} ${t('insights.habitBoost', { delta: c.delta })}`}
                    {c.type === 'sleep' && t('insights.sleepBoost', { detail: c.detail })}
                    {c.type === 'cycle' && t(`insights.${c.message}`, { phase: t(`cycle.${c.phase}`) })}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.tagInsights?.length > 0 && (
            <div className="card">
              <h3>{t('insights.tagPatterns')}</h3>
              <ul className="correlation-list">
                {insights.tagInsights.map((ti) => (
                  <li key={ti.tag}>
                    #{ti.tag} — {t('insights.tagAvg', { avg: ti.avg.toFixed(1), count: ti.count })}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.triggerInsights?.length > 0 && (
            <div className="card">
              <h3>{t('insights.triggers')}</h3>
              <ul className="correlation-list">
                {insights.triggerInsights.map((tr) => (
                  <li key={tr.key}>{t(`triggers.${tr.key}`)} — {tr.count}×</li>
                ))}
              </ul>
            </div>
          )}

          {insights.weatherInsights?.length > 0 && (
            <div className="card">
              <h3>{t('insights.weather')}</h3>
              <ul className="correlation-list">
                {insights.weatherInsights.map((w) => (
                  <li key={w.condition}>{t(`weather.${w.condition}`)} — {t('insights.tagAvg', { avg: w.avg.toFixed(1), count: w.count })}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.medicationInsights?.length > 0 && (
            <div className="card">
              <h3>{t('insights.medications')}</h3>
              <ul className="correlation-list">
                {insights.medicationInsights.map((med) => (
                  <li key={med.name}>{med.name} — {t('insights.medDays', { n: med.count })}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <h3>{t('tracking.habitsSection')}</h3>
            <div className="mood-chart">
              {habits.map((h) => (
                <div key={h.id} className="mood-chart-row">
                  <span className="mood-chart-emoji">{h.emoji}</span>
                  <span className="mood-chart-label">{h.label || h.labelKey}</span>
                  <div className="mood-chart-bar-wrap">
                    <div className="mood-chart-bar" style={{ width: `${insights.daysLogged ? (insights.habitTotals[h.id] / insights.daysLogged) * 100 : 0}%`, backgroundColor: 'var(--accent)' }} />
                  </div>
                  <span className="mood-chart-count">{insights.habitTotals[h.id]}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
