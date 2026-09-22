import { useRef, useState } from 'react'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { Field } from '~/ui/field'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { ProgressBar } from '~/ui/spinner'
import { Select } from '~/ui/select'
import { useToast } from '~/ui/toast'
import {
  IMPORT_EXTENSIONS,
  IMPORT_MAX_BYTES,
  useConfirmImport,
  usePreviewImport,
} from '../../api/imports'
import type { ImportPreview, ImportReport, ImportSubjectMapping } from '../../api/types'
import { useSubjects, useYearOptions } from '../../api/use-options'
import { ExamPeriodField } from '../../components/exam-period-field'
import { schoolText } from '../../school.i18n'
import { ImportMappingPanel, initialMapping, type MappingChoice } from './import-mapping-panel'
import { ImportReportPanel } from './import-report-panel'
import { importsText } from './imports.i18n'

const MAX_MB = IMPORT_MAX_BYTES / 1024 / 1024

type Step = 'upload' | 'mapping' | 'report'

export function ImportsScreen() {
  const text = useDict(importsText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { notify, notifyError } = useToast()
  const years = useYearOptions()
  const subjects = useSubjects()
  const previewImport = usePreviewImport()
  const confirmImport = useConfirmImport()
  const fileInput = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [yearId, setYearId] = useState('')
  const [examPeriodId, setExamPeriodId] = useState('')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [mapping, setMapping] = useState<MappingChoice>({})
  const [report, setReport] = useState<ImportReport | null>(null)

  const resetToUpload = () => {
    setStep('upload')
    setPreview(null)
    setMapping({})
    setReport(null)
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
    previewImport.reset()
    confirmImport.reset()
  }

  const runPreview = async () => {
    if (!file) return notify('danger', text.noFile)
    if (file.size > IMPORT_MAX_BYTES) return notify('danger', v.fileTooLarge(MAX_MB))

    try {
      const data = await previewImport.mutateAsync({
        file,
        academic_year_id: yearId,
        exam_period_id: examPeriodId,
      })
      setPreview(data)
      setMapping(initialMapping(data))
      setStep('mapping')
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const runConfirm = async () => {
    if (!preview) return

    const chosen: ImportSubjectMapping[] = Object.entries(mapping)
      .filter(([, subjectId]) => subjectId !== '')
      .map(([sheetIndex, subjectId]) => ({
        sheet_index: Number(sheetIndex),
        subject_id: /^\d+$/.test(subjectId) ? Number(subjectId) : subjectId,
      }))

    if (chosen.length === 0) return notify('danger', text.needMapping)

    try {
      const data = await confirmImport.mutateAsync({
        resultImportId: String(preview.resultImportId),
        mapping: chosen,
      })
      setReport(data)
      setStep('report')
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const ready = file !== null && yearId !== '' && examPeriodId !== ''

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      {step === 'upload' ? (
        <Card>
          <CardHeader title={text.uploadTitle} />
          <CardBody className="flex flex-col gap-4">
            <Field label={text.file} hint={text.fileHint} required>
              {(props) => (
                <input
                  {...props}
                  ref={fileInput}
                  type="file"
                  accept={IMPORT_EXTENSIONS.join(',')}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="h-10 w-full rounded-control border border-line bg-surface px-3 py-2 text-small text-ink file:me-3 file:rounded-control file:border-0 file:bg-sunken file:px-3 file:py-1 file:text-ink"
                />
              )}
            </Field>

            <Field label={text.year} required>
              {(props) => (
                <Select
                  {...props}
                  value={yearId}
                  onChange={(event) => {
                    setYearId(event.target.value)
                    setExamPeriodId('')
                  }}
                  options={years}
                  placeholder={shell.common.none}
                />
              )}
            </Field>

            <ExamPeriodField
              academicYearId={yearId}
              value={examPeriodId}
              onChange={setExamPeriodId}
              required
            />

            {previewImport.isPending ? <ProgressBar label={text.previewing} /> : null}

            <div className="flex justify-end">
              <Button
                variant="primary"
                loading={previewImport.isPending}
                disabled={!ready}
                onClick={runPreview}
              >
                <Icon name="sheet" />
                {text.preview}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {step === 'mapping' && preview ? (
        <>
          {confirmImport.isPending ? <ProgressBar label={text.confirming} /> : null}
          <ImportMappingPanel
            preview={preview}
            subjects={subjects.data ?? []}
            mapping={mapping}
            onChange={(sheetIndex, subjectId) =>
              setMapping((prev) => ({ ...prev, [sheetIndex]: subjectId }))
            }
            onConfirm={runConfirm}
            onBack={resetToUpload}
            confirming={confirmImport.isPending}
          />
        </>
      ) : null}

      {step === 'report' && report ? (
        <ImportReportPanel report={report} onStartOver={resetToUpload} />
      ) : null}

      <p className="flex items-start gap-2 text-small text-muted">
        <Icon name="info" className="size-4 shrink-0" />
        {text.historyBody}
      </p>
    </div>
  )
}
