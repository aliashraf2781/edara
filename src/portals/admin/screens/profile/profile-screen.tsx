import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { LOCALES, LOCALE_LABEL } from '~/lib/i18n/locales'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DefinitionList } from '~/ui/definition-list'
import { ErrorState } from '~/ui/error-state'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { PageHeader } from '~/ui/page-header'
import { Select } from '~/ui/select'
import { Spinner } from '~/ui/spinner'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { useProfile, useUpdateProfile } from '../../api/profile'
import { AvatarCard } from './avatar-card'
import { PasswordCard } from './password-card'
import { profileText } from './profile.i18n'

const FIELDS = ['name', 'phone', 'locale', 'timezone'] as const

const makeSchema = (required: string) =>
  z.object({
    name: z.string().trim().min(1, required),
    phone: z.string().trim(),
    locale: z.enum(LOCALES),
    timezone: z.string().trim(),
  })

type ProfileForm = z.infer<ReturnType<typeof makeSchema>>

export function AdminProfileScreen() {
  const text = useDict(profileText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const profile = useProfile()
  const updateProfile = useUpdateProfile()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(() => makeSchema(v.required), [v.required])
  const form = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    values: {
      name: profile.data?.name ?? '',
      phone: profile.data?.phone ?? '',
      locale: profile.data?.locale === 'en' ? 'en' : 'ar',
      timezone: profile.data?.timezone ?? 'UTC',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await updateProfile.mutateAsync(values)
      notify('success', text.saved)
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  if (profile.isPending) {
    return (
      <div className="flex items-center gap-3 text-muted">
        <Spinner className="text-accent" label={shell.guard.loading} />
        <p className="text-small">{shell.guard.loading}</p>
      </div>
    )
  }

  if (profile.isError) {
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} labels={shell.error} />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      <Card>
        <CardHeader title={text.details} />
        <CardBody>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
            <FormAlert message={formMessage} />

            <DefinitionList
              columns={1}
              items={[{ term: text.email, value: profile.data.email, mono: true }]}
            />
            <p className="text-small text-muted">{text.emailLocked}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={text.name} error={form.formState.errors.name?.message} required>
                {(props) => <TextInput {...props} {...form.register('name')} />}
              </Field>

              <Field label={text.phone} error={form.formState.errors.phone?.message}>
                {(props) => <TextInput {...props} {...form.register('phone')} type="tel" dir="ltr" />}
              </Field>

              <Field label={text.language} error={form.formState.errors.locale?.message}>
                {(props) => (
                  <Select
                    {...props}
                    {...form.register('locale')}
                    options={LOCALES.map((value) => ({ value, label: LOCALE_LABEL[value] }))}
                  />
                )}
              </Field>

              <Field label={text.timezone} error={form.formState.errors.timezone?.message}>
                {(props) => <TextInput {...props} {...form.register('timezone')} dir="ltr" />}
              </Field>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={form.formState.isSubmitting}
                disabled={!form.formState.isDirty}
              >
                {shell.common.save}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <AvatarCard user={profile.data} />
      <PasswordCard />
    </div>
  )
}
