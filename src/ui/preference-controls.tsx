import { useTheme } from '~/lib/hooks/use-theme'
import { useLocale } from '~/lib/i18n/locale-context'
import { LOCALE_LABEL } from '~/lib/i18n/locales'
import { Button } from './button'
import { Icon } from './icon'

/** Switches the whole app between ar/rtl and en/ltr, including the API header. */
export function LocaleToggle({ label }: { label: string }) {
  const { locale, setLocale } = useLocale()
  const next = locale === 'ar' ? 'en' : 'ar'

  return (
    <Button variant="ghost" onClick={() => setLocale(next)} aria-label={`${label}: ${LOCALE_LABEL[next]}`}>
      <Icon name="globe" />
      <span className="text-small">{LOCALE_LABEL[next]}</span>
    </Button>
  )
}

export function ThemeToggle({ label }: { label: string }) {
  const { preference, setPreference } = useTheme()
  const isDark = preference === 'dark'

  return (
    <Button
      variant="ghost"
      onClick={() => setPreference(isDark ? 'light' : 'dark')}
      aria-label={label}
      aria-pressed={isDark}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </Button>
  )
}
