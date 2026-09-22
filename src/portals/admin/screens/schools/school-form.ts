import { z } from 'zod'
import { STRONG_PASSWORD } from '~/lib/forms/validation.i18n'
import type { ValidationText } from '~/lib/forms/validation.i18n'
import type { TenantDraft, TenantUpdate } from '../../api/tenants'
import type { Tenant } from '../../api/types'

/**
 * Creation is now `{ name, admin_email, admin_password }` — the code is
 * server-generated and no longer entered, and the operator sets the Super
 * Admin's password directly instead of a later one-time-password reveal.
 */
export const makeCreateSchema = (v: ValidationText) =>
  z
    .object({
      name: z.string().trim().min(1, v.required).max(120, v.maxLength(120)),
      admin_email: z.email(v.email),
      admin_password: z.string().regex(STRONG_PASSWORD, v.passwordStrength),
      admin_password_confirmation: z.string().min(1, v.required),
    })
    .refine((values) => values.admin_password === values.admin_password_confirmation, {
      path: ['admin_password_confirmation'],
      message: v.passwordMismatch,
    })

export type CreateFormValues = z.infer<ReturnType<typeof makeCreateSchema>>

export const CREATE_FIELDS = ['name', 'admin_email', 'admin_password', 'admin_password_confirmation'] as const

export const emptyCreateForm = (): CreateFormValues => ({
  name: '',
  admin_email: '',
  admin_password: '',
  admin_password_confirmation: '',
})

export const toCreatePayload = (values: CreateFormValues): TenantDraft => ({
  name: values.name,
  admin_email: values.admin_email,
  admin_password: values.admin_password,
})

/**
 * Every editable field after creation — the bilingual name_ar field is gone,
 * and the code is immutable, so neither appears here.
 */
export const makeEditSchema = (v: ValidationText) =>
  z.object({
    name: z.string().trim().min(1, v.required).max(120, v.maxLength(120)),
    contact_email: z.union([z.literal(''), z.email(v.email)]),
    contact_phone: z.string().trim().max(32, v.maxLength(32)),
    governorate: z.string().trim().max(80, v.maxLength(80)),
    address: z.string().trim().max(255, v.maxLength(255)),
  })

export type EditFormValues = z.infer<ReturnType<typeof makeEditSchema>>

export const EDIT_FIELDS = ['name', 'contact_email', 'contact_phone', 'governorate', 'address'] as const

export const schoolFormFrom = (tenant: Tenant): EditFormValues => ({
  name: tenant.name,
  contact_email: tenant.contactEmail ?? '',
  contact_phone: tenant.contactPhone ?? '',
  governorate: tenant.governorate ?? '',
  address: tenant.address ?? '',
})

/** Blank optional fields are omitted rather than sent as empty strings. */
const withoutBlanks = (values: Omit<EditFormValues, 'name'>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''))

export const toUpdatePayload = (values: EditFormValues): TenantUpdate => {
  const { name, ...optional } = values
  return { name, ...withoutBlanks(optional) }
}
