import { useLanguage } from '../i18n/LanguageContext'

const MOBILE_ITEMS = [
  { id: 'calendar', icon: '📅' },
  { id: 'week', icon: '📆' },
  { id: 'log', icon: '➕', action: 'log' },
  { id: 'insights', icon: '📊' },
  { id: 'more', icon: '⋯' },
]

export default function BottomNav({ page, onNavigate, onLogToday }) {
  const { t } = useLanguage()
  const active = ['collections', 'search', 'settings', 'tracking'].includes(page) ? 'more' : page

  return (
    <nav className="bottom-nav" aria-label={t('a11y.mainNav')}>
      {MOBILE_ITEMS.map((item) => {
        const isLog = item.action === 'log'
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${isLog ? 'bottom-nav-log' : ''} ${!isLog && active === item.id ? 'active' : ''}`}
            onClick={() => (isLog ? onLogToday?.() : onNavigate(item.id))}
            aria-current={!isLog && active === item.id ? 'page' : undefined}
            aria-label={isLog ? t('logToday') : t(`nav.${item.id}`)}
          >
            <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="bottom-nav-label">{isLog ? t('logToday') : t(`nav.${item.id}`)}</span>
          </button>
        )
      })}
    </nav>
  )
}
