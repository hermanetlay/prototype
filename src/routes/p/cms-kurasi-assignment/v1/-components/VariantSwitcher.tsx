import { setSim, useSim } from '../-logic/simulation'
import { cn } from '@/shared/lib/cn'

export type Variant = 'wizard' | 'panel' | 'review'

const variants: { key: Variant; label: string }[] = [
  { key: 'wizard', label: 'Wizard' },
  { key: 'panel', label: 'Panel' },
  { key: 'review', label: 'Review' },
]

/** Floating bar: pick a dialog variant and toggle simulated failures. */
export function VariantSwitcher({
  value,
  onChange,
}: {
  value: Variant
  onChange: (v: Variant) => void
}) {
  const sim = useSim()
  const toggles: { key: keyof typeof sim; label: string }[] = [
    { key: 'e2Error', label: 'Simulasikan error E2' },
    { key: 'e1Forbidden', label: 'Simulasikan 403 E1' },
    { key: 'e1BadRequest', label: 'Simulasikan 400 E1' },
  ]
  return (
    <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-surface px-4 py-2 shadow-md">
      <span className="text-helper font-semibold text-text-subdued">Varian</span>
      <div className="flex gap-1">
        {variants.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => onChange(v.key)}
            className={cn(
              'rounded-full px-3 py-1 text-body-sm font-semibold transition-colors',
              value === v.key ? 'bg-interactive text-text-inverse' : 'text-text-subdued hover:bg-surface-hovered',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <span className="h-5 w-px bg-border" />
      {toggles.map((t) => (
        <label key={t.key} className="flex items-center gap-1 text-helper text-text-subdued">
          <input type="checkbox" checked={sim[t.key]} onChange={(e) => setSim({ [t.key]: e.target.checked })} />
          {t.label}
        </label>
      ))}
    </div>
  )
}
