import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { Select } from '~/ui/select'
import { Spinner } from '~/ui/spinner'
import { adminText } from '../../admin.i18n'
import { useAdminReference, useSchoolStudent } from '../../api/insights'
import type { StudentDetail, StudentTermStats, StudentTermSubject, SubjectGroup } from '../../api/types'
import { RequireAdmin } from '../../layout/require-admin'
import { toArabicDigits } from './arabic-digits'
import { EXTRACT_CSS } from './extract-styles'
import { EMPTY_ISSUE_DETAILS, type IssueDetails } from './issue-details'
import { IssueDetailsDialog } from './issue-details-dialog'
import { resultsText } from './results.i18n'

const TERM_PARAM = { term: '' } as const

/** The post holder whose name is printed under the last signature slot. */
const EXAMS_DIRECTOR = 'ابراهيم طلعت محمد'

/**
 * Grade level -> the ordinal word used inside "الصف [ordinal] الابتدائي"
 * and "منقول من/إلى الصف [ordinal]". A school's own Grade.name is free
 * text (it might read "الرابع الابتدائي", "Grade 4", anything), so the
 * one field guaranteed to mean the same thing everywhere is the numeric
 * level — same mapping ResultSheetParser::detectGradeLevel() uses on the
 * backend to go the other direction.
 */
const ORDINAL_WORDS: Record<number, string> = {
  1: 'أول', 2: 'ثاني', 3: 'ثالث', 4: 'رابع', 5: 'خامس', 6: 'سادس',
  7: 'سابع', 8: 'ثامن', 9: 'تاسع', 10: 'عاشر', 11: 'حادي عشر', 12: 'ثاني عشر',
}

/**
 * A dotted rule that carries a value when there is one, and stays empty to be
 * filled in by hand when there is not.
 */
function Blank({
  value,
  className = '',
  style,
}: {
  value?: string
  className?: string
  style?: React.CSSProperties
}) {
  const filled = value !== undefined && value !== ''
  return (
    <span className={`blank ${filled ? 'filled ' : ''}${className}`.trim()} style={style}>
      {filled ? value : null}
    </span>
  )
}

/** The group headers printed across the top of the grade 4-6 form, in printed order. */
const GROUP_LABEL: Record<SubjectGroup, string> = {
  pass_fail: 'مواد نجاح ورسوب',
  formative: 'تقييم تكويني',
  attendance: 'مواد نجاح بنسبة حضور ٨٠٪',
  blank: '',
}

/** Run-length encodes the subjects into the form's column groups, straight off each subject's own print_group. */
function groupRuns(subjects: readonly StudentTermSubject[]) {
  const runs: { group: SubjectGroup; span: number }[] = []
  for (const subject of subjects) {
    const group: SubjectGroup = subject.print_group ?? 'blank'
    const last = runs.at(-1)
    if (last && last.group === group) last.span += 1
    else runs.push({ group, span: 1 })
  }
  return runs
}

/** `year-2025` → ٢٠٢٥ / ٢٠٢٦ as whole years (never `٢٠`+`٢٦`, which RTL paints as ٢٦٢٠). */
const academicYears = (academicYearId: string | undefined) => {
  const start = Number(academicYearId?.match(/(\d{4})/)?.[1] ?? NaN)
  if (!Number.isFinite(start)) return null
  return { from: toArabicDigits(start), to: toArabicDigits(start + 1) }
}

/** Two-digit year fragment → full `٢٠٢٦`, kept as one string so bidi cannot flip it to ٢٦٢٠. */
const fullArabicYear = (yy: string) => (yy === '' ? '' : toArabicDigits(`20${yy}`))

export function StudentPrintScreen() {
  return (
    <RequireAdmin>
      <StudentExtract />
    </RequireAdmin>
  )
}

function StudentExtract() {
  const text = useDict(resultsText)
  const shell = useDict(adminText)
  const navigate = useNavigate()
  const params = useParams()
  const code = params.code ?? ''
  const id = params.id ?? ''
  const { values, setValue } = useTableParams(TERM_PARAM)

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

  const data = detail.data
  const term = data.terms.find((row) => row.term_id === values.term) ?? data.terms[0]
  const classroom = reference.data?.classrooms.find((room) => room.id === data.student.classroom_id)
  const grade = reference.data?.grades.find((row) => row.id === data.student.grade_id)

  return (
    <div className="extract-screen">
      <style>{EXTRACT_CSS}</style>

      <div className="extract-chrome flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(`/admin/schools/${code}/students/${id}`)}>
            <Icon name="chevronStart" directional />
            {text.print.back}
          </Button>
          <Select
            aria-label={text.print.term}
            className="min-w-44"
            value={term?.term_id ?? ''}
            onChange={(event) => setValue('term', event.target.value)}
            options={data.terms.map((row) => ({ value: row.term_id, label: row.term_name }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setAskingDetails(true)}>
            <Icon name="pencil" />
            {text.issue.fill}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.print()
            }}
          >
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
            // The values have to be on the page — and the dialog gone — before
            // the browser's print preview reads the DOM.
            flushSync(() => {
              setIssue(details)
              setAskingDetails(false)
            })
            window.print()
          }}
        />
      ) : null}

      {term ? (
        <ExtractPage
          data={data}
          term={term}
          gradeLevel={grade?.level}
          academicYearId={classroom?.academic_year_id}
          issue={issue}
        />
      ) : null}
    </div>
  )
}

