import type { Dict } from '~/lib/i18n/locales'
import type { SchoolRole } from './api/roles'

export const schoolText: Dict<{
  portal: string
  nav: {
    dashboard: string
    academics: string
    examPeriods: string
    students: string
    results: string
    imports: string
    reports: string
    staff: string
    profile: string
    groups: { overview: string; academic: string; data: string; team: string; account: string }
  }
  header: { signOut: string; theme: string; language: string; menu: string }
  guard: { loading: string; noAccess: string }
  error: { title: string; retry: string; rateLimited: (seconds: number) => string }
  common: {
    cancel: string
    save: string
    create: string
    edit: string
    delete: string
    close: string
    search: string
    previous: string
    next: string
    none: string
    pageSummary: (page: number, pages: number, total: number) => string
  }
  roles: Record<SchoolRole, string>
  roleDescriptions: Record<SchoolRole, string>
  examPeriodField: {
    label: string
    placeholder: string
    pickYearFirst: string
    empty: string
    code: string
    name: string
    term: string
    create: string
    created: string
    quickCreateNeeded: string
  }
}> = {
  ar: {
    portal: 'بوابة المدرسة',
    nav: {
      dashboard: 'لوحة المتابعة',
      academics: 'الهيكل الدراسي',
      examPeriods: 'فترات الامتحان',
      students: 'الطلاب',
      results: 'النتائج',
      imports: 'الاستيراد',
      reports: 'التقارير',
      staff: 'حسابات الطاقم',
      profile: 'حسابي',
      groups: {
        overview: 'نظرة عامة',
        academic: 'السجل الأكاديمي',
        data: 'البيانات',
        team: 'الطاقم',
        account: 'الحساب',
      },
    },
    header: { signOut: 'تسجيل الخروج', theme: 'المظهر', language: 'اللغة', menu: 'القائمة' },
    guard: { loading: 'جارٍ فتح بوابة المدرسة', noAccess: 'هذه الشاشة غير متاحة لدورك.' },
    error: {
      title: 'تعذّر تحميل البيانات',
      retry: 'إعادة المحاولة',
      rateLimited: (seconds) => `طلبات كثيرة. أعد المحاولة بعد ${seconds} ثانية`,
    },
    common: {
      cancel: 'إلغاء',
      save: 'حفظ التغييرات',
      create: 'إضافة',
      edit: 'تعديل',
      delete: 'حذف',
      close: 'إغلاق',
      search: 'بحث',
      previous: 'السابق',
      next: 'التالي',
      none: '—',
      pageSummary: (page, pages, total) => `صفحة ${page} من ${pages} — ${total} سجل`,
    },
    roles: {
      'school-super-admin': 'مدير عام',
      'school-admin': 'مدير',
      'school-teacher': 'معلّم',
      'school-data-entry': 'مُدخل بيانات',
    },
    roleDescriptions: {
      'school-super-admin': 'كل الصلاحيات، بما فيها إدارة حسابات الطاقم.',
      'school-admin': 'كل الصلاحيات عدا إدارة حسابات الطاقم.',
      'school-teacher':
        'إضافة الطلاب وتسجيلهم وإدخال النتائج والاستيراد والتقارير. لا يعدّل الهيكل الدراسي ولا يعتمد النتائج.',
      'school-data-entry':
        'نفس صلاحيات المعلّم: إدخال البيانات والنتائج دون تعديل الهيكل الدراسي أو اعتماد النتائج.',
    },
    examPeriodField: {
      label: 'فترة الامتحان',
      placeholder: 'اختر فترة الامتحان',
      pickYearFirst: 'اختر العام الدراسي أولًا.',
      empty: 'لا توجد فترة امتحان لهذا العام الدراسي بعد.',
      code: 'الكود',
      name: 'الاسم',
      term: 'رقم الترم',
      create: 'إضافة فترة امتحان',
      created: 'تمت إضافة فترة الامتحان.',
      quickCreateNeeded: 'أدخل الكود والاسم على الأقل.',
    },
  },
  en: {
    portal: 'School portal',
    nav: {
      dashboard: 'Dashboard',
      academics: 'Academic structure',
      examPeriods: 'Exam periods',
      students: 'Students',
      results: 'Results',
      imports: 'Imports',
      reports: 'Reports',
      staff: 'Staff accounts',
      profile: 'My profile',
      groups: {
        overview: 'Overview',
        academic: 'Academic records',
        data: 'Data',
        team: 'Team',
        account: 'Account',
      },
    },
    header: { signOut: 'Sign out', theme: 'Theme', language: 'Language', menu: 'Menu' },
    guard: { loading: 'Opening the school portal', noAccess: 'This screen is not available to your role.' },
    error: {
      title: 'This could not be loaded',
      retry: 'Try again',
      rateLimited: (seconds) => `Too many requests. Try again in ${seconds} seconds.`,
    },
    common: {
      cancel: 'Cancel',
      save: 'Save changes',
      create: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      search: 'Search',
      previous: 'Previous',
      next: 'Next',
      none: '—',
      pageSummary: (page, pages, total) => `Page ${page} of ${pages} — ${total} records`,
    },
    roles: {
      'school-super-admin': 'Super admin',
      'school-admin': 'Admin',
      'school-teacher': 'Teacher',
      'school-data-entry': 'Data entry',
    },
    roleDescriptions: {
      'school-super-admin': 'Everything, including managing staff accounts.',
      'school-admin': 'Everything except managing staff accounts.',
      'school-teacher':
        'Add and enroll students, enter results, run imports, view reports. Cannot edit the academic structure or approve results.',
      'school-data-entry':
        'The same as a teacher: enter students and results, without editing structure or approving results.',
    },
    examPeriodField: {
      label: 'Exam period',
      placeholder: 'Choose an exam period',
      pickYearFirst: 'Choose the academic year first.',
      empty: 'This academic year has no exam period yet.',
      code: 'Code',
      name: 'Name',
      term: 'Term number',
      create: 'Add exam period',
      created: 'Exam period added.',
      quickCreateNeeded: 'Enter at least a code and a name.',
    },
  },
}
