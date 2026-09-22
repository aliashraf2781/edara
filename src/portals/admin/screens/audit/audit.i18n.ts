import type { Dict } from '~/lib/i18n/locales'

export const auditText: Dict<{
  title: string
  description: string
  pendingTitle: string
  pendingBody: string
}> = {
  ar: {
    title: 'سجل التدقيق',
    description: 'سجل بمن غيّر ماذا ومتى عبر المنصة.',
    pendingTitle: 'لم يُفعَّل بعد',
    pendingBody:
      'واجهة سجل التدقيق غير متاحة في الخادم حتى الآن. ستظهر السجلات هنا فور إتاحتها.',
  },
  en: {
    title: 'Audit log',
    description: 'A record of who changed what, and when, across the platform.',
    pendingTitle: 'Not available yet',
    pendingBody:
      'The audit log endpoint is not live on the server yet. Entries will appear here as soon as it is.',
  },
}
