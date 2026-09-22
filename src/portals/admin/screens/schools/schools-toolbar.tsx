import { FilterChip } from '~/ui/chip'
import { SearchInput } from '~/ui/search-input'
import { Select } from '~/ui/select'
import { schoolsText } from './schools.i18n'
import { useDict } from '~/lib/i18n/use-dict'

type ToolbarProps = {
  search: string
  status: string
  provisioning: string
  onChange: (key: 'search' | 'status' | 'provisioning', value: string) => void
}

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

/**
 * Filters live directly above the table as controls plus removable chips —
 * never in a side panel that hides the data being filtered.
 */
export function SchoolsToolbar({ search, status, provisioning, onChange }: ToolbarProps) {
  const text = useDict(schoolsText)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        label={text.searchLabel}
        value={search}
        onChange={(event) => onChange('search', event.target.value)}
      />

      <Select
        aria-label={text.filterStatus}
        value={status}
        onChange={(event) => onChange('status', event.target.value)}
        placeholder={text.anyStatus}
        options={toOptions(text.status)}
      />

      <Select
        aria-label={text.filterProvisioning}
        value={provisioning}
        onChange={(event) => onChange('provisioning', event.target.value)}
        placeholder={text.anyProvisioning}
        options={toOptions(text.provisioning)}
      />

      {status === '' ? null : (
        <FilterChip
          label={text.filterStatus}
          value={text.status[status as keyof typeof text.status]}
          onRemove={() => onChange('status', '')}
          removeLabel={text.removeFilter}
        />
      )}

      {provisioning === '' ? null : (
        <FilterChip
          label={text.filterProvisioning}
          value={text.provisioning[provisioning as keyof typeof text.provisioning]}
          onRemove={() => onChange('provisioning', '')}
          removeLabel={text.removeFilter}
        />
      )}
    </div>
  )
}
