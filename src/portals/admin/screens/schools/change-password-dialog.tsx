import { useState } from 'react'
import { useCopyToClipboard } from '~/lib/hooks/use-copy-to-clipboard'
import { isValidationError } from '~/lib/api/error'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { useChangeTenantPassword } from '../../api/tenants'
import { schoolFormText } from './school-detail.i18n'

const MIN_LENGTH = 8

type Done = { loginEmail: string; password: string }

/**
 * The backend never returns the password, so the only copy is what the admin
 * typed. It lives in this component's state until the dialog closes and is
 * never stored or cached.
 */
export function ChangePasswordDialog({
  code,
  open,
  onClose,
}: {
  code: string
  open: boolean
  onClose: () => void
}) {
  const text = useDict(schoolFormText).password
  const v = useDict(validationText)
  const shell = useDict(adminText)
  const { notify } = useToast()
  const { copied, copy } = useCopyToClipboard()
  const change = useChangeTenantPassword(code)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [done, setDone] = useState<Done | null>(null)

  const close = () => {
    setPassword('')
    setConfirm('')
    setVisible(false)
    setError(null)
    setFormMessage(null)
    setDone(null)
    onClose()
  }

  const submit = async () => {
    setFormMessage(null)
    if (password.length < MIN_LENGTH) return setError(v.minLength(MIN_LENGTH))
    if (confirm !== '' && confirm !== password) return setError(text.emailMismatch)
    setError(null)
    try {
      const result = await change.mutateAsync(password)
      notify('success', text.changed)
      setDone({ loginEmail: result.loginEmail, password })
    } catch (failure) {
      if (isValidationError(failure)) setError(failure.fieldErrors.password?.[0] ?? null)
      else setFormMessage(failure instanceof Error ? failure.message : shell.error.title)
    }
  }

  const onCopy = async () => {
    if (!done) return
    const ok = await copy(`${done.loginEmail}\n${done.password}`)
    if (!ok) notify('danger', text.copyFailed)
  }

  if (done) {
    return (
      <Dialog
        open={open}
        busy
        onClose={close}
        title={text.title}
        footer={
          <Button variant="primary" onClick={close}>
            {text.close}
          </Button>
        }
      >
        <p>{text.doneBody}</p>
        <dl className="flex flex-col gap-3 rounded-control border border-line bg-sunken p-4">
          <div className="flex flex-col gap-1">
            <dt className="label-micro">{text.loginEmail}</dt>
            <dd className="font-mono text-body break-all text-ink select-all" dir="ltr">
              {done.loginEmail}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="label-micro">{text.label}</dt>
            <dd className="font-mono text-h2 break-all text-ink select-all" dir="ltr">
              {done.password}
            </dd>
          </div>
        </dl>
        <Button onClick={onCopy}>
          <Icon name={copied ? 'check' : 'copy'} />
          {copied ? text.copied : text.copy}
        </Button>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      busy={change.isPending}
      onClose={close}
      title={text.title}
      footer={
        <>
          <Button onClick={close} disabled={change.isPending}>
            {text.cancel}
          </Button>
          <Button variant="primary" onClick={submit} loading={change.isPending}>
            {text.save}
          </Button>
        </>
      }
    >
      <p className="flex items-start gap-2 rounded-control border border-attention border-s-2 bg-attention/12 px-3 py-2 text-small text-attention">
        <Icon name="alert" className="size-4" />
        <span>{text.warning}</span>
      </p>
      <FormAlert message={formMessage} />

      <Field label={text.label} error={error ?? undefined} hint={v.minLength(MIN_LENGTH)} required>
        {(props) => (
          <TextInput
            {...props}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={visible ? 'text' : 'password'}
            dir="ltr"
            autoComplete="new-password"
          />
        )}
      </Field>

      <Field label={text.confirm}>
        {(props) => (
          <TextInput
            {...props}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            type={visible ? 'text' : 'password'}
            dir="ltr"
            autoComplete="new-password"
          />
        )}
      </Field>

      <label className="flex items-center gap-2 text-small">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        {visible ? text.hide : text.show}
      </label>
    </Dialog>
  )
}
