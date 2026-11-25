import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Institusi, Jenjang, Kelompok, Materi, Program, ProsesBisnis, Review, Tipe, Jenis } from './-data/seed'
import type { Alasan } from './-logic/labels'
import { getSim } from './-logic/simulation'

const base = '/api/cms-kurasi-assignment/v1'
const key = ['cms-kurasi-assignment', 'v1'] as const

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

async function json<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new ApiError(res.status, body.message ?? res.statusText)
  }
  return res.json() as Promise<T>
}

const qs = (o: Record<string, string | undefined>) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(o)) if (v) p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}

export type MateriRow = Materi
export const materiListQuery = (p: { tab: 'semua' | 'perlu'; q: string }) =>
  queryOptions({
    queryKey: [...key, 'materi', p],
    queryFn: () =>
      json<{ data: MateriRow[]; total: number }>(
        `${base}/materi${qs({ tab: p.tab, q: p.q, limit: '50', offset: '0' })}`,
      ),
  })

export const jenjangQuery = queryOptions({
  queryKey: [...key, 'jenjang'],
  queryFn: () => json<{ data: Jenjang[] }>(`${base}/jenjang`),
  staleTime: Infinity,
})

export const institusiQuery = (q: string) =>
  queryOptions({
    queryKey: [...key, 'institusi', q],
    queryFn: () => json<{ data: Institusi[] }>(`${base}/institusi${qs({ q })}`),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  })

export const kelompokQuery = (p: { jenis?: Jenis; jenjang_id?: string; tipe_materi?: Tipe }) =>
  queryOptions({
    queryKey: [...key, 'kelompok', p],
    queryFn: () => json<{ data: Kelompok[] }>(`${base}/kelompok-instrumen${qs(p)}`),
    staleTime: Infinity,
  })

export const PROGRAM_LIMIT = 20

export const programQuery = (p: { jenjang_id: string; tipe: Tipe; q: string }) =>
  queryOptions({
    queryKey: [...key, 'program', p],
    queryFn: () =>
      json<{ data: Program[]; total: number }>(
        `${base}/program${qs({ ...p, lengkap: 'true', limit: String(PROGRAM_LIMIT) })}`,
      ),
    placeholderData: (prev) => prev,
  })

export type Impact = {
  jumlah_materi: number
  dapat_diubah: number
  terkunci: { materi_id: string; alasan: Alasan; status?: string }[]
  akan_direset: number
  pekerjaan_hilang: {
    kurator_sudah_ditugaskan: number
    kurasi_diperiksa: number
    kurasi_lolos_atau_ditolak: number
  }
}

export const impactQuery = (ids: string[], simulateError: boolean) =>
  queryOptions({
    queryKey: [...key, 'dampak', [...ids].sort().join(','), simulateError],
    queryFn: async () =>
      (
        await json<{ data: Impact }>(`${base}/penugasan-kurasi/dampak${qs({ materi_ids: ids.join(',') })}`, {
          headers: simulateError ? { 'x-simulate': 'e2-error' } : undefined,
        })
      ).data,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })

export type AssignBody = {
  materi_ids: string[]
  program_id: string | null
  institusi_satker_id: string
  institusi_puskur_id: string
  institusi_kurator_media_id: string
  institusi_kurator_substansi_id: string
  kelompok_instrumen_media_id: string
  kelompok_instrumen_substansi_id: string
  /** Prototype extension: one pair per tipe for a mixed-tipe selection. */
  kelompok_per_tipe?: Record<string, { media: string; substansi: string }>
  proses_bisnis: ProsesBisnis
  review: Review
}

export type AssignResult = {
  materi_id: string
  hasil: 'ok' | 'terkunci' | 'gagal'
  berubah?: boolean
  status_baru?: string
  direset?: boolean
  alasan?: Alasan
  status?: string
}

export function useAssign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: AssignBody) => {
      const sim = getSim()
      const headers: Record<string, string> = {}
      if (sim.e1Forbidden) headers['x-simulate'] = 'e1-403'
      else if (sim.e1BadRequest) headers['x-simulate'] = 'e1-400'
      const r = await json<{ data: AssignResult[] }>(`${base}/penugasan-kurasi`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
      })
      return r.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...key, 'materi'] })
    },
  })
}

/** All programs (incl. legacy), used only to show names in the list. */
export const programNamesQuery = queryOptions({
  queryKey: [...key, 'program', 'all'],
  queryFn: () => json<{ data: Program[] }>(`${base}/program`),
  staleTime: Infinity,
})
