import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Checkbox } from '~/ui/checkbox'
import { Drawer } from '~/ui/drawer'
import { Icon } from '~/ui/icon'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { ASSIGNABLE_GLOBAL_ROLES } from '../../api/permissions'
import type { GlobalUser } from '../../api/types'
import { useUpdateGlobalUser } from '../../api/users'
import { globalUsersText } from './users.i18n'

/**
 * A standalone role set with the current roles pre-ticked and one "Save roles"
 * button — saving replaces the set, so an additive "add role" control would
 * misdescribe what happens.
 */
export function SyncRolesDrawer({ user, onClose }: { user: GlobalUser; onClose: () => void }) {
  const text = useDict(globalUsersText)
  const shell = useDict(adminText)
  const { notify, notifyError } = useToast()
  const updateUser = useUpdateGlobalUser()
  // Seeded from the user this drawer was opened for. The parent keys this
  // component by user id, so a different user remounts it with fresh state
  // instead of needing an effect to resync.
  const [selected, setSelected] = useState<readonly string[]>(user.roles)

  const toggle = (role: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, role] : current.filter((item) => item !== role),
    )

  const save = async () => {
    try {
      await updateUser.mutateAsync({ id: user.id, roles: [...selected] })
      notify('success', text.rolesSaved)
      onClose()
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={text.syncRolesTitle}
      description={user.name}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button variant="primary" loading={updateUser.isPending} onClick={save}>
            {text.saveRoles}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="flex items-start gap-2 rounded-control border border-attention border-s-2 bg-attention/12 px-3 py-2 text-small text-attention">
          <Icon name="info" className="size-4" />
          <span>{text.syncRolesBody}</span>
        </p>

        <fieldset className="flex flex-col gap-1">
          <legend className="label-micro">{text.fields.roles}</legend>
          {ASSIGNABLE_GLOBAL_ROLES.map((role) => (
            <Checkbox
              key={role}
              label={text.roleNames[role] ?? role}
              checked={selected.includes(role)}
              onChange={(event) => toggle(role, event.target.checked)}
            />
          ))}
        </fieldset>
      </div>
    </Drawer>
  )
}
