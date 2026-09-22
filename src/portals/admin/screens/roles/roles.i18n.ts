import type { Dict } from '~/lib/i18n/locales'

export const rolesText: Dict<{
  title: string
  description: string
  noPermissions: string
}> = {
  ar: {
    title: 'الأدوار',
    description: 'الأدوار العامة وصلاحيات كل منها. الأدوار تُسند من صفحة المستخدم.',
    noPermissions: 'لا صلاحيات مسندة لهذا الدور.',
  },
  en: {
    title: 'Roles',
    description:
      'The global roles and what each one grants. Roles are assigned from a user, not from here.',
    noPermissions: 'This role grants no permissions.',
  },
}
