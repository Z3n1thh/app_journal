import { useState, useEffect } from 'react'
import { generateWeeklySummary } from '../utils/summary'
import { generateAISummary } from '../utils/aiSummary'
import { useLanguage } from '../i18n/LanguageContext'

export default function WeeklySummary({ entries, habits, moods, profile }) {
  const { t, lang } = useLanguage()
  const [aiLines, setAiLines] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const aiConfig = profile?.ai

  const ruleLines = generateWeeklySummary(entries, habits, moods, t, lang)

  useEffect(() => {
    if (!aiConfig?.enabled || !aiConfig?.apiKey) {
      setAiLines(null)
      return
    }
    let cancelled = false
    setAiLoading(true)
    generateAISummary(entries, habits, moods, t, lang, aiConfig)
      .then((lines) => { if (!cancelled) setAiLines(lines) })
      .finally(() => { if (!cancelled) setAiLoading(false) })
    return () => { cancelled = true }
  }, [entries, habits, moods, t, lang, aiConfig?.enabled, aiConfig?.apiKey, aiConfig?.provider])

  const lines = aiLines?.length ? aiLines : ruleLines
  if (lines.length <= 1 && !aiLoading) return null

  return (
    <div className="card weekly-summary">
      <h3>{t('summary.title')}</h3>
      {aiLoading && <p className="settings-hint">{t('ai.loading')}</p>}
      {aiLines?.length > 0 && <p className="settings-hint">{t('ai.powered')}</p>}
      <ul className="correlation-list">
        {lines.map((line, i) => <li key={i}>{line}</li>)}
      </ul>
    </div>
  )
}
