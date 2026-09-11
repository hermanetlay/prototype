export type Role = 'Admin Institusi' | 'Kurator' | 'Kreator'

export const roles: Role[] = ['Admin Institusi', 'Kurator', 'Kreator']

export type Organization = { id: string; name: string }

export type User = {
  id: string
  email: string
  displayName: string
  role: Role
  organizationIds: string[]
}

const orgNames = [
  'Dinas Pendidikan Provinsi DKI Jakarta',
  'Dinas Pendidikan Provinsi Jawa Barat',
  'Dinas Pendidikan Provinsi Jawa Tengah',
  'Dinas Pendidikan Provinsi Jawa Timur',
  'Dinas Pendidikan Kota Bandung',
  'Dinas Pendidikan Kota Surabaya',
  'Dinas Pendidikan Kota Yogyakarta',
  'Dinas Pendidikan Kabupaten Sleman',
  'SMA Negeri 1 Jakarta',
  'SMA Negeri 3 Bandung',
  'SMA Negeri 5 Surabaya',
  'SMA Negeri 8 Yogyakarta',
  'SMK Negeri 2 Semarang',
  'SMK Negeri 4 Malang',
  'SMP Negeri 1 Bogor',
  'SMP Negeri 2 Depok',
  'SMP Negeri 5 Medan',
  'SMP Negeri 12 Makassar',
  'SD Negeri 1 Denpasar',
  'SD Negeri 3 Palembang',
  'SD Negeri 7 Balikpapan',
  'MAN 2 Kota Padang',
  'MTs Negeri 1 Pontianak',
  'Balai Guru Penggerak Jawa Barat',
  'Balai Guru Penggerak Sulawesi Selatan',
  'Pusat Kurikulum dan Pembelajaran',
  'Pusat Asesmen Pendidikan',
  'Tim Konten Ruang Murid',
  'Mitra Penerbit Erlangga',
  'Mitra Penerbit Yudhistira',
]

export const organizations: Organization[] = orgNames.map((name, i) => ({
  id: `org_${String(i + 1).padStart(2, '0')}`,
  name,
}))

export const seedUsers: User[] = [
  {
    id: 'u_001',
    email: 'rina.wulandari@belajar.id',
    displayName: 'Rina Wulandari',
    role: 'Kurator',
    organizationIds: ['org_01', 'org_09', 'org_26'],
  },
  {
    id: 'u_002',
    email: 'dimas.prasetyo@belajar.id',
    displayName: 'Dimas Prasetyo',
    role: 'Kreator',
    organizationIds: ['org_28'],
  },
  {
    id: 'u_003',
    email: 'sari.handayani@belajar.id',
    displayName: 'Sari Handayani',
    role: 'Admin Institusi',
    organizationIds: ['org_10'],
  },
]
