import { useQuery } from '@tanstack/react-query'
import { Field, Input, controlClass } from '@/shared/ui/Field'
import { Badge } from '@/shared/ui/Badge'
import type { Materi } from '../-data/seed'
import { alasanLabel, type Alasan } from '../-logic/labels'
import type { AssignForm } from '../-logic/useAssignForm'
import { impactQuery, type AssignResult, type Impact } from '../-queries'
import { useSim } from '../-logic/simulation'
import { Alert } from './Modal'
import { useNames } from './names'

export function useImpact(ids: string[]) {
  const sim = useSim()
  return useQuery({ ...impactQuery(ids, sim.e2Error), enabled: ids.length > 0 })
}

export function lockedMap(impact: Impact | undefined) {
  return new Map<string, Alasan>((impact?.terkunci ?? []).map((t) => [t.materi_id, t.alasan]))
}

/** Can the admin confirm, given the impact and what they typed? */
export function confirmReady(impact: Impact | undefined, typed: string) {
  if (!impact || impact.dapat_diubah === 0) return false
  return impact.akan_direset > 0 ? typed.trim() === String(impact.akan_direset) : true
}

export function SelectionSummary({ materi }: { materi: Materi[] }) {
  const names = useNames()
  const byJ = new Map<string, number>()
  const byT = new Map<string, number>()
  for (const m of materi) {
    byJ.set(m.jenjang_id, (byJ.get(m.jenjang_id) ?? 0) + 1)
    byT.set(m.tipe, (byT.get(m.tipe) ?? 0) + 1)
  }
  return (
    <div className="rounded-lg bg-gray-5 p-4 text-body-sm">
      <p className="font-semibold">{materi.length} materi dipilih</p>
      <p className="mt-1 text-text-subdued">
        Jenjang: {[...byJ].map(([j, n]) => `${names.jenjang(j)} (${n})`).join(', ')}
      </p>
      <p className="text-text-subdued">Tipe: {[...byT].map(([t, n]) => `${t} (${n})`).join(', ')}</p>
    </div>
  )
}

