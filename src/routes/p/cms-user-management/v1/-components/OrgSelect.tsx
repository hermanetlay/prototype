import Select, { type ActionMeta, type MultiValue } from 'react-select'
import { cn } from '@/shared/lib/cn'
import type { Organization } from '../-data/seed'

type Option = { value: string; label: string; isFixed: boolean }

/**
 * Multi-select for organizations. Ids in `fixedIds` are rendered first, grey,
 * without a remove button, and survive backspace and "clear all" — the
 * react-select "fixed options" pattern.
 */
export function OrgSelect({
  inputId,
  organizations,
  value,
  fixedIds = [],
  invalid,
  onChange,
  onBlur,
}: {
  inputId: string
  organizations: Organization[]
  value: string[]
  fixedIds?: string[]
  invalid?: boolean
  onChange: (ids: string[]) => void
  onBlur?: () => void
}) {
  const fixed = new Set(fixedIds)
  const toOption = (o: Organization): Option => ({
    value: o.id,
    label: o.name,
    isFixed: fixed.has(o.id),
  })
  const options = organizations.map(toOption)
  const byId = new Map(options.map((o) => [o.value, o]))
  const selected = value
    .map((id) => byId.get(id))
    .filter((o): o is Option => !!o)
    .sort((a, b) => Number(b.isFixed) - Number(a.isFixed))

  const handleChange = (next: MultiValue<Option>, meta: ActionMeta<Option>) => {
    if (
      (meta.action === 'remove-value' || meta.action === 'pop-value') &&
      meta.removedValue.isFixed
    ) {
      return
    }
    const kept = meta.action === 'clear' ? selected.filter((o) => o.isFixed) : next
    onChange(kept.map((o) => o.value))
  }

  return (
    <Select<Option, true>
      inputId={inputId}
      isMulti
      unstyled
      options={options}
      value={selected}
      onChange={handleChange}
      onBlur={onBlur}
      isClearable={selected.some((o) => !o.isFixed)}
      placeholder="Pilih organisasi"
      noOptionsMessage={() => 'Organisasi tidak ditemukan'}
      // react-select's emotion CSS is unlayered and beats Tailwind's layered
      // utilities, so hiding the fixed chips' remove button must go through styles.
      styles={{
        multiValueRemove: (base, { data }) => (data.isFixed ? { ...base, display: 'none' } : base),
      }}
      classNames={{
        control: ({ isFocused }) =>
          cn(
            'min-h-10 rounded-md border px-2 py-1 text-body-sm',
            invalid
              ? 'border-border-critical bg-critical-subdued'
              : isFocused
                ? 'border-interactive bg-surface'
                : 'border-border bg-surface',
          ),
        valueContainer: () => 'gap-1 py-0.5',
        placeholder: () => 'px-1 text-text-disabled',
        input: () => 'px-1',
        multiValue: ({ data }) =>
          cn(
            'items-center rounded-full py-0.5 pl-2.5',
            data.isFixed ? 'bg-gray-10 pr-2.5 text-text-subdued' : 'bg-blue-5 pr-1 text-interactive',
          ),
        multiValueLabel: () => 'text-helper font-semibold',
        multiValueRemove: () => 'ml-1 rounded-full px-0.5 hover:bg-blue-10',
        indicatorsContainer: () => 'gap-1 text-text-subdued',
        clearIndicator: () => 'p-1 hover:text-text',
        dropdownIndicator: () => 'p-1 hover:text-text',
        indicatorSeparator: () => 'my-2 w-px bg-border',
        menu: () => 'mt-1 rounded-md border border-border bg-surface py-1 shadow-md',
        option: ({ isFocused }) => cn('px-3 py-2 text-body-sm', isFocused && 'bg-surface-hovered'),
        noOptionsMessage: () => 'px-3 py-2 text-body-sm text-text-subdued',
      }}
    />
  )
}
