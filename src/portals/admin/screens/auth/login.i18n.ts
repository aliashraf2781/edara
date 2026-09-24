import type { Dict } from '~/lib/i18n/locales'

export const adminLoginText: Dict<{
  eyebrow: string
  title: string
  subtitle: string
  email: string
  password: string
  submit: string
  failed: string
  unverified: string
}> = {
  ar: {
    eyebrow: 'إدارة المنصة',
    title: 'تسجيل الدخول',
    subtitle: 'ادخل ببيانات فريق المنصة.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    submit: 'تسجيل الدخول',
    failed: 'تعذّر تسجيل الدخول.',
    unverified: 'الحساب غير مُفعَّل. أرسلنا رمزًا جديدًا إلى بريدك.',
  },
  en: {
    eyebrow: 'Platform administration',
    title: 'Sign in',
    subtitle: 'Sign in with your platform staff details.',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    failed: 'Sign-in failed.',
    unverified: 'This account is not verified yet. A new code has been sent to your email.',
  },
}
