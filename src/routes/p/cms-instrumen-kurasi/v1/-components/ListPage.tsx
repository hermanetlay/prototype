import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { Card, CardBody, CardHeader } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Field'
import { Table, Td, Th } from '@/shared/ui/Table'
import { JENIS_KURASI, TIPE_MATERI } from '../-data/seed'
import { hasFilters, PAGE_SIZES } from '../-logic/search'
import type { Search } from '../-logic/search'
import { jenjangQuery, listQuery } from '../-queries'
import { ErrorBlock, fmtDate, KLink, Select, StatusBadges, useGo } from './parts'

export function ListPage({ search }: { search: Search }) {
  const go = useGo()
  const jenjang = useQuery(jenjangQuery)
  const page = search.page ?? 1
  const list = useQuery(
    listQuery({
      q: search.q,
      jenis_kurasi: search.jenis_kurasi,
      tipe_materi: search.tipe_materi,
      jenjang_id: search.jenjang_id,
      status: search.status,
      limit: search.limit,
      offset: (page - 1) * search.limit,
      simulasi: search.simulasi,
    }),
  )

  const [q, setQ] = useState(search.q ?? '')
  useEffect(() => setQ(search.q ?? ''), [search.q])
  useEffect(() => {
    if (q.trim() === (search.q ?? '')) return
    const t = setTimeout(() => go.patch({ q: q.trim() || undefined, page: undefined }), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const filter = (patch: Partial<Search>) => go.patch({ ...patch, page: undefined })
  const total = list.data?.meta.total ?? 0
  const from = total === 0 ? 0 : (page - 1) * search.limit + 1
  const to = Math.min(page * search.limit, total)

  return (
    <Card>
      <CardHeader
        title="Daftar kelompok instrumen"
        subtitle="Kelola kelompok instrumen, kategori dan indikator kurasi."
        actions={<Button onClick={() => go.patch({ form: 'new' }, false)}>Tambah kelompok</Button>}
      />
      <CardBody className="flex flex-col gap-4">
        <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-3">
          <Input
            aria-label="Cari nama"
            placeholder="Cari nama kelompok"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select
            aria-label="Jenis kurasi"
            value={search.jenis_kurasi ?? ''}
            onChange={(e) => filter({ jenis_kurasi: (e.target.value || undefined) as Search['jenis_kurasi'] })}
          >
            <option value="">Semua jenis</option>
            {JENIS_KURASI.map((j) => (
              <option key={j}>{j}</option>
            ))}
          </Select>
          <Select
            aria-label="Tipe materi"
            value={search.tipe_materi ?? ''}
            onChange={(e) => filter({ tipe_materi: (e.target.value || undefined) as Search['tipe_materi'] })}
          >
            <option value="">Semua tipe materi</option>
            {TIPE_MATERI.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Select
            aria-label="Jenjang"
            value={search.jenjang_id ?? ''}
            onChange={(e) => filter({ jenjang_id: e.target.value || undefined })}
          >
            <option value="">Semua jenjang</option>
            {(jenjang.data?.data ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama_singkat}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Status"
            value={search.status ?? ''}
            onChange={(e) => filter({ status: (e.target.value || undefined) as Search['status'] })}
          >
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </Select>
        </div>
        {hasFilters(search) ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                go.patch({
                  q: undefined,
                  jenis_kurasi: undefined,
                  tipe_materi: undefined,
                  jenjang_id: undefined,
                  status: undefined,
                  page: undefined,
                })
              }
            >
              Hapus filter
            </Button>
          </div>
        ) : null}

        <div className="rounded-lg border border-border">
          <Table>
            <thead>
              <tr>
                <Th>Nama</Th>
                <Th>Jenis kurasi</Th>
                <Th>Tipe materi</Th>
                <Th>Jenjang</Th>
                <Th>Status</Th>
                <Th className="text-right">Kategori</Th>
                <Th className="text-right">Indikator</Th>
                <Th>Diperbarui</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {list.isPending ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="animate-pulse">
                    <Td colSpan={9}>
                      <div className="h-5 rounded-md bg-gray-10" />
                    </Td>
                  </tr>
                ))
              ) : list.isError ? (
                <tr>
                  <Td colSpan={9}>
                    <ErrorBlock message={list.error.message} onRetry={() => list.refetch()} />
                  </Td>
                </tr>
              ) : list.data.data.length === 0 ? (
                <tr>
                  <Td colSpan={9} className="py-10 text-center">
                    <p className="text-body-sm font-semibold">
                      {hasFilters(search) ? 'Tidak ada kelompok yang cocok.' : 'Belum ada kelompok instrumen.'}
                    </p>
                    <p className="mt-1 text-helper text-text-subdued">
                      {hasFilters(search) ? 'Ubah atau hapus filter.' : 'Tambah kelompok pertama.'}
                    </p>
                  </Td>
                </tr>
              ) : (
                list.data.data.map((k) => (
                  <tr key={k.id} className="hover:bg-surface-hovered">
                    <Td className="font-semibold">{k.nama}</Td>
                    <Td>{k.jenis_kurasi}</Td>
                    <Td>{k.tipe_materi ?? <span className="text-text-subdued">Semua</span>}</Td>
                    <Td>{k.jenjang.map((j) => j.nama_singkat).join(', ') || '–'}</Td>
                    <Td>
                      <StatusBadges k={k} />
                    </Td>
                    <Td className="text-right">{k.jumlah_kategori}</Td>
                    <Td className="text-right">{k.jumlah_indikator}</Td>
                    <Td className="whitespace-nowrap">{fmtDate(k.updated_at)}</Td>
                    <Td>
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <KLink id={k.id} className="font-semibold text-interactive hover:underline">
                          Lihat
                        </KLink>
                        <button
                          className="font-semibold text-interactive hover:underline"
                          onClick={() => go.patch({ form: k.id }, false)}
                        >
                          Ubah
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-body-sm text-text-subdued">
          <label className="flex items-center gap-2">
            Baris per halaman
            <Select
              aria-label="Baris per halaman"
              className="w-20"
              value={search.limit}
              onChange={(e) => filter({ limit: Number(e.target.value) as Search['limit'] })}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </Select>
          </label>
          <div className="flex items-center gap-3">
            <span>
              {from}–{to} dari {total}
            </span>
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => go.patch({ page: page - 1 || undefined })}>
              Sebelumnya
            </Button>
            <Button variant="secondary" size="sm" disabled={to >= total} onClick={() => go.patch({ page: page + 1 })}>
              Berikutnya
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
