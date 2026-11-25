import { useQuery } from '@tanstack/react-query'
import type { Search } from '../-logic/search'
import { listQuery } from '../-queries'

export const PAGE_SIZE = 10

export function useInformasiList(s: Search, opts: { paged: boolean }) {
  return useQuery(
    listQuery({
      q: s.q,
      kategori: s.kategori,
      layanan: s.layanan,
      jenjang_id: s.jenjang_id,
      status_tayang: s.status_tayang,
      homepage: s.homepage,
      limit: opts.paged ? PAGE_SIZE : 100,
      offset: opts.paged ? ((s.page ?? 1) - 1) * PAGE_SIZE : 0,
      simulasi: s.simulasi,
    }),
  )
}
