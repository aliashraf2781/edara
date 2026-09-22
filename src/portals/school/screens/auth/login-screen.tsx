import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { z } from 'zod'
import { isApiError } from '~/lib/api/error'
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
import { useSchoolLogin, useSchoolToken } from '../../auth/use-school-session'
import { schoolText } from '../../school.i18n'
import { schoolLoginText } from './login.i18n'

const makeSchema = (v: ValidationText) =>
  z.object({
    email: z.email(v.email),
    password: z.string().min(1, v.required),
  })

type LoginForm = z.infer<ReturnType<typeof makeSchema>>

export function SchoolLoginScreen() {
  const text = useDict(schoolLoginText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const navigate = useNavigate()
  const token = useSchoolToken()
  const login = useSchoolLogin()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(() => makeSchema(v), [v])
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  if (token !== null) return <Navigate to="/school/dashboard" replace />

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await login.mutateAsync(values)
      navigate('/school/dashboard', { replace: true })
    } catch (error) {
      // One message for wrong credentials, an unknown code and an inactive
      // school alike — anything more specific would let school codes be
      // enumerated from this form.
      if (isApiError(error) && (error.status === 401 || error.status === 403)) {
        setFormMessage(text.failed)
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
      accent={<Icon name="school" />}
      preferenceLabels={{ language: shell.header.language, theme: shell.header.theme }}
      switcher={<PortalSwitcher />}
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        <Field label={text.email} error={form.formState.errors.email?.message} required>
          {(props) => (
            <TextInput {...props} {...form.register('email')} type="email" dir="ltr" autoComplete="username" />
          )}
        </Field>

        <Field label={text.password} error={form.formState.errors.password?.message} required>
          {(props) => (
            <TextInput
              {...props}
              {...form.register('password')}
              type="password"
              dir="ltr"
              autoComplete="current-password"
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
