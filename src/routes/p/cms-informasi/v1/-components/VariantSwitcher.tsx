import { useEffect } from 'react'
import { cn } from '@/shared/lib/cn'
import { VARIANTS } from '../-logic/search'
import type { Variant } from '../-logic/search'

const LABEL: Record<Variant, string> = {
  A: 'Tabel + halaman form',
  B: 'Tabel + panel samping',
  C: 'Papan per status tayang',
}

/** The variant chosen for the product (see CONTEXT.md, Outcome). */
const CHOSEN: Variant = 'A'

/** Floating bar: ← → keys (not while typing) and a toggle for the 500 state. */
export function VariantSwitcher({
  variant,
  onChange,
  error,
  onToggleError,
}: {
  variant: Variant
  onChange: (v: Variant) => void
  error: boolean
  onToggleError: () => void
}) {
  const step = (d: number) =>
    onChange(VARIANTS[(VARIANTS.indexOf(variant) + d + VARIANTS.length) % VARIANTS.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const btn = 'flex size-8 items-center justify-center rounded-full hover:bg-white/15'
  return (
    <div className="fixed bottom-4 left-1/2 z-[54] flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-90 py-2 pl-2 pr-4 text-body-sm text-text-inverse shadow-xl">
      <button aria-label="Varian sebelumnya" className={btn} onClick={() => step(-1)}>
        ←
      </button>
      <span className="min-w-56 text-center font-semibold">
        {variant} ({LABEL[variant]})
        {variant === CHOSEN ? (
          <span className="ml-2 rounded-full bg-success-subdued px-2 py-0.5 text-helper text-text-success">✓ Dipilih</span>
        ) : null}
      </span>
      <button aria-label="Varian berikutnya" className={btn} onClick={() => step(1)}>
        →
      </button>
      <span className="h-5 w-px bg-white/30" />
      <button
        onClick={onToggleError}
        className={cn(
          'rounded-full px-3 py-1 text-helper font-semibold',
          error ? 'bg-critical text-text-inverse' : 'bg-white/15',
        )}
      >
        Simulasi error: {error ? 'nyala' : 'mati'}
      </button>
    </div>
  )
}
