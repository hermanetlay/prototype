// Seed fixtures. Shapes are proposals from RFC section 6, not an existing BE spec.

export type Jenjang = { id: string; nama: string }
export type Tipe = 'Modul Ajar' | 'Buku Teks' | 'Video Pembelajaran'
export type Jenis = 'Media' | 'Substansi'
export type ProsesBisnis = 'Kurasi' | 'Produksi'
export type Review = 'Dalam CMS' | 'Luar CMS'

export type Status =
  | 'Draf'
  | 'Penugasan Institusi'
  | 'Penugasan Kurator'
  | 'Diperiksa'
  | 'Perlu Perbaikan'
  | 'Divalidasi'
  | 'Perlu Perbaikan Akhir'
  | 'Terbit'
  | 'Diarsipkan'
  | 'Ditolak'

export type Institusi = { id: string; nama: string }

export type Kelompok = {
  id: string
  nama: string
  jenis: Jenis
  jenjang_id: string
  tipe: Tipe | null
}

export type ProgramValues = {
  institusi_satker_id: string
  institusi_puskur_id: string
  institusi_kurator_media_id: string
  institusi_kurator_substansi_id: string
  kelompok_instrumen_media_id: string
  kelompok_instrumen_substansi_id: string
  proses_bisnis: ProsesBisnis
  review: Review
}

export type Program = {
  id: string
  nama: string
  jenjang_id: string
  tipe_materi: Tipe
  is_legacy: boolean
  lengkap: boolean
  values: ProgramValues | null
}

export type KurasiRowStatus = 'Penugasan Institusi' | 'Penugasan Kurator' | 'Diperiksa' | 'Lolos' | 'Ditolak'
export type KurasiRow = { status: KurasiRowStatus; kurator: string | null }

export type Materi = {
  id: string
  judul: string
  tipe: Tipe
  jenjang_id: string
  mapel: string
  status: Status
  pernah_terbit: boolean
  program_id: string | null
  proses_bisnis: ProsesBisnis | null
  review: Review | null
  institusi_satker_id: string | null
  institusi_puskur_id: string | null
  institusi_kurator_media_id: string | null
  institusi_kurator_substansi_id: string | null
  kelompok_instrumen_media_id: string | null
  kelompok_instrumen_substansi_id: string | null
  media: KurasiRow
  substansi: KurasiRow
}

export const jenjang: Jenjang[] = [
  { id: 'sd', nama: 'SD' },
  { id: 'smp', nama: 'SMP' },
  { id: 'sma', nama: 'SMA' },
]

export const tipeList: Tipe[] = ['Modul Ajar', 'Buku Teks', 'Video Pembelajaran']

export const institusi: Institusi[] = [
  { id: 'i-puskur', nama: 'Pusat Kurikulum dan Pembelajaran' },
  { id: 'i-bbgp', nama: 'Balai Besar Guru Penggerak' },
  { id: 'i-bpmp-jabar', nama: 'BPMP Jawa Barat' },
  { id: 'i-bpmp-jatim', nama: 'BPMP Jawa Timur' },
  { id: 'i-bpmp-sulsel', nama: 'BPMP Sulawesi Selatan' },
  { id: 'i-unj', nama: 'Universitas Negeri Jakarta' },
  { id: 'i-upi', nama: 'Universitas Pendidikan Nusantara' },
  { id: 'i-pustekkom', nama: 'Pusat Teknologi Pembelajaran' },
  { id: 'i-pusbuk', nama: 'Pusat Perbukuan Nasional' },
  { id: 'i-lpmp', nama: 'Lembaga Penjaminan Mutu Pendidikan Banten' },
]

export const kelompok: Kelompok[] = jenjang.flatMap((j) =>
  (['Media', 'Substansi'] as Jenis[]).flatMap((jenis) =>
    ([null, ...tipeList] as (Tipe | null)[]).map((t) => ({
      id: `k-${jenis.toLowerCase()}-${j.id}-${t ? t.split(' ')[0].toLowerCase() : 'umum'}`,
      nama: `Instrumen ${jenis} ${j.nama} ${t ?? '(Semua Tipe)'}`,
      jenis,
      jenjang_id: j.id,
      tipe: t,
    })),
  ),
)

const kel = (jenis: Jenis, j: string, t: Tipe | null) =>
  kelompok.find((k) => k.jenis === jenis && k.jenjang_id === j && k.tipe === t)!.id

