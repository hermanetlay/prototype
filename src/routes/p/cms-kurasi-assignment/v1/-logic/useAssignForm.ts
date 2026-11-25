import { useMemo, useState } from 'react'
import type { Materi, Program, ProsesBisnis, Review, Tipe } from '../-data/seed'
import type { AssignBody } from '../-queries'
import type { Alasan } from './labels'

export type FieldKey =
  | 'satker'
  | 'puskur'
  | 'kurator_media'
  | 'kurator_substansi'
  | 'kelompok_media'
  | 'kelompok_substansi'
  | 'proses_bisnis'
  | 'review'

export type Values = {
  satker: string
  puskur: string
  kuratorMedia: string
  kuratorSubstansi: string
  prosesBisnis: ProsesBisnis | ''
  review: Review | ''
  kelompok: Record<string, { media: string; substansi: string }>
}

const empty = (): Values => ({
  satker: '',
  puskur: '',
  kuratorMedia: '',
  kuratorSubstansi: '',
  prosesBisnis: '',
  review: '',
  kelompok: {},
})

export function useAssignForm(materi: Materi[]) {
  const jenjangIds = useMemo(() => [...new Set(materi.map((m) => m.jenjang_id))], [materi])
  const tipes = useMemo(() => [...new Set(materi.map((m) => m.tipe))] as Tipe[], [materi])
  const [jenjangId, setJenjangState] = useState(jenjangIds.length === 1 ? jenjangIds[0] : '')
  const [program, setProgramState] = useState<Program | null>(null)
  const [values, setValues] = useState<Values>(empty)

  const mixedTipe = tipes.length > 1
  const mixedJenjang = jenjangIds.length > 1

  const setJenjang = (id: string) => {
    setJenjangState(id)
    setProgramState(null)
    // Kelompok options depend on jenjang, so earlier picks no longer apply.
    setValues((v) => ({ ...v, kelompok: {} }))
  }

  const setProgram = (p: Program | null) => {
    setProgramState(p)
    if (!p?.values) return
    const pv = p.values
    setValues({
      satker: pv.institusi_satker_id,
      puskur: pv.institusi_puskur_id,
      kuratorMedia: pv.institusi_kurator_media_id,
      kuratorSubstansi: pv.institusi_kurator_substansi_id,
      prosesBisnis: pv.proses_bisnis,
      review: pv.review,
      kelompok: {
        [p.tipe_materi]: {
          media: pv.kelompok_instrumen_media_id,
          substansi: pv.kelompok_instrumen_substansi_id,
        },
      },
    })
  }

  const set = <K extends keyof Values>(k: K, val: Values[K]) =>
    setValues((v) => {
      const next = { ...v, [k]: val }
      // Kurasi locks review to Dalam CMS.
      if (k === 'prosesBisnis' && val === 'Kurasi') next.review = 'Dalam CMS'
      return next
    })

  const setKelompok = (tipe: string, which: 'media' | 'substansi', id: string) =>
    setValues((v) => ({
      ...v,
      kelompok: { ...v.kelompok, [tipe]: { ...(v.kelompok[tipe] ?? { media: '', substansi: '' }), [which]: id } },
    }))

  const overridden = useMemo(() => {
    const out = new Set<FieldKey>()
    const pv = program?.values
    if (!pv || !program) return out
    if (values.satker !== pv.institusi_satker_id) out.add('satker')
    if (values.puskur !== pv.institusi_puskur_id) out.add('puskur')
    if (values.kuratorMedia !== pv.institusi_kurator_media_id) out.add('kurator_media')
    if (values.kuratorSubstansi !== pv.institusi_kurator_substansi_id) out.add('kurator_substansi')
    const k = values.kelompok[program.tipe_materi]
    if (k?.media !== pv.kelompok_instrumen_media_id) out.add('kelompok_media')
    if (k?.substansi !== pv.kelompok_instrumen_substansi_id) out.add('kelompok_substansi')
    if (values.prosesBisnis !== pv.proses_bisnis) out.add('proses_bisnis')
    if (values.review !== pv.review) out.add('review')
    return out
  }, [program, values])

  const missing: string[] = []
  if (!values.satker) missing.push('Satuan Kerja')
  if (!values.puskur) missing.push('Pusat Kurikulum')
  if (!values.kuratorMedia) missing.push('Institusi Kurator Media')
  if (!values.kuratorSubstansi) missing.push('Institusi Kurator Substansi')
  for (const t of tipes) {
    if (!values.kelompok[t]?.media) missing.push(`Kelompok Media${mixedTipe ? ` (${t})` : ''}`)
    if (!values.kelompok[t]?.substansi) missing.push(`Kelompok Substansi${mixedTipe ? ` (${t})` : ''}`)
  }
  if (!values.prosesBisnis) missing.push('Proses Bisnis')
  if (!values.review) missing.push('Review')
  const valid = missing.length === 0 && !!jenjangId

  const buildBody = (ids: string[]): AssignBody => {
    const first = values.kelompok[tipes[0]] ?? { media: '', substansi: '' }
    return {
      materi_ids: ids,
      program_id: program?.id ?? null,
      institusi_satker_id: values.satker,
      institusi_puskur_id: values.puskur,
      institusi_kurator_media_id: values.kuratorMedia,
      institusi_kurator_substansi_id: values.kuratorSubstansi,
      kelompok_instrumen_media_id: first.media,
      kelompok_instrumen_substansi_id: first.substansi,
      kelompok_per_tipe: mixedTipe ? values.kelompok : undefined,
      proses_bisnis: values.prosesBisnis as ProsesBisnis,
      review: values.review as Review,
    }
  }

  /** Materi of another jenjang than the chosen one will come back `gagal`. */
  const otherJenjang = materi.filter((m) => jenjangId && m.jenjang_id !== jenjangId)

  return {
    materi,
    jenjangIds,
    tipes,
    mixedTipe,
    mixedJenjang,
    jenjangId,
    setJenjang,
    program,
    setProgram,
    values,
    set,
    setKelompok,
    overridden,
    missing,
    valid,
    buildBody,
    otherJenjang,
  }
}

export type AssignForm = ReturnType<typeof useAssignForm>

export type Prediction = { outcome: 'ubah' | 'terkunci' | 'gagal'; alasan?: Alasan }

/** Client-side guess of what E1 will answer for one materi. */
export function predict(m: Materi, form: AssignForm, locked: Map<string, Alasan>): Prediction {
  const l = locked.get(m.id)
  if (l) return { outcome: 'terkunci', alasan: l }
  if (form.jenjangId && m.jenjang_id !== form.jenjangId) {
    return { outcome: 'gagal', alasan: 'kelompok_tidak_sesuai' }
  }
  return { outcome: 'ubah' }
}
