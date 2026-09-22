import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { LocaleProvider } from '~/lib/i18n/locale-context'
import { ThemeProvider } from '~/lib/hooks/use-theme'
import { ToastProvider } from '~/ui/toast'
import { createQueryClient } from './query-client'

export function AppProviders({ children }: { children: ReactNode }) {
  // Created once per app load, never on re-render.
  const [queryClient] = useState(createQueryClient)

  return (
    <LocaleProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </LocaleProvider>
  )
}
