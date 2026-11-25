import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Editor, Jenjang, StatusTayang } from './-data/seed'
import type { Errors, FormValues } from './-logic/rules'
import { rememberPreview } from './-logic/thumb'

const base = '/api/cms-informasi/v2'
const key = ['cms-informasi', 'v2'] as const

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly field?: string,
    readonly errors?: Errors,
  ) {
    super(message)
  }
}

async function call<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as {
      message?: string
      field?: string
      errors?: Errors
    }
    throw new ApiError(res.status, b.message ?? res.statusText, b.field, b.errors)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export type Informasi = {
  id: string
  nama: string
  judul: string
  thumbnail: string
  kategori: string
  layanan: string[]
  jenjang: Jenjang[]
  url: string
  tanggal_mulai: string
  tanggal_selesai: string
  pin_informasi: boolean
  homepage_order?: number
  status: 'Aktif' | 'Inaktif'
  status_tayang: StatusTayang
  created_by?: Editor
  updated_by?: Editor
  created_at: string
  updated_at: string
}

export type ListParams = {
  q?: string
  kategori?: string
  layanan?: string
  jenjang_id?: string
  status_tayang?: string
  homepage?: boolean
  limit: number
  offset: number
  simulasi?: string
}

export const listQuery = (params: ListParams) => {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') qs.set(k, String(v))
  return queryOptions({
    queryKey: [...key, 'list', params],
    queryFn: () => call<{ data: Informasi[]; total: number }>(`${base}/informasi?${qs}`),
  })
}

export const detailQuery = (id: string) =>
  queryOptions({
    queryKey: [...key, 'detail', id],
    queryFn: () => call<{ data: Informasi }>(`${base}/informasi/${id}`),
    staleTime: 0,
    gcTime: 0,
  })

export const jenjangQuery = queryOptions({
  queryKey: [...key, 'jenjang'],
  queryFn: () => call<{ data: Jenjang[] }>(`${base}/jenjang`),
  staleTime: Infinity,
})

export const toPayload = (v: FormValues) => ({
  nama: v.nama.trim(),
  judul: v.judul.trim(),
  thumbnail: v.thumbnail,
  layanan: v.layanan,
  jenjang_ids: v.jenjang_ids,
  kategori: v.kategori,
  url: v.url.trim(),
  tanggal_mulai: v.tanggal_mulai,
  tanggal_selesai: v.tanggal_selesai,
  pin_informasi: v.pin_informasi,
  homepage_order: v.homepage_order.trim() === '' ? undefined : Number(v.homepage_order),
  status: v.status,
})

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

function useRefresh() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [...key, 'list'] })
}

export function useSaveInformasi(id: string | 'new') {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (v: FormValues): Promise<void> => {
      if (id === 'new') await call(`${base}/informasi`, json('POST', toPayload(v)))
      else await call(`${base}/informasi/${id}`, json('PUT', toPayload(v)))
    },
    onSuccess: refresh,
  })
}

export function useDeleteInformasi() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: (id: string) => call<void>(`${base}/informasi/${id}`, { method: 'DELETE' }),
    onSuccess: refresh,
  })
}

export function useUploadThumbnail() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.set('file', file)
      fd.set('folder', 'informasi')
      const res = await call<{ data: { url: string } }>(`${base}/files/upload`, {
        method: 'POST',
        body: fd,
      })
      rememberPreview(res.data.url, file)
      return res.data.url
    },
  })
}
