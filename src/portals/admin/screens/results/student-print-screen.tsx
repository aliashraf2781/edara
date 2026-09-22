import { useNavigate, useParams } from 'react-router'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import {
  FAILED_LABEL,
  PASSED_LABEL,
  SUBJECT_BLUEPRINT,
  gradeById,
  gradeByLevel,
  isQualitativePass,
} from '~/mocks/curriculum'
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
import { resultsText } from './results.i18n'

const TERM_PARAM = { term: '' } as const

/** The group headers printed across the top of the form, in printed order. */
const GROUP_LABEL: Record<SubjectGroup, string> = {
  pass_fail: 'مواد نجاح ورسوب',
  formative: 'تقييم تكويني',
  attendance: 'مواد نجاح بنسبة حضور ٨٠٪',
  blank: '',
}

const groupOf = (subjectId: string): SubjectGroup =>
  SUBJECT_BLUEPRINT.find((blueprint) => subjectId.endsWith(`.${blueprint.key}`))?.group ?? 'blank'

/** Run-length encodes the subjects into the form's four column groups. */
function groupRuns(subjects: readonly StudentTermSubject[]) {
  const runs: { group: SubjectGroup; span: number }[] = []
  for (const subject of subjects) {
    const group = groupOf(subject.subject_id)
    const last = runs.at(-1)
    if (last && last.group === group) last.span += 1
    else runs.push({ group, span: 1 })
  }
  return runs
}

const qualitativeVerdict = (subject: StudentTermSubject) =>
  subject.is_absent ? 'غ' : isQualitativePass(subject.qualitative_rating) ? PASSED_LABEL : FAILED_LABEL

/** `year-2025` → ٢٠٢٥ / ٢٠٢٦, the only place the academic year is available. */
const academicYears = (academicYearId: string | undefined) => {
  const start = Number(academicYearId?.match(/(\d{4})/)?.[1] ?? NaN)
  if (!Number.isFinite(start)) return null
  return { from: toArabicDigits(String(start).slice(2)), to: toArabicDigits(String(start + 1).slice(2)) }
}

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

  const reference = useAdminReference()
  const detail = useSchoolStudent(code, id)

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

        <Button variant="primary" onClick={() => window.print()}>
          <Icon name="download" />
          {text.print.action}
        </Button>
      </div>

      {term ? <ExtractPage data={data} term={term} academicYearId={classroom?.academic_year_id} /> : null}
    </div>
  )
}

type ExtractPageProps = {
  data: StudentDetail
  term: StudentTermStats
  academicYearId: string | undefined
}

function ExtractPage({ data, term, academicYearId }: ExtractPageProps) {
  const { student, school } = data
  const grade = gradeById(student.grade_id)
  const nextGrade = grade ? gradeByLevel(grade.level + 1) : null
  const fullName = [student.first_name, student.father_name, student.family_name]
    .filter((part) => part !== '')
    .join(' ')

  const subjects = term.subjects
  const numeric = subjects.filter((subject) => subject.grading_type === 'numeric')
  const years = academicYears(academicYearId)

  return (
    <div className="extract" dir="rtl" lang="ar">
      <div className="page">
        {/* ===== Header ===== */}
        <div className="top-row">
          <div className="seal" title="شعار الجهة" />
          <div className="date-field">
            التاريخ : <span className="blank" style={{ minWidth: 34 }} /> /{' '}
            <span className="blank" style={{ minWidth: 34 }} /> / ٢٠
            <span className="blank" style={{ minWidth: 34 }} /> م
          </div>
          <div className="letterhead">
            <div>وزارة التربية والتعليم</div>
            <div>مديرية التربية والتعليم بـ {school.governorate ?? '..........................'}</div>
            <div>إدارة {school.directorate} التعليمية</div>
          </div>
        </div>

        {/* ===== Title box ===== */}
        <div className="title-wrap">
          <div className="title-box">
            <span>مستخرج رسمي بنتيجة الصف</span>
            <span className="blank filled">{grade ? `ال${grade.ordinal}` : ''}</span>
            <span>الابتدائي</span>
          </div>
        </div>

        {/* ===== Info lines ===== */}
        <div className="info-lines">
          <div className="row">
            <span className="txt">بالكشف في سجلات القيد بمدرسة&nbsp;:</span>
            <span className="blank filled b-xl">{school.name}</span>
            <span className="txt">في العام الدراسي ٢٠</span>
            <span className="blank filled b-sm">{years?.from ?? ''}</span>
            <span className="txt">/ ٢٠</span>
            <span className="blank filled b-sm">{years?.to ?? ''}</span>
            <span className="txt">م&nbsp;(</span>
            <span className="blank filled b-lg">{term.term_name}</span>
            <span className="txt">)</span>
          </div>
          <div className="row">
            <span className="txt">وجد اسم الطالب&nbsp;:</span>
            <span className="blank filled b-xl">{fullName}</span>
            <span className="txt">منقول من الصف</span>
            <span className="blank filled b-md">{grade ? `ال${grade.ordinal}` : ''}</span>
            <span className="txt">الابتدائي إلى الصف</span>
            <span className="blank filled b-md">{nextGrade ? `ال${nextGrade.ordinal}` : ''}</span>
          </div>
          <div className="row">
            <span className="txt">تحت اشراف المديرية برقم جلوس</span>
            <span className="blank filled b-lg">{toArabicDigits(student.seat_no)}</span>
            <span className="txt">طبقاً للقرار الوزاري رقم ١٩٥ لسنة ٢٠٢٣م الدور</span>
            <span className="blank filled b-md">الأول</span>
          </div>
        </div>

        {/* ===== Grades table ===== */}
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
                    <span>{qualitativeVerdict(subject)}</span>
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
                  {subject.is_absent ? 'غ' : toArabicDigits(subject.score)}
                </td>
              ))}
            </tr>
            <tr className="fill-row">
              <td className="label-col">التقييم</td>
              {numeric.map((subject) => (
                <td key={subject.subject_id}>{subject.passed ? 'ناجح' : 'راسب'}</td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* ===== After-table text ===== */}
        <div className="after-table">
          <p className="submit-line">
            <span>وقد استخرج هذا البيان لتقديمه إلى&nbsp;:</span>
            <span className="blank" />
          </p>
          <p className="pay-line">
            <span>بناء على طلب الطالب بعد سداد الرسم المقرر بالحوالة رقم&nbsp;:</span>
            <span className="blank b-md" />
            <span>بتاريخ&nbsp;:</span>
            <span>
              <span className="blank" style={{ minWidth: 20 }} />/
              <span className="blank" style={{ minWidth: 20 }} />/٢٠
              <span className="blank" style={{ minWidth: 20 }} />م
            </span>
            <span>&nbsp;&nbsp;مبلغ&nbsp;:</span>
            <span className="blank b-md" />
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
          <div>مراجع أول</div>
          <div>مراجع ثان</div>
          <div>مدير إدارة شئون الطلبة والامتحانات</div>
        </div>

        <div className="office-stamp">
          <div className="seal" />
          <div className="date-field">
            التاريخ : <span className="blank" style={{ minWidth: 18 }} />/
            <span className="blank" style={{ minWidth: 18 }} />/٢٠
            <span className="blank" style={{ minWidth: 18 }} />م
          </div>
        </div>
      </div>
    </div>
  )
}
