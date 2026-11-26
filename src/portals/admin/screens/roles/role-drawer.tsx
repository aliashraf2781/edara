import { useState, type FormEvent } from 'react'
import { isValidationError } from '~/lib/api/error'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Checkbox } from '~/ui/checkbox'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION_GROUPS, unknownPermissions } from '../../api/permissions'
import type { Role } from '../../api/types'
import { useCreateRole, useUpdateRole } from '../../api/users'
import { rolesText } from './roles.i18n'

const NAME_PATTERN = /^[a-z0-9-]+$/

type RoleDrawerProps = {
  /** Null creates a new role. */
  role: Role | null
  existing: readonly Role[]
  onClose: () => void
}

export function RoleDrawer({ role, existing, onClose }: RoleDrawerProps) {
  const text = useDict(rolesText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()

  const [name, setName] = useState(role?.name ?? '')
  const [granted, setGranted] = useState<string[]>(() => [...(role?.permissions ?? [])])
  const [nameError, setNameError] = useState<string>()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  // Permissions the catalog does not know are still listed, so saving keeps them.
  const extra = unknownPermissions(role?.permissions ?? [])
  const groups = [
    ...PERMISSION_GROUPS.map((group) => ({ id: group.id, title: text.groups[group.id], items: group.permissions })),
    ...(extra.length > 0 ? [{ id: 'other', title: text.otherGroup, items: extra }] : []),
  ]

  const toggle = (items: readonly string[], checked: boolean) =>
    setGranted((current) => {
      const rest = current.filter((item) => !items.includes(item))
      return checked ? [...rest, ...items] : rest
    })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setFormMessage(null)
    const trimmed = name.trim()
    if (trimmed === '') return setNameError(v.required)
    if (!NAME_PATTERN.test(trimmed)) return setNameError(text.fields.nameHint)
    if (existing.some((other) => other.name === trimmed && other.id !== role?.id)) {
      return setNameError(text.nameTaken)
    }
    setNameError(undefined)

    try {
      if (role) await updateRole.mutateAsync({ id: role.id, name: trimmed, permissions: granted })
      else await createRole.mutateAsync({ name: trimmed, permissions: granted })
      notify('success', role ? text.updated : text.created)
      onClose()
    } catch (error) {
      const message = isValidationError(error) ? error.fieldErrors.name?.[0] : undefined
      if (message) setNameError(message)
      else setFormMessage(error instanceof Error ? error.message : shell.error.title)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={role ? text.editTitle : text.createTitle}
      description={text.syncNote}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button
            type="submit"
            form="role-form"
            variant="primary"
            loading={createRole.isPending || updateRole.isPending}
          >
            {role ? shell.common.save : shell.common.create}
          </Button>
        </>
      }
    >
      <form id="role-form" noValidate onSubmit={submit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        <Field label={text.fields.name} hint={text.fields.nameHint} error={nameError} required>
          {(props) => (
            <TextInput
              {...props}
              value={name}
              onChange={(event) => setName(event.target.value)}
              dir="ltr"
              autoComplete="off"
            />
          )}
        </Field>

        <p className="label-form">{text.fields.permissions}</p>
        {groups.map((group) => {
          const selected = group.items.filter((item) => granted.includes(item)).length
          const all = selected === group.items.length
          return (
            <fieldset key={group.id} className="flex flex-col gap-2 rounded-control border border-line px-4 py-3">
              <legend className="px-1 text-body font-semibold text-ink">{group.title}</legend>
              <div className="flex items-center justify-between gap-3">
                <span className="text-small text-muted">{text.selectedCount(selected, group.items.length)}</span>
                <Button variant="ghost" onClick={() => toggle(group.items, !all)}>
                  {all ? text.clearAll : text.selectAll}
                </Button>
              </div>
              {group.items.map((permission) => (
                <Checkbox
                  key={permission}
                  label={text.permissions[permission] ?? permission}
                  checked={granted.includes(permission)}
                  onChange={(event) => toggle([permission], event.target.checked)}
                />
              ))}
            </fieldset>
          )
        })}
      </form>
    </Drawer>
  )
}
