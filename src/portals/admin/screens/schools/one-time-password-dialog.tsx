import { useCopyToClipboard } from '~/lib/hooks/use-copy-to-clipboard'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Icon } from '~/ui/icon'
import { useToast } from '~/ui/toast'
import { schoolFormText } from './school-detail.i18n'

type OneTimePasswordDialogProps = {
  open: boolean
  email: string
  password: string
  onAcknowledge: () => void
}

/**
 * The Super Admin password exists in this component's props and nowhere else.
 * It is never written to storage, never put in a query cache, and never
 * re-fetchable — closing this dialog loses it permanently, which is why the
 * only way out is the explicit acknowledgement button.
 */
export function OneTimePasswordDialog({
  open,
  email,
  password,
  onAcknowledge,
}: OneTimePasswordDialogProps) {
  const text = useDict(schoolFormText)
  const { notify } = useToast()
  const { copied, copy } = useCopyToClipboard()

  const onCopy = async () => {
    const ok = await copy(password)
    if (!ok) notify('danger', text.provision.copyFailed)
  }

  return (
    <Dialog
      open={open}
      // `busy` blocks Esc and backdrop dismissal: this must not close by accident.
      busy
      onClose={onAcknowledge}
      title={text.provision.passwordTitle}
      footer={
        <Button variant="primary" onClick={onAcknowledge}>
          {text.provision.acknowledge}
        </Button>
      }
    >
      <p>{text.provision.passwordBody}</p>

      <p className="flex items-start gap-2 rounded-control border border-attention border-s-2 bg-attention/12 px-3 py-2 text-small text-attention">
        <Icon name="alert" className="size-4" />
        <span>{text.provision.passwordWarning}</span>
      </p>

      <dl className="flex flex-col gap-3 rounded-control border border-line bg-sunken p-4">
        <div className="flex flex-col gap-1">
          <dt className="label-micro">{text.provision.email}</dt>
          <dd className="font-mono text-body text-ink" dir="ltr">
            {email}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="label-micro">{text.provision.password}</dt>
          <dd className="font-mono text-h2 text-ink select-all" dir="ltr">
            {password}
          </dd>
        </div>
      </dl>

      <Button variant="primary" onClick={onCopy}>
        <Icon name={copied ? 'check' : 'copy'} />
        {copied ? text.provision.copied : text.provision.copy}
      </Button>

      <p className="text-small text-muted">{text.provision.closeWarning}</p>
    </Dialog>
  )
}
