import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Materi, MateriStatus } from './-data/materi'

const base = '/api/persetujuan-materi/v1'

async function json<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const materiListQuery = (status: string) =>
  queryOptions({
    queryKey: ['persetujuan-materi', 'v1', 'list', status],
    queryFn: () => json<{ items: Materi[] }>(`${base}/materi?status=${status}`),
  })

export const materiDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['persetujuan-materi', 'v1', 'detail', id],
    queryFn: () => json<Materi>(`${base}/materi/${id}`),
  })

export function useKeputusan(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      status: Extract<MateriStatus, 'disetujui' | 'ditolak'>
      catatan?: string
    }) =>
      json<Materi>(`${base}/materi/${id}/keputusan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['persetujuan-materi', 'v1'] }),
  })
}
