import type { Dict } from '~/lib/i18n/locales'
import type { AdminRelationship } from '../../api/types'

export const schoolFormText: Dict<{
  createTitle: string
  createDescription: string
  fields: {
    name: string
    contactEmail: string
    contactEmailHint: string
    contactPhone: string
    governorate: string
    address: string
    adminEmail: string
    adminEmailHint: string
    adminPassword: string
    adminPasswordConfirmation: string
  }
  created: string
  saved: string
  submitCreate: string
  loginEmail: {
    title: string
    body: string
    warning: string
    email: string
    typedEmail: string
    eitherWorks: string
    password: string
    passwordNote: string
    openPortal: string
    copy: string
    copied: string
    copyFailed: string
    acknowledge: string
  }
  tabs: { overview: string; officers: string; danger: string }
  password: {
    loginEmail: string
    action: string
    title: string
    warning: string
    label: string
    confirm: string
    show: string
    hide: string
    save: string
    cancel: string
    changed: string
    doneBody: string
    copy: string
    copied: string
    copyFailed: string
    close: string
    emailMismatch: string
    contactEmailWarning: string
  }
  readOnly: string
  provision: {
    bannerTitle: string
    bannerBody: string
    retryTitle: string
    retryBody: string
    action: string
    running: string
    runningBody: string
    doneTitle: string
    doneBody: string
    passwordTitle: string
    passwordBody: string
    passwordWarning: string
    email: string
    password: string
    copy: string
    copied: string
    copyFailed: string
    acknowledge: string
    closeWarning: string
    alreadyProvisioned: string
  }
  officers: {
    title: string
    description: string
    add: string
    userId: string
    relationship: string
    isPrimary: string
    columnName: string
    columnEmail: string
    columnRelationship: string
    columnPrimary: string
    remove: string
    removeTitle: string
    removeConsequence: string
    empty: string
    emptyBody: string
    added: string
    removed: string
    yes: string
    no: string
    roles: Record<AdminRelationship, string>
  }
  danger: {
    title: string
    deleteTitle: string
    deleteBody: string
    deleteAction: string
    deleteConsequence: string
    deleted: string
  }
}> = {
  ar: {
    createTitle: 'مدرسة جديدة',
    createDescription:
      'يُنشئ هذا الطلب سجل المدرسة ويفعّلها — كل ذلك في خطوة واحدة. المدرسة جاهزة للاستخدام فور الحفظ.',
    fields: {
      name: 'اسم المدرسة',
      contactEmail: 'بريد جهة الاتصال',
      contactPhone: 'هاتف جهة الاتصال',
      contactEmailHint: 'يمكن ضبطه لاحقًا من هذه الصفحة.',
      governorate: 'المحافظة',
      address: 'العنوان',
      adminEmail: 'بريد المدير العام',
      adminEmailHint: 'يصبح هذا البريد حساب تسجيل الدخول لمدير المدرسة العام.',
      adminPassword: 'كلمة مرور المدير العام',
      adminPasswordConfirmation: 'تأكيد كلمة المرور',
    },
    created: 'تم إنشاء المدرسة وتفعيلها.',
    saved: 'تم حفظ التغييرات.',
    submitCreate: 'إنشاء المدرسة',
    loginEmail: {
      title: 'بريد تسجيل دخول المدير العام',
      body:
        'يضيف الخادم كود المدرسة إلى البريد الذي أدخلته، فيصبح بريد الدخول المركّب مختلفًا عمّا كتبته. هذه هي المرة الوحيدة التي يُعرض فيها — سلّمه للمدير العام.',
      warning: 'لن يُعرض البريد المركّب مرة أخرى. انسخه الآن.',
      email: 'بريد الدخول المركّب',
      typedEmail: 'البريد الذي أدخلته',
      eitherWorks: 'بوابة المدرسة تقبل أيًا من البريدين لتسجيل الدخول ورفع البيانات.',
      password: 'كلمة المرور',
      passwordNote: 'هي كلمة المرور التي اخترتها الآن — لم تُنشأ كلمة مرور أخرى.',
      openPortal: 'فتح بوابة المدرسة',
      copy: 'نسخ',
      copied: 'تم النسخ',
      copyFailed: 'تعذّر النسخ. حدّد النص وانسخه يدويًا.',
      acknowledge: 'نسختُه — إغلاق',
    },
    tabs: { overview: 'البيانات', officers: 'المسؤولون', danger: 'منطقة الخطر' },
    password: {
      loginEmail: 'بريد تسجيل الدخول',
      action: 'تغيير كلمة المرور',
      title: 'تغيير كلمة مرور المدرسة',
      warning: 'ستُسجَّل المدرسة خروجها من كل الأجهزة، ولن تعمل كلمة المرور القديمة.',
      label: 'كلمة المرور الجديدة',
      confirm: 'تأكيد كلمة المرور',
      show: 'إظهار',
      hide: 'إخفاء',
      save: 'حفظ',
      cancel: 'إلغاء',
      changed: 'تم تغيير كلمة مرور حساب المدرسة.',
      doneBody: 'سلّم هذه البيانات للمدرسة. لا تُعرض كلمة المرور مرة أخرى.',
      copy: 'نسخ',
      copied: 'تم النسخ',
      copyFailed: 'تعذّر النسخ. حدّد النص وانسخه يدويًا.',
      close: 'إغلاق',
      emailMismatch: 'كلمتا المرور غير متطابقتين',
      contactEmailWarning:
        'تغيير بريد جهة الاتصال لا يغيّر بريد تسجيل الدخول الفعلي للمدرسة.',
    },
    readOnly: 'للعرض فقط — حقول النظام.',
    provision: {
      bannerTitle: 'هذه المدرسة لم تُجهَّز بعد',
      bannerBody: 'السجل موجود، لكن التجهيز لم يكتمل بعد ولا يمكن لطاقمها تسجيل الدخول.',
      retryTitle: 'فشل التجهيز',
      retryBody: 'يمكنك إعادة المحاولة — التجهيز آمن التكرار على الخادم.',
      action: 'تجهيز هذه المدرسة',
      running: 'جارٍ التجهيز',
      runningBody: 'يستغرق هذا بضع ثوانٍ. لا تغلق هذه الصفحة.',
      doneTitle: 'تم التجهيز',
      doneBody: 'المدرسة جاهزة وحساب المدير العام أُنشئ.',
      passwordTitle: 'كلمة مرور المدير العام — تُعرض مرة واحدة',
      passwordBody: 'سلّم هذه البيانات لمسؤول المدرسة بطريقة آمنة، واطلب تغيير كلمة المرور عند أول دخول.',
      passwordWarning: 'لن تُعرض كلمة المرور هذه مرة أخرى أبدًا. انسخها الآن.',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور المؤقتة',
      copy: 'نسخ كلمة المرور',
      copied: 'تم النسخ',
      copyFailed: 'تعذّر النسخ. حدّد النص وانسخه يدويًا.',
      acknowledge: 'نسختُها — إغلاق',
      closeWarning: 'بإغلاق هذه النافذة تفقد كلمة المرور نهائيًا.',
      alreadyProvisioned: 'هذه المدرسة مُجهَّزة بالفعل. لم تُنشأ كلمة مرور جديدة.',
    },
    officers: {
      title: 'المسؤولون',
      description: 'مستخدمين المنصة المسؤولون عن متابعة هذه المدرسة.',
      add: 'إضافة مسؤول',
      userId: 'معرّف المستخدم',
      relationship: 'الصفة',
      isPrimary: 'جهة الاتصال الأساسية',
      columnName: 'الاسم',
      columnEmail: 'البريد الإلكتروني',
      columnRelationship: 'الصفة',
      columnPrimary: 'أساسي',
      remove: 'إزالة',
      removeTitle: 'إزالة المسؤول',
      removeConsequence: 'لن يظهر هذا المستخدم كجهة اتصال لهذه المدرسة. لا يتأثر حسابه.',
      empty: 'لا يوجد مسؤولون',
      emptyBody: 'أضف مستخدمًا من المنصة ليكون جهة الاتصال لهذه المدرسة.',
      added: 'تمت إضافة المسؤول.',
      removed: 'تمت إزالة المسؤول.',
      yes: 'نعم',
      no: 'لا',
      roles: { owner: 'مالك', officer: 'مسؤول', reviewer: 'مراجع' },
    },
    danger: {
      title: 'منطقة الخطر',
      deleteTitle: 'حذف سجل المدرسة',
      deleteBody: 'يحذف السجل من المنصة حذفًا مبدئيًا. لن يتمكن طاقمها من تسجيل الدخول.',
      deleteAction: 'حذف السجل',
      deleteConsequence:
        'سيختفي سجل هذه المدرسة من المنصة ولن يتمكن طاقمها من تسجيل الدخول.',
      deleted: 'تم حذف سجل المدرسة.',
    },
  },
  en: {
    createTitle: 'New school',
    createDescription:
      'This creates the school’s record and activates it — all in one step. It is ready to use as soon as you save.',
    fields: {
      name: 'School name',
      contactEmail: 'Contact email',
      contactEmailHint: 'Can be set later from this page.',
      contactPhone: 'Contact phone',
      governorate: 'Governorate',
      address: 'Address',
      adminEmail: 'Super Admin email',
      adminEmailHint: 'This address becomes the school’s Super Admin login.',
      adminPassword: 'Super Admin password',
      adminPasswordConfirmation: 'Confirm password',
    },
    created: 'School created and activated.',
    saved: 'Changes saved.',
    submitCreate: 'Create school',
    loginEmail: {
      title: 'Super Admin login email',
      body:
        'The server embeds the school’s code into the email you entered, so the composite login email differs from what you typed. This is the only time it is shown — hand it to the Super Admin.',
      warning: 'The composite email will not be shown again. Copy it now.',
      email: 'Composite login email',
      typedEmail: 'The email you typed',
      eitherWorks: 'The school portal accepts either address to sign in and upload data.',
      password: 'Password',
      passwordNote: 'It is the password you just chose — no other password was generated.',
      openPortal: 'Open the school portal',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Copying failed. Select the text and copy it manually.',
      acknowledge: 'I have copied it — close',
    },
    tabs: { overview: 'Overview', officers: 'Responsible officers', danger: 'Danger zone' },
    password: {
      loginEmail: 'Login email',
      action: 'Change password',
      title: 'Change the school’s password',
      warning: 'The school will be logged out of every device, and the old password stops working.',
      label: 'New password',
      confirm: 'Confirm password',
      show: 'Show',
      hide: 'Hide',
      save: 'Save',
      cancel: 'Cancel',
      changed: 'School account password updated.',
      doneBody: 'Send these credentials to the school. The password is not shown again.',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Copying failed. Select the text and copy it manually.',
      close: 'Close',
      emailMismatch: 'The passwords do not match',
      contactEmailWarning:
        'Changing the contact email does not change the email the school actually logs in with.',
    },
    readOnly: 'Read-only — system fields.',
    provision: {
      bannerTitle: 'This school is not provisioned yet',
      bannerBody:
        'The record exists, but setup is incomplete and its staff cannot log in.',
      retryTitle: 'Provisioning failed',
      retryBody: 'You can run it again — provisioning is idempotent server-side.',
      action: 'Provision this school',
      running: 'Provisioning',
      runningBody: 'This takes a few seconds. Do not close this page.',
      doneTitle: 'Provisioned',
      doneBody: 'The school is ready and its Super Admin account has been created.',
      passwordTitle: 'Super Admin password — shown once',
      passwordBody:
        'Send these credentials to the school securely, and tell them to change the password on first login.',
      passwordWarning: 'This password will never be shown again. Copy it now.',
      email: 'Email',
      password: 'Temporary password',
      copy: 'Copy password',
      copied: 'Copied',
      copyFailed: 'Copying failed. Select the text and copy it manually.',
      acknowledge: 'I have copied it — close',
      closeWarning: 'Closing this dialog loses the password permanently.',
      alreadyProvisioned: 'This school was already provisioned. No new password was generated.',
    },
    officers: {
      title: 'Responsible officers',
      description: 'Platform users accountable for this school.',
      add: 'Add officer',
      userId: 'User ID',
      relationship: 'Relationship',
      isPrimary: 'Primary contact',
      columnName: 'Name',
      columnEmail: 'Email',
      columnRelationship: 'Relationship',
      columnPrimary: 'Primary',
      remove: 'Remove',
      removeTitle: 'Remove this officer',
      removeConsequence:
        'This user stops being listed as a contact for this school. Their account is not affected.',
      empty: 'No officers assigned',
      emptyBody: 'Add a platform user as the contact for this school.',
      added: 'Officer added.',
      removed: 'Officer removed.',
      yes: 'Yes',
      no: 'No',
      roles: { owner: 'Owner', officer: 'Officer', reviewer: 'Reviewer' },
    },
    danger: {
      title: 'Danger zone',
      deleteTitle: 'Delete the school record',
      deleteBody:
        'Soft-deletes the registry record on the platform. Staff will be unable to log in.',
      deleteAction: 'Delete record',
      deleteConsequence:
        'This school disappears from the platform and its staff will be unable to log in.',
      deleted: 'School record deleted.',
    },
  },
}
