import { setSim, useSim } from '../-logic/simulation'

/** Floating bar: toggle simulated failures. Shown on every page of this version. */
export function SimulationBar() {
  const sim = useSim()
  const toggles: { key: keyof typeof sim; label: string }[] = [
    { key: 'e2Error', label: 'Simulasikan error E2' },
    { key: 'e1Forbidden', label: 'Simulasikan 403 E1' },
    { key: 'e1BadRequest', label: 'Simulasikan 400 E1' },
    { key: 'program409', label: 'Simulasikan 409 Program' },
    { key: 'programListError', label: 'Simulasikan error daftar Program' },
  ]
  return (
    <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-surface px-4 py-2 shadow-md">
      <span className="text-helper font-semibold text-text-subdued">Simulasi</span>
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
