import { useQuery } from '@tanstack/react-query'
import { institusiQuery, jenjangQuery, kelompokQuery } from '../-queries'

/** id -> name lookups from the unfiltered option lists. */
export function useNames() {
  const i = useQuery(institusiQuery(''))
  const k = useQuery(kelompokQuery({}))
  const j = useQuery(jenjangQuery)
  return {
    inst: (id: string | null | undefined) =>
      id ? (i.data?.data.find((x) => x.id === id)?.nama ?? '…') : '',
    kel: (id: string | null | undefined) =>
      id ? (k.data?.data.find((x) => x.id === id)?.nama ?? '…') : '',
    jenjang: (id: string) => j.data?.data.find((x) => x.id === id)?.nama ?? id.toUpperCase(),
  }
}
