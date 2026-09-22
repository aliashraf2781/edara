export type UserStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'banned'

export type GlobalUser = {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  status: UserStatus
  emailVerified: boolean
  lastLoginAt: string | null
  locale: string
  timezone: string
  preferences: Record<string, unknown>
  roles: string[]
  createdAt: string
  updatedAt: string
}

export type TenantStatus = 'pending' | 'active' | 'disabled' | 'archived'
export type ProvisioningStatus = 'pending' | 'provisioning' | 'provisioned' | 'failed'
export type AdminRelationship = 'owner' | 'officer' | 'reviewer'

export type TenantAdmin = {
  id: string
  name: string
  email: string
  relationship: AdminRelationship
  isPrimary: boolean
}

/** The lighter shape returned by the list endpoint — no admins or contact fields. */
export type TenantSummary = {
  id: string
  code: string
  name: string
  status: TenantStatus
  provisioningStatus: ProvisioningStatus
  governorate: string | null
  createdAt: string
}

export type Tenant = TenantSummary & {
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  settings: Record<string, unknown> | null
  admins: TenantAdmin[]
  updatedAt: string
}

/**
 * `temporaryPassword` is null on a repeat call — that is success, not failure.
 * Check `tenant.provisioningStatus` to decide what happened.
 */
export type ProvisionResult = {
  tenant: Tenant
  superAdmin: { email: string; temporaryPassword: string | null }
}

/**
 * The operator sets the Super Admin's password directly on create, so
 * there is no `temporaryPassword` here — only `ProvisionResult` (the
 * manual-retry path) reveals one. `superAdmin.email` is the actual composite
 * login email (e.g. `admin_SCH-KJFZBV@pp.com`); it differs from whatever
 * plain `admin_email` was submitted and is never surfaced again after this.
 */
export type TenantCreateResult = {
  tenant: Tenant
  superAdmin: { email: string }
}

export type Role = {
  id: number
  name: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export type AuditLogEntry = {
  id: string
  logName: string
  description: string
  subjectType: string | null
  causerId: string | null
  createdAt: string
}

export type AdminIdentity = {
  user: GlobalUser
  permissions: string[]
}

export type AuthTokens = {
  user: GlobalUser
  accessToken: string
  tokenType: string
  accessExpiresIn: number
  refreshToken: string
  refreshExpiresIn: number
}
