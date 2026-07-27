import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { COLLECTION_TEMPLATES, templateToCollection } from '../constants/collectionTemplates'

export default function CollectionsPage({ collections = [], onUpdate }) {
  const { t } = useLanguage()
  const [newTitle, setNewTitle] = useState('')
  const [newItems, setNewItems] = useState({})

  const addList = () => {
    const title = newTitle.trim()
    if (!title) return
    onUpdate([...collections, { id: `col-${Date.now()}`, title, items: [] }])
    setNewTitle('')
  }

  const addTemplate = (template) => {
    onUpdate([...collections, templateToCollection(template, t)])
  }

  const removeList = (id) => {
    onUpdate(collections.filter((c) => c.id !== id))
  }

  const addItem = (colId) => {
    const text = (newItems[colId] || '').trim()
    if (!text) return
    onUpdate(collections.map((c) =>
      c.id === colId ? { ...c, items: [...(c.items || []), { id: `item-${Date.now()}`, text, done: false }] } : c
    ))
    setNewItems({ ...newItems, [colId]: '' })
  }

  const toggleItem = (colId, itemId) => {
    onUpdate(collections.map((c) =>
      c.id === colId
        ? { ...c, items: (c.items || []).map((i) => i.id === itemId ? { ...i, done: !i.done } : i) }
        : c
    ))
  }

  const removeItem = (colId, itemId) => {
    onUpdate(collections.map((c) =>
      c.id === colId ? { ...c, items: (c.items || []).filter((i) => i.id !== itemId) } : c
    ))
  }

  return (
    <div className="page collections-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('collections.title')}</h1>
          <p className="page-subtitle">{t('collections.subtitle')}</p>
        </div>
      </div>

      <div className="add-list-row">
        <input
          className="bujo-input"
          placeholder={t('collections.listName')}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addList()}
        />
        <button className="bujo-btn primary" onClick={addList}>{t('collections.newList')}</button>
      </div>

      <div className="card template-picker">
        <h3>{t('collections.templates')}</h3>
        <div className="template-grid">
          {COLLECTION_TEMPLATES.map((tpl) => (
            <button key={tpl.id} className="bujo-btn ghost template-btn" onClick={() => addTemplate(tpl)}>
              {tpl.emoji} {t(tpl.titleKey)}
            </button>
          ))}
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="card empty-state"><span className="empty-icon">📋</span><p>{t('collections.empty')}</p></div>
      ) : (
        <div className="collections-grid">
          {collections.map((col) => (
            <div key={col.id} className="card collection-card">
              <div className="card-header-row">
                <h3>{col.title}</h3>
                <button className="bujo-btn small danger" onClick={() => removeList(col.id)}>×</button>
              </div>
              <ul className="collection-items">
                {(col.items || []).map((item) => (
                  <li key={item.id} className={`collection-item ${item.done ? 'done' : ''}`}>
                    <button className="collection-check" onClick={() => toggleItem(col.id, item.id)} aria-label="Toggle">
                      {item.done ? '✓' : '○'}
                    </button>
                    <span>{item.text}</span>
                    <button className="collection-remove" onClick={() => removeItem(col.id, item.id)}>×</button>
                  </li>
                ))}
              </ul>
              <div className="tag-input-row">
                <input
                  className="bujo-input small"
                  placeholder={t('collections.addItem')}
                  value={newItems[col.id] || ''}
                  onChange={(e) => setNewItems({ ...newItems, [col.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addItem(col.id)}
                />
                <button className="bujo-btn small" onClick={() => addItem(col.id)}>{t('dayModal.add')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
