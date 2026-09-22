import { Link } from 'react-router'
import { useCopyToClipboard } from '~/lib/hooks/use-copy-to-clipboard'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Icon } from '~/ui/icon'
import { useToast } from '~/ui/toast'
import { schoolFormText } from './school-detail.i18n'

type SchoolCreatedDialogProps = {
  open: boolean
  /** The composite login the server generated, e.g. `admin_SCH-KJFZBV@pp.com`. */
  loginEmail: string
  /** The plain address the operator typed — the school portal accepts it too. */
  typedEmail: string
  onAcknowledge: () => void
}

function CopyRow({ term, value }: { term: string; value: string }) {
  const text = useDict(schoolFormText)
  const { notify } = useToast()
  const { copied, copy } = useCopyToClipboard()

  const onCopy = async () => {
    const ok = await copy(value)
    if (!ok) notify('danger', text.loginEmail.copyFailed)
  }

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="label-micro">{term}</dt>
        <dd className="font-mono text-h2 break-all text-ink select-all" dir="ltr">
          {value}
        </dd>
      </div>
      <Button onClick={onCopy} aria-label={`${text.loginEmail.copy} — ${term}`}>
        <Icon name={copied ? 'check' : 'copy'} />
        {copied ? text.loginEmail.copied : text.loginEmail.copy}
      </Button>
    </div>
  )
}

/**
 * The composite login email only ever appears in the create response, so this
 * dialog is the one chance to hand it over — together with the address the
 * operator typed and the password they just chose, since the school portal
 * accepts either email with that same password.
 */
export function SchoolCreatedDialog({
  open,
  loginEmail,
  typedEmail,
  onAcknowledge,
}: SchoolCreatedDialogProps) {
  const text = useDict(schoolFormText)

  return (
    <Dialog
      open={open}
      busy
      onClose={onAcknowledge}
      title={text.loginEmail.title}
      footer={
        <>
          <Link
            to="/school/login"
            className="inline-flex h-10 items-center gap-2 rounded-control border border-line-strong bg-surface px-4 text-body font-medium text-ink shadow-xs transition-colors duration-150 ease-out hover:bg-sunken"
          >
            <Icon name="school" />
            {text.loginEmail.openPortal}
          </Link>
          <Button variant="primary" onClick={onAcknowledge}>
            {text.loginEmail.acknowledge}
          </Button>
        </>
      }
    >
      <p>{text.loginEmail.body}</p>

      <p className="flex items-start gap-2 rounded-control border border-attention border-s-2 bg-attention/12 px-3 py-2 text-small text-attention">
        <Icon name="alert" className="size-4" />
        <span>{text.loginEmail.warning}</span>
      </p>

      <dl className="flex flex-col gap-4 rounded-control border border-line bg-sunken p-4">
        <CopyRow term={text.loginEmail.email} value={loginEmail} />
        <CopyRow term={text.loginEmail.typedEmail} value={typedEmail} />

        <div className="flex flex-col gap-1">
          <dt className="label-micro">{text.loginEmail.password}</dt>
          <dd className="text-small text-muted">{text.loginEmail.passwordNote}</dd>
        </div>
      </dl>

      <p className="text-small text-muted">{text.loginEmail.eitherWorks}</p>
    </Dialog>
  )
}
