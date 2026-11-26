import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Checkbox } from '~/ui/checkbox'
import { Spinner } from '~/ui/spinner'
import { adminText } from '../../admin.i18n'
import { UNASSIGNABLE_ROLES } from '../../api/permissions'
import { useGlobalRoles } from '../../api/users'
import { globalUsersText } from './users.i18n'

type RolePickerProps = {
  value: readonly string[]
  onChange: (next: string[]) => void
  error?: string
}

export function RolePicker({ value, onChange, error }: RolePickerProps) {
  const text = useDict(globalUsersText)
  const shell = useDict(adminText)
  const roles = useGlobalRoles(true)
  // What was held when the form opened: an unassignable role stays listed for
  // a user who already has it, even after being unticked.
  const [initial] = useState(() => [...value])

  const names = (roles.data ?? [])
    .map((role) => role.name)
    .filter((name) => !UNASSIGNABLE_ROLES.includes(name) || initial.includes(name))

  const toggle = (name: string, checked: boolean) =>
    onChange(checked ? [...value, name] : value.filter((item) => item !== name))

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label-form mb-2">{text.fields.roles}</legend>
      {roles.isPending ? (
        <Spinner className="text-accent" label={shell.guard.loading} />
      ) : roles.isError ? (
        <p className="text-small text-danger">{roles.error.message}</p>
      ) : names.length === 0 ? (
        <p className="text-small text-muted">{text.noRolesAvailable}</p>
      ) : (
        names.map((name) => (
          <Checkbox
            key={name}
            label={text.roleNames[name] ?? name}
            checked={value.includes(name)}
            onChange={(event) => toggle(name, event.target.checked)}
          />
        ))
      )}
      {error ? (
        <p role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
