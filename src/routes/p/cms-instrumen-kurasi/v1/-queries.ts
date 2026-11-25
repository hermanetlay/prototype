import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/ui/Toast'
import type { IndikatorRec, Jenjang, JenisKurasi, Status, TipeMateri } from './-data/seed'

const base = '/api/cms-instrumen-kurasi/v1'
const key = ['cms-instrumen-kurasi', 'v1'] as const

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly field?: string,
  ) {
    super(message)
  }
}

async function call<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { message?: string; field?: string }
    throw new ApiError(res.status, b.message ?? res.statusText, b.field)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export type KelompokItem = {
  id: string
  nama: string
  jenis_kurasi: JenisKurasi
  tipe_materi: TipeMateri | null
  status: Status
  jenjang: Jenjang[]
  jumlah_kategori: number
  jumlah_indikator: number
  siap_dipakai: boolean
  updated_at: string
}
export type KategoriRef = { id: string; nama: string; jumlah_indikator: number }
export type KelompokDetail = KelompokItem & { kategori: KategoriRef[] }
export type KategoriFull = {
  id: string
  nama: string
  kelompok_id: string
  indikator: IndikatorRec[]
}

export type ListParams = {
  q?: string
  jenis_kurasi?: string
  tipe_materi?: string
  jenjang_id?: string
  status?: string
  limit: number
  offset: number
  simulasi?: string
}

export const listQuery = (params: ListParams) => {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') qs.set(k, String(v))
  return queryOptions({
    queryKey: [...key, 'list', params],
    queryFn: () =>
      call<{ data: KelompokItem[]; meta: { limit: number; offset: number; total: number } }>(
        `${base}/kelompok-instrumen?${qs}`,
      ),
  })
}

export const detailQuery = (id: string) =>
  queryOptions({
    queryKey: [...key, 'detail', id],
    queryFn: () => call<{ data: KelompokDetail }>(`${base}/kelompok-instrumen/${id}`),
    staleTime: 0,
  })

export const kategoriQuery = (id: string) =>
  queryOptions({
    queryKey: [...key, 'kategori', id],
    queryFn: () => call<{ data: KategoriFull }>(`${base}/kategori/${id}`),
    staleTime: 0,
  })

export const jenjangQuery = queryOptions({
  queryKey: [...key, 'jenjang'],
  queryFn: () => call<{ data: Jenjang[] }>(`${base}/jenjang`),
  staleTime: Infinity,
})

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

/** Mutation that refreshes everything, toasts the server message on failure. */
function useWrite<V, R = unknown>(fn: (v: V) => Promise<R>, ok?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: key })
      if (ok) toast(ok)
    },
    onError: (e) => toast(e.message, 'critical'),
  })
}

export type KelompokPayload = {
  nama: string
  jenis_kurasi: string
  tipe_materi: string | null
  jenjang_ids: string[]
}

export const useCreateKelompok = () =>
  useWrite((v: KelompokPayload) =>
    call<{ data: KelompokDetail }>(`${base}/kelompok-instrumen`, json('POST', v)),
  'Kelompok ditambahkan.')

export const useUpdateKelompok = (id: string) =>
  useWrite((v: Partial<KelompokPayload>) =>
    call<{ data: KelompokDetail }>(`${base}/kelompok-instrumen/${id}`, json('PATCH', v)),
  'Perubahan disimpan.')

export const useSetStatus = (id: string) =>
  useWrite((status: Status) =>
    call<{ data: KelompokDetail }>(`${base}/kelompok-instrumen/${id}`, json('PATCH', { status })),
  )

export const useDeleteKelompok = () =>
  useWrite((id: string) => call<void>(`${base}/kelompok-instrumen/${id}`, { method: 'DELETE' }), 'Kelompok dihapus.')

export const useAddKategori = (kelompokId: string) =>
  useWrite((nama: string) =>
    call<{ data: KategoriFull }>(`${base}/kelompok-instrumen/${kelompokId}/kategori`, json('POST', { nama })),
  'Kategori ditambahkan.')

export const useRenameKategori = () =>
  useWrite((v: { id: string; nama: string }) =>
    call(`${base}/kategori/${v.id}`, json('PATCH', { nama: v.nama })),
  'Kategori disimpan.')

export const useDeleteKategori = () =>
  useWrite((id: string) => call<void>(`${base}/kategori/${id}`, { method: 'DELETE' }), 'Kategori dihapus.')

export type IndikatorPayload = { nama_indikator: string; negasi_indikator: string }

export const useAddIndikator = () =>
  useWrite((v: IndikatorPayload & { kategoriId: string }) =>
    call<{ data: IndikatorRec }>(`${base}/kategori/${v.kategoriId}/indikator`, json('POST', {
      nama_indikator: v.nama_indikator,
      negasi_indikator: v.negasi_indikator,
    })),
  'Indikator ditambahkan.')

export const useEditIndikator = () =>
  useWrite((v: IndikatorPayload & { id: string }) =>
    call(`${base}/indikator/${v.id}`, json('PATCH', {
      nama_indikator: v.nama_indikator,
      negasi_indikator: v.negasi_indikator,
    })),
  'Indikator disimpan.')

export const useDeleteIndikator = () =>
  useWrite((id: string) => call<void>(`${base}/indikator/${id}`, { method: 'DELETE' }), 'Indikator dihapus.')
