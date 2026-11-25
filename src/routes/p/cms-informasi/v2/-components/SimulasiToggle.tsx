import { cn } from '@/shared/lib/cn'

/** Floating toggle for the 500 state of the list endpoints. */
export function SimulasiToggle({ error, onToggle }: { error: boolean; onToggle: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[54] flex -translate-x-1/2 items-center rounded-full bg-gray-90 p-2 text-body-sm text-text-inverse shadow-xl">
      <button
        onClick={onToggle}
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
