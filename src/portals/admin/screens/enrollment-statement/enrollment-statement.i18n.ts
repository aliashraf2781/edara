import type { Dict } from '~/lib/i18n/locales'

export const statementText: Dict<{
  loading: string
  back: string
  fill: string
  print: string
  dialog: {
    title: string
    description: string
    studentSection: string
    issueSection: string
    grade: string
    gradePlaceholder: string
    schoolName: string
    studentName: string
    registrationNo: string
    yearFrom: string
    yearTo: string
    yearNote: string
    yearNoteHint: string
    issueDate: string
    issueDateHint: string
    transferNumber: string
    amount: string
    transferDate: string
    submittedTo: string
    submittedToPlaceholder: string
    day: string
    month: string
    year: string
    apply: string
    reset: string
    print: string
  }
}> = {
  ar: {
    loading: 'جارٍ تجهيز بيان القيد…',
    back: 'رجوع',
    fill: 'تعبئة البيانات',
    print: 'طباعة',
    dialog: {
      title: 'بيانات بيان القيد',
      description:
        'بيانات الطالب مُعبّأة من سجلات المدرسة ويمكن تعديلها. أكمل التاريخ والحوالة والجهة؛ أي خانة تُترك فارغة تبقى للكتابة بخط اليد، وكذلك التوقيعات.',
      studentSection: 'بيانات الطالب',
      issueSection: 'بيانات الاستخراج',
      grade: 'الصف',
      gradePlaceholder: 'مثال: الرابع الابتدائي',
      schoolName: 'المدرسة',
      studentName: 'اسم الطالب',
      registrationNo: 'رقم القيد',
      yearFrom: 'العام الدراسي من',
      yearTo: 'إلى',
      yearNote: 'عام (   )',
      yearNoteHint: 'الخانة بين القوسين بعد العام الدراسي.',
      issueDate: 'تاريخ البيان',
      issueDateHint: 'يوم / شهر / سنة — يظهر أعلى الصفحة.',
      transferNumber: 'رقم الحوالة',
      amount: 'المبلغ',
      transferDate: 'تاريخ الحوالة',
      submittedTo: 'وذلك لتقديمه إلى',
      submittedToPlaceholder: 'الجهة المقدَّم إليها البيان',
      day: 'يوم',
      month: 'شهر',
      year: 'سنة',
      apply: 'حفظ على البيان',
      reset: 'إعادة الضبط',
      print: 'طباعة',
    },
  },
  en: {
    loading: 'Preparing the enrollment statement…',
    back: 'Back',
    fill: 'Fill in details',
    print: 'Print',
    dialog: {
      title: 'Enrollment statement details',
      description:
        'Student details come from the school’s records and can be edited. Add the date, transfer and destination; any slot left empty stays for handwriting, as do the signatures.',
      studentSection: 'Student',
      issueSection: 'Issue',
      grade: 'Grade',
      gradePlaceholder: 'e.g. الرابع الابتدائي',
      schoolName: 'School',
      studentName: 'Student name',
      registrationNo: 'Registration number',
      yearFrom: 'Academic year from',
      yearTo: 'To',
      yearNote: 'عام (   )',
      yearNoteHint: 'The bracketed slot after the academic year.',
      issueDate: 'Statement date',
      issueDateHint: 'Day / month / year — printed at the top of the page.',
      transferNumber: 'Transfer number',
      amount: 'Amount',
      transferDate: 'Transfer date',
      submittedTo: 'Submitted to',
      submittedToPlaceholder: 'The body the statement is for',
      day: 'Day',
      month: 'Month',
      year: 'Year',
      apply: 'Apply to the statement',
      reset: 'Reset',
      print: 'Print',
    },
  },
}