const pv = (
  j: string,
  t: Tipe,
  sat: string,
  pus: string,
  km: string,
  ks: string,
  pb: ProsesBisnis,
  rv: Review,
): ProgramValues => ({
  institusi_satker_id: sat,
  institusi_puskur_id: pus,
  institusi_kurator_media_id: km,
  institusi_kurator_substansi_id: ks,
  kelompok_instrumen_media_id: kel('Media', j, t),
  kelompok_instrumen_substansi_id: kel('Substansi', j, t),
  proses_bisnis: pb,
  review: rv,
})

const full = (id: string, nama: string, j: string, t: Tipe, values: ProgramValues): Program => ({
  id,
  nama,
  jenjang_id: j,
  tipe_materi: t,
  is_legacy: false,
  lengkap: true,
  values,
})
const legacy = (id: string, nama: string, j: string, t: Tipe): Program => ({
  id,
  nama,
  jenjang_id: j,
  tipe_materi: t,
  is_legacy: true,
  lengkap: false,
  values: null,
})

export const programs: Program[] = [
  full('p-literasi-sd', 'Program Pemerkayaan Literasi 2026', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bpmp-jabar', 'i-puskur', 'i-unj', 'i-upi', 'Kurasi', 'Dalam CMS')),
  full('p-numerasi-sd', 'Program Numerasi SD 2026', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bpmp-jatim', 'i-puskur', 'i-upi', 'i-unj', 'Kurasi', 'Dalam CMS')),
  full('p-penggerak-sd', 'Program Sekolah Penggerak SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bbgp', 'i-puskur', 'i-unj', 'i-upi', 'Kurasi', 'Dalam CMS')),
  full('p-bahasa-daerah-sd', 'Program Bahasa Daerah SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bpmp-sulsel', 'i-puskur', 'i-upi', 'i-bpmp-jabar', 'Kurasi', 'Dalam CMS')),
  full('p-inklusi-sd', 'Program Inklusi SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-pustekkom', 'i-puskur', 'i-unj', 'i-bbgp', 'Produksi', 'Dalam CMS')),
  full('p-mendalam-sd', 'Program Pembelajaran Mendalam SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-puskur', 'i-puskur', 'i-upi', 'i-unj', 'Kurasi', 'Dalam CMS')),
  full('p-3t-sd', 'Program Sekolah Daerah 3T SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bpmp-jatim', 'i-puskur', 'i-bpmp-sulsel', 'i-upi', 'Produksi', 'Luar CMS')),
  full('p-pancasila-sd', 'Program Penguatan Profil Pelajar Pancasila SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-lpmp', 'i-puskur', 'i-unj', 'i-upi', 'Kurasi', 'Dalam CMS')),
  full('p-coding-sd', 'Program Koding dan Kecerdasan Artifisial SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-pustekkom', 'i-puskur', 'i-pustekkom', 'i-unj', 'Produksi', 'Dalam CMS')),
  full('p-iklim-sd', 'Program Literasi Iklim dan Lingkungan SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bpmp-jabar', 'i-puskur', 'i-upi', 'i-bbgp', 'Kurasi', 'Dalam CMS')),
  full('p-seni-sd', 'Program Seni dan Budaya Nusantara SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bpmp-jatim', 'i-puskur', 'i-unj', 'i-upi', 'Produksi', 'Luar CMS')),
  full('p-transisi-sd', 'Program Transisi PAUD ke SD', 'sd', 'Modul Ajar',
    pv('sd', 'Modul Ajar', 'i-bbgp', 'i-puskur', 'i-bpmp-jabar', 'i-unj', 'Kurasi', 'Dalam CMS')),
  full('p-buku-sd', 'Program Buku Pendamping SD', 'sd', 'Buku Teks',
    pv('sd', 'Buku Teks', 'i-pusbuk', 'i-puskur', 'i-pusbuk', 'i-unj', 'Produksi', 'Luar CMS')),
  full('p-video-sd', 'Program Video Literasi SD', 'sd', 'Video Pembelajaran',
    pv('sd', 'Video Pembelajaran', 'i-pustekkom', 'i-puskur', 'i-pustekkom', 'i-upi', 'Produksi', 'Dalam CMS')),
  full('p-numerasi-smp', 'Program Numerasi SMP', 'smp', 'Modul Ajar',
    pv('smp', 'Modul Ajar', 'i-bpmp-sulsel', 'i-puskur', 'i-unj', 'i-bbgp', 'Kurasi', 'Dalam CMS')),
  full('p-video-smp', 'Program Video Sains SMP', 'smp', 'Video Pembelajaran',
    pv('smp', 'Video Pembelajaran', 'i-pustekkom', 'i-puskur', 'i-pustekkom', 'i-unj', 'Produksi', 'Luar CMS')),
  full('p-informatika-sma', 'Program Informatika SMA', 'sma', 'Modul Ajar',
    pv('sma', 'Modul Ajar', 'i-bbgp', 'i-puskur', 'i-upi', 'i-unj', 'Kurasi', 'Dalam CMS')),
  full('p-sains-sma', 'Program Penguatan Sains SMA', 'sma', 'Buku Teks',
    pv('sma', 'Buku Teks', 'i-lpmp', 'i-puskur', 'i-pusbuk', 'i-upi', 'Produksi', 'Dalam CMS')),
  legacy('p-legacy-1', 'Pemerkayaan 2024 (lama)', 'sd', 'Modul Ajar'),
  legacy('p-legacy-2', 'Buku Nasional 2023 (lama)', 'smp', 'Buku Teks'),
  legacy('p-legacy-3', 'Video Sekolah Penggerak (lama)', 'sma', 'Video Pembelajaran'),
]

