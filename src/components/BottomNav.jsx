import { useLanguage } from '../i18n/LanguageContext'

const MOBILE_ITEMS = [
  { id: 'calendar', icon: '📅' },
  { id: 'week', icon: '📆' },
  { id: 'tracking', icon: '✏️' },
  { id: 'insights', icon: '📊' },
  { id: 'more', icon: '⋯' },
]

export default function BottomNav({ page, onNavigate }) {
  const { t } = useLanguage()
  const active = ['collections', 'search', 'settings'].includes(page) ? 'more' : page

  return (
    <nav className="bottom-nav" aria-label={t('a11y.mainNav')}>
      {MOBILE_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
          aria-current={active === item.id ? 'page' : undefined}
          aria-label={t(`nav.${item.id}`)}
        >
          <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="bottom-nav-label">{t(`nav.${item.id}`)}</span>
        </button>
      ))}
    </nav>
  )
}
