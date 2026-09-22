import type { Dict } from '~/lib/i18n/locales'

export const documentsText: Dict<{
  title: string
  description: string
  stepSchool: string
  schoolSearch: string
  changeSchool: string
  stepStudent: string
  studentSearch: string
  changeStudent: string
  noSchoolsTitle: string
  noSchoolsBody: string
  noStudentsTitle: string
  noStudentsBody: string
  actions: {
    title: string
    resultExtract: string
    resultExtractHint: string
    enrollmentStatement: string
    enrollmentStatementHint: string
  }
}> = {
  ar: {
    title: 'المستندات',
    description: 'استخرج بيان قيد أو مستخرج نتيجة رسمي لأي طالب في أي مدرسة.',
    stepSchool: 'الخطوة ١ — اختر المدرسة',
    schoolSearch: 'ابحث بكود المدرسة أو اسمها',
    changeSchool: 'تغيير المدرسة',
    stepStudent: 'الخطوة ٢ — اختر الطالب',
    studentSearch: 'ابحث بكود الطالب أو اسمه',
    changeStudent: 'تغيير الطالب',
    noSchoolsTitle: 'لا توجد مدارس مطابقة',
    noSchoolsBody: 'جرّب اسمًا أو كودًا آخر.',
    noStudentsTitle: 'لا يوجد طلاب مطابقون',
    noStudentsBody: 'جرّب اسمًا أو كودًا آخر.',
    actions: {
      title: 'الخطوة ٣ — اختر المستند',
      resultExtract: 'مستخرج رسمي بالنتيجة',
      resultExtractHint: 'جدول الدرجات الكامل لصف الطالب وترمه.',
      enrollmentStatement: 'بيان قيد',
      enrollmentStatementHint: 'إفادة قيد الطالب بالمدرسة، جاهزة للطباعة.',
    },
  },
  en: {
    title: 'Documents',
    description: 'Generate an enrollment statement or an official result extract for any student in any school.',
    stepSchool: 'Step 1 — choose the school',
    schoolSearch: 'Search by school code or name',
    changeSchool: 'Change school',
    stepStudent: 'Step 2 — choose the student',
    studentSearch: 'Search by student code or name',
    changeStudent: 'Change student',
    noSchoolsTitle: 'No matching schools',
    noSchoolsBody: 'Try a different name or code.',
    noStudentsTitle: 'No matching students',
    noStudentsBody: 'Try a different name or code.',
    actions: {
      title: 'Step 3 — choose the document',
      resultExtract: 'Official result extract',
      resultExtractHint: "The student's full grade table for one term.",
      enrollmentStatement: 'Enrollment statement',
      enrollmentStatementHint: 'Confirms the student is enrolled at the school, ready to print.',
    },
  },
}
