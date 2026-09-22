import type { Dict } from '~/lib/i18n/locales'

export const schoolLoginText: Dict<{
  eyebrow: string
  title: string
  subtitle: string
  email: string
  password: string
  submit: string
  failed: string
}> = {
  ar: {
    eyebrow: 'بوابة المدرسة',
    title: 'تسجيل الدخول',
    subtitle: 'ادخل ببيانات مدرستك. هذه البوابة مخصصة لطاقم المدارس.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    submit: 'تسجيل الدخول',
    failed: 'بيانات الدخول غير صحيحة.',
  },
  en: {
    eyebrow: 'School portal',
    title: 'Sign in',
    subtitle: 'Sign in with your school’s details. This portal is for school staff.',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    failed: 'Those sign-in details are not correct.',
  },
}
