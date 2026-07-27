import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { t as translate, LANGUAGES, translations } from './translations'
import { loadLanguage, saveLanguage } from '../storage'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => loadLanguage())

  const setLang = useCallback((code) => {
    setLangState(code)
    saveLanguage(code)
    document.documentElement.lang = code
  }, [])

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang])

  const months = useMemo(() => translations[lang]?.months || translations.en.months, [lang])
  const weekdays = useMemo(() => translations[lang]?.weekdays || translations.en.weekdays, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES, months, weekdays }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
