import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { STRONG_PASSWORD, validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { useChangePassword } from '../../api/profile'
import { profileText } from './profile.i18n'

const FIELDS = ['current_password', 'new_password', 'new_password_confirmation'] as const

const makeSchema = (v: ValidationText) =>
  z
    .object({
      current_password: z.string().min(1, v.required),
      new_password: z.string().regex(STRONG_PASSWORD, v.passwordStrength),
      new_password_confirmation: z.string().min(1, v.required),
    })
    .refine((values) => values.new_password === values.new_password_confirmation, {
      path: ['new_password_confirmation'],
      message: v.passwordMismatch,
    })

type PasswordForm = z.infer<ReturnType<typeof makeSchema>>

export function PasswordCard() {
  const text = useDict(profileText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const changePassword = useChangePassword()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(() => makeSchema(v), [v])
  const form = useForm<PasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', new_password: '', new_password_confirmation: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await changePassword.mutateAsync(values)
      notify('success', text.passwordChanged)
      form.reset()
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  return (
    <Card>
      <CardHeader title={text.passwordTitle} />
      <CardBody>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <p className="text-small text-muted">{text.passwordBody}</p>
          <FormAlert message={formMessage} />

          <Field
            label={text.currentPassword}
            error={form.formState.errors.current_password?.message}
            required
          >
            {(props) => (
              <TextInput
                {...props}
                {...form.register('current_password')}
                type="password"
                dir="ltr"
                autoComplete="current-password"
              />
            )}
          </Field>

          <Field
            label={text.newPassword}
            error={form.formState.errors.new_password?.message}
            hint={v.passwordStrength}
            required
          >
            {(props) => (
              <TextInput
                {...props}
                {...form.register('new_password')}
                type="password"
                dir="ltr"
                autoComplete="new-password"
              />
            )}
          </Field>

          <Field
            label={text.confirmPassword}
            error={form.formState.errors.new_password_confirmation?.message}
            required
          >
            {(props) => (
              <TextInput
                {...props}
                {...form.register('new_password_confirmation')}
                type="password"
                dir="ltr"
                autoComplete="new-password"
              />
            )}
          </Field>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
              {text.changePassword}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
