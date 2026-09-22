import type { Dict } from '~/lib/i18n/locales'
import type { GradingType, ImportErrorCode } from '../../api/types'

export const importsText: Dict<{
  title: string
  description: string
  chooseTitle: string
  howTitle: string
  howSteps: readonly string[]
  columnsTitle: string
  columnsHint: string
  columnHeaders: { order: string; subject: string; gradingType: string; max: string; pass: string }
  gradingTypes: Record<GradingType, string>
  download: string
  downloadingRoster: string
  downloaded: string
  pickBoth: string
  rosterEmpty: string
  studentCount: (count: number) => string
  uploadTitle: string
  uploadHint: string
  file: string
  fileHint: string
  upload: string
  uploading: string
  noFile: string
  successBanner: (students: number, marks: number) => string
  partialBanner: (valid: number, total: number, invalid: number) => string
  summaryTitle: string
  importedResultsHint: (count: number) => string
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
    description:
      'نزّل قالب الصف جاهزًا بأسماء الطلاب وأعمدة المواد، املأ الدرجات، ثم ارفع الملف نفسه. لا حاجة لمطابقة أعمدة.',
    chooseTitle: 'الخطوة ١ — اختر الترم والصف',
    howTitle: 'كيف تسير العملية',
    howSteps: [
      'اختر الترم والصف من القائمتين أعلاه.',
      'نزّل قالب النتائج — يفتح بأسماء طلاب الصف وأعمدة المواد الثلاث عشرة.',
      'اكتب الدرجة من ١٠٠ في مواد الدرجات، و«اجتياز» أو «لم يجتز» في مواد الاجتياز. لا تغيّر أسماء الأعمدة ولا كود الطالب.',
      'ارفع الملف نفسه في الخطوة الثانية، وستظهر نتيجة الرفع فورًا.',
    ],
    columnsTitle: 'أعمدة القالب',
    columnsHint:
      'هذه هي أعمدة المواد التي سيحتويها الملف، بالترتيب المطبوع. الأعمدة الأربعة الأولى (م، كود الطالب، اسم الطالب، الفصل) تأتي مملوءة.',
    columnHeaders: {
      order: 'م',
      subject: 'المادة',
      gradingType: 'نوع التقييم',
      max: 'الدرجة النهائية',
      pass: 'درجة النجاح',
    },
    gradingTypes: { numeric: 'درجات', qualitative: 'اجتياز / لم يجتز' },
    download: 'تنزيل قالب النتائج (Excel)',
    downloadingRoster: 'جارٍ تجهيز كشف الصف',
    downloaded: 'تم تنزيل القالب.',
    pickBoth: 'اختر الترم والصف أولًا لتفعيل التنزيل.',
    rosterEmpty: 'لا يوجد طلاب مقيّدون في هذا الصف.',
    studentCount: (count) => `${count} طالبًا في هذا الصف.`,
    uploadTitle: 'الخطوة ٢ — ارفع الملف بعد ملئه',
    uploadHint:
      'ارفع القالب نفسه بعد تعبئته. رفع القالب كما نُزِّل دون تعديل يُسجَّل بنجاح أيضًا.',
    file: 'ملف النتائج',
    fileHint: 'xlsx أو xls أو csv، بحد أقصى ١٠ ميجابايت.',
    upload: 'رفع النتائج',
    uploading: 'جارٍ رفع النتائج',
    noFile: 'اختر ملفًا أولًا.',
    successBanner: (students, marks) =>
      `تم رفع نتائج ${students} طالبًا، وتسجيل ${marks} درجة. لا توجد أخطاء.`,
    partialBanner: (valid, total, invalid) =>
      `تم رفع نتائج ${valid} من ${total} طالبًا. ${invalid} يحتاجون تصحيحًا أدناه.`,
    summaryTitle: 'نتيجة الرفع',
    importedResultsHint: (count) => `${count} درجة مادة فردية سُجِّلت ونُشرت.`,
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
    description:
      'Download the grade’s template — it arrives filled with the roster and the subject columns — enter the marks, then upload the same file back. No column mapping.',
    chooseTitle: 'Step 1 — choose the term and grade',
    howTitle: 'How this works',
    howSteps: [
      'Pick the term and the grade above.',
      'Download the results template: it opens with this grade’s students and all thirteen subject columns.',
      'Enter a mark out of 100 for the graded subjects, and “اجتياز” or “لم يجتز” for the pass/fail ones. Do not rename the columns or edit a student code.',
      'Upload that same file in step 2 — the result appears straight away.',
    ],
    columnsTitle: 'Template columns',
    columnsHint:
      'These are the subject columns the sheet carries, in printed order. The first four columns (serial, student code, name, classroom) come pre-filled.',
    columnHeaders: {
      order: '#',
      subject: 'Subject',
      gradingType: 'Grading',
      max: 'Out of',
      pass: 'Pass mark',
    },
    gradingTypes: { numeric: 'Marks', qualitative: 'Pass / fail' },
    download: 'Download the results template (Excel)',
    downloadingRoster: 'Preparing the grade roster',
    downloaded: 'Template downloaded.',
    pickBoth: 'Choose a term and a grade to enable the download.',
    rosterEmpty: 'No students are enrolled in this grade.',
    studentCount: (count) => `${count} students in this grade.`,
    uploadTitle: 'Step 2 — upload the filled sheet',
    uploadHint:
      'Upload the same template once it is filled in. Uploading it back exactly as downloaded also succeeds.',
    file: 'Results file',
    fileHint: 'xlsx, xls or csv, 10 MB maximum.',
    upload: 'Upload results',
    uploading: 'Uploading results',
    noFile: 'Choose a file first.',
    successBanner: (students, marks) =>
      `${students} students uploaded and ${marks} marks recorded, with no errors.`,
    partialBanner: (valid, total, invalid) =>
      `${valid} of ${total} students uploaded. ${invalid} need correcting below.`,
    summaryTitle: 'Upload result',
    importedResultsHint: (count) => `${count} individual subject marks were recorded and published.`,
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
