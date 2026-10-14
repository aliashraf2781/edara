import { useState } from 'react'
import { STRONG_PASSWORD, validationText } from '~/lib/forms/validation.i18n'
import { useCopyToClipboard } from '~/lib/hooks/use-copy-to-clipboard'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { ApiError } from '~/lib/api/error'
import { useChangeTenantPassword } from '../../api/tenants'
import { schoolFormText } from './school-detail.i18n'

type ChangePasswordDialogProps = {
  code: string
  open: boolean
  onClose: () => void
}

type Done = { loginEmail: string; password: string }

/**
 * The new password is held in component state only: never stored, never
 * cached. Closing the dialog drops it, and the confirmation step is the one
 * chance to copy it.
 */
export function ChangePasswordDialog({ code, open, onClose }: ChangePasswordDialogProps) {
  const text = useDict(schoolFormText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const { copied, copy } = useCopyToClipboard()
  const change = useChangeTenantPassword(code)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<Done | null>(null)

  const busy = change.isPending

  const reset = () => {
    setPassword('')
    setConfirm('')
    setVisible(false)
    setError(null)
    setDone(null)
    change.reset()
  }

  const close = () => {
    if (busy) return
    reset()
    onClose()
  }

  const validate = (): string | null => {
    if (!STRONG_PASSWORD.test(password)) return v.passwordStrength
    if (password !== confirm) return text.password.emailMismatch
    return null
  }

  const submit = async () => {
    if (busy) return
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    try {
      const result = await change.mutateAsync(password)
      notify('success', text.password.changed)
      setDone({ loginEmail: result?.loginEmail ?? '', password })
      setPassword('')
      setConfirm('')
    } catch (failure) {
      const fieldMessage =
        failure instanceof ApiError ? Object.values(failure.fieldErrors ?? {})[0]?.[0] : undefined
      setError(fieldMessage ?? (failure instanceof Error ? failure.message : v.passwordStrength))
    }
  }

  const onCopy = async () => {
    if (!done) return
    const ok = await copy(done.password)
    if (!ok) notify('danger', text.password.copyFailed)
  }

  if (done) {
    return (
      <Dialog
        open={open}
        busy
        onClose={close}
        title={text.password.title}
        footer={
          <Button variant="primary" onClick={close}>
            {text.password.close}
          </Button>
        }
      >
        <p>{text.password.doneBody}</p>
        <dl className="flex flex-col gap-3 rounded-control border border-line bg-sunken p-4">
          {done.loginEmail ? (
            <div className="flex flex-col gap-1">
              <dt className="label-micro">{text.password.loginEmail}</dt>
              <dd className="font-mono text-body text-ink" dir="ltr">
                {done.loginEmail}
              </dd>
            </div>
          ) : null}
          <div className="flex flex-col gap-1">
            <dt className="label-micro">{text.password.label}</dt>
            <dd className="font-mono text-h2 text-ink select-all" dir="ltr">
              {done.password}
            </dd>
          </div>
        </dl>
        <Button onClick={onCopy}>
          <Icon name={copied ? 'check' : 'copy'} />
          {copied ? text.password.copied : text.password.copy}
        </Button>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      busy={busy}
      onClose={close}
      title={text.password.title}
      footer={
        <>
          <Button onClick={close} disabled={busy}>
            {text.password.cancel}
          </Button>
          <Button variant="primary" onClick={submit} loading={busy}>
            {text.password.save}
          </Button>
        </>
      }
    >
      <p className="flex items-start gap-2 rounded-control border border-attention border-s-2 bg-attention/12 px-3 py-2 text-small text-attention">
        <Icon name="alert" className="size-4" />
        <span>{text.password.warning}</span>
      </p>
      <FormAlert message={error} />
      <form
        noValidate
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Field label={text.password.label} hint={v.passwordStrength} required>
          {(props) => (
            <TextInput
              {...props}
              type={visible ? 'text' : 'password'}
              dir="ltr"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>
        <Field label={text.password.confirm} required>
          {(props) => (
            <TextInput
              {...props}
              type={visible ? 'text' : 'password'}
              dir="ltr"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          )}
        </Field>
        <button
          type="button"
          className="self-start text-small text-accent underline"
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? text.password.hide : text.password.show}
        </button>
      </form>
    </Dialog>
  )
}
