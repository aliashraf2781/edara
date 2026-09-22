import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { validationText } from '~/lib/forms/validation.i18n'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { ConfirmDialog } from '~/ui/dialog'
import { Drawer } from '~/ui/drawer'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { Select } from '~/ui/select'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { useAcademicList } from '../../api/academics'
import { useDeleteExamPeriod, useExamPeriods, useSaveExamPeriod } from '../../api/exam-periods'
import type { AcademicYear, ExamPeriod } from '../../api/types'
import { useYearOptions } from '../../api/use-options'
import { useSchoolSession } from '../../auth/session-context'
import { schoolText } from '../../school.i18n'
import { examPeriodsText } from './exam-periods.i18n'

type FormValues = {
  code: string
  name: string
  term: string
  type: string
  starts_on: string
  ends_on: string
  status: string
  entry_opens_at: string
  entry_closes_at: string
}

const DEFAULTS: FormValues = {
  code: '',
  name: '',
  term: '',
  type: '',
  starts_on: '',
  ends_on: '',
  status: '',
  entry_opens_at: '',
  entry_closes_at: '',
}

const toForm = (row: ExamPeriod): FormValues => ({
  code: row.code,
  name: row.name,
  term: row.term === null ? '' : String(row.term),
  type: row.type ?? '',
  starts_on: row.starts_on ?? '',
  ends_on: row.ends_on ?? '',
  status: row.status ?? '',
  entry_opens_at: row.entry_opens_at ?? '',
  entry_closes_at: row.entry_closes_at ?? '',
})

