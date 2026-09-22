import { useState } from 'react'
import { useParams } from 'react-router'
import { formatDateTime } from '~/lib/format'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DefinitionList } from '~/ui/definition-list'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { Spinner } from '~/ui/spinner'
import { Stamp } from '~/ui/stamp'
import { useToast } from '~/ui/toast'
import { useResult, useTransitionResult } from '../../api/results'
import type { ResultStatus } from '../../api/types'
import { useCurriculumNames } from '../../api/use-options'
import { useSchoolSession } from '../../auth/session-context'
import { schoolText } from '../../school.i18n'
import { markLabel } from './mark'
import { resultsText } from './results.i18n'
import { TransitionDialog } from './transition-dialog'
import { nextStatuses, STATUS_TONE } from './workflow'

export function ResultDetailScreen() {
  const text = useDict(resultsText)
  const shell = useDict(schoolText)
  const { locale } = useLocale()
  const { can } = useSchoolSession()
  const { notify, notifyError } = useToast()

  const id = useParams().id ?? ''
  const result = useResult(id)
  const transition = useTransitionResult(id)
  const [target, setTarget] = useState<ResultStatus | null>(null)
  const { termName, gradeName } = useCurriculumNames()

  if (result.isPending) {
    return (
      <div className="flex items-center gap-3 text-muted">
        <Spinner className="text-accent" label={shell.guard.loading} />
        <p className="text-small">{shell.guard.loading}</p>
      </div>
    )
  }

  if (result.isError) {
    return <ErrorState error={result.error} onRetry={() => void result.refetch()} labels={shell.error} />
  }

  const record = result.data
  // Only the moves the server would accept, narrowed further by role.
  const moves = nextStatuses(record.status, can.canReviewResults)
  const transitions = record.transitions ?? []

  const runTransition = async (reason: string | undefined) => {
    if (!target) return
    try {
      await transition.mutateAsync({ status: target, reason })
      notify('success', text.transitioned)
      setTarget(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={record.student_name}
        description={record.subject_name}
        meta={<Stamp tone={STATUS_TONE[record.status]}>{text.statuses[record.status]}</Stamp>}
        actions={
          moves.length === 0 ? null : (
            <div className="flex flex-wrap gap-3">
              {moves.map((status) => (
                <Button
                  key={status}
                  variant="primary"
                  destructive={status === 'rejected'}
                  onClick={() => setTarget(status)}
                >
                  {text.actions[status]}
                </Button>
              ))}
            </div>
          )
        }
      />

      {!can.canReviewResults ? (
        <p className="flex items-center gap-2 text-small text-muted">
          <Icon name="info" className="size-4" />
          {text.teacherNote}
        </p>
      ) : null}

      <Card>
        <CardHeader title={text.detailTitle} />
        <CardBody>
          <DefinitionList
            columns={3}
            items={[
              {
                term: text.columns.mark,
                value: markLabel(record, {
                  absent: text.absent,
                  none: shell.common.none,
                  qualitative: text.qualitative,
                }),
                // Only a numeric mark is a numeral — اجتياز must stay RTL.
                mono: record.grading_type === 'numeric',
              },
              { term: text.gradingTypeLabel, value: text.gradingTypes[record.grading_type] },
              { term: shell.pickers.term, value: termName(record.term_id) },
              { term: shell.pickers.grade, value: gradeName(record.grade_id) },
              { term: text.columns.code, value: record.student_code, mono: true },
              ...(record.reason ? [{ term: text.reason, value: record.reason }] : []),
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={text.timeline} />
        <CardBody>
          {transitions.length === 0 ? (
            <p className="text-small text-muted">{text.timelineEmpty}</p>
          ) : (
            <ol className="flex flex-col gap-4">
              {transitions.map((entry) => (
                <li key={entry.id} className="flex gap-4 border-s-2 border-line ps-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.from_status ? (
                        <>
                          <Stamp tone={STATUS_TONE[entry.from_status]}>
                            {text.statuses[entry.from_status]}
                          </Stamp>
                          <Icon name="chevronEnd" className="size-4 text-muted" directional />
                        </>
                      ) : null}
                      <Stamp tone={STATUS_TONE[entry.to_status]}>
                        {text.statuses[entry.to_status]}
                      </Stamp>
                    </div>
                    <p className="font-mono text-small text-muted">
                      {formatDateTime(entry.created_at, locale)}
                      {entry.causer_name ? ` · ${text.by} ${entry.causer_name}` : ''}
                    </p>
                    {entry.reason ? <p className="text-small text-ink">{entry.reason}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>

      {target ? (
        <TransitionDialog
          key={target}
          target={target}
          loading={transition.isPending}
          onClose={() => setTarget(null)}
          onConfirm={runTransition}
        />
      ) : null}
    </div>
  )
}
