import type { Dict } from '~/lib/i18n/locales'

export const examPeriodsText: Dict<{
  title: string
  description: string
  year: string
  pickYear: string
  noYears: string
  noYearsHint: string
  fields: {
    code: string
    name: string
    term: string
    type: string
    startsOn: string
    endsOn: string
    status: string
    entryOpensAt: string
    entryClosesAt: string
  }
  empty: { title: string; body: string }
  readOnlyEmpty: string
  created: string
  saved: string
  deleted: string
  deleteTitle: string
  deleteConsequence: (label: string) => string
  endBeforeStart: string
}> = {
  ar: {
    title: 'فترات الامتحان',
    description: 'الفترات (مثل الترم الأول) التي تُبنى عليها كشوف النتائج داخل كل عام دراسي.',
    year: 'العام الدراسي',
    pickYear: 'اختر عامًا دراسيًا',
    noYears: 'لا يوجد عام دراسي بعد',
    noYearsHint: 'أضف عامًا دراسيًا من الهيكل الدراسي أولًا.',
    fields: {
      code: 'الكود',
      name: 'الاسم',
      term: 'رقم الترم',
      type: 'النوع',
      startsOn: 'تاريخ البداية',
      endsOn: 'تاريخ النهاية',
      status: 'الحالة',
      entryOpensAt: 'بداية إدخال النتائج',
      entryClosesAt: 'نهاية إدخال النتائج',
    },
    empty: {
      title: 'لا توجد فترات امتحان لهذا العام',
      body: 'أضف فترة مثل «الترم الأول» قبل رفع أي كشف نتائج لهذا العام.',
    },
    readOnlyEmpty: 'لم تُضَف فترات امتحان بعد. إضافتها من صلاحية المدير.',
    created: 'تمت إضافة فترة الامتحان.',
    saved: 'تم حفظ التغييرات.',
    deleted: 'تم الحذف.',
    deleteTitle: 'حذف فترة الامتحان',
    deleteConsequence: (label) =>
      `سيُحذف «${label}». أي نتائج أو كشوف مرتبطة بها قد تصبح غير قابلة للعرض.`,
    endBeforeStart: 'يجب ألا يسبق تاريخ النهاية تاريخ البداية',
  },
  en: {
    title: 'Exam periods',
    description: 'The periods (such as the first term) that result sheets are graded against, within an academic year.',
    year: 'Academic year',
    pickYear: 'Choose an academic year',
    noYears: 'No academic year yet',
    noYearsHint: 'Add an academic year under the academic structure first.',
    fields: {
      code: 'Code',
      name: 'Name',
      term: 'Term number',
      type: 'Type',
      startsOn: 'Starts on',
      endsOn: 'Ends on',
      status: 'Status',
      entryOpensAt: 'Entry opens',
      entryClosesAt: 'Entry closes',
    },
    empty: {
      title: 'No exam periods for this year',
      body: 'Add one, such as “First term”, before uploading any result sheet for this year.',
    },
    readOnlyEmpty: 'No exam periods have been added yet. Adding one is an admin action.',
    created: 'Exam period added.',
    saved: 'Changes saved.',
    deleted: 'Deleted.',
    deleteTitle: 'Delete this exam period',
    deleteConsequence: (label) =>
      `“${label}” will be deleted. Any results or imports linked to it may stop being viewable.`,
    endBeforeStart: 'The end date cannot be before the start date',
  },
}
