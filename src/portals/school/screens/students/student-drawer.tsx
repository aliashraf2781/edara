import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { applyFieldErrors } from '~/lib/forms/apply-field-errors'
import { validationText, type ValidationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Drawer } from '~/ui/drawer'
import { Field } from '~/ui/field'
import { FormAlert } from '~/ui/form-alert'
import { Select } from '~/ui/select'
import { NumeralInput, TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { useSaveStudent } from '../../api/students'
import type { Student } from '../../api/types'
import { schoolText } from '../../school.i18n'
import { studentsText } from './students.i18n'

const FIELDS = [
  'student_code',
  'national_id',
  'first_name',
  'father_name',
  'family_name',
  'gender',
  'birth_date',
  'guardian_name',
  'guardian_phone',
] as const

const makeSchema = (v: ValidationText) =>
  z.object({
    student_code: z.string().trim().min(1, v.required),
    national_id: z.string().trim(),
    first_name: z.string().trim().min(1, v.required),
    father_name: z.string().trim(),
    family_name: z.string().trim(),
    gender: z.enum(['male', 'female']),
    birth_date: z.string(),
    guardian_name: z.string().trim(),
    guardian_phone: z.string().trim(),
  })

type StudentForm = z.infer<ReturnType<typeof makeSchema>>

const emptyForm = (): StudentForm => ({
  student_code: '',
  national_id: '',
  first_name: '',
  father_name: '',
  family_name: '',
  gender: 'male',
  birth_date: '',
  guardian_name: '',
  guardian_phone: '',
})

const formFrom = (student: Student): StudentForm => ({
  student_code: student.student_code,
  national_id: student.national_id ?? '',
  first_name: student.first_name,
  father_name: student.father_name ?? '',
  family_name: student.family_name ?? '',
  gender: student.gender,
  birth_date: student.birth_date ?? '',
  guardian_name: student.guardian_name ?? '',
  guardian_phone: student.guardian_phone ?? '',
})

/** Blank optional fields are dropped instead of being sent as empty strings. */
const toPayload = (values: StudentForm) => {
  const { student_code, first_name, gender, ...optional } = values
  const kept = Object.fromEntries(Object.entries(optional).filter(([, value]) => value !== ''))
  return { student_code, first_name, gender, ...kept }
}

type StudentDrawerProps = {
  open: boolean
  student: Student | null
  onClose: () => void
}

export function StudentDrawer({ open, student, onClose }: StudentDrawerProps) {
  const text = useDict(studentsText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { notify } = useToast()
  const saveStudent = useSaveStudent()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const schema = useMemo(() => makeSchema(v), [v])
  const form = useForm<StudentForm>({ resolver: zodResolver(schema), defaultValues: emptyForm() })

  useEffect(() => {
    if (open) form.reset(student ? formFrom(student) : emptyForm())
  }, [open, student, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setFormMessage(null)
    try {
      await saveStudent.mutateAsync({ id: student?.id ?? null, values: toPayload(values) })
      notify('success', student ? text.saved : text.created)
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
      title={student ? text.editTitle : text.createTitle}
      closeLabel={shell.common.close}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button type="submit" form="student-form" variant="primary" loading={form.formState.isSubmitting}>
            {shell.common.save}
          </Button>
        </>
      }
    >
      <form id="student-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formMessage} />

        <Field label={text.fields.studentCode} error={errors.student_code?.message} required>
          {(props) => (
            <NumeralInput {...props} {...form.register('student_code')} autoComplete="off" />
          )}
        </Field>

        <Field label={text.fields.nationalId} error={errors.national_id?.message}>
          {(props) => <NumeralInput {...props} {...form.register('national_id')} inputMode="numeric" />}
        </Field>

        <Field label={text.fields.firstName} error={errors.first_name?.message} required>
          {(props) => <TextInput {...props} {...form.register('first_name')} />}
        </Field>

        <Field label={text.fields.fatherName} error={errors.father_name?.message}>
          {(props) => <TextInput {...props} {...form.register('father_name')} />}
        </Field>

        <Field label={text.fields.familyName} error={errors.family_name?.message}>
          {(props) => <TextInput {...props} {...form.register('family_name')} />}
        </Field>

        <Field label={text.fields.gender} error={errors.gender?.message} required>
          {(props) => (
            <Select
              {...props}
              {...form.register('gender')}
              options={[
                { value: 'male', label: text.genders.male },
                { value: 'female', label: text.genders.female },
              ]}
            />
          )}
        </Field>

        <Field label={text.fields.birthDate} error={errors.birth_date?.message}>
          {(props) => <TextInput {...props} {...form.register('birth_date')} type="date" dir="ltr" />}
        </Field>

        <Field label={text.fields.guardianName} error={errors.guardian_name?.message}>
          {(props) => <TextInput {...props} {...form.register('guardian_name')} />}
        </Field>

        <Field label={text.fields.guardianPhone} error={errors.guardian_phone?.message}>
          {(props) => <TextInput {...props} {...form.register('guardian_phone')} type="tel" dir="ltr" />}
        </Field>
      </form>
    </Drawer>
  )
}
