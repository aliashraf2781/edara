import { useWatch, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { Select } from '~/ui/select'
import { NumeralInput, TextInput } from '~/ui/text-input'
import type { GradingType, Subject } from '../../api/types'
import { useGradeOptions, useStageOptions } from '../../api/use-options'
import { academicsText } from './academics.i18n'
import { ResourcePanel } from './resource-panel'

const GRADING_TYPES: readonly GradingType[] = ['numeric', 'qualitative']

const FIELDS = [
  'grade_id',
  'educational_stage_id',
  'code',
  'name',
  'grading_type',
  'max_score',
  'pass_score',
] as const

type SubjectFormValues = {
  grade_id: string
  educational_stage_id: string
  code: string
  name: string
  grading_type: GradingType
  max_score: number
  pass_score: number
}

/**
 * Its own component (not inlined in `renderFields`) so `useWatch` follows the
 * rules of hooks — `renderFields` is a render prop, not a component itself.
 */
function ScoreFields({
  form,
  maxScoreLabel,
  passScoreLabel,
}: {
  form: UseFormReturn<SubjectFormValues, unknown, SubjectFormValues>
  maxScoreLabel: string
  passScoreLabel: string
}) {
  const gradingType = useWatch({ control: form.control, name: 'grading_type' })
  if (gradingType !== 'numeric') return null

  return (
    <>
      <Field label={maxScoreLabel} error={form.formState.errors.max_score?.message} required>
        {(props) => <NumeralInput {...props} {...form.register('max_score')} type="number" min={1} />}
      </Field>
      <Field label={passScoreLabel} error={form.formState.errors.pass_score?.message} required>
        {(props) => <NumeralInput {...props} {...form.register('pass_score')} type="number" min={0} />}
      </Field>
    </>
  )
}

export function SubjectsPanel({ editable }: { editable: boolean }) {
  const text = useDict(academicsText)
  const v = useDict(validationText)
  const grades = useGradeOptions()
  const stages = useStageOptions()

  const schema: z.ZodType<SubjectFormValues> = z
    .object({
      grade_id: z.string(),
      educational_stage_id: z.string(),
      code: z.string().trim().min(1, v.required),
      name: z.string().trim().min(1, v.required),
      grading_type: z.enum(GRADING_TYPES as [GradingType, ...GradingType[]]),
      max_score: z.coerce.number().min(0),
      pass_score: z.coerce.number().min(0, v.notNegative),
    })
    // Numeric subjects need a real maximum; qualitative ones ignore both fields.
    .refine((values) => values.grading_type !== 'numeric' || values.max_score >= 1, {
      path: ['max_score'],
      message: v.required,
    })
    // A pass mark above the maximum can never be reached.
    .refine((values) => values.grading_type !== 'numeric' || values.pass_score <= values.max_score, {
      path: ['pass_score'],
      message: v.scoreRange,
    })

  return (
    <ResourcePanel<Subject, SubjectFormValues>
      resource="subjects"
      title={text.tabs.subjects}
      editable={editable}
      empty={text.empty.subjects}
      schema={schema}
      fields={FIELDS}
      defaults={{
        grade_id: '',
        educational_stage_id: '',
        code: '',
        name: '',
        grading_type: 'numeric',
        max_score: 100,
        pass_score: 50,
      }}
      rowKey={(row) => row.id}
      rowLabel={(row) => row.name}
      toForm={(row) => ({
        grade_id: row.grade_id ?? '',
        educational_stage_id: row.educational_stage_id ?? '',
        code: row.code,
        name: row.name,
        grading_type: row.grading_type,
        max_score: row.max_score ?? 0,
        pass_score: row.pass_score ?? 0,
      })}
      // The server stores null for both scores on a qualitative subject.
      toPayload={(values) =>
        values.grading_type === 'qualitative' ? { ...values, max_score: null, pass_score: null } : values
      }
      columns={[
        { key: 'code', header: text.fields.code, cell: (row) => <span className="font-mono">{row.code}</span> },
        { key: 'name', header: text.fields.name, cell: (row) => row.name },
        {
          key: 'gradingType',
          header: text.fields.gradingType,
          cell: (row) => text.gradingTypes[row.grading_type],
        },
        { key: 'max', header: text.fields.maxScore, numeric: true, cell: (row) => row.max_score ?? '—' },
        { key: 'pass', header: text.fields.passScore, numeric: true, cell: (row) => row.pass_score ?? '—' },
      ]}
      renderFields={(form) => (
        <>
          <Field label={text.fields.code} error={form.formState.errors.code?.message} required>
            {(props) => <TextInput {...props} {...form.register('code')} dir="ltr" className="font-mono" />}
          </Field>
          <Field label={text.fields.name} error={form.formState.errors.name?.message} required>
            {(props) => <TextInput {...props} {...form.register('name')} />}
          </Field>
          <Field label={text.fields.grade} error={form.formState.errors.grade_id?.message}>
            {(props) => (
              <Select {...props} {...form.register('grade_id')} options={grades} placeholder={text.pickGrade} />
            )}
          </Field>
          <Field label={text.fields.stage} error={form.formState.errors.educational_stage_id?.message}>
            {(props) => (
              <Select
                {...props}
                {...form.register('educational_stage_id')}
                options={stages}
                placeholder={text.pickStage}
              />
            )}
          </Field>
          <Field
            label={text.fields.gradingType}
            hint={text.gradingTypeHint}
            error={form.formState.errors.grading_type?.message}
            required
          >
            {(props) => (
              <Select
                {...props}
                {...form.register('grading_type')}
                options={GRADING_TYPES.map((value) => ({ value, label: text.gradingTypes[value] }))}
              />
            )}
          </Field>
          <ScoreFields form={form} maxScoreLabel={text.fields.maxScore} passScoreLabel={text.fields.passScore} />
        </>
      )}
    />
  )
}
