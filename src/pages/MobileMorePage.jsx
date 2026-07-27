import { useLanguage } from '../i18n/LanguageContext'

const MORE_ITEMS = [
  { id: 'tracking', icon: '✏️' },
  { id: 'collections', icon: '📋' },
  { id: 'search', icon: '🔍' },
  { id: 'settings', icon: '⚙️' },
]

export default function MobileMorePage({ onNavigate }) {
  const { t } = useLanguage()

  return (
    <div className="page more-page">
      <div className="page-header">
        <h1 className="page-title">{t('nav.more')}</h1>
      </div>
      <div className="more-grid">
        {MORE_ITEMS.map((item) => (
          <button key={item.id} type="button" className="more-card card" onClick={() => onNavigate(item.id)}>
            <span className="more-icon" aria-hidden="true">{item.icon}</span>
            <span>{t(`nav.${item.id}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
