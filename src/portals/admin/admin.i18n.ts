import type { Dict } from '~/lib/i18n/locales'

export const adminText: Dict<{
  portal: string
  nav: {
    schools: string
    users: string
    roles: string
    audit: string
    profile: string
    comingSoon: string
    groups: { overview: string; access: string; account: string }
  }
  header: { signOut: string; theme: string; language: string; menu: string }
  guard: { loading: string; signedOut: string; noAccess: string }
  error: { title: string; retry: string; rateLimited: (seconds: number) => string }
  common: {
    cancel: string
    save: string
    create: string
    close: string
    search: string
    previous: string
    next: string
    pageSummary: (page: number, pages: number, total: number) => string
  }
}> = {
  ar: {
    portal: 'إدارة المنصة',
    nav: {
      schools: 'المدارس',
      users: 'مستخدمين المنصة',
      roles: 'الأدوار',
      audit: 'سجل التدقيق',
      profile: 'حسابي',
      comingSoon: 'قريبًا',
      groups: { overview: 'نظرة عامة', access: 'الوصول والصلاحيات', account: 'الحساب' },
    },
    header: { signOut: 'تسجيل الخروج', theme: 'المظهر', language: 'اللغة', menu: 'القائمة' },
    guard: {
      loading: 'جارٍ فتح لوحة الإدارة',
      signedOut: 'انتهت الجلسة',
      noAccess: 'هذه الشاشة غير متاحة بصلاحياتك الحالية.',
    },
    error: {
      title: 'تعذّر تحميل البيانات',
      retry: 'إعادة المحاولة',
      rateLimited: (seconds) => `طلبات كثيرة. أعد المحاولة بعد ${seconds} ثانية`,
    },
    common: {
      cancel: 'إلغاء',
      save: 'حفظ التغييرات',
      create: 'إنشاء',
      close: 'إغلاق',
      search: 'بحث',
      previous: 'السابق',
      next: 'التالي',
      pageSummary: (page, pages, total) => `صفحة ${page} من ${pages} — ${total} سجل`,
    },
  },
  en: {
    portal: 'Platform administration',
    nav: {
      schools: 'Schools',
      users: 'Global users',
      roles: 'Roles',
      audit: 'Audit log',
      profile: 'My profile',
      comingSoon: 'Coming soon',
      groups: { overview: 'Overview', access: 'Access control', account: 'Account' },
    },
    header: { signOut: 'Sign out', theme: 'Theme', language: 'Language', menu: 'Menu' },
    guard: {
      loading: 'Opening the admin portal',
      signedOut: 'Session ended',
      noAccess: 'This screen is not available with your current permissions.',
    },
    error: {
      title: 'This could not be loaded',
      retry: 'Try again',
      rateLimited: (seconds) => `Too many requests. Try again in ${seconds} seconds.`,
    },
    common: {
      cancel: 'Cancel',
      save: 'Save changes',
      create: 'Create',
      close: 'Close',
      search: 'Search',
      previous: 'Previous',
      next: 'Next',
      pageSummary: (page, pages, total) => `Page ${page} of ${pages} — ${total} records`,
    },
  },
}
