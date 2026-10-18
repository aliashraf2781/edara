import { formatDateTime } from '~/lib/format'
import { useCopyToClipboard } from '~/lib/hooks/use-copy-to-clipboard'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DefinitionList } from '~/ui/definition-list'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { PageSection } from '~/ui/page-section'
import { useToast } from '~/ui/toast'
import type { SchoolRole } from '../../api/roles'
import { useSchoolSession } from '../../auth/session-context'
import { useSchoolLogout } from '../../auth/use-school-session'
import { schoolText } from '../../school.i18n'
import { PasswordCard } from './password-card'
import { schoolProfileText } from './profile.i18n'

/**
 * Details are read-only (the API has no profile editing); the password form is
 * open to every signed-in school user, so it is deliberately not role-gated.
 */
function LoginEmail({ email }: { email: string }) {
  const text = useDict(schoolProfileText)
  const { notify } = useToast()
  const { copied, copy } = useCopyToClipboard()

  const onCopy = async () => {
    if (!(await copy(email))) notify('danger', text.copyFailed)
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="label-micro">{text.loginEmail}</p>
      <div className="flex flex-wrap items-center gap-2">
        {/* Shown verbatim: the school code inside it is what the user types to sign in. */}
        <p
          dir="ltr"
          className="min-w-0 break-all rounded-control border border-line bg-sunken px-3 py-2 font-mono text-body text-ink select-all"
        >
          {email}
        </p>
        <Button onClick={() => void onCopy()}>
          <Icon name={copied ? 'check' : 'copy'} />
          <span aria-live="polite">{copied ? text.copied : text.copy}</span>
        </Button>
      </div>
      <p className="text-small text-muted">{text.loginEmailHint}</p>
    </div>
  )
}

export function SchoolProfileScreen() {
  const text = useDict(schoolProfileText)
  const shell = useDict(schoolText)
  const { locale } = useLocale()
  const { user, school } = useSchoolSession()
  const logout = useSchoolLogout()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <Button loading={logout.isPending} onClick={() => logout.mutate()}>
            <Icon name="logout" directional />
            {text.signOut}
          </Button>
        }
      />

      <Card>
        <CardHeader title={text.account} />
        <CardBody className="flex flex-col gap-6">
          <LoginEmail email={user.email} />

          <DefinitionList
            columns={2}
            items={[
              { term: text.name, value: user.name },
              { term: text.phone, value: user.phone ?? shell.common.none, mono: true },
              { term: text.schoolName, value: school.name },
              { term: text.schoolCode, value: school.code, mono: true },
              { term: text.memberSince, value: formatDateTime(user.createdAt, locale) },
            ]}
          />
        </CardBody>
      </Card>

      <PasswordCard />

      <PageSection title={text.whatYourRoleAllows}>
        <ul className="flex flex-col gap-3">
          {user.roles.map((role) => (
            <li key={role} className="flex flex-col gap-1">
              <span className="text-h2 font-semibold text-ink">
                {shell.roles[role as SchoolRole] ?? role}
              </span>
              <span className="text-small text-muted">
                {shell.roleDescriptions[role as SchoolRole] ?? ''}
              </span>
            </li>
          ))}
        </ul>
      </PageSection>
    </div>
  )
}
