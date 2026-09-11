# Kelola Pengguna (cms-user-management) — v1

**Question this prototype answers:** can an admin add or update a user from one
email-first page without creating duplicates, and do they understand — without
explanation — that saved organizations cannot be removed?

**What to watch for in review**
- Is the switch from lookup → insert mode vs. update mode obvious?
- Do the fixed organization chips read as "locked" on their own?
- After saving a new user, does the flip into update mode make sense?

## Flow

Single page, three states.

### 1. Lookup
- Email input + **Cek Email** button.
- Email format is validated client-side; an invalid address never hits the API.
- Button shows a loading state while the lookup runs.
- Network/500 error → inline alert under the input with **Coba lagi**.
- Loading the page with `?email=` runs the lookup automatically.

### 2a. Insert mode — email not registered

| Field | Rule |
|---|---|
| Email | Prefilled, **locked**. **Ganti email** returns to lookup. |
| Display name | Required, trimmed, 3–100 chars. |
| Role | Required, **no default**. Admin Institusi · Kurator · Kreator. |
| Organization | Required, ≥ 1. Multi-select. |

### 2b. Update mode — email registered

The lookup returns the user's `id`; the record is keyed by `id`, not email.

| Field | Rule |
|---|---|
| Email | Prefilled, **editable**, required, email format. |
| Display name | Required, trimmed, 3–100 chars. |
| Role | Read-only **badge**. Not editable. |
| Organization | **Append-only.** Saved orgs are fixed (no ×). Orgs added this session stay removable until saved. |

### 3. After save
- Success toast ("Pengguna berhasil ditambahkan" / "…diperbarui").
- Page **stays in update mode** for the saved user: after an insert it flips to
  update mode, role becomes a badge and the chosen orgs become fixed; after an
  update the newly added orgs become fixed.
- URL `?email=` follows the **saved** email (changes only after a successful save).
- **Cari email lain** clears the URL and returns to lookup.

### Validation & errors
- Field errors appear on blur and on submit, never per keystroke.
- **Simpan** is never disabled; clicking it reveals any errors.
- Update mode, email already used by another user → API `409` → inline error
  under Email: "Email sudah digunakan pengguna lain."

## Domain decisions
- **Role belongs to the user**, one per user. It is not a per-organization role;
  organizations are plain memberships.
- **Role does not constrain organizations.** Every role takes 1..n orgs.
- **Organizations are a small, stable list** (10–50). Loaded once, filtered
  client-side. No server-side search.
- **Append-only is enforced by the API too**, not just the UI: a PATCH that drops
  a saved org is rejected with `422`.

## Accepted trade-offs
- **The email sits in the URL query string** (`?email=`), so every state is
  shareable. This leaks personal data into browser history and logs; accepted
  for the prototype, must be revisited for production (e.g. key by `userId`).
- Plain component state for the form, no form library — the prototype tests the
  interaction, not the form stack.

## Mock API

All under `/api/cms-user-management/v1`, in-memory, resets on reload.

| Method | Path | Result |
|---|---|---|
| GET | `/users/lookup?email=` | `{ status: 'new' }` or `{ status: 'registered', user }` |
| GET | `/organizations` | `Organization[]` (~30) |
| POST | `/users` | `201 User`; `409` if email exists |
| PATCH | `/users/:id` | `200 User`; `409` email taken; `422` saved org removed |

Test hooks:
- Emails containing `error` (e.g. `error@belajar.id`) make the lookup return `500`.
- Seeded users (use any to trigger update mode, or the 409 conflict):
  `rina.wulandari@belajar.id` (Kurator), `dimas.prasetyo@belajar.id` (Kreator),
  `sari.handayani@belajar.id` (Admin Institusi).

## Open questions
- Production URL keying — `?email=` vs `?userId=`.
- Should role ever be changeable, and by whom?
- Is there a way to remove an organization at all (a separate, audited flow)?
