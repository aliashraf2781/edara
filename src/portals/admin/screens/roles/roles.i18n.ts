import type { Dict } from '~/lib/i18n/locales'
import type { PermissionGroupId } from '../../api/permissions'

export const rolesText: Dict<{
  title: string
  description: string
  noPermissions: string
  readOnlyNote: string
  newRole: string
  createTitle: string
  editTitle: string
  edit: string
  delete: string
  builtIn: string
  builtInNote: string
  created: string
  updated: string
  deleted: string
  deleteTitle: string
  deleteConsequence: (name: string) => string
  fields: { name: string; nameHint: string; permissions: string }
  syncNote: string
  nameTaken: string
  selectAll: string
  clearAll: string
  selectedCount: (selected: number, total: number) => string
  otherGroup: string
  emptyTitle: string
  emptyBody: string
  groups: Record<PermissionGroupId, string>
  permissions: Record<string, string>
}> = {
  ar: {
    title: 'الأدوار',
    description: 'الأدوار العامة وصلاحيات كل منها.',
    noPermissions: 'لا صلاحيات مسندة لهذا الدور.',
    readOnlyNote: 'للعرض فقط. إنشاء الأدوار وتعديلها متاح لمدير المنصة.',
    newRole: 'دور جديد',
    createTitle: 'دور جديد',
    editTitle: 'تعديل الدور',
    edit: 'تعديل',
    delete: 'حذف',
    builtIn: 'مدمج',
    builtInNote: 'دور مدمج في النظام ولا يمكن تعديله أو حذفه.',
    created: 'تم إنشاء الدور.',
    updated: 'تم تحديث الدور.',
    deleted: 'تم حذف الدور.',
    deleteTitle: 'حذف الدور',
    deleteConsequence: (name) =>
      `سيُحذف الدور "${name}" ويفقد كل مستخدم يحمله صلاحياته. لا يمكن التراجع عن ذلك.`,
    fields: {
      name: 'اسم الدور',
      nameHint: 'حروف إنجليزية صغيرة وأرقام وشرطات، مثل: support',
      permissions: 'الصلاحيات',
    },
    syncNote: 'الحفظ يستبدل صلاحيات الدور بالكامل بما هو محدّد هنا.',
    nameTaken: 'يوجد دور بهذا الاسم بالفعل',
    selectAll: 'تحديد الكل',
    clearAll: 'إلغاء التحديد',
    selectedCount: (selected, total) => `${selected} من ${total}`,
    otherGroup: 'صلاحيات أخرى',
    emptyTitle: 'لا توجد أدوار',
    emptyBody: 'أنشئ أول دور مخصص.',
    groups: { schools: 'المدارس', users: 'المستخدمون والأدوار', audit: 'سجل التدقيق' },
    permissions: {
      'view-tenants': 'عرض قائمة المدارس',
      'view-tenant': 'عرض مدرسة',
      'create-tenant': 'إنشاء مدرسة',
      'update-tenant': 'تعديل مدرسة وكلمة مرورها',
      'change-tenant-status': 'تفعيل/إيقاف مدرسة',
      'delete-tenant': 'حذف مدرسة',
      'provision-tenant': 'تجهيز قاعدة بيانات مدرسة',
      'purge-tenant-database': 'مسح قاعدة بيانات مدرسة',
      'assign-tenant-admin': 'إسناد مسؤول لمدرسة',
      'view-global-users': 'عرض المستخدمين والأدوار',
      'create-global-user': 'إضافة مسؤول',
      'update-global-user': 'تعديل مسؤول وحالته',
      'delete-global-user': 'حذف مسؤول',
      'assign-global-role': 'إسناد الأدوار العامة',
      'view-audit-log': 'عرض سجل التدقيق',
    },
  },
  en: {
    title: 'Roles',
    description: 'The global roles and what each one grants.',
    noPermissions: 'This role grants no permissions.',
    readOnlyNote: 'View only. Creating and editing roles is for global admins.',
    newRole: 'New role',
    createTitle: 'New role',
    editTitle: 'Edit role',
    edit: 'Edit',
    delete: 'Delete',
    builtIn: 'Built-in',
    builtInNote: 'A built-in role. It cannot be edited or deleted.',
    created: 'Role created.',
    updated: 'Role updated.',
    deleted: 'Role deleted.',
    deleteTitle: 'Delete this role',
    deleteConsequence: (name) =>
      `The role "${name}" will be deleted and every user holding it loses its permissions. This cannot be undone.`,
    fields: {
      name: 'Role name',
      nameHint: 'Lowercase letters, numbers and hyphens, e.g. support',
      permissions: 'Permissions',
    },
    syncNote: "Saving replaces the role's whole permission set with what is ticked here.",
    nameTaken: 'A role with this name already exists',
    selectAll: 'Select all',
    clearAll: 'Clear all',
    selectedCount: (selected, total) => `${selected} of ${total}`,
    otherGroup: 'Other permissions',
    emptyTitle: 'No roles',
    emptyBody: 'Create the first custom role.',
    groups: { schools: 'Schools', users: 'Users & roles', audit: 'Audit log' },
    permissions: {
      'view-tenants': 'List schools',
      'view-tenant': 'View a school',
      'create-tenant': 'Create a school',
      'update-tenant': 'Edit a school and change its password',
      'change-tenant-status': 'Activate / deactivate a school',
      'delete-tenant': 'Delete a school',
      'provision-tenant': 'Provision a school database',
      'purge-tenant-database': 'Purge a school database',
      'assign-tenant-admin': 'Attach / detach a school admin',
      'view-global-users': 'View users and roles',
      'create-global-user': 'Add an admin',
      'update-global-user': 'Edit an admin and change status',
      'delete-global-user': 'Delete an admin',
      'assign-global-role': 'Assign global roles',
      'view-audit-log': 'View the audit log',
    },
  },
}
