import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody } from '~/ui/card'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useCreateTenant } from '../../api/tenants'
import { useAdminSession } from '../../auth/session-context'
import { SchoolCreatedDialog } from './school-created-dialog'
import { schoolFormText } from './school-detail.i18n'
import {
  CREATE_FIELDS,
  emptyCreateForm,
  makeCreateSchema,
  toCreatePayload,
  type CreateFormValues,
} from './school-form'

/**
 * A single request creates the school's record and activates it. There is no
 * separate "step 2" anymore, and no one-time password reveal for this path —
 * the operator sets the Super Admin's password themselves, right here.
 */
export function SchoolCreateScreen() {
  const text = useDict(schoolFormText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const navigate = useNavigate()
  const { can } = useAdminSession()
  const { notify } = useToast()
  const createTenant = useCreateTenant()
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [created, setCreated] = useState<{
    code: string
    loginEmail: string
    typedEmail: string
  } | null>(null)

  const schema = useMemo(() => makeCreateSchema(v), [v])
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCreateForm(),
  })

  if (!can(PERMISSION.createTenant)) {
    return <NoAccess title={text.createTitle} description={shell.guard.noAccess} />
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      const result = await createTenant.mutateAsync(toCreatePayload(values))
      notify('success', text.created)
      setCreated({
        code: result.tenant.code,
        loginEmail: result.superAdmin.email,
        typedEmail: values.admin_email,
      })
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, CREATE_FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  const onAcknowledgeLoginEmail = () => {
    if (created) navigate(`/admin/schools/${created.code}`, { replace: true })
  }

  const { errors } = form.formState

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <PageHeader title={text.createTitle} description={text.createDescription} />

      <Card>
        <CardBody className="flex flex-col gap-6">
          <FormAlert message={formMessage} />

          <Field label={text.fields.name} error={errors.name?.message} required>
            {(props) => <TextInput {...props} {...form.register('name')} autoComplete="off" />}
          </Field>

          <Field
            label={text.fields.adminEmail}
            error={errors.admin_email?.message}
            hint={text.fields.adminEmailHint}
            required
          >
            {(props) => (
              <TextInput {...props} {...form.register('admin_email')} type="email" dir="ltr" autoComplete="off" />
            )}
          </Field>

          <Field
            label={text.fields.adminPassword}
            error={errors.admin_password?.message}
            hint={v.passwordStrength}
            required
          >
            {(props) => (
              <TextInput
                {...props}
                {...form.register('admin_password')}
                type="password"
                dir="ltr"
                autoComplete="new-password"
              />
            )}
          </Field>

          <Field
            label={text.fields.adminPasswordConfirmation}
            error={errors.admin_password_confirmation?.message}
            required
          >
            {(props) => (
              <TextInput
                {...props}
                {...form.register('admin_password_confirmation')}
                type="password"
                dir="ltr"
                autoComplete="new-password"
              />
            )}
          </Field>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button onClick={() => navigate('/admin/schools')}>{shell.common.cancel}</Button>
        <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
          {text.submitCreate}
        </Button>
      </div>

      {created && (
        <SchoolCreatedDialog
          open
          loginEmail={created.loginEmail}
          typedEmail={created.typedEmail}
          onAcknowledge={onAcknowledgeLoginEmail}
        />
      )}
    </form>
  )
}
