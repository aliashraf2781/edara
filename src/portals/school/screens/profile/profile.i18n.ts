import type { Dict } from '~/lib/i18n/locales'

export const schoolProfileText: Dict<{
  title: string
  description: string
  account: string
  name: string
  loginEmail: string
  loginEmailHint: string
  copy: string
  copied: string
  copyFailed: string
  phone: string
  schoolName: string
  schoolCode: string
  memberSince: string
  signOut: string
  whatYourRoleAllows: string
  password: {
    title: string
    body: string
    current: string
    new: string
    confirm: string
    newHint: string
    submit: string
    submitWait: (seconds: number) => string
    show: string
    hide: string
    changed: string
    otherDevices: string
    sameAsCurrent: string
    failed: string
  }
}> = {
  ar: {
    title: 'حسابي',
    description: 'بياناتك في هذه المدرسة، وما يتيحه دورك.',
    account: 'بيانات الحساب',
    name: 'الاسم',
    loginEmail: 'بريد تسجيل الدخول',
    loginEmailHint: 'اكتب هذا البريد كما هو تمامًا عند تسجيل الدخول؛ فهو يتضمن رمز المدرسة.',
    copy: 'نسخ البريد',
    copied: 'تم النسخ',
    copyFailed: 'تعذّر النسخ. حدّد البريد وانسخه يدويًا.',
    phone: 'رقم الهاتف',
    schoolName: 'اسم المدرسة',
    schoolCode: 'رمز المدرسة',
    memberSince: 'تاريخ الإنشاء',
    signOut: 'تسجيل الخروج',
    whatYourRoleAllows: 'ما يتيحه دورك',
    password: {
      title: 'تغيير كلمة المرور',
      body: 'أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة. ستبقى مسجّل الدخول على هذا الجهاز.',
      current: 'كلمة المرور الحالية',
      new: 'كلمة المرور الجديدة',
      confirm: 'تأكيد كلمة المرور الجديدة',
      newHint: 'ثمانية أحرف على الأقل، ويجب أن تختلف عن كلمة المرور الحالية.',
      submit: 'تغيير كلمة المرور',
      submitWait: (seconds) => `حاول مجددًا بعد ${seconds} ث`,
      show: 'إظهار كلمة المرور',
      hide: 'إخفاء كلمة المرور',
      changed: 'تم تغيير كلمة المرور.',
      otherDevices: 'تم تسجيل خروجك من أجهزتك الأخرى.',
      sameAsCurrent: 'يجب أن تختلف كلمة المرور الجديدة عن الحالية',
      failed: 'تعذّر تغيير كلمة المرور. تحقق من الاتصال وحاول مرة أخرى.',
    },
  },
  en: {
    title: 'My profile',
    description: 'Your details at this school, and what your role allows.',
    account: 'Account details',
    name: 'Name',
    loginEmail: 'Login email',
    loginEmailHint: 'Type this email exactly as shown when you sign in. It includes your school code.',
    copy: 'Copy email',
    copied: 'Copied',
    copyFailed: 'Could not copy. Select the email and copy it by hand.',
    phone: 'Phone',
    schoolName: 'School name',
    schoolCode: 'School code',
    memberSince: 'Created',
    signOut: 'Sign out',
    whatYourRoleAllows: 'What your role allows',
    password: {
      title: 'Change password',
      body: 'Enter your current password, then choose a new one. You stay signed in on this device.',
      current: 'Current password',
      new: 'New password',
      confirm: 'Confirm new password',
      newHint: 'At least 8 characters, and different from your current password.',
      submit: 'Change password',
      submitWait: (seconds) => `Try again in ${seconds}s`,
      show: 'Show password',
      hide: 'Hide password',
      changed: 'Password changed.',
      otherDevices: 'You were signed out of your other devices.',
      sameAsCurrent: 'The new password must be different from the current one',
      failed: 'Could not change the password. Check your connection and try again.',
    },
  },
}
