export const SCHOOL_ROLES = [
  'school-super-admin',
  'school-admin',
  'school-teacher',
  'school-data-entry',
] as const

export type SchoolRole = (typeof SCHOOL_ROLES)[number]

const ADMIN_ROLES: readonly SchoolRole[] = ['school-super-admin', 'school-admin']

/**
 * The four role gates the UI actually needs, derived once from `me.roles`.
 * Screens ask these questions rather than comparing role strings inline.
 */
export const capabilitiesFor = (roles: readonly string[]) => {
  const isSuperAdmin = roles.includes('school-super-admin')
  const isAdmin = ADMIN_ROLES.some((role) => roles.includes(role))

  return {
    isSuperAdmin,
    isAdmin,
    /** Academic structure writes, and deleting a student. */
    canEditStructure: isAdmin,
    canDeleteStudent: isAdmin,
    /** Approve, reject and publish. A teacher can only get a result to submitted. */
    canReviewResults: isAdmin,
    /** Staff accounts are super-admin only and hidden entirely otherwise. */
    canManageStaff: isSuperAdmin,
  }
}

export type SchoolCapabilities = ReturnType<typeof capabilitiesFor>
