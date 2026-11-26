import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { STRONG_PASSWORD, validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { GLOBAL_ADMIN_ROLE, PERMISSION, SUPER_ADMIN_ROLE } from '../../api/permissions'
import type { GlobalUser } from '../../api/types'
import { useUpdateGlobalUser, type UpdateUserInput } from '../../api/users'
import { useAdminSession } from '../../auth/session-context'
import { RolePicker } from './role-picker'
import { globalUsersText } from './users.i18n'

const FIELDS = ['name', 'email', 'password', 'password_confirmation', 'roles'] as const
const ADMIN_ROLES: readonly string[] = [GLOBAL_ADMIN_ROLE, SUPER_ADMIN_ROLE]

const makeSchema = (v: ValidationText) =>
  z
    .object({
      name: z.string().trim().min(1, v.required),
      email: z.email(v.email),
      // Blank keeps the current password.
      password: z.string().refine((value) => value === '' || STRONG_PASSWORD.test(value), v.passwordStrength),
      password_confirmation: z.string(),
      roles: z.array(z.string()),
    })
    .refine((values) => values.password === values.password_confirmation, {
      path: ['password_confirmation'],
      message: v.passwordMismatch,
    })

type EditUserForm = z.infer<ReturnType<typeof makeSchema>>

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((item) => b.includes(item))

export function EditUserDrawer({ user, onClose }: { user: GlobalUser; onClose: () => void }) {
  const text = useDict(globalUsersText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const updateUser = useUpdateGlobalUser()
  const { can, user: me } = useAdminSession()
  const canAssignRoles = can(PERMISSION.assignGlobalRole)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(() => makeSchema(v), [v])
  const form = useForm<EditUserForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      roles: [...user.roles],
    },
  })

  const selected = useWatch({ control: form.control, name: 'roles' })
  const selfDemote =
    user.id === me.id &&
    user.roles.some((role) => ADMIN_ROLES.includes(role)) &&
    !selected.some((role) => ADMIN_ROLES.includes(role))

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    // Send only what changed: `roles`, when present, replaces the whole set.
    const changes: UpdateUserInput = { id: user.id }
    if (values.name.trim() !== user.name) changes.name = values.name.trim()
    if (values.email !== user.email) changes.email = values.email
    if (values.password !== '') {
      changes.password = values.password
      changes.password_confirmation = values.password_confirmation
    }
    if (canAssignRoles && !sameSet(values.roles, user.roles)) changes.roles = values.roles

    if (Object.keys(changes).length === 1) return onClose()

    try {
      await updateUser.mutateAsync(changes)
      notify('success', text.updated)
      onClose()
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  return (
    <Drawer
      open
      onClose={onClose}
      title={text.editTitle}
      description={user.email}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button type="submit" form="edit-global-user" variant="primary" loading={form.formState.isSubmitting}>
            {shell.common.save}
          </Button>
        </>
      }
    >
      <form id="edit-global-user" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
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
          label={text.fields.newPassword}
          error={form.formState.errors.password?.message}
          hint={text.passwordOptionalHint}
        >
          {(props) => (
            <TextInput {...props} {...form.register('password')} type="password" dir="ltr" autoComplete="new-password" />
          )}
        </Field>

        <Field label={text.fields.passwordConfirmation} error={form.formState.errors.password_confirmation?.message}>
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

        {canAssignRoles ? (
          <>
            <p className="text-small text-muted">{text.syncRolesBody}</p>
            <RolePicker
              value={selected}
              onChange={(next) => form.setValue('roles', next, { shouldValidate: true, shouldDirty: true })}
              error={form.formState.errors.roles?.message}
            />
            {selfDemote ? (
              <p role="alert" className="text-small text-attention">
                {text.selfDemoteWarning}
              </p>
            ) : null}
          </>
        ) : null}
      </form>
    </Drawer>
  )
}
