import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { Spinner } from '~/ui/spinner'
import { adminText } from '../../admin.i18n'
import { useAdminReference, useSchoolStudent } from '../../api/insights'
import { RequireAdmin } from '../../layout/require-admin'
import { toArabicDigits } from './arabic-digits'
import { EXTRACT_CSS } from './extract-styles'
import { EMPTY_ISSUE_DETAILS, type IssueDetails } from './issue-details'
import { IssueDetailsDialog } from './issue-details-dialog'
import { resultsText } from './results.i18n'

/** Grade level -> ordinal word, same mapping student-print-screen.tsx uses. */
const ORDINAL_WORDS: Record<number, string> = {
  1: 'أول', 2: 'ثاني', 3: 'ثالث', 4: 'رابع', 5: 'خامس', 6: 'سادس',
  7: 'سابع', 8: 'ثامن', 9: 'تاسع', 10: 'عاشر', 11: 'حادي عشر', 12: 'ثاني عشر',
}

function Blank({ value, className = '' }: { value?: string; className?: string }) {
  const filled = value !== undefined && value !== ''
  return <span className={`blank ${filled ? 'filled ' : ''}${className}`.trim()}>{filled ? value : null}</span>
}

const academicYears = (academicYearId: string | undefined) => {
  const start = Number(academicYearId?.match(/(\d{4})/)?.[1] ?? NaN)
  if (!Number.isFinite(start)) return null
  return { from: toArabicDigits(start), to: toArabicDigits(start + 1) }
}

export function EnrollmentStatementScreen() {
  return (
    <RequireAdmin>
      <Statement />
    </RequireAdmin>
  )
}

