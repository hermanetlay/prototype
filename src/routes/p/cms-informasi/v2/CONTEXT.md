# CMS Informasi — v2

Initiative context: [../CONTEXT.md](../CONTEXT.md). RFC:
`learning-platform-be/doc/RFC_CMS_INFORMASI.md` (feature branch, not on main).
Starts from v1 variant A ("Tabel + halaman form"); v1 stays frozen.

**Question this prototype answers:** Does a multi-select dropdown work better
than checkboxes for Jenjang in the create/edit form? It answers v1's review
question "Jenjang/layanan as checkboxes: fine for 6 jenjang, ok for more?".

## Scope
Route `/p/cms-informasi/v2`. One variant only (no switcher); list + filters,
create, edit (`?form=new|<id>`), delete with confirmation, thumbnail upload and
error cases are unchanged from v1 A. URL state: `q`, `kategori`, `layanan`,
`jenjang_id`, `status_tayang`, `homepage=true`, `page`, `form`, `simulasi=error`
(also toggled from the floating "Simulasi error" button).

## Change from v1
- Jenjang in the form is a `react-select` multi dropdown (`-components/JenjangSelect.tsx`, copied from cms-instrumen-kurasi and adapted): chips, "Pilih jenjang", "Jenjang tidak ditemukan", loading state, red border when `jenjang_ids` has an error, menu opens up or down by space.
- Rules unchanged: at least 1 jenjang, unique ids (`-logic/rules.ts`, key `jenjang_ids`).
- Layanan stays a checkbox group; Highlight stays a checkbox; the list's Jenjang filter was already a dropdown.
- Variants B and C and the variant switcher are removed.

## Decisions
- Single variant, so the bottom bar keeps only the error simulation.
- Everything else from v1 (validation shared by form and MSW handler, expired-date warning, thumbnail upload via fake endpoint, seed dates from today) is kept.

## Open questions
- Is a dropdown slower than checkboxes when an editor picks most jenjang? There is no "pilih semua".
- Are chips readable when many jenjang are chosen?

## What to watch for in review
- Can an editor see all selected jenjang at a glance, and remove one easily?
- Is the error state (no jenjang) clear after Simpan?
- Does the menu stay visible near the bottom of the page?

## Mock API
`/api/cms-informasi/v2/*`, defined in `-api/handlers.ts`: `GET/POST /informasi`,
`GET/PUT/DELETE /informasi/:id`, `GET /jenjang`, `POST /files/upload`. The
signed-in editor is always Budi Santoso.
