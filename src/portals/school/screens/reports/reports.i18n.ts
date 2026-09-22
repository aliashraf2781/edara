import type { Dict } from '~/lib/i18n/locales'

export const reportsText: Dict<{
  title: string
  description: string
  dashboardTitle: string
  dashboardDescription: string
  publishedOnly: string
  pickPeriod: string
  year: string
  pickYear: string
  stats: { total: string; passed: string; passRate: string; average: string }
  byGrade: string
  columns: { grade: string; total: string; passed: string; passRate: string; average: string }
  emptyTitle: string
  emptyBody: string
  noData: string
  openReports: string
}> = {
  ar: {
    title: 'التقارير',
    description: 'ملخص النتائج لفترة امتحان واحدة.',
    dashboardTitle: 'لوحة المتابعة',
    dashboardDescription: 'نظرة سريعة على نتائج فترة الامتحان المختارة.',
    publishedOnly:
      'تُحتسب النتائج المنشورة فقط. النتائج في المسودة أو قيد المراجعة لا تؤثر على هذه الأرقام.',
    pickPeriod: 'اختر فترة الامتحان لعرض الملخص.',
    year: 'العام الدراسي',
    pickYear: 'اختر عامًا دراسيًا',
    stats: {
      total: 'إجمالي النتائج',
      passed: 'ناجح',
      passRate: 'نسبة النجاح',
      average: 'المتوسط',
    },
    byGrade: 'حسب الصف',
    columns: {
      grade: 'الصف',
      total: 'الإجمالي',
      passed: 'ناجح',
      passRate: 'نسبة النجاح',
      average: 'المتوسط',
    },
    emptyTitle: 'لا بيانات لعرضها',
    emptyBody: 'لا توجد نتائج منشورة لفترة الامتحان هذه بعد.',
    noData: 'لا نتائج منشورة',
    openReports: 'فتح التقارير',
  },
  en: {
    title: 'Reports',
    description: 'A summary of results for one exam period.',
    dashboardTitle: 'Dashboard',
    dashboardDescription: 'A quick read on the selected exam period.',
    publishedOnly:
      'Only published results are counted. Results still in draft, submitted or under review will not move these numbers.',
    pickPeriod: 'Choose an exam period to see the summary.',
    year: 'Academic year',
    pickYear: 'Choose an academic year',
    stats: { total: 'Results counted', passed: 'Passed', passRate: 'Pass rate', average: 'Average' },
    byGrade: 'By grade',
    columns: { grade: 'Grade', total: 'Total', passed: 'Passed', passRate: 'Pass rate', average: 'Average' },
    emptyTitle: 'Nothing to show',
    emptyBody: 'No results have been published for this exam period yet.',
    noData: 'No published results',
    openReports: 'Open reports',
  },
}
