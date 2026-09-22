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
  verifyTitle: string
  verifyBody: string
  code: string
  verify: string
  resend: string
  resent: string
  verified: string
  backToLogin: string
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
    verifyTitle: 'تفعيل البريد الإلكتروني',
    verifyBody: 'أدخل الرمز المكوّن من ٦ أرقام المُرسل إلى بريدك.',
    code: 'رمز التفعيل',
    verify: 'تفعيل الحساب',
    resend: 'إعادة إرسال الرمز',
    resent: 'تم إرسال رمز جديد.',
    verified: 'تم تفعيل الحساب. سجّل الدخول الآن.',
    backToLogin: 'العودة لتسجيل الدخول',
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
    verifyTitle: 'Verify your email',
    verifyBody: 'Enter the 6-digit code sent to your email.',
    code: 'Verification code',
    verify: 'Verify account',
    resend: 'Send a new code',
    resent: 'A new code has been sent.',
    verified: 'Account verified. Sign in to continue.',
    backToLogin: 'Back to sign in',
  },
}
