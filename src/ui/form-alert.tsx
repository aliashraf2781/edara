import { Icon } from './icon'

/** Form-level failures: the server's sentence, never a status code. */
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-control border border-danger/30 bg-danger/8 px-3.5 py-2.5 text-small font-medium text-danger"
    >
      <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  )
}
