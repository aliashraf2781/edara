import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { PageHeader } from '~/ui/page-header'
import { Tabs, type TabItem } from '~/ui/tabs'
import { useSchoolSession } from '../../auth/session-context'
import { academicsText } from './academics.i18n'
import { ClassroomsPanel } from './classrooms-panel'
import { GradesPanel } from './grades-panel'
import { StagesPanel } from './stages-panel'
import { SubjectsPanel } from './subjects-panel'
import { YearsPanel } from './years-panel'

type TabId = 'years' | 'stages' | 'grades' | 'classrooms' | 'subjects'

export function AcademicsScreen() {
  const text = useDict(academicsText)
  const { can } = useSchoolSession()
  const [tab, setTab] = useState<TabId>('years')

  // Teacher and data-entry see the same lists, without any write controls.
  const editable = can.canEditStructure

  const items: readonly TabItem<TabId>[] = [
    { id: 'years', label: text.tabs.years },
    { id: 'stages', label: text.tabs.stages },
    { id: 'grades', label: text.tabs.grades },
    { id: 'classrooms', label: text.tabs.classrooms },
    { id: 'subjects', label: text.tabs.subjects },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      <Tabs label={text.title} items={items} active={tab} onChange={setTab} />

      {tab === 'years' ? <YearsPanel editable={editable} /> : null}
      {tab === 'stages' ? <StagesPanel editable={editable} /> : null}
      {tab === 'grades' ? <GradesPanel editable={editable} /> : null}
      {tab === 'classrooms' ? <ClassroomsPanel editable={editable} /> : null}
      {tab === 'subjects' ? <SubjectsPanel editable={editable} /> : null}
    </div>
  )
}
