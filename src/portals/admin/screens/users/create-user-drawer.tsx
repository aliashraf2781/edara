import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { STRONG_PASSWORD, validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Checkbox } from '~/ui/checkbox'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { ASSIGNABLE_GLOBAL_ROLES } from '../../api/permissions'
import { useCreateGlobalUser } from '../../api/users'
import { globalUsersText } from './users.i18n'

const FIELDS = ['name', 'email', 'password', 'password_confirmation', 'roles'] as const

const makeSchema = (v: ValidationText) =>
  z
    .object({
      name: z.string().trim().min(1, v.required),
      email: z.email(v.email),
      password: z.string().regex(STRONG_PASSWORD, v.passwordStrength),
      password_confirmation: z.string().min(1, v.required),
      roles: z.array(z.string()).min(1, v.atLeastOne),
    })
    .refine((values) => values.password === values.password_confirmation, {
      path: ['password_confirmation'],
      message: v.passwordMismatch,
    })

type CreateUserForm = z.infer<ReturnType<typeof makeSchema>>

export function CreateUserDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const text = useDict(globalUsersText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const createUser = useCreateGlobalUser()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(() => makeSchema(v), [v])
  const form = useForm<CreateUserForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      roles: ['reviewer'],
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await createUser.mutateAsync(values)
      notify('success', text.created)
      form.reset()
      onClose()
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  const selected = useWatch({ control: form.control, name: 'roles' })

  const toggleRole = (role: string, checked: boolean) => {
    const next = checked ? [...selected, role] : selected.filter((item) => item !== role)
    form.setValue('roles', next, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={text.createTitle}
      description={text.createBody}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button type="submit" form="create-global-user" variant="primary" loading={form.formState.isSubmitting}>
            {shell.common.create}
          </Button>
        </>
      }
    >
      <form id="create-global-user" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        <Field label={text.fields.name} error={form.formState.errors.name?.message} required>
          {(props) => <TextInput {...props} {...form.register('name')} />}
        </Field>

        <Field label={text.fields.email} error={form.formState.errors.email?.message} required>
          {(props) => (
            <TextInput {...props} {...form.register('email')} type="email" dir="ltr" autoComplete="off" />
          )}
        </Field>

        <Field
          label={text.fields.password}
          error={form.formState.errors.password?.message}
          hint={v.passwordStrength}
          required
        >
          {(props) => (
            <TextInput {...props} {...form.register('password')} type="password" dir="ltr" autoComplete="new-password" />
          )}
        </Field>

        <Field
          label={text.fields.passwordConfirmation}
          error={form.formState.errors.password_confirmation?.message}
          required
        >
          {(props) => (
            <TextInput
              {...props}
              {...form.register('password_confirmation')}
              type="password"
              dir="ltr"
              autoComplete="new-password"
            />
          )}
        </Field>

        <fieldset className="flex flex-col gap-1">
          <legend className="label-micro">{text.fields.roles}</legend>
          {/* Only the three global roles. Tenant role names never appear here. */}
          {ASSIGNABLE_GLOBAL_ROLES.map((role) => (
            <Checkbox
              key={role}
              label={text.roleNames[role] ?? role}
              checked={selected.includes(role)}
              onChange={(event) => toggleRole(role, event.target.checked)}
            />
          ))}
          {form.formState.errors.roles ? (
            <p role="alert" className="text-small text-danger">
              {form.formState.errors.roles.message}
            </p>
          ) : null}
        </fieldset>
      </form>
    </Drawer>
  )
}
