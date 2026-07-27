import { useLanguage } from '../i18n/LanguageContext'

export default function SideNav({ page, onNavigate, theme, onToggleTheme, profilesMeta }) {
  const { t } = useLanguage()

  const items = [
    { id: 'calendar', icon: '📅', label: t('nav.calendar') },
    { id: 'week', icon: '📆', label: t('nav.week') },
    { id: 'tracking', icon: '✏️', label: t('nav.tracking') },
    { id: 'insights', icon: '📊', label: t('nav.insights') },
    ...(profilesMeta?.profiles?.length > 1 ? [{ id: 'couple', icon: '💑', label: t('couple.usTwo') }] : []),
    { id: 'collections', icon: '📋', label: t('nav.collections') },
    { id: 'search', icon: '🔍', label: t('nav.search') },
    { id: 'settings', icon: '⚙️', label: t('nav.settings') },
  ]

  return (
    <nav className="side-nav" aria-label={t('a11y.mainNav')}>
      <div className="side-nav-brand">
        <span className="brand-icon" aria-hidden="true">📔</span>
        <div className="brand-text">
          <span className="brand-name">{t('appName')}</span>
          <span className="brand-tagline">{t('appTagline')}</span>
        </div>
      </div>

      <ul className="side-nav-list" role="list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={`side-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="side-nav-footer">
        <button className="side-nav-theme" onClick={onToggleTheme} aria-label={t('toggleTheme')}>
          <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>{theme === 'light' ? t('dark') : t('light')}</span>
        </button>
      </div>
    </nav>
  )
}
