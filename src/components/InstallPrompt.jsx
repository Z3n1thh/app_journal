import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
}

export default function InstallPrompt() {
  const { t } = useLanguage()
  const [deferred, setDeferred] = useState(null)
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('bujo-install-dismissed') === '1' } catch { return false }
  })
  const showIOSHint = isIOS() && !isStandalone() && !dismissed

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferred(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if ((!deferred && !showIOSHint) || dismissed) return null

  const install = async () => {
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem('bujo-install-dismissed', '1') } catch { /* ignore */ }
  }

  return (
    <div className="install-banner">
      <span>{showIOSHint ? t('pwa.iosHint') : t('pwa.installHint')}</span>
      {deferred && (
        <button className="bujo-btn small primary" onClick={install}>{t('pwa.install')}</button>
      )}
      <button className="bujo-btn small ghost" onClick={dismiss}>{t('dayModal.close')}</button>
    </div>
  )
}
