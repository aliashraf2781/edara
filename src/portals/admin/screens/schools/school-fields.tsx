import type { UseFormReturn } from 'react-hook-form'
import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { TextInput } from '~/ui/text-input'
import { Textarea } from '~/ui/textarea'
import { schoolFormText } from './school-detail.i18n'
import type { EditFormValues } from './school-form'

/**
 * The Overview tab's edit form. The code is server-generated and immutable,
 * and there is no bilingual name_ar field anymore, so neither appears here.
 */
export function SchoolFields({ form }: { form: UseFormReturn<EditFormValues> }) {
  const text = useDict(schoolFormText)
  const { errors } = form.formState

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={text.fields.name} error={errors.name?.message} required>
        {(props) => <TextInput {...props} {...form.register('name')} autoComplete="off" />}
      </Field>

      <Field
        label={text.fields.contactEmail}
        error={errors.contact_email?.message}
        hint={text.fields.contactEmailHint}
      >
        {(props) => (
          <TextInput {...props} {...form.register('contact_email')} type="email" dir="ltr" />
        )}
      </Field>

      <Field label={text.fields.contactPhone} error={errors.contact_phone?.message}>
        {(props) => (
          <TextInput {...props} {...form.register('contact_phone')} type="tel" dir="ltr" />
        )}
      </Field>

      <Field label={text.fields.governorate} error={errors.governorate?.message}>
        {(props) => <TextInput {...props} {...form.register('governorate')} />}
      </Field>

      <Field label={text.fields.address} error={errors.address?.message} className="md:col-span-2">
        {(props) => <Textarea {...props} {...form.register('address')} />}
      </Field>
    </div>
  )
}
