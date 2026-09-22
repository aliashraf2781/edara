import type { Dict } from '~/lib/i18n/locales'
import type { QualitativeRating, ResultStatus } from '../../api/types'

export const resultsText: Dict<{
  title: string
  description: string
  newResult: string
  filters: { year: string; classroom: string; subject: string; status: string; anyStatus: string }
  columns: {
    student: string
    subject: string
    score: string
    maxScore: string
    status: string
  }
  statuses: Record<ResultStatus, string>
  actions: Record<ResultStatus, string>
  ratings: Record<QualitativeRating, string>
  absent: string
  entryTitle: string
  entryDescription: string
  upsertNotice: string
  fields: {
    enrollment: string
    enrollmentHint: string
    academicYear: string
    subject: string
    score: string
    maxScore: string
    qualitativeRating: string
    isAbsent: string
  }
  saved: string
  emptyTitle: string
  emptyBody: string
  detailTitle: string
  timeline: string
  timelineEmpty: string
  reason: string
  reasonRequired: string
  transitioned: string
  by: string
  teacherNote: string
}> = {
  ar: {
    title: 'النتائج',
    description: 'إدخال الدرجات ومتابعتها عبر مراحل المراجعة حتى النشر.',
    newResult: 'إدخال درجة',
    filters: {
      year: 'العام الدراسي',
      classroom: 'الفصل',
      subject: 'المادة',
      status: 'الحالة',
      anyStatus: 'كل الحالات',
    },
    columns: {
      student: 'الطالب',
      subject: 'المادة',
      score: 'الدرجة',
      maxScore: 'من',
      status: 'الحالة',
    },
    statuses: {
      draft: 'مسودة',
      submitted: 'مُرسلة',
      under_review: 'قيد المراجعة',
      approved: 'معتمدة',
      rejected: 'مرفوضة',
      published: 'منشورة',
    },
    actions: {
      draft: 'إعادة إلى مسودة',
      submitted: 'إرسال للمراجعة',
      under_review: 'بدء المراجعة',
      approved: 'اعتماد',
      rejected: 'رفض',
      published: 'نشر',
    },
    ratings: {
      exceeds_expectations: 'يتجاوز التوقعات',
      meets_expectations: 'يحقق التوقعات',
      sometimes_meets_expectations: 'يحقق التوقعات أحيانًا',
      below_expectations: 'دون التوقعات',
    },
    absent: 'غائب',
    entryTitle: 'إدخال درجة',
    entryDescription: 'تُحفظ الدرجة كمسودة، ثم تمر بمراحل المراجعة.',
    upsertNotice: 'إدخال نفس الطالب والمادة وفترة الامتحان يعدّل المسودة الموجودة ولا يُنشئ سجلًا جديدًا.',
    fields: {
      enrollment: 'معرّف القيد الدراسي',
      enrollmentHint: 'من صفحة الطالب، تبويب القيود الدراسية.',
      academicYear: 'العام الدراسي',
      subject: 'المادة',
      score: 'الدرجة',
      maxScore: 'الدرجة العظمى',
      qualitativeRating: 'المستوى',
      isAbsent: 'الطالب غائب',
    },
    saved: 'تم حفظ الدرجة كمسودة.',
    emptyTitle: 'لا نتائج',
    emptyBody: 'أدخل أول درجة، أو استورد كشفًا من شاشة الاستيراد.',
    detailTitle: 'تفاصيل النتيجة',
    timeline: 'سجل الحالات',
    timelineEmpty: 'لم تتغير حالة هذه النتيجة بعد.',
    reason: 'سبب الرفض',
    reasonRequired: 'اذكر سبب الرفض ليعرف المعلّم ما يصححه.',
    transitioned: 'تم تحديث حالة النتيجة.',
    by: 'بواسطة',
    teacherNote: 'الاعتماد والرفض والنشر من صلاحية الإدارة.',
  },
  en: {
    title: 'Results',
    description: 'Enter marks and move them through review until they are published.',
    newResult: 'Enter a mark',
    filters: {
      year: 'Academic year',
      classroom: 'Classroom',
      subject: 'Subject',
      status: 'Status',
      anyStatus: 'Any status',
    },
    columns: { student: 'Student', subject: 'Subject', score: 'Score', maxScore: 'Out of', status: 'Status' },
    statuses: {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under review',
      approved: 'Approved',
      rejected: 'Rejected',
      published: 'Published',
    },
    actions: {
      draft: 'Return to draft',
      submitted: 'Submit for review',
      under_review: 'Start review',
      approved: 'Approve',
      rejected: 'Reject',
      published: 'Publish',
    },
    ratings: {
      exceeds_expectations: 'Exceeds expectations',
      meets_expectations: 'Meets expectations',
      sometimes_meets_expectations: 'Sometimes meets expectations',
      below_expectations: 'Below expectations',
    },
    absent: 'Absent',
    entryTitle: 'Enter a mark',
    entryDescription: 'The mark is saved as a draft, then moves through review.',
    upsertNotice:
      'Entering the same student, subject and exam period again edits the existing draft — it does not create a second record.',
    fields: {
      enrollment: 'Enrollment ID',
      enrollmentHint: 'From the student’s page, under enrollment history.',
      academicYear: 'Academic year',
      subject: 'Subject',
      score: 'Score',
      maxScore: 'Maximum score',
      qualitativeRating: 'Rating',
      isAbsent: 'Student was absent',
    },
    saved: 'Mark saved as a draft.',
    emptyTitle: 'No results',
    emptyBody: 'Enter the first mark, or bring in a sheet from the Imports screen.',
    detailTitle: 'Result details',
    timeline: 'Status history',
    timelineEmpty: 'This result has not changed status yet.',
    reason: 'Reason for rejection',
    reasonRequired: 'Say why it was rejected, so the teacher knows what to correct.',
    transitioned: 'Result status updated.',
    by: 'by',
    teacherNote: 'Approving, rejecting and publishing are admin actions.',
  },
}
