import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LOCALE, directionOf, isLocale, type Direction, type Locale } from './locales'

const STORAGE_KEY = 'edara.locale'

type LocaleContextValue = {
  locale: Locale
  direction: Direction
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const readStoredLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(readStoredLocale)
  const direction = directionOf(locale)

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = direction
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* Private mode: the language still applies for this session. */
    }
  }, [locale, direction])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, direction, setLocale: setLocaleState }),
    [locale, direction],
  )

  return <LocaleContext value={value}>{children}</LocaleContext>
}

export function useLocale(): LocaleContextValue {
  const value = use(LocaleContext)
  if (!value) throw new Error('useLocale must be used inside <LocaleProvider>')
  return value
}
