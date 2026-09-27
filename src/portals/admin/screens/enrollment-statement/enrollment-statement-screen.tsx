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
import type { AdminReference, StudentDetail } from '../../api/types'
import { RequireAdmin } from '../../layout/require-admin'
import { toArabicDigits } from '../results/arabic-digits'
import { statementText } from './enrollment-statement.i18n'
import { EMPTY_ISSUE_SLOTS, type StatementDetails } from './statement-details'
import { StatementDetailsDialog } from './statement-details-dialog'
import { STATEMENT_CSS } from './statement-styles'

/** Grade level -> ordinal word, printed as «ال[ordinal] الابتدائي». */
const ORDINAL_WORDS: Record<number, string> = {
  1: 'أول', 2: 'ثاني', 3: 'ثالث', 4: 'رابع', 5: 'خامس', 6: 'سادس',
}

/** What the school's records already say, before the officer edits anything. */
function fromRecords(data: StudentDetail, reference: AdminReference | undefined): StatementDetails {
  const { student, school } = data
  const classroom = reference?.classrooms.find((room) => room.id === student.classroom_id)
  const level = reference?.grades.find((row) => row.id === student.grade_id)?.level
  const ordinal = level !== undefined ? ORDINAL_WORDS[level] : undefined
  const yearStart = Number(classroom?.academic_year_id?.match(/(\d{4})/)?.[1] ?? NaN)

  return {
    ...EMPTY_ISSUE_SLOTS,
    grade: ordinal ? `ال${ordinal} الابتدائي` : data.grade_name,
    schoolName: school.name,
    yearFrom: Number.isFinite(yearStart) ? String(yearStart) : '',
    yearTo: Number.isFinite(yearStart) ? String(yearStart + 1) : '',
    studentName: [student.first_name, student.father_name, student.family_name]
      .filter((part) => part !== '')
      .join(' '),
    registrationNo: student.student_code,
  }
}

export function EnrollmentStatementScreen() {
  return (
    <RequireAdmin>
      <Statement />
    </RequireAdmin>
  )
}

