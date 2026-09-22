import type { Dict } from '~/lib/i18n/locales'

export const schoolProfileText: Dict<{
  title: string
  description: string
  account: string
  name: string
  email: string
  phone: string
  status: string
  roles: string
  school: string
  memberSince: string
  gap: string
  signOut: string
  whatYourRoleAllows: string
}> = {
  ar: {
    title: 'حسابي',
    description: 'بياناتك في هذه المدرسة، وما يتيحه دورك.',
    account: 'بيانات الحساب',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    status: 'الحالة',
    roles: 'الأدوار',
    school: 'المدرسة',
    memberSince: 'تاريخ الإنشاء',
    gap:
      'لا توفّر الواجهة البرمجية لبوابة المدرسة تعديل الملف الشخصي أو تغيير كلمة المرور بعد. تواصل مع المدير العام لمدرستك لتحديث بياناتك.',
    signOut: 'تسجيل الخروج',
    whatYourRoleAllows: 'ما يتيحه دورك',
  },
  en: {
    title: 'My profile',
    description: 'Your details at this school, and what your role allows.',
    account: 'Account details',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    roles: 'Roles',
    school: 'School',
    memberSince: 'Created',
    gap:
      'The school portal API does not expose profile editing or a password change yet. Ask your school’s super admin to update your details.',
    signOut: 'Sign out',
    whatYourRoleAllows: 'What your role allows',
  },
}
