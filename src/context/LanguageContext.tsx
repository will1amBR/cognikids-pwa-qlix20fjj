import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AppLanguage } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { translations, TranslationKey } from '@/lib/i18n/translations'
import pb from '@/lib/pocketbase/client'

interface LanguageContextType {
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => Promise<void>
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  languages: typeof SUPPORTED_LANGUAGES
  currentLanguageOption: (typeof SUPPORTED_LANGUAGES)[0]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'cognikids_ui_language'

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    // 1. Local storage preference
    const stored = localStorage.getItem(STORAGE_KEY) as AppLanguage | null
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      return stored
    }
    // 2. User record preference if loaded
    const userPref = pb.authStore.record?.preferred_language as AppLanguage | undefined
    if (userPref && SUPPORTED_LANGUAGES.some((l) => l.code === userPref)) {
      return userPref
    }
    // 3. Browser language detection
    if (typeof navigator !== 'undefined' && navigator.language) {
      const navLang = navigator.language.toLowerCase()
      if (navLang.startsWith('pt')) return 'pt-BR'
      if (navLang.startsWith('en')) return 'en'
      if (navLang.startsWith('es')) return 'es'
      if (navLang.startsWith('de')) return 'de'
      if (navLang.startsWith('fr')) return 'fr'
    }
    // Fallback default
    return 'pt-BR'
  })

  // Sync with auth user preferred_language on login
  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.record?.preferred_language) {
      const userLang = pb.authStore.record.preferred_language as AppLanguage
      if (SUPPORTED_LANGUAGES.some((l) => l.code === userLang) && userLang !== language) {
        setLanguageState(userLang)
        localStorage.setItem(STORAGE_KEY, userLang)
      }
    }
  }, [])

  const setLanguage = async (newLang: AppLanguage) => {
    setLanguageState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)

    // Save to user profile in background if logged in
    if (pb.authStore.isValid && pb.authStore.record?.id) {
      try {
        await pb.collection('users').update(pb.authStore.record.id, {
          preferred_language: newLang,
        })
      } catch (err) {
        console.warn('Could not persist preferred_language on user record', err)
      }
    }
  }

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations['pt-BR']
    let text = langDict[key] || translations['pt-BR'][key] || key

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(value))
      })
    }
    return text
  }

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
