import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { AuthLayout } from '~/ui/auth-layout'
import { Button } from '~/ui/button'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { NumeralInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { adminApi } from '../../api/client'
import { adminLoginText } from './login.i18n'

const CODE_LENGTH = 6

const makeSchema = (v: ValidationText) =>
  z.object({ code: z.string().regex(/^\d{6}$/, v.digits(CODE_LENGTH)) })

type VerifyForm = z.infer<ReturnType<typeof makeSchema>>

export function AdminVerifyScreen() {
  const text = useDict(adminLoginText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const navigate = useNavigate()
  const { notify, notifyError } = useToast()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const email = (useLocation().state as { email?: string } | null)?.email ?? null

  const schema = useMemo(() => makeSchema(v), [v])
  const form = useForm<VerifyForm>({ resolver: zodResolver(schema), defaultValues: { code: '' } })

  const resend = useMutation({
    mutationFn: () => adminApi.post<{ verificationCode: number }>('/auth/resend-verification', { email }),
    onSuccess: () => notify('info', text.resent),
    onError: (error) => notifyError(error, text.failed),
  })

  // Reached only from the login screen, which supplies the email.
  if (!email) return <Navigate to="/admin/login" replace />

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await adminApi.post<boolean>('/auth/verify', { email, code: values.code })
      notify('success', text.verified)
      navigate('/admin/login', { replace: true })
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, ['code'], text.failed)
      setFormMessage(failure.formMessage)
    }
  })

  return (
    <AuthLayout
      eyebrow={text.eyebrow}
      title={text.verifyTitle}
      subtitle={`${text.verifyBody} ${email}`}
      accent={<Icon name="shield" />}
      preferenceLabels={{ language: shell.header.language, theme: shell.header.theme }}
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        <Field label={text.code} error={form.formState.errors.code?.message} required>
          {(props) => (
            <NumeralInput
              {...props}
              {...form.register('code')}
              inputMode="numeric"
              maxLength={CODE_LENGTH}
              autoComplete="one-time-code"
            />
          )}
        </Field>

        <Button type="submit" variant="primary" size="lg" loading={form.formState.isSubmitting}>
          {text.verify}
        </Button>

        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" loading={resend.isPending} onClick={() => resend.mutate()}>
            {text.resend}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/login')}>
            {text.backToLogin}
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