type Spec = {
  s: Status
  j: string
  t: Tipe
  mapel: string
  topic: string
  inst?: 'none' | 'part' | 'all'
  media?: KurasiRow
  sub?: KurasiRow
  pt?: boolean
  prog?: string
  fail?: boolean
}

const R = (status: KurasiRowStatus, kurator: string | null = null): KurasiRow => ({ status, kurator })
const MA: Tipe = 'Modul Ajar'
const BT: Tipe = 'Buku Teks'
const VP: Tipe = 'Video Pembelajaran'

const specs: Spec[] = [
  // Penugasan Institusi (12): some with no institusi
  { s: 'Penugasan Institusi', j: 'sd', t: MA, mapel: 'Matematika', topic: 'Pecahan Senilai', inst: 'none' },
  { s: 'Penugasan Institusi', j: 'sd', t: MA, mapel: 'Bahasa Indonesia', topic: 'Membaca Teks Narasi', inst: 'none' },
  { s: 'Penugasan Institusi', j: 'sd', t: MA, mapel: 'IPAS', topic: 'Siklus Air', inst: 'part' },
  { s: 'Penugasan Institusi', j: 'sd', t: BT, mapel: 'IPAS', topic: 'Makhluk Hidup di Sekitarku', inst: 'none' },
  { s: 'Penugasan Institusi', j: 'sd', t: VP, mapel: 'Bahasa Indonesia', topic: 'Dongeng Nusantara', inst: 'none', fail: true },
  { s: 'Penugasan Institusi', j: 'smp', t: MA, mapel: 'Matematika', topic: 'Aljabar Dasar', inst: 'none' },
  { s: 'Penugasan Institusi', j: 'smp', t: MA, mapel: 'IPAS', topic: 'Sistem Pencernaan', inst: 'part' },
  { s: 'Penugasan Institusi', j: 'smp', t: BT, mapel: 'Bahasa Indonesia', topic: 'Teks Eksposisi', inst: 'none' },
  { s: 'Penugasan Institusi', j: 'smp', t: VP, mapel: 'IPAS', topic: 'Gerak Lurus', inst: 'none' },
  { s: 'Penugasan Institusi', j: 'sma', t: MA, mapel: 'Informatika', topic: 'Berpikir Komputasional', inst: 'none' },
  { s: 'Penugasan Institusi', j: 'sma', t: MA, mapel: 'Matematika', topic: 'Fungsi Kuadrat', inst: 'part' },
  { s: 'Penugasan Institusi', j: 'sma', t: BT, mapel: 'Informatika', topic: 'Jaringan Komputer', inst: 'none' },
  // Penugasan Kurator (10)
  { s: 'Penugasan Kurator', j: 'sd', t: MA, mapel: 'Matematika', topic: 'Bangun Datar', inst: 'all', media: R('Penugasan Kurator', 'Rina Wijaya'), sub: R('Penugasan Kurator') },
  { s: 'Penugasan Kurator', j: 'sd', t: MA, mapel: 'IPAS', topic: 'Energi dan Perubahannya', inst: 'all', media: R('Penugasan Kurator'), sub: R('Penugasan Kurator') },
  { s: 'Penugasan Kurator', j: 'sd', t: BT, mapel: 'Bahasa Indonesia', topic: 'Puisi Anak', inst: 'all', media: R('Penugasan Kurator', 'Dedi Hartono'), sub: R('Penugasan Kurator', 'Sari Lestari') },
  { s: 'Penugasan Kurator', j: 'smp', t: MA, mapel: 'Matematika', topic: 'Persamaan Linear', inst: 'all', media: R('Penugasan Kurator', 'Agus Pratama'), sub: R('Penugasan Kurator') },
  { s: 'Penugasan Kurator', j: 'smp', t: MA, mapel: 'Informatika', topic: 'Algoritma Pengurutan', inst: 'all', media: R('Penugasan Kurator'), sub: R('Penugasan Kurator') },
  { s: 'Penugasan Kurator', j: 'smp', t: VP, mapel: 'IPAS', topic: 'Tata Surya', inst: 'all', media: R('Penugasan Kurator', 'Wulan Sari'), sub: R('Penugasan Kurator', 'Budi Santoso') },
  { s: 'Penugasan Kurator', j: 'sma', t: MA, mapel: 'Informatika', topic: 'Basis Data', inst: 'all', media: R('Penugasan Kurator'), sub: R('Penugasan Kurator') },
  { s: 'Penugasan Kurator', j: 'sma', t: MA, mapel: 'Bahasa Indonesia', topic: 'Teks Argumentasi', inst: 'all', media: R('Penugasan Kurator', 'Fitri Handayani'), sub: R('Penugasan Kurator') },
  { s: 'Penugasan Kurator', j: 'sma', t: BT, mapel: 'Matematika', topic: 'Trigonometri', inst: 'all', media: R('Penugasan Kurator'), sub: R('Penugasan Kurator', 'Hendra Gunawan') },
  { s: 'Penugasan Kurator', j: 'sma', t: VP, mapel: 'IPAS', topic: 'Listrik Dinamis', inst: 'all', media: R('Penugasan Kurator'), sub: R('Penugasan Kurator') },
  // Diperiksa (6)
  { s: 'Diperiksa', j: 'sd', t: MA, mapel: 'Matematika', topic: 'Pengukuran Panjang', inst: 'all', media: R('Lolos', 'Rina Wijaya'), sub: R('Ditolak', 'Sari Lestari') },
  { s: 'Diperiksa', j: 'sd', t: MA, mapel: 'Bahasa Indonesia', topic: 'Menulis Surat', inst: 'all', media: R('Diperiksa', 'Dedi Hartono'), sub: R('Diperiksa', 'Sari Lestari') },
  { s: 'Diperiksa', j: 'smp', t: MA, mapel: 'Matematika', topic: 'Teorema Pythagoras', inst: 'all', media: R('Lolos', 'Agus Pratama'), sub: R('Diperiksa', 'Budi Santoso') },
  { s: 'Diperiksa', j: 'smp', t: BT, mapel: 'IPAS', topic: 'Ekosistem', inst: 'all', media: R('Diperiksa', 'Wulan Sari'), sub: R('Penugasan Kurator') },
  { s: 'Diperiksa', j: 'sma', t: MA, mapel: 'Informatika', topic: 'Kecerdasan Artifisial', inst: 'all', media: R('Lolos', 'Fitri Handayani'), sub: R('Lolos', 'Hendra Gunawan') },
  { s: 'Diperiksa', j: 'sma', t: VP, mapel: 'Matematika', topic: 'Statistika', inst: 'all', media: R('Diperiksa', 'Fitri Handayani'), sub: R('Ditolak', 'Hendra Gunawan') },
  // Diperiksa but pernah terbit (3)
  { s: 'Diperiksa', j: 'sd', t: MA, mapel: 'IPAS', topic: 'Perubahan Wujud Benda', inst: 'all', media: R('Lolos', 'Rina Wijaya'), sub: R('Diperiksa', 'Sari Lestari'), pt: true },
  { s: 'Diperiksa', j: 'smp', t: MA, mapel: 'Bahasa Indonesia', topic: 'Teks Prosedur', inst: 'all', media: R('Diperiksa', 'Agus Pratama'), sub: R('Diperiksa', 'Budi Santoso'), pt: true },
  { s: 'Diperiksa', j: 'sma', t: BT, mapel: 'Informatika', topic: 'Keamanan Siber', inst: 'all', media: R('Lolos', 'Fitri Handayani'), sub: R('Lolos', 'Hendra Gunawan'), pt: true },
  // Race: shown as Diperiksa, becomes Divalidasi on the server the first time impact is read
  { s: 'Diperiksa', j: 'smp', t: MA, mapel: 'IPAS', topic: 'Getaran dan Gelombang', inst: 'all', media: R('Lolos', 'Wulan Sari'), sub: R('Lolos', 'Budi Santoso') },
  // Locked statuses
  { s: 'Divalidasi', j: 'sd', t: MA, mapel: 'Matematika', topic: 'Operasi Bilangan Cacah', inst: 'all', media: R('Lolos', 'Rina Wijaya'), sub: R('Lolos', 'Sari Lestari') },
  { s: 'Divalidasi', j: 'smp', t: BT, mapel: 'Matematika', topic: 'Bilangan Berpangkat', inst: 'all', media: R('Lolos', 'Agus Pratama'), sub: R('Lolos', 'Budi Santoso') },
  { s: 'Perlu Perbaikan Akhir', j: 'sma', t: MA, mapel: 'Bahasa Indonesia', topic: 'Cerpen Kontemporer', inst: 'all', media: R('Lolos', 'Fitri Handayani'), sub: R('Lolos', 'Hendra Gunawan') },
  { s: 'Terbit', j: 'sd', t: BT, mapel: 'IPAS', topic: 'Tubuhku', inst: 'all', media: R('Lolos', 'Rina Wijaya'), sub: R('Lolos', 'Sari Lestari') },
  { s: 'Terbit', j: 'sma', t: MA, mapel: 'Matematika', topic: 'Limit Fungsi', inst: 'all', media: R('Lolos', 'Fitri Handayani'), sub: R('Lolos', 'Hendra Gunawan') },
  { s: 'Draf', j: 'sd', t: MA, mapel: 'Bahasa Indonesia', topic: 'Mengenal Huruf', inst: 'none' },
  { s: 'Draf', j: 'smp', t: VP, mapel: 'Informatika', topic: 'Pengantar Pemrograman', inst: 'none' },
  { s: 'Perlu Perbaikan', j: 'sd', t: MA, mapel: 'IPAS', topic: 'Cahaya dan Bayangan', inst: 'all', media: R('Lolos', 'Rina Wijaya'), sub: R('Ditolak', 'Sari Lestari') },
  { s: 'Perlu Perbaikan', j: 'sma', t: MA, mapel: 'IPAS', topic: 'Termodinamika', inst: 'all', media: R('Ditolak', 'Fitri Handayani'), sub: R('Lolos', 'Hendra Gunawan') },
  { s: 'Ditolak', j: 'smp', t: MA, mapel: 'Matematika', topic: 'Himpunan', inst: 'all', media: R('Ditolak', 'Agus Pratama'), sub: R('Ditolak', 'Budi Santoso') },
]

