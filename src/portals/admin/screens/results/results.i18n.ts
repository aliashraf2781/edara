import type { Dict } from '~/lib/i18n/locales'

export const resultsText: Dict<{
  overview: {
    title: string
    description: string
    emptyTitle: string
    emptyBody: string
    stats: {
      schools: string
      students: string
      results: string
      passRate: string
      average: string
    }
    columns: {
      school: string
      code: string
      students: string
      results: string
      passRate: string
      average: string
      actions: string
    }
    open: string
  }
  filters: {
    term: string
    allTerms: string
    grade: string
    allGrades: string
    classroom: string
    allClassrooms: string
    subject: string
    allSubjects: string
    search: string
    searchHint: string
    clear: string
  }
  tabs: { overview: string; results: string; students: string }
  school: {
    resultsTitle: string
    resultsDescription: string
    studentsTitle: string
    studentsDescription: string
    backToSchool: string
    byGrade: string
    bySubject: string
    gradeColumns: {
      grade: string
      students: string
      results: string
      passed: string
      passRate: string
      average: string
    }
    subjectColumns: {
      subject: string
      type: string
      results: string
      passed: string
      passRate: string
      average: string
    }
    gradingType: { numeric: string; qualitative: string }
    resultColumns: {
      student: string
      code: string
      grade: string
      classroom: string
      subject: string
      mark: string
      verdict: string
    }
    studentColumns: {
      name: string
      code: string
      seat: string
      grade: string
      classroom: string
      actions: string
    }
    view: string
    emptyTitle: string
    emptyBody: string
    noResultsTitle: string
    noResultsBody: string
  }
  student: {
    description: string
    identity: string
    code: string
    seat: string
    nationalId: string
    gender: string
    birthDate: string
    grade: string
    classroom: string
    school: string
    genders: { male: string; female: string }
    print: string
    subjectColumns: {
      subject: string
      mark: string
      finalMark: string
      minMark: string
      verdict: string
    }
    totals: {
      total: string
      outOf: string
      percent: string
      average: string
      subjectsPassed: string
    }
    verdict: string
    passed: string
    failed: string
    noTerms: string
    noTermsBody: string
  }
  print: {
    title: string
    term: string
    action: string
    back: string
    loading: string
  }
  issue: {
    title: string
    description: string
    submittedTo: string
    submittedToPlaceholder: string
    transferNumber: string
    transferDate: string
    transferDateHint: string
    day: string
    month: string
    year: string
    amount: string
    fill: string
    apply: string
    clear: string
    print: string
  }
}> = {
  ar: {
    overview: {
      title: 'نتائج المدارس',
      description: 'أرقام النتائج لكل مدرسة في المنصة، مرتبة بنسبة النجاح.',
      emptyTitle: 'لا توجد مدارس بعد',
      emptyBody: 'أنشئ مدرسة أولًا، ثم ارفع نتائجها لتظهر هنا.',
      stats: {
        schools: 'المدارس',
        students: 'الطلاب',
        results: 'الدرجات المسجّلة',
        passRate: 'نسبة النجاح',
        average: 'المتوسط العام',
      },
      columns: {
        school: 'المدرسة',
        code: 'الكود',
        students: 'الطلاب',
        results: 'الدرجات',
        passRate: 'نسبة النجاح',
        average: 'المتوسط',
        actions: 'إجراءات',
      },
      open: 'فتح النتائج',
    },
    filters: {
      term: 'الترم',
      allTerms: 'كل الترمين',
      grade: 'الصف',
      allGrades: 'كل الصفوف',
      classroom: 'الفصل',
      allClassrooms: 'كل الفصول',
      subject: 'المادة',
      allSubjects: 'كل المواد',
      search: 'بحث',
      searchHint: 'اسم الطالب أو كوده',
      clear: 'مسح عوامل التصفية',
    },
    tabs: { overview: 'البيانات', results: 'النتائج', students: 'الطلاب' },
    school: {
      resultsTitle: 'نتائج المدرسة',
      resultsDescription: 'كل درجة مسجّلة في هذه المدرسة، مع أرقامها الإجمالية.',
      studentsTitle: 'طلاب المدرسة',
      studentsDescription: 'اختر طالبًا لعرض إحصائياته وطباعة نتيجته.',
      backToSchool: 'عودة إلى المدرسة',
      byGrade: 'حسب الصف',
      bySubject: 'حسب المادة',
      gradeColumns: {
        grade: 'الصف',
        students: 'الطلاب',
        results: 'الدرجات',
        passed: 'الناجحون',
        passRate: 'نسبة النجاح',
        average: 'المتوسط',
      },
      subjectColumns: {
        subject: 'المادة',
        type: 'نوع التقييم',
        results: 'الدرجات',
        passed: 'الناجحون',
        passRate: 'نسبة النجاح',
        average: 'المتوسط',
      },
      gradingType: { numeric: 'درجة رقمية', qualitative: 'اجتياز' },
      resultColumns: {
        student: 'الطالب',
        code: 'كود الطالب',
        grade: 'الصف',
        classroom: 'الفصل',
        subject: 'المادة',
        mark: 'الدرجة',
        verdict: 'التقييم',
      },
      studentColumns: {
        name: 'اسم الطالب',
        code: 'كود الطالب',
        seat: 'رقم الجلوس',
        grade: 'الصف',
        classroom: 'الفصل',
        actions: 'إجراءات',
      },
      view: 'عرض',
      emptyTitle: 'لا توجد بيانات بعد',
      emptyBody: 'لم ترفع هذه المدرسة أي نتائج حتى الآن.',
      noResultsTitle: 'لا توجد نتائج مطابقة',
      noResultsBody: 'جرّب تعديل عوامل التصفية أو كلمة البحث.',
    },
    student: {
      description: 'إحصائيات الطالب في الترمين، ومستخرج النتيجة الرسمي.',
      identity: 'بيانات الطالب',
      code: 'كود الطالب',
      seat: 'رقم الجلوس',
      nationalId: 'الرقم القومي',
      gender: 'النوع',
      birthDate: 'تاريخ الميلاد',
      grade: 'الصف',
      classroom: 'الفصل',
      school: 'المدرسة',
      genders: { male: 'ذكر', female: 'أنثى' },
      print: 'طباعة النتيجة',
      subjectColumns: {
        subject: 'المادة',
        mark: 'درجة الطالب',
        finalMark: 'الدرجة النهائية',
        minMark: 'الدرجة الصغرى',
        verdict: 'التقييم',
      },
      totals: {
        total: 'المجموع',
        outOf: 'من',
        percent: 'النسبة المئوية',
        average: 'المتوسط',
        subjectsPassed: 'المواد المجتازة',
      },
      verdict: 'النتيجة النهائية',
      passed: 'ناجح',
      failed: 'راسب',
      noTerms: 'لا توجد نتائج مسجّلة',
      noTermsBody: 'لم تُرفع درجات هذا الطالب بعد.',
    },
    print: {
      title: 'مستخرج رسمي بنتيجة الصف الابتدائي',
      term: 'الترم',
      action: 'طباعة',
      back: 'عودة إلى صفحة الطالب',
      loading: 'جارٍ تجهيز المستخرج',
    },
    issue: {
      title: 'بيانات استخراج المستخرج',
      description:
        'املأ الجهة ورقم الحوالة وتاريخها والمبلغ. الحقول اختيارية — اتركها فارغة لتبقى الأسطر منقّطة وتُملأ بخط اليد.',
      submittedTo: 'وقد استخرج هذا البيان لتقديمه إلى',
      submittedToPlaceholder: 'الجهة المقدَّم إليها البيان',
      transferNumber: 'رقم الحوالة',
      transferDate: 'تاريخ الحوالة',
      transferDateHint: 'يوم / شهر / سنة (خانتان) — تُطبع كالسنة كاملة ٢٠xx.',
      day: 'يوم',
      month: 'شهر',
      year: 'سنة',
      amount: 'المبلغ',
      fill: 'تعبئة البيانات',
      apply: 'حفظ على المستخرج',
      clear: 'مسح الحقول',
      print: 'طباعة',
    },
  },
  en: {
    overview: {
      title: 'School results',
      description: 'Result figures for every school on the platform, ranked by pass rate.',
      emptyTitle: 'No schools yet',
      emptyBody: 'Create a school first, then upload its results to see them here.',
      stats: {
        schools: 'Schools',
        students: 'Students',
        results: 'Recorded marks',
        passRate: 'Pass rate',
        average: 'Overall average',
      },
      columns: {
        school: 'School',
        code: 'Code',
        students: 'Students',
        results: 'Marks',
        passRate: 'Pass rate',
        average: 'Average',
        actions: 'Actions',
      },
      open: 'Open results',
    },
    filters: {
      term: 'Term',
      allTerms: 'Both terms',
      grade: 'Grade',
      allGrades: 'All grades',
      classroom: 'Classroom',
      allClassrooms: 'All classrooms',
      subject: 'Subject',
      allSubjects: 'All subjects',
      search: 'Search',
      searchHint: 'Student name or code',
      clear: 'Clear filters',
    },
    tabs: { overview: 'Overview', results: 'Results', students: 'Students' },
    school: {
      resultsTitle: 'School results',
      resultsDescription: 'Every mark recorded for this school, with its headline figures.',
      studentsTitle: 'School students',
      studentsDescription: 'Pick a student to read their statistics and print their result.',
      backToSchool: 'Back to the school',
      byGrade: 'By grade',
      bySubject: 'By subject',
      gradeColumns: {
        grade: 'Grade',
        students: 'Students',
        results: 'Marks',
        passed: 'Passed',
        passRate: 'Pass rate',
        average: 'Average',
      },
      subjectColumns: {
        subject: 'Subject',
        type: 'Grading',
        results: 'Marks',
        passed: 'Passed',
        passRate: 'Pass rate',
        average: 'Average',
      },
      gradingType: { numeric: 'Numeric', qualitative: 'Pass / fail' },
      resultColumns: {
        student: 'Student',
        code: 'Student code',
        grade: 'Grade',
        classroom: 'Class',
        subject: 'Subject',
        mark: 'Mark',
        verdict: 'Verdict',
      },
      studentColumns: {
        name: 'Student name',
        code: 'Student code',
        seat: 'Seat no.',
        grade: 'Grade',
        classroom: 'Class',
        actions: 'Actions',
      },
      view: 'View',
      emptyTitle: 'Nothing here yet',
      emptyBody: 'This school has not uploaded any results so far.',
      noResultsTitle: 'No matching results',
      noResultsBody: 'Try changing the filters or the search term.',
    },
    student: {
      description: 'This student’s figures across both terms, and the official extract.',
      identity: 'Student record',
      code: 'Student code',
      seat: 'Seat number',
      nationalId: 'National ID',
      gender: 'Gender',
      birthDate: 'Date of birth',
      grade: 'Grade',
      classroom: 'Class',
      school: 'School',
      genders: { male: 'Male', female: 'Female' },
      print: 'Print the result',
      subjectColumns: {
        subject: 'Subject',
        mark: 'Student mark',
        finalMark: 'Final mark',
        minMark: 'Minimum mark',
        verdict: 'Verdict',
      },
      totals: {
        total: 'Total',
        outOf: 'Out of',
        percent: 'Percentage',
        average: 'Average',
        subjectsPassed: 'Subjects passed',
      },
      verdict: 'Overall verdict',
      passed: 'Passed',
      failed: 'Failed',
      noTerms: 'No results recorded',
      noTermsBody: 'This student’s marks have not been uploaded yet.',
    },
    print: {
      title: 'Official primary-grade result extract',
      term: 'Term',
      action: 'Print',
      back: 'Back to the student',
      loading: 'Preparing the extract',
    },
    issue: {
      title: 'Extract issue details',
      description:
        'Fill the destination, transfer number, date, and amount. Every field is optional — leave them blank to keep the dotted rules for handwriting.',
      submittedTo: 'Issued for submission to',
      submittedToPlaceholder: 'The body the extract is submitted to',
      transferNumber: 'Transfer number',
      transferDate: 'Transfer date',
      transferDateHint: 'Day / month / year (2 digits) — printed as the full 20xx year.',
      day: 'Day',
      month: 'Month',
      year: 'Year',
      amount: 'Amount',
      fill: 'Fill details',
      apply: 'Apply to extract',
      clear: 'Clear fields',
      print: 'Print',
    },
  },
}
