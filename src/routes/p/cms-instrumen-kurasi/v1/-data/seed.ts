export type Jenjang = { id: string; nama_singkat: string }

export const JENJANG: Jenjang[] = [
  { id: 'j-paud', nama_singkat: 'PAUD' },
  { id: 'j-sd', nama_singkat: 'SD' },
  { id: 'j-smp', nama_singkat: 'SMP' },
  { id: 'j-sma', nama_singkat: 'SMA' },
  { id: 'j-smk', nama_singkat: 'SMK' },
]

export const TIPE_MATERI = [
  'Artikel',
  'Video',
  'Lab Maya',
  'Gim Edukasi',
  'Video Interaktif',
  'Interaktif',
  'Teks',
  'Gambar',
] as const
export type TipeMateri = (typeof TIPE_MATERI)[number]

export const JENIS_KURASI = ['Media', 'Substansi'] as const
export type JenisKurasi = (typeof JENIS_KURASI)[number]

export type Status = 'active' | 'inactive'

export type IndikatorRec = {
  id: string
  nama_indikator: string
  negasi_indikator: string
  updated_at: string
}
export type KategoriRec = {
  id: string
  nama: string
  indikator: IndikatorRec[]
  updated_at: string
}
export type KelompokRec = {
  id: string
  nama: string
  jenis_kurasi: JenisKurasi
  tipe_materi: TipeMateri | null
  status: Status
  jenjang_ids: string[]
  kategori: KategoriRec[]
  updated_at: string
}
export type ProgramRec = { id: string; nama: string; kelompok_ids: string[] }

let seq = 0
const uid = (p: string) => `${p}-${++seq}`

type Ind = [string, string]
/** "Materi <x>." and its negation "Materi tidak <x>." */
const p = (pred: string): Ind => [`Materi ${pred}.`, `Materi tidak ${pred}.`]
type Kat = [string, Ind[]]

function kelompok(
  id: string,
  nama: string,
  jenis: JenisKurasi,
  tipe: TipeMateri | null,
  status: Status,
  jenjang: string[],
  kategori: Kat[],
  updated: string,
): KelompokRec {
  return {
    id,
    nama,
    jenis_kurasi: jenis,
    tipe_materi: tipe,
    status,
    jenjang_ids: jenjang,
    updated_at: updated,
    kategori: kategori.map(([kn, inds]) => ({
      id: uid('kat'),
      nama: kn,
      updated_at: updated,
      indikator: inds.map(([a, b]) => ({
        id: uid('ind'),
        nama_indikator: a,
        negasi_indikator: b,
        updated_at: updated,
      })),
    })),
  }
}

