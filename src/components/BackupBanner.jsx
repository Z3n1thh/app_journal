import { useLanguage } from '../i18n/LanguageContext'

export default function BackupBanner({ lastBackup, onBackup }) {
  const { t } = useLanguage()
  if (!lastBackup) {
    return (
      <div className="backup-banner warn">
        <span>{t('backup.never')}</span>
        <button className="bujo-btn small" onClick={onBackup}>{t('settings.download')}</button>
      </div>
    )
  }

  const days = Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24))
  if (days < 7) return null

  return (
    <div className="backup-banner warn">
      <span>{t('backup.overdue', { days })}</span>
      <button className="bujo-btn small" onClick={onBackup}>{t('settings.download')}</button>
    </div>
  )
}