// Index of the "race" materi (status Diperiksa, right after the pernah_terbit trio).
export const RACE_ID = 'm-32'
export const FAIL_IDS = new Set(['m-05'])

function build(spec: Spec, i: number): Materi {
  const n = String(i + 1).padStart(2, '0')
  const id = `m-${n}`
  const none = (spec.inst ?? 'none') === 'none'
  const all = spec.inst === 'all'
  const part = spec.inst === 'part'
  const pick = (k: number) => institusi[(i + k) % institusi.length].id
  const hasProgram = all && ['Penugasan Kurator', 'Diperiksa'].includes(spec.s) && i % 3 === 0
  const pr = hasProgram ? programs.find((p) => p.jenjang_id === spec.j && p.tipe_materi === spec.t && p.lengkap) : undefined
  return {
    id,
    judul: `${spec.mapel}: ${spec.topic}`,
    tipe: spec.t,
    jenjang_id: spec.j,
    mapel: spec.mapel,
    status: spec.s,
    pernah_terbit: spec.pt ?? false,
    program_id: pr?.id ?? null,
    proses_bisnis: none ? null : i % 2 === 0 ? 'Kurasi' : 'Produksi',
    review: none ? null : 'Dalam CMS',
    institusi_satker_id: none ? null : pick(1),
    institusi_puskur_id: none ? null : part ? null : 'i-puskur',
    institusi_kurator_media_id: all ? pick(3) : null,
    institusi_kurator_substansi_id: all ? pick(5) : null,
    kelompok_instrumen_media_id: null,
    kelompok_instrumen_substansi_id: null,
    media: spec.media ?? R('Penugasan Institusi'),
    substansi: spec.sub ?? R('Penugasan Institusi'),
  }
}

export function seedMateri(): Materi[] {
  return specs.map(build)
}