export function buildSeed(): { kelompok: KelompokRec[]; programs: ProgramRec[] } {
  seq = 0
  const kelompokList = [
    kelompok(
      'kel-01',
      'Instrumen Media Video SD',
      'Media',
      'Video',
      'active',
      ['j-sd'],
      [
        [
          'Kesesuaian Capaian Pembelajaran',
          [
            [
              'Materi sesuai dengan capaian pembelajaran fase yang dituju.',
              'Materi tidak sesuai dengan capaian pembelajaran fase yang dituju.',
            ],
            p('mencakup tujuan pembelajaran yang jelas'),
            p('disajikan secara runtut dari konsep dasar'),
            p('relevan dengan kehidupan sehari-hari murid'),
          ],
        ],
        [
          'Kualitas Audio dan Visual',
          [
            p('memiliki suara yang jernih dan mudah didengar'),
            p('memiliki gambar yang tajam dan tidak buram'),
            p('memiliki teks pada layar yang mudah dibaca'),
            p('bebas dari musik latar yang mengganggu narasi'),
            p('memiliki durasi yang sesuai dengan usia murid'),
          ],
        ],
        [
          'Kebahasaan',
          [
            p('menggunakan bahasa Indonesia yang baku dan mudah dipahami'),
            p('bebas dari kesalahan ejaan dan tata bahasa'),
            p('menggunakan istilah yang sesuai dengan jenjang'),
          ],
        ],
        [
          'Aksesibilitas',
          [
            p('menyediakan teks pendamping atau takarir'),
            p('dapat diputar pada perangkat dengan koneksi rendah'),
            p('tidak mengandung kilatan cahaya yang berbahaya'),
          ],
        ],
      ],
      '2026-11-20T09:30:00+07:00',
    ),
    kelompok(
      'kel-02',
      'Instrumen Substansi SMP',
      'Substansi',
      null,
      'active',
      ['j-smp'],
      [
        [
          'Ketepatan Konsep',
          [
            p('menyajikan konsep yang benar secara keilmuan'),
            p('menyertakan contoh yang tepat'),
            p('bebas dari miskonsepsi'),
          ],
        ],
        [
          'Kedalaman Materi',
          [
            p('memiliki cakupan yang sesuai dengan fase belajar'),
            p('mendorong murid berpikir kritis'),
            p('menyediakan latihan yang menguji pemahaman'),
          ],
        ],
        [
          'Karakter dan Nilai',
          [
            p('selaras dengan profil pelajar Pancasila'),
            p('bebas dari unsur SARA dan bias gender'),
            p('menghargai keberagaman budaya'),
          ],
        ],
      ],
      '2026-11-18T14:05:00+07:00',
    ),
    kelompok(
      'kel-03',
      'Instrumen Media Artikel SMA',
      'Media',
      'Artikel',
      'inactive',
      ['j-sma'],
      [
        [
          'Struktur Tulisan',
          [
            p('memiliki judul yang mewakili isi'),
            p('memiliki paragraf yang tersusun logis'),
          ],
        ],
        [
          'Sumber dan Rujukan',
          [p('mencantumkan sumber rujukan yang dapat ditelusuri'), p('memakai data yang mutakhir')],
        ],
      ],
      '2026-11-10T10:00:00+07:00',
    ),
    kelompok(
      'kel-04',
      'Instrumen Media Gim Edukasi SD',
      'Media',
      'Gim Edukasi',
      'active',
      ['j-sd'],
      [
        ['Mekanika Gim', [p('memiliki aturan main yang jelas')]],
        ['Umpan Balik', []],
      ],
      '2026-11-19T08:15:00+07:00',
    ),
    kelompok(
      'kel-05',
      'Instrumen Media Lab Maya SMK',
      'Media',
      'Lab Maya',
      'inactive',
      ['j-smk'],
      [
        ['Keselamatan Kerja', []],
        ['Kesesuaian Alat', []],
      ],
      '2026-11-12T16:40:00+07:00',
    ),
    kelompok('kel-06', 'Instrumen Substansi Interaktif SD', 'Substansi', 'Interaktif', 'inactive', ['j-sd'], [], '2026-11-21T11:00:00+07:00'),
    kelompok(
      'kel-07',
      'Instrumen Media Video SMP',
      'Media',
      'Video',
      'active',
      ['j-smp', 'j-sma'],
      [
        [
          'Kualitas Produksi',
          [p('memiliki pencahayaan yang memadai'), p('memiliki suara tanpa derau')],
        ],
        ['Kebahasaan', [p('menggunakan bahasa yang santun'), p('memakai istilah yang konsisten')]],
      ],
      '2026-11-15T13:20:00+07:00',
    ),
    kelompok('kel-08', 'Instrumen Substansi Literasi SMP (draf)', 'Substansi', 'Teks', 'inactive', ['j-smp'], [], '2026-11-09T09:00:00+07:00'),
    kelompok(
      'kel-09',
      'Instrumen Substansi Lama',
      'Substansi',
      null,
      'inactive',
      [],
      [
        ['Isi Materi', [p('memuat informasi yang akurat'), p('memuat informasi yang lengkap')]],
        ['Penyajian', [p('disajikan secara menarik')]],
      ],
      '2026-08-02T10:00:00+07:00',
    ),
    kelompok(
      'kel-10',
      'Instrumen Media Teks SD',
      'Media',
      'Teks',
      'inactive',
      ['j-sd', 'j-smp'],
      [
        ['Kebahasaan', [p('menggunakan kalimat yang efektif'), p('bebas dari salah ketik')]],
        ['Tata Letak', [p('memiliki jarak antarbaris yang nyaman dibaca')]],
        ['Kebahasaan', [p('menggunakan kosakata sesuai tingkat baca murid')]],
      ],
      '2026-11-05T15:10:00+07:00',
    ),
    kelompok(
      'kel-11',
      'Instrumen Media Interaktif SMA',
      'Media',
      'Interaktif',
      'active',
      ['j-sma', 'j-smk'],
      [
        [
          'Interaktivitas',
          [p('merespons masukan murid dengan cepat'), p('memberi petunjuk penggunaan yang jelas')],
        ],
        ['Kinerja', [p('dapat dimuat dalam waktu wajar'), p('berjalan stabil tanpa galat')]],
      ],
      '2026-11-22T10:45:00+07:00',
    ),
    kelompok(
      'kel-12',
      'Instrumen Media Video Interaktif PAUD',
      'Media',
      'Video Interaktif',
      'inactive',
      ['j-paud'],
      [['Keamanan Anak', [p('bebas dari konten yang menakutkan'), p('memakai warna yang ramah anak')]]],
      '2026-11-23T09:05:00+07:00',
    ),
  ]
  const programs: ProgramRec[] = [
    { id: 'prog-1', nama: 'Program Pemerkayaan SD', kelompok_ids: ['kel-01', 'kel-04'] },
    { id: 'prog-2', nama: 'Program Literasi SMP', kelompok_ids: ['kel-02', 'kel-08'] },
  ]
  return { kelompok: kelompokList, programs }
}
