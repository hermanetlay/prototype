import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { useAssignForm } from '../-logic/useAssignForm'
import { useAssign, type AssignResult } from '../-queries'
import type { DialogProps } from './DialogTypes'
import { Modal, Stepper } from './Modal'
import {
  ImpactSection,
  JenjangPicker,
  OtherJenjangWarning,
  ResultView,
  SelectionSummary,
  SubmitError,
  ValuesSummary,
  confirmReady,
  useImpact,
} from './Parts'
import { ProgramCombobox } from './ProgramCombobox'
import { ValuesForm } from './ValuesForm'

const steps = ['Jenjang', 'Program', 'Nilai', 'Dampak', 'Hasil']

export function WizardDialog({ materi, onClose, onApplied }: DialogProps) {
  const form = useAssignForm(materi)
  const ids = materi.map((m) => m.id)
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')
  const [results, setResults] = useState<AssignResult[]>([])
  const assign = useAssign()
  const impact = useImpact(step === 3 ? ids : [])

  const submit = () =>
    assign.mutate(form.buildBody(ids), {
      onSuccess: (r) => {
        setResults(r)
        setStep(4)
        onApplied(r)
      },
    })

  const canNext = step === 0 ? !!form.jenjangId : step === 2 ? form.valid : true
  const busy = assign.isPending

  const footer =
    step === 4 ? (
      <Button onClick={onClose}>Tutup</Button>
    ) : (
      <>
        {step > 0 ? (
          <Button variant="secondary" disabled={busy} onClick={() => setStep(step - 1)}>
            Kembali
          </Button>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
        )}
        {step < 3 ? (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
            Lanjut
          </Button>
        ) : (
          <Button disabled={busy || !confirmReady(impact.data, typed)} onClick={submit}>
            {busy ? 'Mengirim…' : 'Konfirmasi penugasan'}
          </Button>
        )}
      </>
    )

  return (
    <Modal title="Tugaskan Kurasi" subtitle={`${materi.length} materi dipilih`} onClose={onClose} footer={footer}>
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="flex flex-col gap-4">
          <SelectionSummary materi={materi} />
          <JenjangPicker form={form} />
        </div>
      ) : null}
      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-text-subdued">Pilih program untuk mengisi nilai otomatis. Boleh dilewati.</p>
          <ProgramCombobox form={form} />
          <OtherJenjangWarning form={form} />
        </div>
      ) : null}
      {step === 2 ? (
        <div className="flex flex-col gap-4 pb-24">
          {form.program ? (
            <p className="text-body-sm text-text-subdued">
              Nilai diisi dari <span className="font-semibold">{form.program.nama}</span>. Ubah bila perlu.
            </p>
          ) : null}
          <ValuesForm form={form} />
        </div>
      ) : null}
      {step === 3 ? (
        <div className="flex flex-col gap-4">
          <ImpactSection ids={ids} materi={materi} typed={typed} setTyped={setTyped} />
          <OtherJenjangWarning form={form} />
          <h3 className="text-subheading font-semibold">Nilai yang akan disimpan</h3>
          <ValuesSummary form={form} />
          <SubmitError error={assign.error} />
        </div>
      ) : null}
      {step === 4 ? <ResultView results={results} materi={materi} /> : null}
    </Modal>
  )
}
