import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isApiError, isValidationError } from '~/lib/api/error'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { schoolApi } from '../../api/client'
import { schoolProfileText } from './profile.i18n'

const FIELDS = ['current_password', 'new_password', 'new_password_confirmation'] as const
const MIN_LENGTH = 8

type PasswordText = (typeof schoolProfileText)['en']['password']

const makeSchema = (v: ValidationText, text: PasswordText) =>
  z
    .object({
      current_password: z.string().min(1, v.required),
      new_password: z.string().min(MIN_LENGTH, v.minLength(MIN_LENGTH)),
      new_password_confirmation: z.string().min(1, v.required),
    })
    .refine((values) => values.new_password !== values.current_password, {
      path: ['new_password'],
      message: text.sameAsCurrent,
    })
    .refine((values) => values.new_password === values.new_password_confirmation, {
      path: ['new_password_confirmation'],
      message: v.passwordMismatch,
    })

type PasswordForm = z.infer<ReturnType<typeof makeSchema>>

export function PasswordCard() {
  const text = useDict(schoolProfileText).password
  const v = useDict(validationText)
  const { notify } = useToast()
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  // Seconds left after a 429.
  const [wait, setWait] = useState(0)

  const changePassword = useMutation({
    mutationFn: (input: PasswordForm) => schoolApi.post<unknown>('/school/me/password', input),
  })

  useEffect(() => {
    if (wait <= 0) return
    const timer = window.setTimeout(() => setWait(wait - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [wait])

  const schema = useMemo(() => makeSchema(v, text), [v, text])
  const form = useForm<PasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', new_password: '', new_password_confirmation: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await changePassword.mutateAsync(values)
      notify('success', text.changed)
      form.reset()
    } catch (error) {
      if (isApiError(error) && error.status === 429) {
        setWait(error.retryAfterSeconds ?? 60)
        setFormMessage(error.message)
        return
      }
      const failure = applyFieldErrors(error, form.setError, FIELDS, text.failed)
      setFormMessage(isValidationError(error) || isApiError(error) ? failure.formMessage : text.failed)
    }
  })

  const type = visible ? 'text' : 'password'

  return (
    <Card>
      <CardHeader title={text.title} />
      <CardBody>
        <form noValidate onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
          <p className="text-small text-muted">{text.body}</p>
          <FormAlert message={formMessage} />

          <Field label={text.current} error={form.formState.errors.current_password?.message} required>
            {(props) => (
              <TextInput
                {...props}
                {...form.register('current_password')}
                type={type}
                dir="ltr"
                autoComplete="current-password"
              />
            )}
          </Field>

          <Field label={text.new} hint={text.newHint} error={form.formState.errors.new_password?.message} required>
            {(props) => (
              <TextInput
                {...props}
                {...form.register('new_password')}
                type={type}
                dir="ltr"
                autoComplete="new-password"
              />
            )}
          </Field>

          <Field label={text.confirm} error={form.formState.errors.new_password_confirmation?.message} required>
            {(props) => (
              <TextInput
                {...props}
                {...form.register('new_password_confirmation')}
                type={type}
                dir="ltr"
                autoComplete="new-password"
              />
            )}
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setVisible(!visible)}>
              <Icon name={visible ? 'eyeOff' : 'eye'} />
              {visible ? text.hide : text.show}
            </Button>
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting} disabled={wait > 0}>
              {wait > 0 ? text.submitWait(wait) : text.submit}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
