export const LOCALES = ['ar', 'en'] as const

export type Locale = (typeof LOCALES)[number]
export type Direction = 'rtl' | 'ltr'

/** Arabic is the default: the primary users are Egyptian school staff. */
export const DEFAULT_LOCALE: Locale = 'ar'

export const LOCALE_LABEL: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
}

export const directionOf = (locale: Locale): Direction => (locale === 'ar' ? 'rtl' : 'ltr')

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

/**
 * One translated shape per locale. Features declare their own, so no screen
 * pulls in strings belonging to another screen.
 */
export type Dict<T> = Record<Locale, T>
