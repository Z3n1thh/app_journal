import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export default function GoalsCard({ goals, monthKey, habits, onSave }) {
  const { t, lang } = useLanguage()
  const monthGoals = goals[monthKey] || []
  const [newGoal, setNewGoal] = useState('')
  const [target, setTarget] = useState(20)
  const [linkHabit, setLinkHabit] = useState('')

  const addGoal = () => {
    const text = newGoal.trim()
    if (!text) return
    const updated = {
      ...goals,
      [monthKey]: [...monthGoals, {
        id: Date.now().toString(), text, target: Number(target) || 20, progress: 0,
        habitId: linkHabit || null,
      }],
    }
    onSave(updated)
    setNewGoal('')
    setLinkHabit('')
  }

  const removeGoal = (id) => {
    onSave({ ...goals, [monthKey]: monthGoals.filter((g) => g.id !== id) })
  }

  const bumpProgress = (id) => {
    onSave({
      ...goals,
      [monthKey]: monthGoals.map((g) => g.id === id ? { ...g, progress: Math.min(g.target, g.progress + 1) } : g),
    })
  }

  return (
    <div className="card">
      <h3>{t('goals.title')}</h3>
      {monthGoals.map((g) => (
        <div key={g.id} className="goal-row">
          <div className="goal-info">
            <span>{g.text}{g.habitId && <span className="goal-linked"> 🔗</span>}</span>
            <div className="goal-bar-wrap">
              <div className="goal-bar" style={{ width: `${(g.progress / g.target) * 100}%` }} />
            </div>
            <span className="goal-progress">{g.progress}/{g.target}</span>
          </div>
          <div className="goal-actions">
            <button className="bujo-btn tiny" onClick={() => bumpProgress(g.id)}>+1</button>
            <button className="bujo-btn tiny ghost" onClick={() => removeGoal(g.id)}>✕</button>
          </div>
        </div>
      ))}
      <div className="goal-add">
        <input className="bujo-input" placeholder={t('goals.placeholder')} value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
        <input type="number" min={1} max={31} className="bujo-input tiny" value={target} onChange={(e) => setTarget(e.target.value)} />
        <select className="bujo-input tiny" value={linkHabit} onChange={(e) => setLinkHabit(e.target.value)}>
          <option value="">{t('goals.linkHabit')}</option>
          {habits.map((h) => <option key={h.id} value={h.id}>{h.emoji} {h.label || h.labelKey}</option>)}
        </select>
        <button className="bujo-btn small" onClick={addGoal}>{t('goals.add')}</button>
      </div>
    </div>
  )
}
