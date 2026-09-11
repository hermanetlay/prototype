export type MateriStatus = 'menunggu' | 'disetujui' | 'ditolak'

export type Materi = {
  id: string
  judul: string
  mataPelajaran: string
  jenjang: string
  penulis: string
  dikirimPada: string
  status: MateriStatus
  catatan?: string
  ringkasan: string
}

export const seedMateri: Materi[] = [
  {
    id: 'MAT-1042',
    judul: 'Sistem Persamaan Linear Dua Variabel',
    mataPelajaran: 'Matematika',
    jenjang: 'SMP Kelas 8',
    penulis: 'Rina Wulandari',
    dikirimPada: '2026-09-08',
    status: 'menunggu',
    ringkasan:
      'Modul 12 halaman dengan 3 latihan interaktif dan 1 kuis akhir bab.',
  },
  {
    id: 'MAT-1039',
    judul: 'Teks Eksposisi: Struktur dan Kaidah',
    mataPelajaran: 'Bahasa Indonesia',
    jenjang: 'SMA Kelas 10',
    penulis: 'Dimas Prasetyo',
    dikirimPada: '2026-09-07',
    status: 'menunggu',
    ringkasan: 'Materi bacaan plus lembar kerja analisis struktur teks.',
  },
  {
    id: 'MAT-1031',
    judul: 'Gerak Lurus Berubah Beraturan',
    mataPelajaran: 'Fisika',
    jenjang: 'SMA Kelas 10',
    penulis: 'Sari Handayani',
    dikirimPada: '2026-09-05',
    status: 'disetujui',
    ringkasan: 'Simulasi grafik v-t dan 8 soal latihan bertingkat.',
  },
  {
    id: 'MAT-1027',
    judul: 'Kerajaan Majapahit',
    mataPelajaran: 'Sejarah',
    jenjang: 'SMP Kelas 7',
    penulis: 'Agus Nugroho',
    dikirimPada: '2026-09-03',
    status: 'ditolak',
    catatan: 'Sumber rujukan belum lengkap pada bagian silsilah raja.',
    ringkasan: 'Narasi sejarah dengan linimasa interaktif.',
  },
]
