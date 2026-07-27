import { useLanguage } from '../i18n/LanguageContext'

function formatBackupDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

export default function BackupBanner({ lastBackup, onBackup }) {
  const { t, lang } = useLanguage()
  const locales = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', nl: 'nl-NL', sv: 'sv-SE' }
  const locale = locales[lang] || lang

  if (!lastBackup) {
    return (
      <div className="backup-banner warn" role="status">
        <span>{t('backup.never')}</span>
        <button type="button" className="bujo-btn small primary" onClick={onBackup}>
          {t('backup.exportNow')}
        </button>
      </div>
    )
  }

  const days = Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24))
  if (days < 7) return null

  return (
    <div className="backup-banner warn" role="status">
      <span>{t('backup.overdue', { days })}</span>
      <button type="button" className="bujo-btn small primary" onClick={onBackup}>
        {t('backup.exportNow')}
      </button>
      <span className="backup-banner-meta">{t('backup.lastOn', { date: formatBackupDate(lastBackup, locale) })}</span>
    </div>
  )
}
