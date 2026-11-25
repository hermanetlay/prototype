# CMS Informasi

Initiative-level context. Applies to every version; each version's own
`CONTEXT.md` records what that iteration tried and decided.

Source: `learning-platform-be/doc/RFC_CMS_INFORMASI.md` (Draft, 2026-11-10).

## Problem
*Informasi* (public banners and announcements) are managed through a Google
Sheet plus a batch job that an `admin_super` triggers. Editors need sheet
access, errors show up in a cell minutes later, nothing records who changed
what, and there is no delete. The RFC replaces this with CRUD in the CMS and
immediate validation. The prototype asks how an `admin_super` should find,
create, edit and delete informasi, and whether the derived status, the homepage
order and the "tanggal selesai >= hari ini" rule are understandable.

## Glossary
| Term (UI) | Meaning |
|---|---|
| Informasi | A banner/announcement shown on the public Ruang Murid site (`informasi` row). |
| Nama (tidak muncul di web) | `nama`: internal unique name, max 255. Duplicate gives 409. |
| Judul | `judul`: public title, max 255. |
| Thumbnail | Banner image URL, only from the CMS bucket host. JPEG/PNG, max 2 MB. |
| Layanan | `Sumber Belajar`, `Latihan Soal`, `Kelas Belajar` (the last is a prototype addition, not in RFC 6.1); at least 1. |
| Jenjang | School level (SD, SMP, ...); at least 1. |
| Kategori | Kebijakan, Fitur, Webinar, Panduan, Rekomendasi Materi, Program dan Kegiatan, Lainnya. |
| Highlight | `pin_informasi`: pinned first in the non-homepage public list. |
| Urutan Beranda | `homepage_order`, optional 1-32767. Empty = not on homepage. Duplicates allowed. |
| Status | Stored: `Aktif` / `Inaktif`. |
| Status Tayang | Derived, never stored or edited: Tayang / Terjadwal / Berakhir / Inaktif. |
| Dibuat oleh / Diubah oleh | `{nama, email}`; omitted for old sheet-synced rows ("Data lama (dari Sheet)"). |

## Business rules
1. **Status tayang** (Asia/Jakarta): `Inaktif` if status is Inaktif; else `Terjadwal` if mulai > today; else `Berakhir` if selesai < today; else `Tayang`.
2. All fields are required except `homepage_order`. `layanan` and `jenjang_ids` have min 1 and must be unique. `url` is http(s).
3. `tanggal_selesai >= tanggal_mulai` **and** `tanggal_selesai >= today`, on every create **and** update. An expired item cannot be saved until its end date moves to today or later (housekeeping edits such as setting Inaktif are blocked). Delete is the way out.
4. `nama` is unique: 409 `nama informasi sudah digunakan`.
5. Unknown jenjang id: 400.
6. Thumbnail: upload via `files/upload` (folder `informasi`), JPEG/PNG only (400 `Tipe file tidak di support`), max 2 MB (413 `Ukuran file melebihi batas yang diizinkan`); create/update accept only bucket-host URLs.
7. Delete is a hard delete (archived server-side); only `admin_super`.
8. List: filters `q`, `kategori`, `layanan`, `jenjang_id`, `status_tayang`, `homepage`; default sort `updated_at DESC, id`; with `homepage=true` sort `homepage_order ASC, tanggal_mulai DESC, id`.
9. Public homepage ties (same `homepage_order`, same `tanggal_mulai`) have no tiebreaker, so duplicates are ambiguous.

## Versions
| Version | Status | Date | What it explores |
|---|---|---|---|
| [v1](v1/CONTEXT.md) | review | 2026-11-17 | Three structures for the same flows: table + form page, table + side drawer with live preview, board per status tayang. **Variant A chosen.** |
| [v2](v2/CONTEXT.md) | draft | 2026-11-25 | Variant A only; Jenjang in the form becomes a multi-select dropdown instead of checkboxes. |

## Decision log
| Date | Decision | Why |
|---|---|---|
| 2026-11-10 | `admin_super` only, hard delete, `PUT` with full body | RFC section 3 |
| 2026-11-10 | Keep `tanggal_selesai >= today` on update | Matches the sheet script; RFC resolved question 2 |
| 2026-11-10 | `homepage_order` not unique | Same as the public endpoint today; RFC resolved question 4 |
| 2026-11-10 | Show editor identity | RFC resolved question 5 |
| 2026-11-17 | Prototype v1 built with 3 variants | Compare how well each makes status tayang, homepage order and the expired-date block understandable |
| 2026-11-17 | Add layanan `Kelas Belajar` in the prototype | Requested change; deviates from RFC 6.1 (`informasi_layanan`), so the RFC and OpenAPI enum need updating |
| 2026-11-17 | Variant A (table + full-page form) chosen; v1 frozen | A has the correct heading on top of the filter (heading → filter → table), matching the current CMS pattern. Next iteration (v2) starts from A only |
| 2026-11-25 | Prototype v2: Jenjang in the form is a multi-select dropdown | Requested change; tests whether it beats checkboxes when there are more jenjang. Layanan stays checkboxes |

## Open questions
- Does the expired-date block need relaxing (for example allow setting Inaktif)? The RFC says no; v1 only makes the reason visible.
- Should duplicate `homepage_order` be warned about in the form, not only on the board?
