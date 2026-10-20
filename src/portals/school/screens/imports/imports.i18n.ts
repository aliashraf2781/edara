import type { Dict } from '~/lib/i18n/locales'
import type { ImportErrorCode } from '../../api/types'

export const importsText: Dict<{
  title: string
  description: string
  uploadTitle: string
  uploadHint: string
  detectionFailed: string
  termHint: string
  termChecking: string
  termMatch: string
  termUnverified: string
  termMismatch: (detected: string) => string
  termSwitch: (name: string) => string
  termKeep: string
  termUnclear: string
  termNoOptions: string
  termLoadFailed: string
  yearDetectionFailed: string
  file: string
  fileHint: string
  upload: string
  uploading: string
  noFile: string
  processingBanner: string
  successBanner: (students: number, marks: number) => string
  partialBanner: (valid: number, total: number, invalid: number) => string
  summaryTitle: string
  importedResultsHint: (count: number) => string
  studentsCreatedHint: (count: number) => string
  detectedFromSheet: (grade: string | null, term: string | null) => string
  stats: { total: string; valid: string; invalid: string; imported: string }
  errorsTitle: string
  errorColumns: { row: string; code: string; message: string; payload: string }
  showPayload: string
  hidePayload: string
  errorLabels: Record<ImportErrorCode, string>
  startOver: string
  historyTitle: string
  historyEmpty: string
  historyColumns: {
    file: string
    grade: string
    term: string
    students: string
    imported: string
    errors: string
    date: string
  }
}> = {
  ar: {
    title: 'رفع النتائج',
    description: 'اختر الترم ثم ارفع ملف النتائج — السنة والصف تُقرآن من الملف نفسه.',
    uploadTitle: 'رفع النتائج',
    uploadHint: 'اختر الترم الذي تخصه النتائج، ثم اختر الملف (xlsx أو xls أو csv) وارفعه. لا حاجة لاختيار الصف مسبقًا.',
    detectionFailed: 'لم نتمكن من التعرف على الصف من هذا الملف — اختره يدويًا ثم أعد الرفع.',
    termChecking: 'جارٍ التحقق من الترم في الملف…',
    termMatch: 'الملف يطابق الترم المختار.',
    termUnverified: 'تعذر التحقق من الترم من الملف — سيُستخدم الترم الذي اخترته.',
    termMismatch: (detected) => `الملف يبدو أنه يخص ${detected}، لكنك اخترت ترمًا آخر.`,
    termSwitch: (name) => `التبديل إلى ${name}`,
    termKeep: 'سيُستخدم الترم المختار إن تابعت الرفع.',
    termHint: 'يُستخدم الترم الذي تختاره دائمًا، حتى لو بدا أن الملف يخص ترمًا آخر.',
    termUnclear: 'الملف لا يوضح الترم. اختر الترم ثم أعد الرفع.',
    termNoOptions: 'لا توجد أي ترمات في المدرسة بعد. أضف الترم من شاشة الفترات الامتحانية ثم أعد الرفع.',
    termLoadFailed: 'تعذر تحميل الترمات. يمكنك الرفع، وسنطلب منك اختيار الترم إن لم يتضح من الملف.',
    yearDetectionFailed: 'لم نتمكن من التعرف على العام الدراسي من هذا الملف — اختره يدويًا ثم أعد الرفع.',
    file: 'ملف النتائج',
    fileHint: 'xlsx أو xls أو csv، بحد أقصى ١٠ ميجابايت.',
    upload: 'رفع النتائج',
    uploading: 'جارٍ رفع النتائج',
    noFile: 'اختر ملفًا أولًا.',
    processingBanner: 'جارٍ معالجة الملف في الخلفية — قد يستغرق ذلك بضع لحظات لملفات النتائج الكبيرة.',
    successBanner: (students, marks) =>
      `تم رفع نتائج ${students} طالبًا، وتسجيل ${marks} درجة. لا توجد أخطاء.`,
    partialBanner: (valid, total, invalid) =>
      `تم رفع نتائج ${valid} من ${total} طالبًا. ${invalid} يحتاجون تصحيحًا أدناه.`,
    summaryTitle: 'نتيجة الرفع',
    importedResultsHint: (count) => `${count} درجة مادة فردية سُجِّلت ونُشرت.`,
    studentsCreatedHint: (count) =>
      count === 0
        ? ''
        : `تم إنشاء ${count} سجل طالب جديد من أكواد لم تكن موجودة في النظام — راجع بياناتهم لاحقًا.`,
    detectedFromSheet: (grade, term) => {
      const parts = [grade ? `الصف: ${grade}` : null, term ? `الترم: ${term}` : null].filter(Boolean)
      return `تم التعرف عليها من الملف — ${parts.join('، ')}`
    },
    stats: {
      total: 'إجمالي الطلاب',
      valid: 'طلاب بلا أخطاء',
      invalid: 'طلاب يحتاجون تصحيحًا',
      imported: 'درجات مسجَّلة',
    },
    errorsTitle: 'الصفوف التي تحتاج تصحيحًا',
    errorColumns: { row: 'رقم الصف', code: 'نوع الخطأ', message: 'التفاصيل', payload: 'بيانات الصف' },
    showPayload: 'عرض',
    hidePayload: 'إخفاء',
    errorLabels: {
      duplicate_row: 'صف مكرر داخل الملف',
      unknown_student: 'كود الطالب غير موجود',
      not_enrolled: 'الطالب غير مقيّد بهذا الصف',
      invalid_score: 'درجة غير صالحة',
      invalid_rating: 'تقدير غير معروف',
      processing_error: 'خطأ غير متوقع في هذا الصف',
      no_classroom_available: 'لا يوجد فصل لهذا الصف الدراسي لتسجيل الطالب فيه',
    },
    startOver: 'رفع ملف آخر',
    historyTitle: 'آخر عمليات الرفع',
    historyEmpty: 'لم تُرفع أي نتائج بعد.',
    historyColumns: {
      file: 'الملف',
      grade: 'الصف',
      term: 'الترم',
      students: 'الطلاب',
      imported: 'درجات مسجَّلة',
      errors: 'أخطاء',
      date: 'التاريخ',
    },
  },
  en: {
    title: 'Upload results',
    description: 'Pick the term, then upload the results file — the year and grade are read from the file itself.',
    uploadTitle: 'Upload results',
    uploadHint: 'Choose the term the results belong to, then pick the file (xlsx, xls or csv) and upload it. No need to pick a grade first.',
    detectionFailed: "Couldn't detect the grade from this file — pick it manually, then upload again.",
    termChecking: 'Checking the term in the file…',
    termMatch: 'The file matches the selected term.',
    termUnverified: "Couldn't verify the term from the file — the term you picked will be used.",
    termMismatch: (detected) => `The file looks like it is for ${detected}, but you picked a different term.`,
    termSwitch: (name) => `Switch to ${name}`,
    termKeep: 'The term you picked will be used if you upload anyway.',
    termHint: "The term you choose is always used, even if the file looks like it belongs to another term.",
    termUnclear: "The file doesn't say which term it is for. Pick the term, then upload again.",
    termNoOptions: 'This school has no terms yet. Add one on the exam periods screen, then upload again.',
    termLoadFailed: "Couldn't load the terms. You can still upload, and you'll be asked for the term if the file doesn't make it clear.",
    yearDetectionFailed: "Couldn't detect the academic year from this file — pick it manually, then upload again.",
    file: 'Results file',
    fileHint: 'xlsx, xls or csv, 10 MB maximum.',
    upload: 'Upload results',
    uploading: 'Uploading results',
    noFile: 'Choose a file first.',
    processingBanner: 'Processing the file in the background — this can take a few moments for larger result sheets.',
    successBanner: (students, marks) =>
      `${students} students uploaded and ${marks} marks recorded, with no errors.`,
    partialBanner: (valid, total, invalid) =>
      `${valid} of ${total} students uploaded. ${invalid} need correcting below.`,
    summaryTitle: 'Upload result',
    importedResultsHint: (count) => `${count} individual subject marks were recorded and published.`,
    studentsCreatedHint: (count) =>
      count === 0
        ? ''
        : `${count} new student record${count === 1 ? '' : 's'} were created from codes not already in the system — review their details later.`,
    detectedFromSheet: (grade, term) => {
      const parts = [grade ? `Grade: ${grade}` : null, term ? `Term: ${term}` : null].filter(Boolean)
      return `Detected from the file — ${parts.join(', ')}`
    },
    stats: {
      total: 'Students in sheet',
      valid: 'Students with no errors',
      invalid: 'Students needing correction',
      imported: 'Marks recorded',
    },
    errorsTitle: 'Rows that need correction',
    errorColumns: { row: 'Row', code: 'Problem', message: 'Details', payload: 'Row data' },
    showPayload: 'Show',
    hidePayload: 'Hide',
    errorLabels: {
      duplicate_row: 'Duplicate row in this file',
      unknown_student: 'Student code not found',
      not_enrolled: 'Student is not enrolled in this grade',
      invalid_score: 'Score is not a usable mark',
      invalid_rating: 'Unrecognised pass/fail text',
      processing_error: 'Unexpected error on this row',
      no_classroom_available: 'No classroom exists for this grade to enroll the student into',
    },
    startOver: 'Upload another file',
    historyTitle: 'Recent uploads',
    historyEmpty: 'Nothing has been uploaded yet.',
    historyColumns: {
      file: 'File',
      grade: 'Grade',
      term: 'Term',
      students: 'Students',
      imported: 'Marks recorded',
      errors: 'Errors',
      date: 'Date',
    },
  },
}
