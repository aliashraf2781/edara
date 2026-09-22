import { useRef, useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { validationText } from '~/lib/forms/validation.i18n'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { ConfirmDialog } from '~/ui/dialog'
import { Icon } from '~/ui/icon'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { AVATAR_MAX_BYTES, AVATAR_TYPES, useAvatar } from '../../api/profile'
import type { GlobalUser } from '../../api/types'
import { profileText } from './profile.i18n'

const MAX_MB = AVATAR_MAX_BYTES / 1024 / 1024

export function AvatarCard({ user }: { user: GlobalUser }) {
  const text = useDict(profileText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { notify, notifyError } = useToast()
  const { upload, remove } = useAvatar()
  const input = useRef<HTMLInputElement>(null)
  const [confirming, setConfirming] = useState(false)

  const onPick = async (file: File | undefined) => {
    if (!file) return
    // Checked here so an oversized file never costs an upload round-trip.
    if (file.size > AVATAR_MAX_BYTES) return notify('danger', v.fileTooLarge(MAX_MB))
    if (!AVATAR_TYPES.includes(file.type)) return notify('danger', v.fileType)

    try {
      await upload.mutateAsync(file)
      notify('success', text.avatarUpdated)
    } catch (error) {
      notifyError(error, shell.error.title)
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  const confirmRemove = async () => {
    try {
      await remove.mutateAsync()
      notify('success', text.avatarRemoved)
      setConfirming(false)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  return (
    <Card>
      <CardHeader title={text.avatarTitle} />
      <CardBody className="flex flex-wrap items-center gap-6">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            width={64}
            height={64}
            className="size-16 rounded-card border border-line object-cover"
          />
        ) : (
          // Not a random gradient: the accent is the one interactive colour.
          <span className="flex size-16 items-center justify-center rounded-card border border-line bg-sunken text-h1 font-semibold text-accent">
            {user.name.slice(0, 1)}
          </span>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-small text-muted">{text.avatarBody}</p>
          <div className="flex flex-wrap gap-3">
            <input
              ref={input}
              type="file"
              accept={AVATAR_TYPES.join(',')}
              className="sr-only"
              onChange={(event) => void onPick(event.target.files?.[0])}
            />
            <Button loading={upload.isPending} onClick={() => input.current?.click()}>
              <Icon name="upload" />
              {text.uploadAvatar}
            </Button>
            {user.avatar ? (
              <Button variant="ghost" destructive onClick={() => setConfirming(true)}>
                {text.removeAvatar}
              </Button>
            ) : null}
          </div>
        </div>
      </CardBody>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={confirmRemove}
        loading={remove.isPending}
        destructive
        title={text.removeAvatarTitle}
        consequence={text.removeAvatarConsequence}
        confirmLabel={text.removeAvatar}
        cancelLabel={shell.common.cancel}
      />
    </Card>
  )
}
