import type { Dict } from '~/lib/i18n/locales'
import type { Gender } from '../../api/types'

export const studentsText: Dict<{
  title: string
  description: string
  searchLabel: string
  newStudent: string
  columns: {
    code: string
    name: string
    nationalId: string
    gender: string
    guardian: string
  }
  fields: {
    studentCode: string
    nationalId: string
    firstName: string
    fatherName: string
    familyName: string
    gender: string
    birthDate: string
    guardianName: string
    guardianPhone: string
  }
  genders: Record<Gender, string>
  createTitle: string
  editTitle: string
  created: string
  saved: string
  deleted: string
  deleteTitle: string
  deleteConsequence: (name: string) => string
  emptyTitle: string
  emptyBody: string
  noResultsTitle: string
  noResultsBody: string
  detail: string
  enrollments: {
    title: string
    description: string
    enroll: string
    year: string
    grade: string
    classroom: string
    enrolledOn: string
    empty: string
    emptyBody: string
    enrolled: string
  }
}> = {
  ar: {
    title: 'الطلاب',
    description: 'سجل طلاب المدرسة. الصف والفصل يُسجَّلان كقيد دراسي وليس كحقل ثابت.',
    searchLabel: 'ابحث بالكود أو الرقم القومي أو الاسم',
    newStudent: 'طالب جديد',
    columns: {
      code: 'كود الطالب',
      name: 'الاسم',
      nationalId: 'الرقم القومي',
      gender: 'النوع',
      guardian: 'ولي الأمر',
    },
    fields: {
      studentCode: 'كود الطالب',
      nationalId: 'الرقم القومي',
      firstName: 'الاسم الأول',
      fatherName: 'اسم الأب',
      familyName: 'اسم العائلة',
      gender: 'النوع',
      birthDate: 'تاريخ الميلاد',
      guardianName: 'اسم ولي الأمر',
      guardianPhone: 'هاتف ولي الأمر',
    },
    genders: { male: 'ذكر', female: 'أنثى' },
    createTitle: 'طالب جديد',
    editTitle: 'تعديل بيانات الطالب',
    created: 'تمت إضافة الطالب.',
    saved: 'تم حفظ البيانات.',
    deleted: 'تم حذف الطالب.',
    deleteTitle: 'حذف الطالب',
    deleteConsequence: (name) => `سيُحذف «${name}» من سجل المدرسة مع الاحتفاظ ببياناته في الخادم.`,
    emptyTitle: 'لا طلاب بعد',
    emptyBody: 'أضف أول طالب، ثم سجّله في فصل من صفحته.',
    noResultsTitle: 'لا نتائج مطابقة',
    noResultsBody: 'جرّب كودًا أو اسمًا آخر.',
    detail: 'بيانات الطالب',
    enrollments: {
      title: 'القيود الدراسية',
      description: 'المكان الوحيد الذي يُسنَد فيه الصف والفصل للطالب.',
      enroll: 'تسجيل في فصل',
      year: 'العام الدراسي',
      grade: 'الصف',
      classroom: 'الفصل',
      enrolledOn: 'تاريخ التسجيل',
      empty: 'لا قيود دراسية',
      emptyBody: 'سجّل الطالب في فصل ليظهر في كشوف النتائج.',
      enrolled: 'تم تسجيل الطالب.',
    },
  },
  en: {
    title: 'Students',
    description:
      'The school’s student roll. Grade and classroom are tracked as enrollment history, not as a fixed field.',
    searchLabel: 'Search by code, national ID or name',
    newStudent: 'New student',
    columns: {
      code: 'Student code',
      name: 'Name',
      nationalId: 'National ID',
      gender: 'Gender',
      guardian: 'Guardian',
    },
    fields: {
      studentCode: 'Student code',
      nationalId: 'National ID',
      firstName: 'First name',
      fatherName: 'Father’s name',
      familyName: 'Family name',
      gender: 'Gender',
      birthDate: 'Date of birth',
      guardianName: 'Guardian’s name',
      guardianPhone: 'Guardian’s phone',
    },
    genders: { male: 'Male', female: 'Female' },
    createTitle: 'New student',
    editTitle: 'Edit student',
    created: 'Student added.',
    saved: 'Details saved.',
    deleted: 'Student deleted.',
    deleteTitle: 'Delete this student',
    deleteConsequence: (name) =>
      `“${name}” is removed from the school roll. Their records are kept on the server.`,
    emptyTitle: 'No students yet',
    emptyBody: 'Add the first student, then enroll them in a classroom from their page.',
    noResultsTitle: 'No matching students',
    noResultsBody: 'Try a different code or name.',
    detail: 'Student details',
    enrollments: {
      title: 'Enrollment history',
      description: 'The only place a student is assigned a grade and classroom.',
      enroll: 'Enroll in a classroom',
      year: 'Academic year',
      grade: 'Grade',
      classroom: 'Classroom',
      enrolledOn: 'Enrolled on',
      empty: 'No enrollments',
      emptyBody: 'Enroll this student in a classroom so they appear in result sheets.',
      enrolled: 'Student enrolled.',
    },
  },
}