type ExtractPageProps = {
  data: StudentDetail
  term: StudentTermStats
  gradeLevel: number | undefined
  academicYearId: string | undefined
  issue: IssueDetails
}

function ExtractPage({ data, term, gradeLevel, academicYearId, issue }: ExtractPageProps) {
  const text = useDict(resultsText)
  const { student, school } = data
  const ordinal = gradeLevel !== undefined ? ORDINAL_WORDS[gradeLevel] : undefined
  const nextOrdinal = gradeLevel !== undefined ? ORDINAL_WORDS[gradeLevel + 1] : undefined
  const fullName = [student.first_name, student.father_name, student.family_name]
    .filter((part) => part !== '')
    .join(' ')

  const subjects = term.subjects
  const numeric = subjects.filter((subject) => subject.grading_type === 'numeric')
  const years = academicYears(academicYearId)
  // Grades 1-2 never carry a numeric mark at all — the printed form for
  // them is a single "تقديرات الطالب" row of ratings, not the four-row
  // numeric table the other grades use.
  const allQualitative = subjects.length > 0 && numeric.length === 0

  const verdict = (subject: StudentTermSubject) =>
    subject.is_absent ? text.print.absentMark : subject.passed ? text.student.passed : text.student.failed

  return (
    <div className="extract" dir="rtl" lang="ar">
      <div className="page">
        {/* ===== Header ===== */}
        <div className="top-row">
          {/* `top-row` is forced LTR, so this crest sits on the left. */}
          <img className="crest crest-start" src="/topleft.png" alt="شعار إدارة شئون الطلبة والامتحانات" />
          <div className="date-field">
            التاريخ :{' '}
            {/* Digits + slashes must stay LTR or bidi flips day/month/year. */}
            <span className="date-run" dir="ltr">
              <Blank style={{ minWidth: 34 }} value={toArabicDigits(issue.issueDay)} /> /{' '}
              <Blank style={{ minWidth: 34 }} value={toArabicDigits(issue.issueMonth)} /> /{' '}
              <Blank style={{ minWidth: 48 }} value={toArabicDigits(issue.issueYear)} /> م
            </span>
          </div>
          <img className="crest crest-end" src="/topright.png" alt="محافظة الدقهلية — مديرية التربية والتعليم" />
        </div>

        {/* ===== Title box ===== */}
        <div className="title-wrap">
          <div className="title-box">
            <span>مستخرج رسمي بنتيجة الصف</span>
            <span className="blank filled">{ordinal ?? ''}</span>
            <span>الابتدائي</span>
          </div>
        </div>

        {/* ===== Info lines ===== */}
        <div className="info-lines">
          <div className="row">
            <span className="txt">بالكشف في سجلات القيد بمدرسة&nbsp;:</span>
            <span className="blank filled b-xl">{school.name}</span>
            <span className="txt">في العام الدراسي </span>
            <span className="date-run" dir="ltr">
              <span className="blank filled b-md">{years?.from ?? ''}</span>
              /
              <span className="blank filled b-md">{years?.to ?? ''}</span>م
            </span>
          </div>
          <div className="row">
            <span className="txt">وجد اسم الطالب&nbsp;:</span>
            <span className="blank filled b-xl">{fullName}</span>
            <span className="txt">منقول من الصف</span>
            <span className="blank filled b-md">{ordinal ?? ''}</span>
            <span className="txt">الابتدائي إلى الصف</span>
            <span className="blank filled b-md">{nextOrdinal ?? ''}</span>
          </div>
          <div className="row">
            <span className="txt">تحت اشراف المديرية برقم جلوس</span>
            <span className="blank filled b-lg">{toArabicDigits(student.seat_no)}</span>
            <span className="txt">طبقا للقرار الوزاري</span>
            <Blank className="b-sm" />
            <span className="txt">لسنة</span>
            <Blank className="b-md" />
            <span className="txt">الدور</span>
            <Blank className="b-md" />
          </div>
        </div>

        {allQualitative ? (
          /* ===== Grades 1-2: one row of ratings, no numeric section ===== */
          <table className="grades">
            <thead>
              <tr>
                <th className="label-col">المادة</th>
                {subjects.map((subject) => (
                  <th key={subject.subject_id}>{subject.subject_name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="fill-row">
                <td className="label-col">تقديرات الطالب</td>
                {subjects.map((subject) => (
                  <td key={subject.subject_id}>{verdict(subject)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          /* ===== Grades 3-6: full numeric + qualitative-verdict table ===== */
          <table className="grades">
            <thead>
              <tr className="summary-row">
                <td className="label-col" />
                {groupRuns(subjects).map((run, index) => (
                  <td
                    key={`${run.group}-${index}`}
                    colSpan={run.span}
                    className={run.group === 'blank' ? 'blank-cell' : undefined}
                  >
                    {GROUP_LABEL[run.group]}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="label-col">المادة</th>
                {subjects.map((subject) => (
                  <th key={subject.subject_id}>{subject.subject_name}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="num-row">
                <td className="label-col">الدرجة النهائية</td>
                {subjects.map((subject) =>
                  subject.grading_type === 'numeric' ? (
                    <td key={subject.subject_id}>{toArabicDigits(subject.max_score)}</td>
                  ) : (
                    // The original spans one rotated «اجتياز» cell over all four
                    // rows; here it carries this student's own verdict instead.
                    <td key={subject.subject_id} rowSpan={4} className="vertical-text">
                      <span>{verdict(subject)}</span>
                    </td>
                  ),
                )}
              </tr>
              <tr className="num-row">
                <td className="label-col">الدرجة الصغرى</td>
                {numeric.map((subject) => (
                  <td key={subject.subject_id}>{toArabicDigits(subject.pass_score)}</td>
                ))}
              </tr>
              <tr className="fill-row">
                <td className="label-col">درجة الطالب</td>
                {numeric.map((subject) => (
                  <td key={subject.subject_id}>
                    {subject.is_absent ? text.print.absentMark : toArabicDigits(subject.score)}
                  </td>
                ))}
              </tr>
              <tr className="fill-row">
                <td className="label-col">التقييم</td>
                {numeric.map((subject) => (
                  <td key={subject.subject_id}>{subject.passed ? text.student.passed : text.student.failed}</td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        {/* ===== After-table text ===== */}
        <div className="after-table">
          <p className="submit-line">
            <span>وقد استخرج هذا البيان لتقديمه إلى&nbsp;:</span>
            <Blank value={issue.submittedTo} />
          </p>
          <p className="pay-line">
            <span>بناء على طلب الطالب بعد سداد الرسم المقرر بالحوالة رقم&nbsp;:</span>
            <Blank className="b-md" value={toArabicDigits(issue.transferNumber)} />
            <span>بتاريخ&nbsp;:</span>
            <span className="date-run" dir="ltr">
              <Blank style={{ minWidth: 20 }} value={toArabicDigits(issue.transferDay)} />/
              <Blank style={{ minWidth: 20 }} value={toArabicDigits(issue.transferMonth)} />/
              <Blank style={{ minWidth: 40 }} value={fullArabicYear(issue.transferYear)} />م
            </span>
            <span>&nbsp;&nbsp;مبلغ&nbsp;:</span>
            <Blank className="b-md" value={toArabicDigits(issue.amount)} />
          </p>
          <p>
            وعلى الجهة المقدم لها البيان التحقق من أن صاحب البيان هو نفس الشخص المدون أعلاه ولا يجوز
            تقديم البيان إلى جهة أخرى أو استخراج
          </p>
          <p>صورة منه لجهة المقدم لها .</p>
        </div>

        {/* ===== Signatures ===== */}
        <div className="signatures">
          <div>المحرر</div>
          <div>مراجع</div>
          <div>مراجع</div>
          <div>
            <span>مدير إدارة شئون الطلبة والامتحانات</span>
            <span className="holder-name">{EXAMS_DIRECTOR}</span>
          </div>
        </div>

        <div className="office-stamp">
          <div className="seal" />
          <div className="date-field">
            التاريخ :{' '}
            <span className="date-run" dir="ltr">
              <span className="blank" style={{ minWidth: 18 }} />/
              <span className="blank" style={{ minWidth: 18 }} />/
              <span className="blank" style={{ minWidth: 36 }} />م
            </span>
          </div>
        </div>

        {/* ===== Rating-band legend ===== */}
        <div className="legend">
          <span className="legend-item legend-blue">{text.print.legend.blue}</span>
          <span className="legend-item legend-green">{text.print.legend.green}</span>
          <span className="legend-item legend-yellow">{text.print.legend.yellow}</span>
          <span className="legend-item legend-red">{text.print.legend.red}</span>
        </div>
      </div>
    </div>
  )
}
