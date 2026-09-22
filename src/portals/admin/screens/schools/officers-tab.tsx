import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { Checkbox } from '~/ui/checkbox'
import { DataTable, type Column } from '~/ui/data-table'
import { ConfirmDialog } from '~/ui/dialog'
import { EmptyState } from '~/ui/empty-state'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { Select } from '~/ui/select'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useAttachTenantAdmin, useDetachTenantAdmin } from '../../api/tenant-admins'
import type { AdminRelationship, Tenant, TenantAdmin } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { schoolFormText } from './school-detail.i18n'

const RELATIONSHIPS: readonly AdminRelationship[] = ['owner', 'officer', 'reviewer']
const FIELDS = ['user_id', 'relationship', 'is_primary'] as const

const makeSchema = (required: string) =>
  z.object({
    user_id: z.string().trim().min(1, required),
    relationship: z.enum(RELATIONSHIPS),
    is_primary: z.boolean(),
  })

type OfficerForm = z.infer<ReturnType<typeof makeSchema>>

export function OfficersTab({ tenant }: { tenant: Tenant }) {
  const text = useDict(schoolFormText)
  const shell = useDict(adminText)
  const v = useDict(validationText)
  const { can } = useAdminSession()
  const { notify } = useToast()

  const attach = useAttachTenantAdmin(tenant.code)
  const detach = useDetachTenantAdmin(tenant.code)
  const [removing, setRemoving] = useState<TenantAdmin | null>(null)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const editable = can(PERMISSION.assignTenantAdmin)
  const schema = useMemo(() => makeSchema(v.required), [v.required])
  const form = useForm<OfficerForm>({
    resolver: zodResolver(schema),
    defaultValues: { user_id: '', relationship: 'officer', is_primary: false },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await attach.mutateAsync(values)
      notify('success', text.officers.added)
      form.reset()
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  const confirmRemove = async () => {
    if (!removing) return
    try {
      await detach.mutateAsync(removing.id)
      notify('success', text.officers.removed)
      setRemoving(null)
    } catch {
      notify('danger', shell.error.title)
    }
  }

  const columns: readonly Column<TenantAdmin>[] = [
    { key: 'name', header: text.officers.columnName, cell: (row) => row.name },
    {
      key: 'email',
      header: text.officers.columnEmail,
      cell: (row) => (
        <span className="font-mono" dir="ltr">
          {row.email}
        </span>
      ),
    },
    {
      key: 'relationship',
      header: text.officers.columnRelationship,
      cell: (row) => text.officers.roles[row.relationship],
    },
    {
      key: 'primary',
      header: text.officers.columnPrimary,
      cell: (row) => (row.isPrimary ? text.officers.yes : text.officers.no),
    },
    {
      key: 'actions',
      header: shell.common.close,
      headClassName: 'sr-only',
      cell: (row) =>
        editable ? (
          <div className="flex justify-end">
            <Button variant="ghost" destructive onClick={() => setRemoving(row)}>
              <Icon name="trash" className="size-4" />
              {text.officers.remove}
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        caption={text.officers.title}
        columns={columns}
        rows={tenant.admins}
        rowKey={(row) => row.id}
        empty={<EmptyState title={text.officers.empty} description={text.officers.emptyBody} />}
      />

      {editable ? (
        <Card>
          <CardHeader title={text.officers.add} />
          <CardBody>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
              <FormAlert message={formMessage} />
              <p className="text-small text-muted">{text.officers.description}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={text.officers.userId}
                  error={form.formState.errors.user_id?.message}
                  required
                >
                  {(props) => (
                    <TextInput {...props} {...form.register('user_id')} dir="ltr" className="font-mono" />
                  )}
                </Field>

                <Field
                  label={text.officers.relationship}
                  error={form.formState.errors.relationship?.message}
                  required
                >
                  {(props) => (
                    <Select
                      {...props}
                      {...form.register('relationship')}
                      options={RELATIONSHIPS.map((value) => ({
                        value,
                        label: text.officers.roles[value],
                      }))}
                    />
                  )}
                </Field>
              </div>

              <Checkbox label={text.officers.isPrimary} {...form.register('is_primary')} />

              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
                  {text.officers.add}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        loading={detach.isPending}
        destructive
        title={text.officers.removeTitle}
        consequence={text.officers.removeConsequence}
        confirmLabel={text.officers.remove}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