function Statement() {
  const text = useDict(statementText)
  const shell = useDict(adminText)
  const navigate = useNavigate()
  const params = useParams()
  const code = params.code ?? ''
  const id = params.id ?? ''

  const reference = useAdminReference(code)
  const detail = useSchoolStudent(code, id)

  const [askingDetails, setAskingDetails] = useState(false)
  // null until the officer edits — the form then follows the records as they load.
  const [edits, setEdits] = useState<StatementDetails | null>(null)

  if (detail.isPending || reference.isPending) {
    return (
      <div className="flex items-center gap-3 p-8 text-muted">
        <Spinner className="text-accent" label={text.loading} />
        <p className="text-small">{text.loading}</p>
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

  const details = edits ?? fromRecords(detail.data, reference.data)

  // Reached from the results modal or the Documents hub, so go back to
  // whichever it was; a directly opened link falls back to the student page.
  const goBack = () => {
    const index = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (index > 0) navigate(-1)
    else navigate(`/admin/schools/${code}/students/${id}`)
  }

  return (
    <div className="statement-screen">
      <style>{STATEMENT_CSS}</style>

      <div className="statement-chrome flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-6 py-4">
        <Button onClick={goBack}>
          <Icon name="chevronStart" directional />
          {text.back}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setAskingDetails(true)}>
            <Icon name="pencil" />
            {text.fill}
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <Icon name="download" />
            {text.print}
          </Button>
        </div>
      </div>

      {askingDetails ? (
        <StatementDetailsDialog
          initial={details}
          onClose={() => setAskingDetails(false)}
          onReset={() => {
            setEdits(null)
            setAskingDetails(false)
          }}
          onApply={(values) => {
            setEdits(values)
            setAskingDetails(false)
          }}
          onPrint={(values) => {
            // The values have to be on the page — and the dialog gone — before
            // the browser's print preview reads the DOM.
            flushSync(() => {
              setEdits(values)
              setAskingDetails(false)
            })
            window.print()
          }}
        />
      ) : null}

      <StatementSheet details={details} />
    </div>
  )
}

function Fill({ value, className = '' }: { value?: string; className?: string }) {
  return <span className={`fill ${className}`.trim()}>{value || null}</span>
}

/** One date as year / month / day, followed by «م». */
function PrintedDate({ day, month, year }: { day: string; month: string; year: string }) {
  return (
    <>
      <span className="run">
        <Fill className="year" value={toArabicDigits(year)} />/
        <Fill value={toArabicDigits(month)} />/
        <Fill value={toArabicDigits(day)} />
      </span>
      <span>م</span>
    </>
  )
}

function StatementSheet({ details }: { details: StatementDetails }) {
  return (
    <div className="statement" dir="rtl" lang="ar">
      <div className="sheet">
        {/* `head` is forced LTR, so the seal sits on the left. */}
        <div className="head">
          <img className="crest crest-start" src="/topleft.png" alt="شعار إدارة شئون الطلبة والامتحانات" />
          <img className="crest crest-end" src="/topright.png" alt="محافظة الدقهلية — مديرية التربية والتعليم" />
        </div>

        <div className="title">بيان قيد</div>

        <p className="line subtitle">
          <span>بيان قيد بالصف&nbsp;:</span>
          <Fill value={details.grade} />
        </p>

        <div className="date-pill line">
          <span>التاريخ&nbsp;:</span>
          <PrintedDate day={details.issueDay} month={details.issueMonth} year={details.issueYear} />
        </div>

        <div className="body-lines">
          <p className="line">
            <span>بالكشف في سجلات القيد بمدرسة&nbsp;:</span>
            <Fill value={details.schoolName} />
          </p>

          <p className="line">
            <span>في العام الدراسي</span>
            <span className="run">
              <Fill className="year" value={toArabicDigits(details.yearTo)} />/
              <Fill className="year" value={toArabicDigits(details.yearFrom)} />
            </span>
            <span>م</span>
            <span>عام (</span>
            <Fill className="year-note" value={toArabicDigits(details.yearNote)} />
            <span>)</span>
          </p>

          <p className="line">
            <span>وجد اسم الطالب&nbsp;:</span>
            <Fill value={details.studentName} />
          </p>

          <p className="line">
            <span>مقيد بالصف&nbsp;:</span>
            <Fill value={details.grade} />
          </p>

          <p className="line">
            <span>رقم القيد&nbsp;:</span>
            <Fill value={toArabicDigits(details.registrationNo)} />
          </p>

          <p className="line">
            <span>وقد استخرج هذا البيان بعد سداد الرسم المقرر بالحوالة رقم&nbsp;:</span>
            <Fill value={toArabicDigits(details.transferNumber)} />
          </p>

          <p className="line">
            <span>بمبلغ&nbsp;:</span>
            <Fill value={toArabicDigits(details.amount)} />
            <span>بتاريخ&nbsp;:</span>
            <PrintedDate day={details.transferDay} month={details.transferMonth} year={details.transferYear} />
          </p>

          <p className="line">
            <span>وذلك لتقديمه إلى&nbsp;:</span>
            <Fill value={toArabicDigits(details.submittedTo)} />
          </p>
        </div>

        <div className="note">
          <span className="note-title">ملحوظة :</span>
          على الجهة المقدم لها البيان التحقق بالأدلة والقرائن التي يتقدم بها الطالب
          <br />
          بأنه نفس المبين بصدر هذا البيان ولا يستعمل لغير الجهة المطلوب لها
          <br />
          ولا لغير الغرض الذي طلب لأجله
        </div>

        <div className="signatures">
          <span>المحرر</span>
          <span>مراجع</span>
          <span>المدير المساعد</span>
        </div>

        <div className="approval">
          <span>يعتمد ،،</span>
          <div className="approval-officer">
            <span>مدير إدارة شئون الطلبة والامتحانات</span>
            <span className="holder-name">ابراهيم طلعت محمد</span>
          </div>
        </div>
      </div>
    </div>
  )
}
