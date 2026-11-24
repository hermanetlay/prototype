import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Field'
import { KATEGORI, LAYANAN, STATUS_TAYANG } from '../-data/seed'
import { FILTER_KEYS, parseSearch } from '../-logic/search'
import type { Search, SetSearch } from '../-logic/search'
import { jenjangQuery } from '../-queries'
import { Select } from './parts'

const reset = Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])) as Partial<Search>

/** Draft filters, written to the URL only on "Terapkan Filter". */
export function Filters({ search, setSearch }: { search: Search; setSearch: SetSearch }) {
  const jenjang = useQuery(jenjangQuery)
  const [d, setD] = useState<Record<string, string>>({})
  useEffect(() => {
    setD({
      q: search.q ?? '',
      kategori: search.kategori ?? '',
      layanan: search.layanan ?? '',
      jenjang_id: search.jenjang_id ?? '',
      status_tayang: search.status_tayang ?? '',
      homepage: search.homepage ? 'true' : '',
    })
  }, [search.q, search.kategori, search.layanan, search.jenjang_id, search.status_tayang, search.homepage])

  const set = (k: string) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value })
  const apply = () => {
    const p = parseSearch({ ...d, variant: search.variant })
    setSearch({ ...reset, q: p.q, kategori: p.kategori, layanan: p.layanan, jenjang_id: p.jenjang_id, status_tayang: p.status_tayang, homepage: p.homepage, page: undefined })
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => (e.preventDefault(), apply())}
    >
      <label className="flex w-56 flex-col gap-1 text-helper font-semibold">
        Cari
        <Input value={d.q ?? ''} onChange={set('q')} placeholder="Nama atau judul" />
      </label>
      <label className="flex w-44 flex-col gap-1 text-helper font-semibold">
        Kategori
        <Select value={d.kategori ?? ''} onChange={set('kategori')}>
          <option value="">Semua</option>
          {KATEGORI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
      </label>
      <label className="flex w-40 flex-col gap-1 text-helper font-semibold">
        Layanan
        <Select value={d.layanan ?? ''} onChange={set('layanan')}>
          <option value="">Semua</option>
          {LAYANAN.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
      </label>
      <label className="flex w-32 flex-col gap-1 text-helper font-semibold">
        Jenjang
        <Select value={d.jenjang_id ?? ''} onChange={set('jenjang_id')}>
          <option value="">Semua</option>
          {jenjang.data?.data.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama_singkat}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex w-36 flex-col gap-1 text-helper font-semibold">
        Status Tayang
        <Select value={d.status_tayang ?? ''} onChange={set('status_tayang')}>
          <option value="">Semua</option>
          {STATUS_TAYANG.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
      </label>
      <label className="flex w-36 flex-col gap-1 text-helper font-semibold">
        Beranda
        <Select value={d.homepage ?? ''} onChange={set('homepage')}>
          <option value="">Semua</option>
          <option value="true">Di beranda</option>
        </Select>
      </label>
      <Button type="submit">Terapkan Filter</Button>
      <Button type="button" variant="secondary" onClick={() => setSearch({ ...reset, page: undefined })}>
        Reset Filter
      </Button>
    </form>
  )
}
