import { useId } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from '@ui-sdk/react/select'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@ui-sdk/react/combobox'
import { Switch, SwitchThumb } from '@ui-sdk/react/switch'
import { controlClass } from '@/shared/ui/Field'
import { cn } from '@/shared/lib/cn'

export type Option = { value: string; label: string }

const popup =
  'z-[80] max-h-64 w-(--anchor-width) overflow-auto rounded-lg border border-border bg-surface p-1 shadow-md'
const item =
  'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-body-sm data-highlighted:bg-surface-selected data-disabled:opacity-50'

/** Token-styled UI SDK Select. */
export function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  invalid,
  disabledValues,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder: string
  disabled?: boolean
  invalid?: boolean
  disabledValues?: string[]
}) {
  return (
    <Select
      items={options}
      placeholder={placeholder}
      value={value || null}
      disabled={disabled}
      onValueChange={(v) => onChange((v as string | null) ?? '')}
    >
      <SelectTrigger
        id={id}
        className={cn(
          controlClass(invalid),
          'flex items-center justify-between gap-2 text-left data-placeholder:text-text-subdued data-disabled:cursor-not-allowed data-disabled:opacity-50',
        )}
      >
        <SelectValue />
        <span className="shrink-0 text-text-subdued" aria-hidden="true">▾</span>
      </SelectTrigger>
      <SelectContent className={popup}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={disabledValues?.includes(o.value)} className={item}>
            {o.label}
            <SelectItemIndicator>
              <span aria-hidden="true">✓</span>
            </SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Searchable single pick (institusi). */
export function SearchPick({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
  loading,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder: string
  invalid?: boolean
  loading?: boolean
}) {
  return (
    <Combobox value={value || null} onValueChange={(v) => onChange((v as string | null) ?? '')}>
      <ComboboxInput id={id} placeholder={loading ? 'Memuat…' : placeholder} className={controlClass(invalid)} />
      <ComboboxContent className={popup}>
        <ComboboxEmpty className="px-3 py-2 text-body-sm text-text-subdued">Institusi tidak ditemukan</ComboboxEmpty>
        <ComboboxList>
          {options.map((o) => (
            <ComboboxItem key={o.value} value={o.value} label={o.label} className={item}>
              {o.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-body-sm">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(!!v)}
        className="relative h-5 w-9 rounded-full bg-gray-30 transition-colors data-checked:bg-interactive"
      >
        <SwitchThumb className="block size-4 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform data-checked:translate-x-[18px]" />
      </Switch>
      {label}
    </label>
  )
}
