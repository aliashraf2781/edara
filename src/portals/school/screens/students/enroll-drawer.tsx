import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Select } from '~/ui/select'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { useEnrollStudent } from '../../api/students'
import { useClassroomOptions, useGradeOptions, useYearOptions } from '../../api/use-options'
import { schoolText } from '../../school.i18n'
import { studentsText } from './students.i18n'

const FIELDS = ['academic_year_id', 'grade_id', 'classroom_id', 'enrolled_on'] as const

export function EnrollDrawer({
  studentId,
  open,
  onClose,
}: {
  studentId: string
  open: boolean
  onClose: () => void
}) {
  const text = useDict(studentsText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const enroll = useEnrollStudent(studentId)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(
    () =>
      z.object({
        academic_year_id: z.string().min(1, v.required),
        grade_id: z.string().min(1, v.required),
        classroom_id: z.string().min(1, v.required),
        enrolled_on: z.string(),
      }),
    [v.required],
  )

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { academic_year_id: '', grade_id: '', classroom_id: '', enrolled_on: '' },
  })

  const years = useYearOptions()
  const grades = useGradeOptions()
  // Classrooms narrow to the chosen grade and year, so the list stays short.
  const gradeId = useWatch({ control: form.control, name: 'grade_id' })
  const yearId = useWatch({ control: form.control, name: 'academic_year_id' })
  const classrooms = useClassroomOptions({
    gradeId: gradeId || undefined,
    academicYearId: yearId || undefined,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await enroll.mutateAsync({
        academic_year_id: values.academic_year_id,
        grade_id: values.grade_id,
        classroom_id: values.classroom_id,
        ...(values.enrolled_on === '' ? {} : { enrolled_on: values.enrolled_on }),
      })
      notify('success', text.enrollments.enrolled)
      form.reset()
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
      title={text.enrollments.enroll}
      description={text.enrollments.description}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button type="submit" form="enroll-form" variant="primary" loading={form.formState.isSubmitting}>
            {text.enrollments.enroll}
          </Button>
        </>
      }
    >
      <form id="enroll-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        <Field label={text.enrollments.year} error={errors.academic_year_id?.message} required>
          {(props) => (
            <Select {...props} {...form.register('academic_year_id')} options={years} placeholder={shell.common.none} />
          )}
        </Field>

        <Field label={text.enrollments.grade} error={errors.grade_id?.message} required>
          {(props) => (
            <Select {...props} {...form.register('grade_id')} options={grades} placeholder={shell.common.none} />
          )}
        </Field>

        <Field label={text.enrollments.classroom} error={errors.classroom_id?.message} required>
          {(props) => (
            <Select
              {...props}
              {...form.register('classroom_id')}
              options={classrooms}
              placeholder={shell.common.none}
            />
          )}
        </Field>

        <Field label={text.enrollments.enrolledOn} error={errors.enrolled_on?.message}>
          {(props) => <TextInput {...props} {...form.register('enrolled_on')} type="date" dir="ltr" />}
        </Field>
      </form>
    </Drawer>
  )
}
