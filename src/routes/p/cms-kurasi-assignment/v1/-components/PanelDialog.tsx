import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Field } from '@/shared/ui/Field'
import { predict, useAssignForm } from '../-logic/useAssignForm'
import { useAssign, type AssignResult } from '../-queries'
import type { DialogProps } from './DialogTypes'
import { Modal } from './Modal'
import {
  ImpactSection,
  JenjangPicker,
  OtherJenjangWarning,
  ResultView,
  SelectionSummary,
  SubmitError,
  ValuesSummary,
  confirmReady,
  lockedMap,
  useImpact,
} from './Parts'
import { ProgramCombobox } from './ProgramCombobox'
import { ValuesForm } from './ValuesForm'

export function PanelDialog({ materi, onClose, onApplied }: DialogProps) {
  const form = useAssignForm(materi)
  const ids = materi.map((m) => m.id)
  const [typed, setTyped] = useState('')
  const [results, setResults] = useState<AssignResult[] | null>(null)
  const assign = useAssign()
  const impact = useImpact(results ? [] : ids)
  const locked = lockedMap(impact.data)
  const willFail = materi.filter((m) => predict(m, form, locked).outcome === 'gagal').length

  const submit = () =>
    assign.mutate(form.buildBody(ids), {
      onSuccess: (r) => {
        setResults(r)
        onApplied(r)
      },
    })

  if (results) {
    return (
      <Modal title="Hasil penugasan" size="lg" onClose={onClose} footer={<Button onClick={onClose}>Tutup</Button>}>
        <ResultView results={results} materi={materi} />
      </Modal>
    )
  }

  return (
    <Modal
      title="Tugaskan Kurasi"
      subtitle={`${materi.length} materi dipilih`}
      size="xl"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={assign.isPending || !form.valid || !confirmReady(impact.data, typed)}
            onClick={submit}
          >
            {assign.isPending ? 'Mengirim…' : 'Konfirmasi penugasan'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_380px] gap-8">
        <div className="flex flex-col gap-5 pb-24">
          <SelectionSummary materi={materi} />
          <JenjangPicker form={form} />
          <Field label="Program (opsional)">
            <ProgramCombobox form={form} />
          </Field>
          <ValuesForm form={form} />
        </div>
        <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-gray-0 p-4">
          <h3 className="text-heading-sm font-semibold">Dampak</h3>
          <ImpactSection ids={ids} materi={materi} typed={typed} setTyped={setTyped} />
          {willFail > 0 ? <OtherJenjangWarning form={form} /> : null}
          <h3 className="text-subheading font-semibold">Nilai saat ini</h3>
          <ValuesSummary form={form} />
          {form.missing.length ? (
            <p className="text-helper text-text-subdued">Belum diisi: {form.missing.join(', ')}.</p>
          ) : null}
          <SubmitError error={assign.error} />
        </aside>
      </div>
    </Modal>
  )
}