export function JenjangPicker({ form }: { form: AssignForm }) {
  const names = useNames()
  return (
    <Field
      label="Satuan Pendidikan"
      htmlFor="jenjang"
      hint={
        form.mixedJenjang
          ? 'Pilihan mencakup beberapa jenjang. Program dan kelompok hanya berlaku untuk satu jenjang.'
          : undefined
      }
    >
      <select
        id="jenjang"
        className={controlClass()}
        value={form.jenjangId}
        onChange={(e) => form.setJenjang(e.target.value)}
      >
        {form.mixedJenjang ? <option value="">Pilih jenjang</option> : null}
        {form.jenjangIds.map((j) => (
          <option key={j} value={j}>
            {names.jenjang(j)}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function OtherJenjangWarning({ form }: { form: AssignForm }) {
  if (form.otherJenjang.length === 0) return null
  return (
    <Alert tone="warning" title={`${form.otherJenjang.length} materi jenjang lain akan gagal`}>
      Nilai ini hanya cocok untuk jenjang yang dipilih. Materi jenjang lain akan dilaporkan gagal (kelompok atau
      program tidak sesuai).
    </Alert>
  )
}

export function ImpactSection({
  ids,
  materi,
  typed,
  setTyped,
}: {
  ids: string[]
  materi: Materi[]
  typed: string
  setTyped: (s: string) => void
}) {
  const q = useImpact(ids)
  if (q.isLoading || (q.isFetching && !q.data)) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-10" />
        <div className="h-16 animate-pulse rounded-lg bg-gray-10" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-10" />
      </div>
    )
  }
  if (q.isError || !q.data) {
    return (
      <Alert tone="critical" title="Gagal memuat dampak penugasan.">
        <p>Coba lagi untuk melihat apa yang akan berubah.</p>
        <button className="mt-2 font-semibold text-interactive" onClick={() => q.refetch()}>
          Coba lagi
        </button>
      </Alert>
    )
  }
  const d = q.data
  const w = d.pekerjaan_hilang
  const byId = new Map(materi.map((m) => [m.id, m]))
  return (
    <div className="flex flex-col gap-4">
      <div className="text-body-sm">
        <p>
          <span className="font-semibold">{d.dapat_diubah} materi akan diubah</span> saat ini
          {d.terkunci.length ? `, ${d.terkunci.length} terkunci` : ''}.
        </p>
        <p className="mt-1 text-helper text-text-subdued">
          Data dapat berubah sebelum penugasan dikirim; sistem memeriksa ulang tiap materi.
        </p>
      </div>
      {d.terkunci.length ? (
        <div className="rounded-lg border border-border">
          <p className="border-b border-border bg-gray-5 px-3 py-2 text-body-sm font-semibold">
            Terkunci, tidak diubah ({d.terkunci.length})
          </p>
          <ul className="divide-y divide-border">
            {d.terkunci.map((t) => (
              <li key={t.materi_id} className="px-3 py-2 text-body-sm">
                <span className="font-semibold">{byId.get(t.materi_id)?.judul ?? t.materi_id}</span>
                <span className="block text-helper text-text-subdued">
                  {t.alasan === 'status_terkunci' && t.status
                    ? `Status ${t.status} tidak dapat diubah`
                    : alasanLabel[t.alasan]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {d.akan_direset > 0 ? (
        <Alert tone="warning" title="Penugasan ini akan menghapus pekerjaan kurasi yang sudah ada.">
          <p>
            Pada {d.akan_direset} materi saat ini: {w.kurator_sudah_ditugaskan} kurator sudah ditugaskan,{' '}
            {w.kurasi_diperiksa} kurasi sedang diperiksa, {w.kurasi_lolos_atau_ditolak} sudah selesai.
          </p>
          <div className="mt-3 max-w-xs">
            <Field label={`Ketik ${d.akan_direset} untuk melanjutkan`} htmlFor="type-confirm">
              <Input
                id="type-confirm"
                inputMode="numeric"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={String(d.akan_direset)}
              />
            </Field>
          </div>
        </Alert>
      ) : d.dapat_diubah > 0 ? (
        <p className="text-body-sm text-text-subdued">Tidak ada pekerjaan kurasi yang dihapus.</p>
      ) : (
        <Alert tone="critical" title="Tidak ada materi yang dapat diubah." />
      )}
    </div>
  )
}

export function ValuesSummary({ form }: { form: AssignForm }) {
  const n = useNames()
  const v = form.values
  const rows: [string, string, boolean][] = [
    ['Program', form.program?.nama ?? 'Tanpa program', false],
    ['Satuan Kerja', n.inst(v.satker), form.overridden.has('satker')],
    ['Pusat Kurikulum', n.inst(v.puskur), form.overridden.has('puskur')],
    ['Kurator Media', n.inst(v.kuratorMedia), form.overridden.has('kurator_media')],
    ['Kurator Substansi', n.inst(v.kuratorSubstansi), form.overridden.has('kurator_substansi')],
    ...form.tipes.flatMap((t): [string, string, boolean][] => [
      [`Kelompok Media${form.mixedTipe ? ` · ${t}` : ''}`, n.kel(v.kelompok[t]?.media), form.overridden.has('kelompok_media')],
      [`Kelompok Substansi${form.mixedTipe ? ` · ${t}` : ''}`, n.kel(v.kelompok[t]?.substansi), form.overridden.has('kelompok_substansi')],
    ]),
    ['Proses Bisnis', v.prosesBisnis, form.overridden.has('proses_bisnis')],
    ['Review', v.review, form.overridden.has('review')],
  ]
  return (
    <dl className="divide-y divide-border rounded-lg border border-border text-body-sm">
      {rows.map(([k, val, ov]) => (
        <div key={k} className="flex justify-between gap-4 px-3 py-2">
          <dt className="text-text-subdued">{k}</dt>
          <dd className="text-right font-semibold">
            {val || '-'}
            {ov ? <span className="ml-2 text-helper font-semibold text-text-warning">diubah dari program</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function ResultView({ results, materi }: { results: AssignResult[]; materi: Materi[] }) {
  const byId = new Map(materi.map((m) => [m.id, m]))
  const groups: { key: string; title: string; tone: 'success' | 'neutral' | 'warning' | 'critical'; items: AssignResult[] }[] = [
    { key: 'ok', title: 'Berhasil', tone: 'success', items: results.filter((r) => r.hasil === 'ok' && r.berubah !== false) },
    { key: 'same', title: 'Tidak berubah', tone: 'neutral', items: results.filter((r) => r.hasil === 'ok' && r.berubah === false) },
    { key: 'lock', title: 'Terkunci', tone: 'warning', items: results.filter((r) => r.hasil === 'terkunci') },
    { key: 'fail', title: 'Gagal', tone: 'critical', items: results.filter((r) => r.hasil === 'gagal') },
  ]
  const problems = results.filter((r) => r.hasil !== 'ok').length
  return (
    <div className="flex flex-col gap-4">
      <Alert tone={problems ? 'warning' : 'informational'} title={problems ? 'Sebagian materi tidak berubah.' : 'Penugasan selesai.'}>
        {problems ? 'Baca hasil di bawah. Dialog tetap terbuka sampai Anda menutupnya.' : 'Semua materi sudah ditugaskan.'}
      </Alert>
      {groups
        .filter((g) => g.items.length)
        .map((g) => (
          <section key={g.key} className="rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-gray-5 px-3 py-2">
              <h3 className="text-body-sm font-semibold">{g.title}</h3>
              <Badge tone={g.tone}>{g.items.length}</Badge>
            </div>
            <ul className="divide-y divide-border">
              {g.items.map((r) => (
                <li key={r.materi_id} className="px-3 py-2 text-body-sm">
                  <span className="font-semibold">{byId.get(r.materi_id)?.judul ?? r.materi_id}</span>
                  <span className="block text-helper text-text-subdued">
                    {r.hasil === 'ok' && r.berubah !== false
                      ? `Status baru: ${r.status_baru}${r.direset ? ' · pekerjaan kurasi dihapus' : ''}`
                      : r.hasil === 'ok'
                        ? 'Nilai sudah sama, tidak ada yang ditulis.'
                        : r.alasan === 'status_terkunci' && r.status
                          ? `Status ${r.status} tidak dapat diubah`
                          : r.alasan
                            ? alasanLabel[r.alasan]
                            : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

export function SubmitError({ error }: { error: unknown }) {
  if (!error) return null
  const status = (error as { status?: number }).status
  const msg = (error as Error).message
  if (status === 403) {
    return (
      <Alert tone="critical" title="Akses ditolak.">
        {msg}
      </Alert>
    )
  }
  return (
    <Alert tone="critical" title={status === 400 ? 'Isian belum valid.' : 'Gagal mengirim penugasan.'}>
      {msg}
    </Alert>
  )
}
