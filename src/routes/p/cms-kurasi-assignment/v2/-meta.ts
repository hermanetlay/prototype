import type { PrototypeMeta } from '@/shared/lib/registry'

export const meta: PrototypeMeta = {
  title: 'Penugasan Kurasi dan Program',
  summary:
    'Admin Super mengelola Program Penugasan (buat, lengkapi program lama, ubah nilai) dan memakainya di dialog penugasan kurasi massal.',
  status: 'review',
  updated: '2026-11-25',
  owners: [],
  changes:
    'Dialog hanya varian review (pilihan v1). Halaman baru Program Penugasan: daftar, tambah, detail/ubah, dan Lengkapi untuk program lama. Satu penyimpanan bersama, sehingga program yang dibuat atau dilengkapi langsung muncul di pilihan program pada dialog. Bar Simulasi menggantikan pemilih varian.',
}
