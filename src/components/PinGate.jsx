import { useState } from 'react'
import { verifyPin, hashPin } from '../utils/pin'
import { authenticatePasskey, hasPasskey, isPasskeySupported } from '../utils/passkey'
import { useLanguage } from '../i18n/LanguageContext'

export default function PinGate({ pinHash, onUnlock, setup = false, onSetPin }) {
  const { t } = useLanguage()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState(setup ? 'set' : 'enter')
  const [error, setError] = useState('')

  const handleUnlock = async () => {
    if (await verifyPin(pin, pinHash)) {
      onUnlock()
      setPin('')
      setError('')
    } else {
      setError(t('pin.wrong'))
      setPin('')
    }
  }

  const handlePasskey = async () => {
    try {
      if (await authenticatePasskey()) onUnlock()
    } catch {
      setError(t('pin.wrong'))
    }
  }

  const handleSet = async () => {
    if (pin.length < 4) return
    if (step === 'set') {
      setStep('confirm')
      setConfirm('')
    } else if (pin === confirm) {
      onSetPin(await hashPin(pin))
      setPin('')
      setConfirm('')
    } else {
      setError(t('pin.wrong'))
      setStep('set')
      setPin('')
    }
  }

  return (
    <div className="pin-gate" role="dialog" aria-label={setup ? t('pin.setTitle') : t('pin.title')}>
      <div className="pin-card card">
        <span className="pin-icon" aria-hidden="true">🔒</span>
        <h2>{setup ? t('pin.setTitle') : t('pin.title')}</h2>
        {error && <p className="pin-error" role="alert">{error}</p>}
        <input
          type="password"
          inputMode="numeric"
          className="bujo-input pin-input"
          maxLength={8}
          value={step === 'confirm' ? confirm : pin}
          onChange={(e) => step === 'confirm' ? setConfirm(e.target.value) : setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setup ? handleSet() : handleUnlock())}
          placeholder="••••"
          autoFocus
          aria-label={t('pin.title')}
        />
        <button
          className="bujo-btn primary full-width"
          onClick={setup ? handleSet : handleUnlock}
        >
          {setup ? (step === 'set' ? t('pin.confirm') : t('pin.confirm')) : t('pin.title')}
        </button>
        {!setup && isPasskeySupported() && hasPasskey() && (
          <button className="bujo-btn ghost full-width" onClick={handlePasskey}>{t('pin.passkey')}</button>
        )}
      </div>
    </div>
  )
}
