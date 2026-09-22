import type { ReactNode } from 'react'
import type { Dict } from '~/lib/i18n/locales'
import { useDict } from '~/lib/i18n/use-dict'
import { LocaleToggle, ThemeToggle } from './preference-controls'

const brandText: Dict<{ mark: string; tagline: string }> = {
  ar: { mark: 'إدارة', tagline: 'نظام موحّد لإدارة المدارس وتتبّع نتائج الطلاب' },
  en: { mark: 'Edara', tagline: 'One system for running schools and tracking student results' },
}

type AuthLayoutProps = {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  /** Distinguishes the two portals at a glance, before anyone types anything. */
  accent: ReactNode
  preferenceLabels: { language: string; theme: string }
  /** Only the login screens pass this — mid-flow screens like OTP verification don't. */
  switcher?: ReactNode
}

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  accent,
  preferenceLabels,
  switcher,
}: AuthLayoutProps) {
  const brand = useDict(brandText)

  return (
    <div className="flex min-h-dvh bg-paper">
      {/* Branding panel — a taste of the dashboard's own dark sidebar, so the
          system feels like one product before anyone even signs in. */}
      <aside className="relative hidden w-[38%] max-w-md shrink-0 overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            color: 'var(--color-sidebar-ink)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-control bg-sidebar-accent text-white">
            {accent}
          </span>
          <p className="text-h2 font-semibold text-sidebar-ink">{brand.mark}</p>
        </div>

        <p className="relative max-w-xs text-display leading-tight font-semibold text-sidebar-ink">{brand.tagline}</p>

        <p className="relative text-micro text-sidebar-muted">© {new Date().getFullYear()}</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-end gap-2 p-4">
          <LocaleToggle label={preferenceLabels.language} />
          <ThemeToggle label={preferenceLabels.theme} />
        </div>

        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="flex w-full max-w-md flex-col gap-6">
            {switcher}

            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-control bg-accent/10 text-accent lg:hidden">
                {accent}
              </span>
              <p className="label-micro">{eyebrow}</p>
              <h1 className="text-display font-semibold text-ink">{title}</h1>
              <p className="text-small text-muted">{subtitle}</p>
            </div>

            <div className="rounded-large border border-line bg-surface p-6 shadow-popover sm:p-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
