import type { Dict } from '~/lib/i18n/locales'

export const currentYearText: Dict<{
  title: string
  description: string
  current: string
  schools: (inSync: number, total: number) => string
  notInSync: string
  pick: string
  apply: string
  readOnly: string
  confirmTitle: string
  confirmBody: (code: string, schools: number) => string
  confirmLabel: string
  cancel: string
  updated: (code: string) => string
  loadFailed: string
}> = {
  ar: {
    title: 'العام الدراسي الحالي',
    description: 'سنة واحدة لكل المدارس. تُستخدم في رفع النتائج وكشوف الطلاب، ولا تستطيع المدرسة تغييرها.',
    current: 'العام الحالي',
    schools: (inSync, total) => `${inSync} من ${total} مدرسة على هذا العام`,
    notInSync: 'بعض المدارس ليست على هذا العام — اضغط «تطبيق» لمزامنتها.',
    pick: 'اختر العام',
    apply: 'تطبيق على كل المدارس',
    readOnly: 'تغييره متاح لمدير المنصة فقط.',
    confirmTitle: 'تغيير العام الدراسي الحالي؟',
    confirmBody: (code, schools) =>
      `سيصبح العام ${code} هو العام الحالي في ${schools} مدرسة، وستُضاف السنة للمدارس التي لا تملكها. رفع النتائج بعد ذلك يذهب إلى هذا العام ما لم يُذكر عام آخر في الملف.`,
    confirmLabel: 'تغيير العام',
    cancel: 'إلغاء',
    updated: (code) => `تم تعيين العام الدراسي الحالي: ${code}.`,
    loadFailed: 'تعذر تحميل العام الدراسي الحالي.',
  },
  en: {
    title: 'Current academic year',
    description: 'One year for every school. Used for result uploads and student statements; a school cannot change it.',
    current: 'Current year',
    schools: (inSync, total) => `${inSync} of ${total} schools are on this year`,
    notInSync: 'Some schools are not on this year — press "Apply" to sync them.',
    pick: 'Pick a year',
    apply: 'Apply to all schools',
    readOnly: 'Only a platform admin can change it.',
    confirmTitle: 'Change the current academic year?',
    confirmBody: (code, schools) =>
      `${code} becomes the current year in ${schools} schools, and is added to schools that do not have it yet. Result uploads after this go to this year unless the file names another.`,
    confirmLabel: 'Change year',
    cancel: 'Cancel',
    updated: (code) => `Current academic year set to ${code}.`,
    loadFailed: 'Could not load the current academic year.',
  },
}
