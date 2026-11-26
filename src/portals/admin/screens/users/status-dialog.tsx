import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { Select } from '~/ui/select'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import type { GlobalUser, UserStatus } from '../../api/types'
import { USER_STATUSES, useGlobalUserStatus } from '../../api/users'
import { globalUsersText } from './users.i18n'

export function StatusDialog({ user, onClose }: { user: GlobalUser; onClose: () => void }) {
  const text = useDict(globalUsersText)
  const shell = useDict(adminText)
  const { notify, notifyError } = useToast()
  const changeStatus = useGlobalUserStatus()
  const [status, setStatus] = useState<UserStatus>(user.status)

  const save = async () => {
    try {
      await changeStatus.mutateAsync({ id: user.id, status })
      notify('success', text.statusSaved)
      onClose()
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={text.statusTitle}
      description={`${user.name} — ${user.email}`}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button variant="primary" loading={changeStatus.isPending} disabled={status === user.status} onClick={save}>
            {text.saveStatus}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-small text-muted">{text.statusBody}</p>
        <Field label={text.statusLabel}>
          {(props) => (
            <Select
              {...props}
              value={status}
              onChange={(event) => setStatus(event.target.value as UserStatus)}
              options={USER_STATUSES.map((value) => ({ value, label: text.statuses[value] }))}
            />
          )}
        </Field>
      </div>
    </Drawer>
  )
}
