import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Field } from '@/shared/ui/Field'
import { Table, Td, Th } from '@/shared/ui/Table'
import { alasanLabel } from '../-logic/labels'
import { predict, useAssignForm } from '../-logic/useAssignForm'
import { useAssign, type AssignResult } from '../-queries'
import type { DialogProps } from './DialogTypes'
import { Alert, Modal, Stepper } from './Modal'
import { useNames } from './names'
import {
  ImpactSection,
  JenjangPicker,
  OtherJenjangWarning,
  ResultView,
  SubmitError,
  confirmReady,
  lockedMap,
  useImpact,
} from './Parts'
import { ProgramCombobox } from './ProgramCombobox'
import { ValuesForm } from './ValuesForm'

const steps = ['Materi', 'Nilai', 'Konfirmasi', 'Hasil']

export function ReviewDialog({ materi, onClose, onApplied }: DialogProps) {
  const form = useAssignForm(materi)
  const names = useNames()
  const ids = materi.map((m) => m.id)
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')
  const [results, setResults] = useState<AssignResult[]>([])
  const assign = useAssign()
  const impact = useImpact(step < 3 ? ids : [])
  const locked = lockedMap(impact.data)
  const busy = assign.isPending

  const submit = () =>
    assign.mutate(form.buildBody(ids), {
      onSuccess: (r) => {
        setResults(r)
        setStep(3)
        onApplied(r)
      },
    })

  const footer =
    step === 3 ? (
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
        {step === 0 ? (
          <Button disabled={!impact.data || impact.data.dapat_diubah === 0} onClick={() => setStep(1)}>
            Lanjut
          </Button>
        ) : step === 1 ? (
          <Button disabled={!form.valid} onClick={() => setStep(2)}>
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
    <Modal title="Tugaskan Kurasi" subtitle={`${materi.length} materi dipilih`} size="xl" onClose={onClose} footer={footer}>
      <Stepper steps={steps} current={step} />

      {step === 0 ? (
        <div className="flex flex-col gap-4">
          {impact.isError ? (
            <Alert tone="critical" title="Gagal memuat dampak penugasan.">
              <button className="font-semibold text-interactive" onClick={() => impact.refetch()}>
                Coba lagi
              </button>
            </Alert>
          ) : null}
          <div className="rounded-lg border border-border">
            <Table>
              <thead>
                <tr>
                  <Th>Judul</Th>
                  <Th>Jenjang</Th>
                  <Th>Tipe</Th>
                  <Th>Status</Th>
                  <Th>Kelayakan</Th>
                </tr>
              </thead>
              <tbody>
                {materi.map((m) => {
                  const lock = impact.data?.terkunci.find((t) => t.materi_id === m.id)
                  return (
                    <tr key={m.id} className={lock ? 'bg-gray-5 text-text-subdued' : ''}>
                      <Td className="font-semibold">{m.judul}</Td>
                      <Td>{names.jenjang(m.jenjang_id)}</Td>
                      <Td>{m.tipe}</Td>
                      <Td>{m.status}</Td>
                      <Td>
                        {!impact.data ? (
                          <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-10" />
                        ) : lock ? (
                          <div>
                            <Badge tone="warning">Terkunci</Badge>
                            <span className="mt-1 block text-helper">
                              {lock.alasan === 'status_terkunci' && lock.status
                                ? `Status ${lock.status} tidak dapat diubah`
                                : alasanLabel[lock.alasan]}
                            </span>
                          </div>
                        ) : (
                          <Badge tone="success">Dapat diubah</Badge>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
          {impact.data ? (
            <p className="text-body-sm">
              <span className="font-semibold">{impact.data.dapat_diubah} materi dapat diubah</span> saat ini,{' '}
              {impact.data.terkunci.length} terkunci.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid grid-cols-[320px_1fr] gap-8 pb-24">
          <div className="flex flex-col gap-4">
            <JenjangPicker form={form} />
            <Field
              label="Isi dari program (opsional)"
              hint={
                <a
                  href="/p/cms-kurasi-assignment/v2/program"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-interactive"
                >
                  Kelola Program
                </a>
              }
            >
              <ProgramCombobox form={form} />
            </Field>
          </div>
          <div className="flex flex-col gap-4">
            <ValuesForm form={form} />
            <OtherJenjangWarning form={form} />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border">
            <Table>
              <thead>
                <tr>
                  <Th>Materi</Th>
                  <Th>Status</Th>
                  <Th>Institusi Media / Substansi</Th>
                  <Th>Kelompok Media / Substansi</Th>
                  <Th>Hasil yang diperkirakan</Th>
                </tr>
              </thead>
              <tbody>
                {materi.map((m) => {
                  const p = predict(m, form, locked)
                  const k = form.values.kelompok[m.tipe]
                  const dim = p.outcome !== 'ubah'
                  return (
                    <tr key={m.id} className={dim ? 'bg-gray-5 text-text-subdued' : ''}>
                      <Td className="font-semibold">{m.judul}</Td>
                      <Td>
                        {m.status}
                        {!dim ? ' → Penugasan Kurator' : ''}
                      </Td>
                      <Td>
                        <Pair
                          before={[names.inst(m.institusi_kurator_media_id), names.inst(m.institusi_kurator_substansi_id)]}
                          after={dim ? null : [names.inst(form.values.kuratorMedia), names.inst(form.values.kuratorSubstansi)]}
                        />
                      </Td>
                      <Td>
                        <Pair
                          before={[names.kel(m.kelompok_instrumen_media_id), names.kel(m.kelompok_instrumen_substansi_id)]}
                          after={dim ? null : [names.kel(k?.media), names.kel(k?.substansi)]}
                        />
                      </Td>
                      <Td>
                        {p.outcome === 'ubah' ? (
                          <Badge tone="success">Diubah</Badge>
                        ) : p.outcome === 'terkunci' ? (
                          <Badge tone="warning">Terkunci</Badge>
                        ) : (
                          <Badge tone="critical">Gagal</Badge>
                        )}
                        {p.alasan ? <span className="mt-1 block text-helper">{alasanLabel[p.alasan]}</span> : null}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
          <ImpactSection ids={ids} materi={materi} typed={typed} setTyped={setTyped} />
          <SubmitError error={assign.error} />
        </div>
      ) : null}

      {step === 3 ? <ResultView results={results} materi={materi} /> : null}
    </Modal>
  )
}

function Pair({ before, after }: { before: string[]; after: string[] | null }) {
  return (
    <div className="flex flex-col gap-1 text-helper">
      {[0, 1].map((i) => (
        <span key={i}>
          <span className="text-text-subdued">{before[i] || '(kosong)'}</span>
          {after ? (
            <>
              {' → '}
              <span className="font-semibold text-text">{after[i] || '(kosong)'}</span>
            </>
          ) : null}
        </span>
      ))}
    </div>
  )
}
