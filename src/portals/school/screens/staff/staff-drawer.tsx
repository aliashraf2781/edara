import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { STRONG_PASSWORD, validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { Select } from '~/ui/select'
import { NumeralInput, TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { useCreateStaff, useUpdateStaff } from '../../api/staff'
import type { SchoolUser } from '../../api/types'
import { schoolText } from '../../school.i18n'
import { staffText } from './staff.i18n'

const FIELDS = ['name', 'email', 'password', 'phone', 'employee_code', 'national_id', 'status'] as const

const makeSchema = (v: ValidationText, creating: boolean) =>
  z.object({
    name: z.string().trim().min(1, v.required),
    email: creating ? z.email(v.email) : z.string(),
    // Optional when editing: blank means "keep the current password".
    password: creating
      ? z.string().regex(STRONG_PASSWORD, v.passwordStrength)
      : z.union([z.literal(''), z.string().regex(STRONG_PASSWORD, v.passwordStrength)]),
    phone: z.string().trim(),
    employee_code: z.string().trim(),
    national_id: z.string().trim(),
    status: z.enum(['active', 'suspended']),
  })

type StaffForm = z.infer<ReturnType<typeof makeSchema>>

const emptyForm = (): StaffForm => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  employee_code: '',
  national_id: '',
  status: 'active',
})

export function StaffDrawer({
  open,
  staff,
  onClose,
}: {
  open: boolean
  staff: SchoolUser | null
  onClose: () => void
}) {
  const text = useDict(staffText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const creating = staff === null
  const schema = useMemo(() => makeSchema(v, creating), [v, creating])
  const form = useForm<StaffForm>({ resolver: zodResolver(schema), defaultValues: emptyForm() })

  useEffect(() => {
    if (!open) return
    form.reset(
      staff
        ? {
            ...emptyForm(),
            name: staff.name,
            email: staff.email,
            phone: staff.phone ?? '',
            status: staff.status,
          }
        : emptyForm(),
    )
  }, [open, staff, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)

    try {
      if (staff) {
        const optional = Object.fromEntries(
          Object.entries({
            phone: values.phone,
            employee_code: values.employee_code,
            national_id: values.national_id,
          }).filter(([, value]) => value !== ''),
        )
        await updateStaff.mutateAsync({
          id: staff.id,
          name: values.name,
          status: values.status,
          ...optional,
          ...(values.password === '' ? {} : { password: values.password }),
        })
        notify('success', text.saved)
      } else {
        await createStaff.mutateAsync({ name: values.name, email: values.email, password: values.password })
        notify('success', text.created)
      }
      onClose()
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  const { errors } = form.formState

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={creating ? text.createTitle : text.editTitle}
      description={creating ? text.noVerification : undefined}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button type="submit" form="staff-form" variant="primary" loading={form.formState.isSubmitting}>
            {shell.common.save}
          </Button>
        </>
      }
    >
      <form id="staff-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        {creating ? (
          <p className="flex items-start gap-2 rounded-control border border-line border-s-2 border-s-accent bg-sunken px-3 py-2 text-small text-muted">
            <Icon name="info" className="size-4 text-accent" />
            <span>{text.rolesAssignedSeparately}</span>
          </p>
        ) : null}

        <Field label={text.fields.name} error={errors.name?.message} required>
          {(props) => <TextInput {...props} {...form.register('name')} />}
        </Field>

        {/* Email is set once at creation; the API does not accept it on update. */}
        {creating ? (
          <Field label={text.fields.email} error={errors.email?.message} required>
            {(props) => <TextInput {...props} {...form.register('email')} type="email" dir="ltr" />}
          </Field>
        ) : null}

        <Field
          label={text.fields.password}
          error={errors.password?.message}
          hint={creating ? v.passwordStrength : text.fields.passwordOptional}
          required={creating}
        >
          {(props) => (
            <TextInput
              {...props}
              {...form.register('password')}
              type="password"
              dir="ltr"
              autoComplete="new-password"
            />
          )}
        </Field>

        {/* Phone/employee code/national ID are not accepted at creation —
            they are set afterward by editing the account. */}
        {creating ? null : (
          <>
            <Field label={text.fields.phone} error={errors.phone?.message}>
              {(props) => <TextInput {...props} {...form.register('phone')} type="tel" dir="ltr" />}
            </Field>

            <Field label={text.fields.employeeCode} error={errors.employee_code?.message}>
              {(props) => <NumeralInput {...props} {...form.register('employee_code')} />}
            </Field>

            <Field label={text.fields.nationalId} error={errors.national_id?.message}>
              {(props) => <NumeralInput {...props} {...form.register('national_id')} inputMode="numeric" />}
            </Field>

            <Field label={text.fields.status} error={errors.status?.message}>
              {(props) => (
                <Select
                  {...props}
                  {...form.register('status')}
                  options={[
                    { value: 'active', label: text.statuses.active },
                    { value: 'suspended', label: text.statuses.suspended },
                  ]}
                />
              )}
            </Field>
          </>
        )}
      </form>
    </Drawer>
  )
}
