import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { z } from 'zod'
import { isValidationError } from '~/lib/api/error'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { AuthLayout } from '~/ui/auth-layout'
import { Button } from '~/ui/button'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { PortalSwitcher } from '~/ui/portal-switcher'
import { TextInput } from '~/ui/text-input'
import { adminText } from '../../admin.i18n'
import { useAdminLogin, useAdminToken } from '../../auth/use-admin-session'
import { adminLoginText } from './login.i18n'

const makeSchema = (v: ValidationText) =>
  z.object({
    email: z.email(v.email),
    password: z.string().min(1, v.required),
  })

type LoginForm = z.infer<ReturnType<typeof makeSchema>>

export function AdminLoginScreen() {
  const text = useDict(adminLoginText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const navigate = useNavigate()
  const token = useAdminToken()
  const login = useAdminLogin()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(() => makeSchema(v), [v])
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  if (token !== null) return <Navigate to="/admin/schools" replace />

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await login.mutateAsync(values)
      navigate('/admin/schools', { replace: true })
    } catch (error) {
      // A 422 on `email` at this point means the account is not verified —
      // the format was already checked client-side (guide 2.2).
      if (isValidationError(error) && 'email' in error.fieldErrors) {
        navigate('/admin/verify', { state: { email: values.email }, replace: true })
        return
      }
      const failure = applyFieldErrors(error, form.setError, ['email', 'password'], text.failed)
      setFormMessage(failure.formMessage)
    }
  })

  return (
    <AuthLayout
      eyebrow={text.eyebrow}
      title={text.title}
      subtitle={text.subtitle}
      accent={<Icon name="shield" />}
      preferenceLabels={{ language: shell.header.language, theme: shell.header.theme }}
      switcher={<PortalSwitcher />}
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        <Field label={text.email} error={form.formState.errors.email?.message} required>
          {(props) => (
            <TextInput {...props} {...form.register('email')} type="email" autoComplete="username" dir="ltr" />
          )}
        </Field>

        <Field label={text.password} error={form.formState.errors.password?.message} required>
          {(props) => (
            <TextInput
              {...props}
              {...form.register('password')}
              type="password"
              autoComplete="current-password"
              dir="ltr"
            />
          )}
        </Field>

        <Button type="submit" variant="primary" size="lg" loading={form.formState.isSubmitting}>
          {text.submit}
        </Button>
      </form>
    </AuthLayout>
  )
}