function Statement() {
  const text = useDict(resultsText)
  const shell = useDict(adminText)
  const navigate = useNavigate()
  const params = useParams()
  const code = params.code ?? ''
  const id = params.id ?? ''

  const reference = useAdminReference(code)
  const detail = useSchoolStudent(code, id)

  const [askingDetails, setAskingDetails] = useState(false)
  const [issue, setIssue] = useState<IssueDetails>(EMPTY_ISSUE_DETAILS)

  if (detail.isPending) {
    return (
      <div className="flex items-center gap-3 p-8 text-muted">
        <Spinner className="text-accent" label={text.print.loading} />
        <p className="text-small">{text.print.loading}</p>
      </div>
    )
  }

  if (detail.isError) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <ErrorState error={detail.error} onRetry={() => void detail.refetch()} labels={shell.error} />
      </div>
    )
  }

  const { student, school } = detail.data
  const classroom = reference.data?.classrooms.find((room) => room.id === student.classroom_id)
  const grade = reference.data?.grades.find((row) => row.id === student.grade_id)
  const ordinal = grade ? ORDINAL_WORDS[grade.level] : undefined
  const years = academicYears(classroom?.academic_year_id)
  const fullName = [student.first_name, student.father_name, student.family_name]
    .filter((part) => part !== '')
    .join(' ')

  return (
    <div className="extract-screen">
      <style>{EXTRACT_CSS}</style>
      <style>{STATEMENT_CSS}</style>

      <div className="extract-chrome flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-6 py-4">
        <Button onClick={() => navigate(`/admin/schools/${code}/students/${id}`)}>
          <Icon name="chevronStart" directional />
          {text.print.back}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setAskingDetails(true)}>
            <Icon name="pencil" />
            {text.issue.fill}
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <Icon name="download" />
            {text.print.action}
          </Button>
        </div>
      </div>

      {askingDetails ? (
        <IssueDetailsDialog
          initial={issue}
          onClose={() => setAskingDetails(false)}
          onApply={(details) => {
            setIssue(details)
            setAskingDetails(false)
          }}
          onPrint={(details) => {
            flushSync(() => {
              setIssue(details)
              setAskingDetails(false)
            })
            window.print()
          }}
        />
      ) : null}

      <div className="extract" dir="rtl" lang="ar">
        <div className="page statement-page">
          <div className="top-row">
            <span />
            <div className="date-field">
              التاريخ :{' '}
              <span className="date-run" dir="ltr">
                <Blank className="statement-date-slot" value={toArabicDigits(issue.issueDay)} /> /{' '}
                <Blank className="statement-date-slot" value={toArabicDigits(issue.issueMonth)} /> /{' '}
                <Blank className="statement-date-slot-lg" value={toArabicDigits(issue.issueYear)} /> م
              </span>
            </div>
            <img className="crest crest-end" src="/topright.png" alt="محافظة الدقهلية — مديرية التربية والتعليم" />
          </div>

          <div className="title-wrap">
            <div className="title-box">
              <span>بيان قيد</span>
            </div>
          </div>

          <p className="statement-subtitle">
            بيان قيد بالصف&nbsp;: <span className="blank filled">{ordinal ? `ال${ordinal} الابتدائي` : ''}</span>
          </p>

          <div className="info-lines statement-lines">
            <div className="row">
              <span className="txt">بالكشف في سجلات القيد بمدرسة&nbsp;:</span>
              <span className="blank filled b-xl">{school.name}</span>
            </div>
            <div className="row">
              <span className="txt">في العام الدراسي </span>
              <span className="date-run" dir="ltr">
                <span className="blank filled b-md">{years?.from ?? ''}</span>/
                <span className="blank filled b-md">{years?.to ?? ''}</span>م
              </span>
            </div>
            <div className="row">
              <span className="txt">وجد اسم الطالب&nbsp;:</span>
              <span className="blank filled b-xl">{fullName}</span>
            </div>
            <div className="row">
              <span className="txt">مقيد بالصف&nbsp;:</span>
              <span className="blank filled b-md">{ordinal ? `ال${ordinal} الابتدائي` : ''}</span>
            </div>
            <div className="row">
              <span className="txt">رقم القيد&nbsp;:</span>
              <span className="blank filled b-md" dir="ltr">
                {student.student_code}
              </span>
            </div>
          </div>

          <div className="after-table">
            <p className="pay-line">
              <span>وقد استخرج هذا البيان بعد سداد الرسم المقرر بالحوالة رقم&nbsp;:</span>
              <Blank className="b-md" value={toArabicDigits(issue.transferNumber)} />
              <span>&nbsp;&nbsp;بمبلغ&nbsp;:</span>
              <Blank className="b-md" value={toArabicDigits(issue.amount)} />
            </p>
            <p className="pay-line">
              <span>بتاريخ&nbsp;:</span>
              <span className="date-run" dir="ltr">
                <Blank className="statement-date-slot" value={toArabicDigits(issue.transferDay)} />/
                <Blank className="statement-date-slot" value={toArabicDigits(issue.transferMonth)} />/
                <Blank className="statement-date-slot-lg" value={toArabicDigits(issue.transferYear)} />م
              </span>
            </p>
            <p className="submit-line">
              <span>وذلك لتقديمه إلى&nbsp;:</span>
              <Blank value={issue.submittedTo} />
            </p>
          </div>

          <div className="statement-note">
            <p className="statement-note-title">ملحوظة :</p>
            <p>
              على الجهة المقدم لها البيان التحقق بالأدلة والقرائن التي يتقدم بها الطالب بأنه نفس المبين بصدر هذا
              البيان ولا يستعمل لغير الجهة المطلوب لها ولا لغير الغرض الذي طلب لأجله
            </p>
          </div>

          <div className="statement-signatures">
            <div>المحرر</div>
            <div>مراجع أول</div>
            <div>مراجع ثان</div>
            <div>المدير المساعد</div>
          </div>

          <div className="statement-approval">
            <span>يعتمد ،،</span>
            <span>مدير الإدارة</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * A few overrides for this simpler form — the shared EXTRACT_CSS covers
 * the rest (blanks, date runs, signatures spacing) but assumes the
 * result extract's wide landscape table. This form is a short portrait
 * page instead (see the real template), so it needs its own page size
 * both on screen and, more importantly, in @page — otherwise it would
 * print on a landscape sheet at the wide extract's proportions, mostly
 * empty. A later @page rule with equal specificity wins the cascade, so
 * this one (loaded after EXTRACT_CSS) overrides its landscape default.
 */
const STATEMENT_CSS = `
.statement-page{
  width:780px;
  min-height:1040px;
  padding:34px 46px 40px;
  display:flex;
  flex-direction:column;
}
.statement-date-slot{ display:inline-block; min-width:26px; border-bottom:1px dotted #000; margin:0 3px; text-align:center; }
.statement-date-slot-lg{ display:inline-block; min-width:48px; border-bottom:1px dotted #000; margin:0 3px; text-align:center; }
.statement-subtitle{ text-align:center; font-size:14px; margin:4px 0 18px; }
.statement-lines .row{ margin:10px 0; }
.statement-note{
  margin-top:26px;
  border:1.5px solid var(--line);
  border-radius:6px;
  padding:12px 16px;
  font-size:12.5px;
  line-height:1.7;
}
.statement-note-title{ font-weight:700; margin:0 0 4px; }
.statement-signatures{
  display:flex;
  justify-content:space-between;
  margin-top:64px;
  font-size:14px;
  font-weight:700;
  padding:0 10px;
}
.statement-approval{
  display:flex;
  justify-content:flex-end;
  gap:32px;
  margin-top:64px;
  font-size:14px;
  font-weight:700;
  padding:0 10px;
}
/* Pushes the note/signatures/approval block toward the bottom of the
   page instead of clumping right under the info lines, matching the
   real form's proportions. */
.statement-note{ margin-top:auto; }

@media print{
  @page{ size:A4 portrait; margin:12mm; }
  .statement-page{ width:100%; min-height:auto; }
}
`
