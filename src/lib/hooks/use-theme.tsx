import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'edara.theme'
const THEMES = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof THEMES)[number]

type ThemeContextValue = {
  preference: ThemePreference
  setPreference: (next: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const isPreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value)

const readStored = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isPreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(readStored)

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = preference === 'dark' || (preference === 'system' && media.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }
    apply()
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      /* Preference is session-only when storage is blocked. */
    }
    if (preference !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])

  const value = useMemo(() => ({ preference, setPreference }), [preference])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const value = use(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
