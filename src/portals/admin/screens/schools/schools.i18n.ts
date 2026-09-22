import type { Dict } from '~/lib/i18n/locales'
import type { ProvisioningStatus, TenantStatus } from '../../api/types'

type StatusLabels = {
  status: Record<TenantStatus, string>
  provisioning: Record<ProvisioningStatus, string>
}

export const schoolsText: Dict<
  StatusLabels & {
    title: string
    description: string
    newSchool: string
    searchLabel: string
    filterStatus: string
    filterProvisioning: string
    anyStatus: string
    anyProvisioning: string
    removeFilter: string
    columns: {
      code: string
      name: string
      status: string
      provisioning: string
      created: string
      actions: string
    }
    view: string
    activate: string
    deactivate: string
    provision: string
    emptyTitle: string
    emptyBody: string
    noResultsTitle: string
    noResultsBody: string
    clearFilters: string
    activateTitle: string
    activateConsequence: string
    deactivateTitle: string
    deactivateConsequence: string
    statusChanged: string
  }
> = {
  ar: {
    title: 'المدارس',
    description: 'سجلّ المدارس على المنصة. تُنشأ المدرسة وتُفعَّل في خطوة واحدة.',
    newSchool: 'مدرسة جديدة',
    searchLabel: 'ابحث بالاسم أو الكود',
    filterStatus: 'الحالة',
    filterProvisioning: 'التجهيز',
    anyStatus: 'كل الحالات',
    anyProvisioning: 'كل مراحل التجهيز',
    removeFilter: 'إزالة عامل التصفية',
    columns: {
      code: 'الكود',
      name: 'المدرسة',
      status: 'الحالة',
      provisioning: 'التجهيز',
      created: 'تاريخ الإنشاء',
      actions: 'إجراءات',
    },
    view: 'عرض',
    activate: 'تفعيل',
    deactivate: 'إيقاف',
    provision: 'تجهيز',
    emptyTitle: 'لا توجد مدارس بعد',
    emptyBody: 'أنشئ أول مدرسة — تُفعَّل وتصبح جاهزة للاستخدام فورًا.',
    noResultsTitle: 'لا نتائج مطابقة',
    noResultsBody: 'جرّب كلمة بحث أخرى أو أزِل عوامل التصفية.',
    clearFilters: 'إزالة كل عوامل التصفية',
    activateTitle: 'تفعيل المدرسة',
    activateConsequence: 'سيتمكن طاقم هذه المدرسة من تسجيل الدخول فورًا.',
    deactivateTitle: 'إيقاف المدرسة',
    deactivateConsequence: 'لن يتمكن طاقم هذه المدرسة من تسجيل الدخول فورًا. بياناتها تبقى كما هي.',
    statusChanged: 'تم تحديث حالة المدرسة.',
    status: { pending: 'قيد الانتظار', active: 'مفعّلة', disabled: 'موقوفة', archived: 'مؤرشفة' },
    provisioning: {
      pending: 'لم تُجهَّز',
      provisioning: 'جارٍ التجهيز',
      provisioned: 'مُجهَّزة',
      failed: 'فشل التجهيز',
    },
  },
  en: {
    title: 'Schools',
    description:
      'The registry of schools on the platform. A school is created and activated in a single step.',
    newSchool: 'New school',
    searchLabel: 'Search by name or code',
    filterStatus: 'Status',
    filterProvisioning: 'Provisioning',
    anyStatus: 'Any status',
    anyProvisioning: 'Any provisioning state',
    removeFilter: 'Remove filter',
    columns: {
      code: 'Code',
      name: 'School',
      status: 'Status',
      provisioning: 'Provisioning',
      created: 'Created',
      actions: 'Actions',
    },
    view: 'View',
    activate: 'Activate',
    deactivate: 'Deactivate',
    provision: 'Provision',
    emptyTitle: 'No schools yet',
    emptyBody: 'Create the first school — it becomes active and ready to use immediately.',
    noResultsTitle: 'No matching schools',
    noResultsBody: 'Try a different search term, or clear the filters.',
    clearFilters: 'Clear all filters',
    activateTitle: 'Activate this school',
    activateConsequence: 'Staff at this school will be able to log in immediately.',
    deactivateTitle: 'Deactivate this school',
    deactivateConsequence:
      'Staff at this school will immediately be unable to log in. Their data is left untouched.',
    statusChanged: 'School status updated.',
    status: { pending: 'Pending', active: 'Active', disabled: 'Disabled', archived: 'Archived' },
    provisioning: {
      pending: 'Not provisioned',
      provisioning: 'Provisioning',
      provisioned: 'Provisioned',
      failed: 'Provisioning failed',
    },
  },
}
