import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Checkbox } from '~/ui/checkbox'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Icon } from '~/ui/icon'
import { Select } from '~/ui/select'
import { NumeralInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { useSaveResult } from '../../api/results'
import { QUALITATIVE_RATINGS, type QualitativeRating } from '../../api/types'
import { useSubjectOptions, useSubjects } from '../../api/use-options'
import { DEFAULT_TERM_ID } from '../../components/curriculum-options'
import { GradeField, TermField } from '../../components/term-grade-fields'
import { schoolText } from '../../school.i18n'
import { resultsText } from './results.i18n'

const FIELDS = [
  'student_enrollment_id',
  'subject_id',
  'exam_period_id',
  'score',
  'max_score',
  'qualitative_rating',
  'is_absent',
] as const

/**
 * Temporary: the term stands in for the exam period, which the endpoint still
 * names `exam_period_id`.
 *
 * Only the fields whose shape never depends on the selected subject. Whether
 * score/max_score or qualitative_rating is actually required depends on the
 * subject's grading type, which is checked by hand in `onSubmit` instead of
 * here — that keeps the resolver static rather than needing to be rebuilt
 * every time the selected subject's grading type changes.
 */
const makeSchema = (v: ValidationText) =>
  z.object({
    student_enrollment_id: z.string().trim().min(1, v.required),
    subject_id: z.string().min(1, v.required),
    exam_period_id: z.string().trim().min(1, v.required),
    // Kept as strings: number inputs hand back strings, and z.coerce would
    // make the form's input and output types diverge.
    score: z.string(),
    max_score: z.string(),
    qualitative_rating: z.string(),
    is_absent: z.boolean(),
  })

type ResultForm = z.infer<ReturnType<typeof makeSchema>>

export function ResultEntryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const text = useDict(resultsText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const saveResult = useSaveResult()
  const [formMessage, setFormMessage] = useState<string | null>(null)
  // Scopes the subject picker only — the saved result carries no grade field.
  const [gradeId, setGradeId] = useState('')
  const subjects = useSubjectOptions(gradeId || undefined)
  const subjectList = useSubjects(gradeId || undefined)

  const form = useForm<ResultForm>({
    resolver: zodResolver(makeSchema(v)),
    defaultValues: {
      student_enrollment_id: '',
      subject_id: '',
      exam_period_id: DEFAULT_TERM_ID,
      score: '',
      max_score: '100',
      qualitative_rating: '',
      is_absent: false,
    },
  })

  const isAbsent = useWatch({ control: form.control, name: 'is_absent' })
  const termId = useWatch({ control: form.control, name: 'exam_period_id' })
  const subjectId = useWatch({ control: form.control, name: 'subject_id' })

  const selectedSubject = subjectList.data?.find((subject) => subject.id === subjectId)
  const isQualitative = selectedSubject?.grading_type === 'qualitative'

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)

    // The score/rating requirement depends on the selected subject's grading
    // type, so it is checked here rather than in the static zod schema.
    if (!values.is_absent) {
      if (isQualitative && values.qualitative_rating === '') {
        form.setError('qualitative_rating', { message: v.required })
        return
      }
      if (!isQualitative) {
        if (Number(values.max_score) < 1) {
          form.setError('max_score', { message: v.required })
          return
        }
        if (values.score === '' || Number(values.score) > Number(values.max_score)) {
          form.setError('score', { message: v.scoreRange })
          return
        }
      }
    }

    try {
      await saveResult.mutateAsync({
        student_enrollment_id: values.student_enrollment_id,
        subject_id: values.subject_id,
        exam_period_id: values.exam_period_id,
        is_absent: values.is_absent,
        ...(values.is_absent
          ? {}
          : isQualitative
            ? { qualitative_rating: values.qualitative_rating as QualitativeRating }
            : {
                max_score: Number(values.max_score),
                ...(values.score === '' ? {} : { score: Number(values.score) }),
              }),
      })
      notify('success', text.saved)
      form.reset()
      setGradeId('')
      onClose()
    } catch (error) {
      const failure = applyFieldErrors(error, form.setError, FIELDS, shell.error.title)
      setFormMessage(failure.formMessage)
    }
  })

  const { errors } = form.formState

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={text.entryTitle}
      description={text.entryDescription}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button type="submit" form="result-form" variant="primary" loading={form.formState.isSubmitting}>
            {shell.common.save}
          </Button>
        </>
      }
    >
      <form id="result-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        {/* Says plainly that this overwrites an existing draft, rather than
            letting duplicate-prevention look like magic. */}
        <p className="flex items-start gap-2 rounded-control border border-line border-s-2 border-s-accent bg-sunken px-3 py-2 text-small text-muted">
          <Icon name="info" className="size-4 text-accent" />
          <span>{text.upsertNotice}</span>
        </p>

        <Field
          label={text.fields.enrollment}
          hint={text.fields.enrollmentHint}
          error={errors.student_enrollment_id?.message}
          required
        >
          {(props) => <NumeralInput {...props} {...form.register('student_enrollment_id')} />}
        </Field>

        <GradeField
          value={gradeId}
          onChange={(value) => {
            setGradeId(value)
            form.setValue('subject_id', '', { shouldValidate: true })
          }}
          placeholder={shell.pickers.pickGrade}
        />

        <Field label={text.fields.subject} error={errors.subject_id?.message} required>
          {(props) => (
            <Select {...props} {...form.register('subject_id')} options={subjects} placeholder={shell.common.none} />
          )}
        </Field>

        <TermField
          value={termId}
          onChange={(value) => form.setValue('exam_period_id', value, { shouldValidate: true })}
          error={errors.exam_period_id?.message}
          required
        />

        <Checkbox label={text.fields.isAbsent} {...form.register('is_absent')} />

        {isQualitative ? (
          <Field label={text.fields.qualitativeRating} error={errors.qualitative_rating?.message} required={!isAbsent}>
            {(props) => (
              <Select
                {...props}
                {...form.register('qualitative_rating')}
                options={QUALITATIVE_RATINGS.map((value) => ({ value, label: text.ratings[value] }))}
                placeholder={shell.common.none}
                disabled={isAbsent}
              />
            )}
          </Field>
        ) : (
          <>
            <Field label={text.fields.score} error={errors.score?.message} required={!isAbsent}>
              {(props) => (
                <NumeralInput {...props} {...form.register('score')} type="number" min={0} disabled={isAbsent} />
              )}
            </Field>

            <Field label={text.fields.maxScore} error={errors.max_score?.message} required>
              {(props) => <NumeralInput {...props} {...form.register('max_score')} type="number" min={1} />}
            </Field>
          </>
        )}
      </form>
    </Drawer>
  )
}
