import { useCopyToClipboard } from '~/lib/hooks/use-copy-to-clipboard'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Icon } from '~/ui/icon'
import { useToast } from '~/ui/toast'
import { schoolFormText } from './school-detail.i18n'

type LoginEmailDialogProps = {
  open: boolean
  email: string
  onAcknowledge: () => void
}

/**
 * The composite login email (code embedded) only ever appears in the create
 * response — it is never surfaced again, so this dialog is the one chance to
 * hand it to the operator.
 */
export function LoginEmailDialog({ open, email, onAcknowledge }: LoginEmailDialogProps) {
  const text = useDict(schoolFormText)
  const { notify } = useToast()
  const { copied, copy } = useCopyToClipboard()

  const onCopy = async () => {
    const ok = await copy(email)
    if (!ok) notify('danger', text.loginEmail.copyFailed)
  }

  return (
    <Dialog
      open={open}
      busy
      onClose={onAcknowledge}
      title={text.loginEmail.title}
      footer={
        <Button variant="primary" onClick={onAcknowledge}>
          {text.loginEmail.acknowledge}
        </Button>
      }
    >
      <p>{text.loginEmail.body}</p>

      <p className="flex items-start gap-2 rounded-control border border-attention border-s-2 bg-attention/12 px-3 py-2 text-small text-attention">
        <Icon name="alert" className="size-4" />
        <span>{text.loginEmail.warning}</span>
      </p>

      <dl className="flex flex-col gap-3 rounded-control border border-line bg-sunken p-4">
        <div className="flex flex-col gap-1">
          <dt className="label-micro">{text.loginEmail.email}</dt>
          <dd className="font-mono text-h2 text-ink select-all" dir="ltr">
            {email}
          </dd>
        </div>
      </dl>

      <Button variant="primary" onClick={onCopy}>
        <Icon name={copied ? 'check' : 'copy'} />
        {copied ? text.loginEmail.copied : text.loginEmail.copy}
      </Button>
    </Dialog>
  )
}
