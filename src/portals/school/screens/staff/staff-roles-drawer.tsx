import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Checkbox } from '~/ui/checkbox'
import { Drawer } from '~/ui/drawer'
import { Icon } from '~/ui/icon'
import { useToast } from '~/ui/toast'
import { SCHOOL_ROLES, type SchoolRole } from '../../api/roles'
import { useSyncStaffRoles } from '../../api/staff'
import type { SchoolUser } from '../../api/types'
import { schoolText } from '../../school.i18n'
import { staffText } from './staff.i18n'

/**
 * A standalone role set, separate from the edit form, because saving replaces
 * the roles rather than adding to them. Each role carries its description, so
 * the choice is made knowing what it grants.
 */
export function StaffRolesDrawer({ staff, onClose }: { staff: SchoolUser; onClose: () => void }) {
  const text = useDict(staffText)
  const shell = useDict(schoolText)
  const { notify, notifyError } = useToast()
  const syncRoles = useSyncStaffRoles()
  // Seeded from the staff member this drawer was opened for; the parent keys
  // it by id, so switching rows remounts rather than resyncing in an effect.
  const [selected, setSelected] = useState<readonly string[]>(staff.roles)

  const toggle = (role: SchoolRole, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, role] : current.filter((item) => item !== role),
    )

  const save = async () => {
    try {
      await syncRoles.mutateAsync({ id: staff.id, roles: [...selected] })
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
      title={text.rolesTitle}
      description={staff.name}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button
            variant="primary"
            loading={syncRoles.isPending}
            disabled={selected.length === 0}
            onClick={save}
          >
            {text.saveRoles}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="flex items-start gap-2 rounded-control border border-attention border-s-2 bg-attention/12 px-3 py-2 text-small text-attention">
          <Icon name="info" className="size-4" />
          <span>{text.rolesBody}</span>
        </p>

        <fieldset className="flex flex-col gap-1">
          <legend className="label-micro">{text.fields.roles}</legend>
          {SCHOOL_ROLES.map((role) => (
            <Checkbox
              key={role}
              label={shell.roles[role]}
              description={shell.roleDescriptions[role]}
              checked={selected.includes(role)}
              onChange={(event) => toggle(role, event.target.checked)}
            />
          ))}
        </fieldset>
      </div>
    </Drawer>
  )
}
