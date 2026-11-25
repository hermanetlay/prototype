import type { PrototypeMeta } from '@/shared/lib/registry'

export const meta: PrototypeMeta = {
  title: 'Penugasan Kurasi Massal',
  summary:
    'Admin Super menugaskan kurasi ke banyak materi sekaligus lewat dialog, dengan prefill program, ringkasan dampak, dan hasil per materi.',
  status: 'review',
  updated: '2026-11-24',
  owners: [],
  changes:
    'Varian review dipilih (default). Versi awal: tiga varian dialog (wizard, panel, review) di atas daftar Kelola Materi tiruan. Pilihan program diganti combobox yang bisa dicari (pencarian, debounce, maks 20 hasil) dan seed diperbanyak menjadi 12 program SD Modul Ajar.',
}
