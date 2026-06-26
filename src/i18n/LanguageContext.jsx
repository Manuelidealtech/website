import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const languageOptions = [
  { code: 'en', label: 'English', flagSrc: '/flags/gb.svg', locale: 'en-GB' },
  { code: 'it', label: 'Italiano', flagSrc: '/flags/it.svg', locale: 'it-IT' },
  { code: 'tr', label: 'Türkçe', flagSrc: '/flags/tr.svg', locale: 'tr-TR' },
]

const DEFAULT_LANGUAGE = 'it'
const STORAGE_KEY = 'idealtech_language'

const LanguageContext = createContext(null)

function getStoredLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY)
  return languageOptions.some((item) => item.code === storedLanguage)
    ? storedLanguage
    : DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage)

  useEffect(() => {
    const currentLanguage = languageOptions.find((item) => item.code === language)
    document.documentElement.lang = language
    document.documentElement.setAttribute('data-language', language)
    document.documentElement.setAttribute('data-locale', currentLanguage?.locale || 'it-IT')
    window.localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const value = useMemo(() => {
    const currentLanguage = languageOptions.find((item) => item.code === language) || languageOptions[1]

    return {
      language,
      locale: currentLanguage.locale,
      setLanguage: setLanguageState,
      languages: languageOptions,
    }
  }, [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
