import Select from 'react-select'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { jenjangQuery } from '../-queries'

type Option = { value: string; label: string }

export function JenjangSelect({
  value,
  invalid,
  onChange,
}: {
  value: string[]
  invalid?: boolean
  onChange: (ids: string[]) => void
}) {
  const jenjang = useQuery(jenjangQuery)
  const options: Option[] = (jenjang.data?.data ?? []).map((j) => ({ value: j.id, label: j.nama_singkat }))
  return (
    <Select<Option, true>
      inputId="f-jenjang"
      isMulti
      unstyled
      menuPlacement="auto"
      isLoading={jenjang.isPending}
      options={options}
      value={options.filter((o) => value.includes(o.value))}
      onChange={(next) => onChange(next.map((o) => o.value))}
      placeholder="Pilih jenjang"
      noOptionsMessage={() => 'Jenjang tidak ditemukan'}
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
        multiValue: () => 'items-center rounded-full bg-blue-5 py-0.5 pl-2.5 pr-1 text-interactive',
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