export function ExamPeriodsScreen() {
  const text = useDict(examPeriodsText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { can } = useSchoolSession()
  const { notify, notifyError } = useToast()

  const editable = can.canEditStructure
  const years = useAcademicList<AcademicYear>('academic-years', {})
  const yearOptions = useYearOptions()
  const [yearId, setYearId] = useState('')

  const activeYearId =
    yearId !== '' ? yearId : (years.data?.find((year) => year.is_current) ?? years.data?.[0])?.id ?? ''

  const list = useExamPeriods(activeYearId, activeYearId !== '')
  const save = useSaveExamPeriod()
  const remove = useDeleteExamPeriod()

  const [editing, setEditing] = useState<{ id: string | null; row: ExamPeriod | null } | null>(null)
  const [removing, setRemoving] = useState<ExamPeriod | null>(null)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = z
    .object({
      code: z.string().trim().min(1, v.required),
      name: z.string().trim().min(1, v.required),
      term: z.string().trim(),
      type: z.string().trim(),
      starts_on: z.string(),
      ends_on: z.string(),
      status: z.string(),
      entry_opens_at: z.string(),
      entry_closes_at: z.string(),
    })
    .refine((value) => value.starts_on === '' || value.ends_on === '' || value.ends_on >= value.starts_on, {
      message: text.endBeforeStart,
      path: ['ends_on'],
    })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: DEFAULTS,
  })

  const fields = ['code', 'name', 'term', 'type', 'starts_on', 'ends_on', 'status'] as const

  const open = (row: ExamPeriod | null) => {
    setFormMessage(null)
    form.reset(row ? toForm(row) : DEFAULTS)
    setEditing({ id: row ? row.id : null, row })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (!editing) return
    setFormMessage(null)

    const shared = {
      name: values.name,
      type: values.type.trim() || undefined,
      term: values.term.trim() === '' ? undefined : Number(values.term),
      starts_on: values.starts_on || undefined,
      ends_on: values.ends_on || undefined,
      status: values.status || undefined,
      entry_opens_at: values.entry_opens_at || undefined,
      entry_closes_at: values.entry_closes_at || undefined,
    }

    // Code and the owning year are set once, at creation, and never sent on update.
    const payload =
      editing.id === null ? { ...shared, code: values.code, academic_year_id: activeYearId } : shared

    try {
      await save.mutateAsync({ id: editing.id, values: payload })
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
      await remove.mutateAsync(removing.id)
      notify('success', text.deleted)
      setRemoving(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const columns: Column<ExamPeriod>[] = [
    { key: 'code', header: text.fields.code, cell: (row) => <span className="font-mono">{row.code}</span> },
    { key: 'name', header: text.fields.name, cell: (row) => row.name },
    { key: 'term', header: text.fields.term, numeric: true, cell: (row) => row.term ?? shell.common.none },
    { key: 'starts', header: text.fields.startsOn, numeric: true, cell: (row) => row.starts_on ?? shell.common.none },
    { key: 'ends', header: text.fields.endsOn, numeric: true, cell: (row) => row.ends_on ?? shell.common.none },
  ]

  if (editable) {
    columns.push({
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
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      <Field label={text.year} className="max-w-xs">
        {(props) => (
          <Select
            {...props}
            value={activeYearId}
            onChange={(event) => setYearId(event.target.value)}
            options={yearOptions}
            placeholder={yearOptions.length === 0 ? text.noYears : text.pickYear}
            disabled={yearOptions.length === 0}
          />
        )}
      </Field>

      {activeYearId === '' ? (
        <EmptyState title={text.noYears} description={text.noYearsHint} />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} labels={shell.error} />
      ) : (
        <>
          {editable ? (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => open(null)}>
                <Icon name="plus" />
                {shell.common.create}
              </Button>
            </div>
          ) : null}

          <DataTable
            caption={text.title}
            columns={columns}
            rows={list.data ?? []}
            rowKey={(row) => row.id}
            isLoading={list.isLoading}
            empty={
              <EmptyState
                title={text.empty.title}
                description={editable ? text.empty.body : text.readOnlyEmpty}
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
        </>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id === null ? `${shell.common.create} — ${text.title}` : `${shell.common.edit} — ${text.title}`}
        closeLabel={shell.common.close}
        footer={
          <>
            <Button onClick={() => setEditing(null)}>{shell.common.cancel}</Button>
            <Button type="submit" form="exam-period-form" variant="primary" loading={form.formState.isSubmitting}>
              {shell.common.save}
            </Button>
          </>
        }
      >
        <form id="exam-period-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormAlert message={formMessage} />

          <Field label={text.fields.code} error={form.formState.errors.code?.message} required>
            {(props) => (
              <TextInput
                {...props}
                {...form.register('code')}
                dir="ltr"
                className="font-mono"
                disabled={editing?.id !== null}
              />
            )}
          </Field>
          <Field label={text.fields.name} error={form.formState.errors.name?.message} required>
            {(props) => <TextInput {...props} {...form.register('name')} />}
          </Field>
          <Field label={text.fields.term} error={form.formState.errors.term?.message}>
            {(props) => <TextInput {...props} {...form.register('term')} type="number" dir="ltr" />}
          </Field>
          <Field label={text.fields.type} error={form.formState.errors.type?.message}>
            {(props) => <TextInput {...props} {...form.register('type')} dir="ltr" placeholder="term" />}
          </Field>
          <Field label={text.fields.startsOn} error={form.formState.errors.starts_on?.message}>
            {(props) => <TextInput {...props} {...form.register('starts_on')} type="date" dir="ltr" />}
          </Field>
          <Field label={text.fields.endsOn} error={form.formState.errors.ends_on?.message}>
            {(props) => <TextInput {...props} {...form.register('ends_on')} type="date" dir="ltr" />}
          </Field>
          <Field label={text.fields.status} error={form.formState.errors.status?.message}>
            {(props) => <TextInput {...props} {...form.register('status')} dir="ltr" />}
          </Field>
          <Field label={text.fields.entryOpensAt} error={form.formState.errors.entry_opens_at?.message}>
            {(props) => <TextInput {...props} {...form.register('entry_opens_at')} type="datetime-local" dir="ltr" />}
          </Field>
          <Field label={text.fields.entryClosesAt} error={form.formState.errors.entry_closes_at?.message}>
            {(props) => <TextInput {...props} {...form.register('entry_closes_at')} type="datetime-local" dir="ltr" />}
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        loading={remove.isPending}
        destructive
        title={text.deleteTitle}
        consequence={removing ? text.deleteConsequence(removing.name) : ''}
        confirmLabel={shell.common.delete}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
