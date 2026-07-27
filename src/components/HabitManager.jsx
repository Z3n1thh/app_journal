import { useState, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { getHabitLabel } from '../constants'

export default function HabitManager({ habits, onUpdate, onClose }) {
  const { t, lang } = useLanguage()
  const [localHabits, setLocalHabits] = useState(habits.map((h) => ({
    ...h,
    reminder: h.reminder || { enabled: false, time: '10:00' },
  })))
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('✦')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const dragIdx = useRef(null)

  const addHabit = () => {
    const label = newLabel.trim()
    if (!label) return
    setLocalHabits((prev) => [...prev, {
      id: `habit-${Date.now()}`, label, emoji: newEmoji || '✦',
      reminder: { enabled: false, time: '10:00' },
    }])
    setNewLabel('')
    setNewEmoji('✦')
  }

  const removeHabit = (id) => setLocalHabits((prev) => prev.filter((h) => h.id !== id))

  const moveHabit = (from, to) => {
    if (to < 0 || to >= localHabits.length) return
    setLocalHabits((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const onDragStart = (i) => { dragIdx.current = i }
  const onDrop = (i) => {
    if (dragIdx.current == null || dragIdx.current === i) return
    moveHabit(dragIdx.current, i)
    dragIdx.current = null
  }

  const startEdit = (habit) => {
    setEditingId(habit.id)
    setEditLabel(habit.label || getHabitLabel(habit, lang))
    setEditEmoji(habit.emoji)
  }

  const saveEdit = () => {
    if (!editLabel.trim()) return
    setLocalHabits((prev) => prev.map((h) => h.id === editingId ? { ...h, label: editLabel.trim(), emoji: editEmoji || '✦' } : h))
    setEditingId(null)
  }

  const updateReminder = (id, field, value) => {
    setLocalHabits((prev) => prev.map((h) =>
      h.id === id ? { ...h, reminder: { ...h.reminder, [field]: value } } : h
    ))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal habit-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('habitManager.title')}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t('dayModal.close')}>✕</button>
        </div>
        <p className="settings-hint">{t('habitManager.dragHint')}</p>

        <div className="habit-list">
          {localHabits.map((habit, i) => (
            <div
              key={habit.id}
              className="habit-row"
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
            >
              <span className="drag-handle" aria-hidden="true">⠿</span>
              {editingId === habit.id ? (
                <>
                  <input className="bujo-input tiny emoji-input" value={editEmoji} onChange={(e) => setEditEmoji(e.target.value)} maxLength={2} />
                  <input className="bujo-input" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} autoFocus />
                  <button className="bujo-btn small" onClick={saveEdit}>{t('tracking.save')}</button>
                  <button className="bujo-btn small ghost" onClick={() => setEditingId(null)}>{t('tracking.cancel')}</button>
                </>
              ) : (
                <>
                  <span className="habit-emoji">{habit.emoji}</span>
                  <span className="habit-name">{getHabitLabel(habit, lang)}</span>
                  <label className="habit-reminder-toggle merge-check">
                    <input type="checkbox" checked={habit.reminder?.enabled}
                      onChange={(e) => updateReminder(habit.id, 'enabled', e.target.checked)} />
                    🔔
                  </label>
                  {habit.reminder?.enabled && (
                    <input type="time" className="bujo-input tiny" value={habit.reminder.time || '10:00'}
                      onChange={(e) => updateReminder(habit.id, 'time', e.target.value)} />
                  )}
                  <button className="bujo-btn small ghost" onClick={() => moveHabit(i, i - 1)} disabled={i === 0}>↑</button>
                  <button className="bujo-btn small ghost" onClick={() => moveHabit(i, i + 1)} disabled={i === localHabits.length - 1}>↓</button>
                  <button className="bujo-btn small ghost" onClick={() => startEdit(habit)}>{t('tracking.edit')}</button>
                  <button className="bujo-btn small danger" onClick={() => removeHabit(habit.id)}>{t('habitManager.remove')}</button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="add-habit-row">
          <input className="bujo-input tiny emoji-input" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} maxLength={2} />
          <input className="bujo-input" placeholder={t('habitManager.newHabit')} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addHabit()} />
          <button className="bujo-btn small" onClick={addHabit}>{t('dayModal.add')}</button>
        </div>

        <div className="modal-actions">
          <button className="bujo-btn ghost" onClick={onClose}>{t('tracking.cancel')}</button>
          <button className="bujo-btn primary" onClick={() => { onUpdate(localHabits); onClose() }}>{t('habitManager.saveHabits')}</button>
        </div>
      </div>
    </div>
  )
}
