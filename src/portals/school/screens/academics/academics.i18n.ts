import type { Dict } from '~/lib/i18n/locales'
import type { GradingType } from '../../api/types'

export const academicsText: Dict<{
  title: string
  description: string
  tabs: {
    years: string
    stages: string
    grades: string
    classrooms: string
    subjects: string
  }
  fields: {
    code: string
    name: string
    startsOn: string
    endsOn: string
    isCurrent: string
    sortOrder: string
    stage: string
    grade: string
    academicYear: string
    level: string
    capacity: string
    gradingType: string
    maxScore: string
    passScore: string
  }
  gradingTypes: Record<GradingType, string>
  gradingTypeHint: string
  nameLockedHint: string
  empty: Record<'years' | 'stages' | 'grades' | 'classrooms' | 'subjects', { title: string; body: string }>
  readOnlyEmpty: string
  created: string
  saved: string
  deleted: string
  deleteTitle: string
  deleteConsequence: (label: string) => string
  pickStage: string
  pickGrade: string
  pickYear: string
  current: string
}> = {
  ar: {
    title: 'الهيكل الدراسي',
    description: 'الأعوام والمراحل والصفوف والفصول والمواد التي تبنى عليها النتائج.',
    tabs: {
      years: 'الأعوام الدراسية',
      stages: 'المراحل التعليمية',
      grades: 'الصفوف',
      classrooms: 'الفصول',
      subjects: 'المواد',
    },
    fields: {
      code: 'الكود',
      name: 'الاسم',
      startsOn: 'تاريخ البداية',
      endsOn: 'تاريخ النهاية',
      isCurrent: 'العام الحالي',
      sortOrder: 'ترتيب العرض',
      stage: 'المرحلة التعليمية',
      grade: 'الصف',
      academicYear: 'العام الدراسي',
      level: 'المستوى',
      capacity: 'السعة',
      gradingType: 'نوع التقييم',
      maxScore: 'الدرجة العظمى',
      passScore: 'درجة النجاح',
    },
    gradingTypes: { numeric: 'بالدرجات', qualitative: 'وصفي' },
    gradingTypeHint: 'المواد الوصفية تُقيَّم بمستوى (يتجاوز التوقعات … دون التوقعات) بدلًا من درجة رقمية.',
    nameLockedHint: 'اسم المادة مشترك بين كل الصفوف التي تُدرَّس فيها، ولا يمكن تعديله من هنا.',
    empty: {
      years: { title: 'لا أعوام دراسية', body: 'أضف العام الدراسي أولًا — كل شيء آخر يرتبط به.' },
      stages: { title: 'لا مراحل تعليمية', body: 'أضف المراحل مثل الابتدائي والإعدادي.' },
      grades: { title: 'لا صفوف', body: 'أضف صفوف كل مرحلة تعليمية.' },
      classrooms: { title: 'لا فصول', body: 'أضف فصول كل صف في العام الدراسي.' },
      subjects: { title: 'لا مواد', body: 'أضف المواد بدرجاتها العظمى ودرجات النجاح.' },
    },
    readOnlyEmpty: 'لم يُضَف شيء بعد. إضافة هذه البيانات من صلاحية المدير.',
    created: 'تمت الإضافة.',
    saved: 'تم حفظ التغييرات.',
    deleted: 'تم الحذف.',
    deleteTitle: 'حذف السجل',
    deleteConsequence: (label) =>
      `سيُحذف «${label}». أي بيانات مرتبطة به قد تصبح غير قابلة للعرض.`,
    pickStage: 'كل المراحل',
    pickGrade: 'كل الصفوف',
    pickYear: 'كل الأعوام',
    current: 'الحالي',
  },
  en: {
    title: 'Academic structure',
    description: 'The years, stages, grades, classrooms and subjects that results are built on.',
    tabs: {
      years: 'Academic years',
      stages: 'Educational stages',
      grades: 'Grades',
      classrooms: 'Classrooms',
      subjects: 'Subjects',
    },
    fields: {
      code: 'Code',
      name: 'Name',
      startsOn: 'Starts on',
      endsOn: 'Ends on',
      isCurrent: 'Current year',
      sortOrder: 'Display order',
      stage: 'Educational stage',
      grade: 'Grade',
      academicYear: 'Academic year',
      level: 'Level',
      capacity: 'Capacity',
      gradingType: 'Grading type',
      maxScore: 'Maximum score',
      passScore: 'Pass score',
    },
    gradingTypes: { numeric: 'Numeric', qualitative: 'Qualitative' },
    gradingTypeHint:
      'Qualitative subjects are rated on a band (exceeds expectations … below expectations) instead of a numeric score.',
    nameLockedHint: "This subject's name is shared across every grade that offers it, and can't be edited from here.",
    empty: {
      years: { title: 'No academic years', body: 'Add the academic year first — everything else hangs off it.' },
      stages: { title: 'No educational stages', body: 'Add stages such as Primary and Preparatory.' },
      grades: { title: 'No grades', body: 'Add the grades belonging to each educational stage.' },
      classrooms: { title: 'No classrooms', body: 'Add each grade’s classrooms for the academic year.' },
      subjects: { title: 'No subjects', body: 'Add subjects with their maximum and pass scores.' },
    },
    readOnlyEmpty: 'Nothing has been added yet. Adding these records is an admin action.',
    created: 'Added.',
    saved: 'Changes saved.',
    deleted: 'Deleted.',
    deleteTitle: 'Delete this record',
    deleteConsequence: (label) =>
      `“${label}” will be deleted. Anything linked to it may stop being viewable.`,
    pickStage: 'All stages',
    pickGrade: 'All grades',
    pickYear: 'All years',
    current: 'Current',
  },
}
