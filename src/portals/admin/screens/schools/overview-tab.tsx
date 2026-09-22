import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText } from '~/lib/forms/validation.i18n'
import { formatDateTime } from '~/lib/format'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DefinitionList } from '~/ui/definition-list'
import { FormAlert } from '~/ui/form-alert'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useUpdateTenant } from '../../api/tenants'
import type { Tenant } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { schoolFormText } from './school-detail.i18n'
import { schoolsText } from './schools.i18n'
import { SchoolFields } from './school-fields'
import {
  EDIT_FIELDS,
  makeEditSchema,
  schoolFormFrom,
  toUpdatePayload,
  type EditFormValues,
} from './school-form'

export function OverviewTab({ tenant }: { tenant: Tenant }) {
  const text = useDict(schoolFormText)
  const labels = useDict(schoolsText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { locale } = useLocale()
  const { can } = useAdminSession()
  const { notify } = useToast()
  const updateTenant = useUpdateTenant(tenant.code)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const editable = can(PERMISSION.updateTenant)
  const schema = useMemo(() => makeEditSchema(v), [v])
  const form = useForm<EditFormValues>({
    resolver: zodResolver(schema),
    values: schoolFormFrom(tenant),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await updateTenant.mutateAsync(toUpdatePayload(values))
      notify('success', text.saved)
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, EDIT_FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  const systemFields = [
    { term: labels.columns.code, value: tenant.code, mono: true },
    { term: labels.columns.created, value: formatDateTime(tenant.createdAt, locale) },
    { term: labels.columns.provisioning, value: labels.provisioning[tenant.provisioningStatus] },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title={text.tabs.overview} />
        <CardBody>
          {editable ? (
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
              <FormAlert message={formMessage} />
              <SchoolFields form={form} />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={form.formState.isSubmitting}
                  disabled={!form.formState.isDirty}
                >
                  {shell.common.save}
                </Button>
              </div>
            </form>
          ) : (
            <DefinitionList
              items={[
                { term: text.fields.name, value: tenant.name },
                { term: text.fields.contactEmail, value: tenant.contactEmail ?? '—', mono: true },
                { term: text.fields.contactPhone, value: tenant.contactPhone ?? '—', mono: true },
                { term: text.fields.governorate, value: tenant.governorate ?? '—' },
                { term: text.fields.address, value: tenant.address ?? '—' },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={text.readOnly} />
        <CardBody>
          <DefinitionList items={systemFields} columns={3} />
        </CardBody>
      </Card>
    </div>
  )
}
