import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import {
  useForm,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form'
import type { ZodType } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import type { QueryParams } from '~/lib/api/query'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { ConfirmDialog } from '~/ui/dialog'
import { Drawer } from '~/ui/drawer'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { useToast } from '~/ui/toast'
import {
  useAcademicList,
  useDeleteAcademic,
  useSaveAcademic,
  type AcademicResource,
} from '../../api/academics'
import { schoolText } from '../../school.i18n'
import { academicsText } from './academics.i18n'

type ResourcePanelProps<T, F extends FieldValues> = {
  resource: AcademicResource
  title: string
  /** Extra list filters, e.g. `?grade_id=` when a parent is selected. */
  query?: QueryParams
  columns: readonly Column<T>[]
  rowKey: (row: T) => string
  rowLabel: (row: T) => string
  schema: ZodType<F, unknown>
  defaults: F
  toForm: (row: T) => F
  /** Transforms form values into the write payload. Defaults to identity. */
  toPayload?: (values: F) => unknown
  fields: readonly Path<F>[]
  renderFields: (form: UseFormReturn<F, unknown, F>, isEditing: boolean) => ReactNode
  /** Writes are hidden, not greyed, for teacher and data-entry roles. */
  editable: boolean
  empty: { title: string; body: string }
}

/**
 * One table plus one create/edit drawer, reused by all five reference
 * resources. Only the columns, the schema and the fields differ.
 */
export function ResourcePanel<T, F extends FieldValues>({
  resource,
  title,
  query,
  columns,
  rowKey,
  rowLabel,
  schema,
  defaults,
  toForm,
  toPayload,
  fields,
  renderFields,
  editable,
  empty,
}: ResourcePanelProps<T, F>) {
  const text = useDict(academicsText)
  const shell = useDict(schoolText)
  const { notify, notifyError } = useToast()

  const list = useAcademicList<T>(resource, query ?? {})
  const save = useSaveAcademic<T>(resource)
  const remove = useDeleteAcademic(resource)

  const [editing, setEditing] = useState<{ id: string | null; row: T | null } | null>(null)
  const [removing, setRemoving] = useState<T | null>(null)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  // The generic parameter cannot be proven to the resolver's own generics, so
  // the resolver is asserted once here rather than at each of the five panels.
  const form = useForm<F, unknown, F>({
    resolver: zodResolver(schema as never) as Resolver<F, unknown, F>,
    defaultValues: defaults as never,
  })

  const open = (row: T | null) => {
    setFormMessage(null)
    form.reset((row ? toForm(row) : defaults) as never)
    setEditing({ id: row ? rowKey(row) : null, row })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (!editing) return
    setFormMessage(null)
    try {
      await save.mutateAsync({ id: editing.id, values: toPayload ? toPayload(values) : values })
      notify('success', editing.id === null ? text.created : text.saved)
      setEditing(null)
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, fields, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  const confirmRemove = async () => {
    if (!removing) return
    try {
      await remove.mutateAsync(rowKey(removing))
      notify('success', text.deleted)
      setRemoving(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const actionColumn: Column<T> = {
    key: 'actions',
    header: shell.common.edit,
    headClassName: 'sr-only',
    cell: (row) => (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" onClick={() => open(row)}>
          <Icon name="pencil" className="size-4" />
          {shell.common.edit}
        </Button>
        <Button variant="ghost" destructive onClick={() => setRemoving(row)}>
          <Icon name="trash" className="size-4" />
        </Button>
      </div>
    ),
  }

  if (list.isError) {
    return <ErrorState error={list.error} onRetry={() => void list.refetch()} labels={shell.error} />
  }

  return (
    <div className="flex flex-col gap-4">
      {editable ? (
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => open(null)}>
            <Icon name="plus" />
            {shell.common.create}
          </Button>
        </div>
      ) : null}

      <DataTable
        caption={title}
        columns={editable ? [...columns, actionColumn] : columns}
        rows={list.data ?? []}
        rowKey={rowKey}
        isLoading={list.isLoading}
        empty={
          <EmptyState
            title={empty.title}
            description={editable ? empty.body : text.readOnlyEmpty}
            action={
              editable ? (
                <Button variant="primary" onClick={() => open(null)}>
                  {shell.common.create}
                </Button>
              ) : null
            }
          />
        }
      />

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id === null ? `${shell.common.create} — ${title}` : `${shell.common.edit} — ${title}`}
        closeLabel={shell.common.close}
        footer={
          <>
            <Button onClick={() => setEditing(null)}>{shell.common.cancel}</Button>
            <Button
              type="submit"
              form="academic-resource-form"
              variant="primary"
              loading={form.formState.isSubmitting}
            >
              {shell.common.save}
            </Button>
          </>
        }
      >
        <form id="academic-resource-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormAlert message={formMessage} />
          {renderFields(form, Boolean(editing?.id))}
        </form>
      </Drawer>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        loading={remove.isPending}
        destructive
        title={text.deleteTitle}
        consequence={removing ? text.deleteConsequence(rowLabel(removing)) : ''}
        confirmLabel={shell.common.delete}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
