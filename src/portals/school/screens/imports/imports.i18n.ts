import type { Dict } from '~/lib/i18n/locales'
import type { GradingType, ImportErrorCode } from '../../api/types'

export const importsText: Dict<{
  title: string
  description: string
  uploadTitle: string
  file: string
  fileHint: string
  year: string
  preview: string
  previewing: string
  mappingTitle: string
  mappingHint: string
  sheetLabel: string
  sheetSubject: string
  gradingType: string
  columns: string
  mapTo: string
  skip: string
  unmatched: string
  noSubjectsForType: string
  confirm: string
  confirming: string
  back: string
  startOver: string
  previewRowsTitle: string
  gradingTypes: Record<GradingType, string>
  summaryTitle: string
  summary: (valid: number, total: number, invalid: number) => string
  allImported: (valid: number, total: number) => string
  importedResultsHint: (count: number) => string
  stats: { total: string; valid: string; invalid: string; imported: string }
  errorsTitle: string
  errorColumns: { row: string; code: string; message: string; payload: string }
  showPayload: string
  hidePayload: string
  errorLabels: Record<ImportErrorCode, string>
  historyBody: string
  noFile: string
  needMapping: string
}> = {
  ar: {
    title: 'استيراد النتائج',
    description:
      'ارفع كشف المدرسة كما هو — راجع مطابقة الأعمدة بالمواد ثم أكّد الاستيراد. الصفوف الصحيحة تُسجَّل حتى لو احتاج غيرها تصحيحًا.',
    uploadTitle: 'رفع الكشف',
    file: 'ملف الكشف',
    fileHint: 'xlsx أو xls أو csv، بحد أقصى ١٠ ميجابايت. شكل الأعمدة يختلف من صف لآخر — لا يوجد نموذج ثابت.',
    year: 'العام الدراسي',
    preview: 'معاينة المطابقة',
    previewing: 'جارٍ قراءة الكشف',
    mappingTitle: 'تأكيد مطابقة المواد',
    mappingHint:
      'راجع كل مادة في الكشف واختر المادة المقابلة في النظام، أو اتركها بلا مطابقة لتخطيها. لا تتخطَّ هذه الخطوة حتى لو بدت الاقتراحات صحيحة.',
    sheetLabel: 'ورقة الكشف',
    sheetSubject: 'اسم المادة في الكشف',
    gradingType: 'نوع التقييم',
    columns: 'الأعمدة',
    mapTo: 'المادة في النظام',
    skip: 'تخطي هذه المادة',
    unmatched: 'لم تُقترح مطابقة — اختر يدويًا أو أنشئ المادة أولًا',
    noSubjectsForType: 'لا توجد مواد بهذا النوع في الهيكل الدراسي',
    confirm: 'تأكيد الاستيراد',
    confirming: 'جارٍ الاستيراد',
    back: 'تعديل الملف',
    startOver: 'استيراد ملف آخر',
    previewRowsTitle: 'عينة من صفوف الكشف',
    gradingTypes: { numeric: 'بالدرجات', qualitative: 'وصفي' },
    summaryTitle: 'نتيجة الاستيراد',
    summary: (valid, total, invalid) =>
      `تم استيراد ${valid} من ${total} طالبًا. ${invalid} يحتاجون متابعة أدناه.`,
    allImported: (valid, total) => `تم استيراد ${valid} من ${total} طالبًا دون أخطاء.`,
    importedResultsHint: (count) => `${count} نتيجة مادة فردية سُجِّلت كمسودات.`,
    stats: {
      total: 'إجمالي الطلاب',
      valid: 'طلاب بلا أخطاء',
      invalid: 'طلاب يحتاجون متابعة',
      imported: 'نتائج مستوردة',
    },
    errorsTitle: 'الصفوف التي تحتاج تصحيحًا',
    errorColumns: { row: 'رقم الصف', code: 'نوع الخطأ', message: 'التفاصيل', payload: 'بيانات الصف' },
    showPayload: 'عرض',
    hidePayload: 'إخفاء',
    errorLabels: {
      duplicate_row: 'صف مكرر داخل الملف',
      unknown_student: 'كود الطالب غير موجود',
      not_enrolled: 'الطالب غير مسجَّل في العام الدراسي المختار',
      invalid_score: 'درجة غير صالحة وليست علامة غياب',
      invalid_rating: 'تقييم وصفي غير معروف',
    },
    historyBody: 'لا توفّر الواجهة البرمجية قائمة بكل عمليات الاستيراد، لذا يُعرض تقرير هذه العملية فقط.',
    noFile: 'اختر ملفًا أولًا.',
    needMapping: 'طابق مادة واحدة على الأقل قبل التأكيد.',
  },
  en: {
    title: 'Import results',
    description:
      'Upload the school’s own mark sheet as-is — review column-to-subject mapping, then confirm. Valid students are imported even when others need attention.',
    uploadTitle: 'Upload a sheet',
    file: 'Mark sheet',
    fileHint: 'xlsx, xls or csv, 10 MB maximum. Column layout varies — there is no fixed template.',
    year: 'Academic year',
    preview: 'Preview mapping',
    previewing: 'Reading the sheet',
    mappingTitle: 'Confirm subject mapping',
    mappingHint:
      'Review every subject found in the sheet and pick the matching system subject, or leave it unmapped to skip it. Always review — never skip this step even when every suggestion looks right.',
    sheetLabel: 'Sheet',
    sheetSubject: 'Name on the sheet',
    gradingType: 'Grading type',
    columns: 'Columns',
    mapTo: 'System subject',
    skip: 'Skip this subject',
    unmatched: 'No suggestion — pick manually or create the subject first',
    noSubjectsForType: 'No subjects of this grading type exist yet',
    confirm: 'Confirm import',
    confirming: 'Importing',
    back: 'Change file',
    startOver: 'Import another file',
    previewRowsTitle: 'Sample rows from the sheet',
    gradingTypes: { numeric: 'Numeric', qualitative: 'Qualitative' },
    summaryTitle: 'Import result',
    summary: (valid, total, invalid) =>
      `${valid} of ${total} students imported. ${invalid} need attention below.`,
    allImported: (valid, total) => `${valid} of ${total} students imported with no errors.`,
    importedResultsHint: (count) => `${count} individual subject results were saved as drafts.`,
    stats: {
      total: 'Students in sheet',
      valid: 'Students with no errors',
      invalid: 'Students needing attention',
      imported: 'Subject results imported',
    },
    errorsTitle: 'Rows that need correction',
    errorColumns: { row: 'Row', code: 'Problem', message: 'Details', payload: 'Row data' },
    showPayload: 'Show',
    hidePayload: 'Hide',
    errorLabels: {
      duplicate_row: 'Duplicate row in this file',
      unknown_student: 'Student code not found',
      not_enrolled: 'Student not enrolled for the selected academic year',
      invalid_score: 'Score is not a number or a recognised absence marker',
      invalid_rating: 'Unrecognised qualitative rating text',
    },
    historyBody:
      'The API has no endpoint that lists every import, so only this run’s report is shown here.',
    noFile: 'Choose a file first.',
    needMapping: 'Map at least one subject before confirming.',
  },
}
