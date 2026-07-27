import { useLanguage } from '../i18n/LanguageContext'
import { computeYearReview } from '../utils/insights'
import { getHabitLabel } from '../constants'

export default function YearReview({ entries, habits, moods, year }) {
  const { t, months, lang } = useLanguage()
  const review = computeYearReview(entries, habits, year)
  const topMood = review.topMood ? moods.find((m) => m.id === review.topMood.id) : null
  const topHabit = habits.find((h) => h.id === review.topHabitId)

  if (review.daysLogged === 0) return null

  return (
    <div className="card year-review">
      <h3>{t('yearReview.title', { year })}</h3>
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card-value">{review.daysLogged}</span>
          <span className="stat-card-label">{t('insights.daysLogged')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-value">{review.bestStreak}</span>
          <span className="stat-card-label">{t('yearReview.longestStreak')}</span>
        </div>
      </div>
      {topMood && (
        <p>{t('yearReview.topMood')}: {topMood.emoji} {t(`moods.${topMood.id}`)} ({review.topMood.count}×)</p>
      )}
      {review.bestMonthCount > 0 && (
        <p>{t('yearReview.bestMonth')}: {months[review.bestMonth]} ({review.bestMonthCount})</p>
      )}
      {topHabit && (
        <p>{t('yearReview.topHabit')}: {topHabit.emoji} {getHabitLabel(topHabit, lang)} ({review.topHabitCount}×)</p>
      )}
    </div>
  )
}
