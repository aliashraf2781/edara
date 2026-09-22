import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'
import { useLocale } from '~/lib/i18n/locale-context'
import type { Dict } from '~/lib/i18n/locales'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Icon } from '~/ui/icon'

const errorText: Dict<{
  notFoundTitle: string
  notFoundBody: string
  title: string
  body: string
  reload: string
  goHome: string
  details: string
}> = {
  ar: {
    notFoundTitle: 'الصفحة غير موجودة',
    notFoundBody: 'الرابط الذي فتحته غير صحيح أو لم يعد متاحًا.',
    title: 'حدث خطأ غير متوقع',
    body: 'تعذّر عرض هذه الشاشة. أعد تحميل الصفحة، وإن تكرر الخطأ فأبلغ فريق الدعم.',
    reload: 'إعادة تحميل الصفحة',
    goHome: 'العودة للبداية',
    details: 'تفاصيل تقنية',
  },
  en: {
    notFoundTitle: 'Page not found',
    notFoundBody: 'The link you opened is wrong or no longer available.',
    title: 'Something went wrong',
    body: 'This screen could not be displayed. Reload the page, and if it keeps happening, tell the support team.',
    reload: 'Reload page',
    goHome: 'Back to start',
    details: 'Technical details',
  },
}

/**
 * The route tree's catch-all: every top-level portal route points its
 * `errorElement` here, so a thrown render error never falls through to the
 * framework's bare, unbranded crash screen.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { direction } = useLocale()
  const text = useDict(errorText)

  const isNotFound = isRouteErrorResponse(error) && error.status === 404
  const detail =
    isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.stack ?? error.message : null

  return (
    <div dir={direction} className="flex min-h-dvh items-center justify-center bg-paper px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-large border border-line bg-surface p-8 text-center shadow-popover">
        <span className="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Icon name="alert" className="size-7" />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="text-h1 font-semibold text-ink">{isNotFound ? text.notFoundTitle : text.title}</h1>
          <p className="text-small text-muted">{isNotFound ? text.notFoundBody : text.body}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="primary" onClick={() => window.location.reload()}>
            <Icon name="refresh" />
            {text.reload}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {text.goHome}
          </Button>
        </div>

        {import.meta.env.DEV && detail ? (
          <details className="w-full text-start">
            <summary className="cursor-pointer text-small font-medium text-muted">{text.details}</summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded-input bg-sunken p-3 text-micro whitespace-pre-wrap text-danger">
              {detail}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  )
}
