import type { Dict } from '~/lib/i18n/locales'
import type { GradingType } from '../../api/types'

export const reportsText: Dict<{
  title: string
  description: string
  dashboardTitle: string
  dashboardDescription: string
  publishedOnly: string
  stats: { total: string; passed: string; passRate: string; average: string }
  byGrade: string
  columns: { grade: string; total: string; passed: string; passRate: string; average: string }
  bySubject: string
  bySubjectHint: string
  subjectColumns: {
    subject: string
    gradingType: string
    total: string
    passed: string
    passRate: string
    average: string
  }
  gradingTypes: Record<GradingType, string>
  emptyTitle: string
  emptyBody: string
  noData: string
  openReports: string
}> = {
  ar: {
    title: 'التقارير',
    description: 'ملخص نتائج الترم: نسبة النجاح حسب الصف وحسب المادة.',
    dashboardTitle: 'لوحة المتابعة',
    dashboardDescription: 'نظرة سريعة على نتائج الترم المختار.',
    publishedOnly:
      'تُحتسب النتائج المنشورة فقط. النتائج في المسودة أو قيد المراجعة لا تؤثر على هذه الأرقام.',
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
    bySubject: 'حسب المادة',
    bySubjectHint: 'مواد الصف المختار. مواد الاجتياز بلا متوسط درجات.',
    subjectColumns: {
      subject: 'المادة',
      gradingType: 'نوع التقييم',
      total: 'الإجمالي',
      passed: 'ناجح',
      passRate: 'نسبة النجاح',
      average: 'المتوسط',
    },
    gradingTypes: { numeric: 'درجات', qualitative: 'اجتياز' },
    emptyTitle: 'لا بيانات لعرضها',
    emptyBody: 'لا توجد نتائج منشورة لهذا الترم بعد. ارفع كشف النتائج من شاشة رفع النتائج.',
    noData: 'لا نتائج منشورة',
    openReports: 'فتح التقارير',
  },
  en: {
    title: 'Reports',
    description: 'A summary of one term: pass rate by grade and by subject.',
    dashboardTitle: 'Dashboard',
    dashboardDescription: 'A quick read on the selected term.',
    publishedOnly:
      'Only published results are counted. Results still in draft, submitted or under review will not move these numbers.',
    stats: { total: 'Results counted', passed: 'Passed', passRate: 'Pass rate', average: 'Average' },
    byGrade: 'By grade',
    columns: { grade: 'Grade', total: 'Total', passed: 'Passed', passRate: 'Pass rate', average: 'Average' },
    bySubject: 'By subject',
    bySubjectHint: 'The subjects of the selected grade. Pass/fail subjects carry no average.',
    subjectColumns: {
      subject: 'Subject',
      gradingType: 'Grading',
      total: 'Total',
      passed: 'Passed',
      passRate: 'Pass rate',
      average: 'Average',
    },
    gradingTypes: { numeric: 'Marks', qualitative: 'Pass / fail' },
    emptyTitle: 'Nothing to show',
    emptyBody: 'No results have been published for this term yet. Upload a results sheet first.',
    noData: 'No published results',
    openReports: 'Open reports',
  },
}
