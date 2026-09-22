import { formatDateTime } from '~/lib/format'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DefinitionList } from '~/ui/definition-list'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { PageSection } from '~/ui/page-section'
import type { SchoolRole } from '../../api/roles'
import { useSchoolSession } from '../../auth/session-context'
import { useSchoolLogout } from '../../auth/use-school-session'
import { schoolText } from '../../school.i18n'
import { schoolProfileText } from './profile.i18n'

/**
 * Read-only: the school-side API exposes no profile, password or avatar
 * endpoints, so nothing here pretends to be editable.
 */
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
          <DefinitionList
            columns={2}
            items={[
              { term: text.name, value: user.name },
              { term: text.email, value: user.email, mono: true },
              { term: text.phone, value: user.phone ?? shell.common.none, mono: true },
              { term: text.school, value: `${school.name} (${school.code})` },
              { term: text.memberSince, value: formatDateTime(user.createdAt, locale) },
            ]}
          />

          <p className="flex items-start gap-2 text-small text-muted">
            <Icon name="info" className="size-4" />
            {text.gap}
          </p>
        </CardBody>
      </Card>

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
