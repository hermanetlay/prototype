# CMS User Management — Kelola Pengguna

Initiative-level context. Applies to every version under this folder; each
version's own `CONTEXT.md` records what that iteration tried and decided.

## Problem

Ruang Murid CMS admins need to onboard and maintain CMS users — the people who
create, curate and administer learning content — without two failure modes:

1. **Duplicate accounts.** The same person registered twice under the same
   email, splitting their work and permissions.
2. **Silent loss of access.** An edit that accidentally drops a user's
   organization membership, cutting them off from content they work on.

The initiative explores an **email-first** flow: the admin always starts from an
email address, and the system decides whether this is a new user or an existing
one before any form is shown.

## Glossary

| Term (UI) | Meaning |
|---|---|
| **Pengguna** | A CMS user account. |
| **Email** | Unique login identity, compared case-insensitively. The entry point for every add/update. |
| **ID** | Stable internal identifier (`u_…`). Once a user exists, the record is keyed by ID, not email. |
| **Nama tampilan** | Display name shown across the CMS. |
| **Peran** | The user's role. One per user, belongs to the user — not per organization. |
| **Admin Institusi** | Role: administers an institution's presence in the CMS. *(Working definition — confirm.)* |
| **Kurator** | Role: reviews and curates content. *(Working definition — confirm.)* |
| **Kreator** | Role: creates content. *(Working definition — confirm.)* |
| **Organisasi** | An institution or unit a user belongs to (schools, Dinas, Balai, partner publishers). Small, stable list: 10–50. |
| **Mode tambah / mode ubah** | Insert mode (email not registered) / update mode (email registered). |

## Business rules

These hold across versions. A version that breaks one must say so explicitly in
its own `CONTEXT.md`.

1. **Email is unique**, case-insensitive. The API rejects a duplicate with `409`.
2. **Role is chosen once**, at creation, with no default. It is not editable afterwards.
3. **Role does not constrain organizations.** Every role takes one or more.
4. **Every user has at least one organization.**
5. **Organization membership is append-only.** Saved memberships cannot be
   removed through this flow; enforced by the API (`422`), not only the UI.
6. **An existing user's email can change**, because the record is keyed by ID.

## Versions

| Version | Status | Date | What it explores |
|---|---|---|---|
| [v1](v1/CONTEXT.md) | review | 2026-09-11 | Single page: email lookup → insert or update mode; append-only org multi-select; flips to update mode after save. |

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-09-11 | Email-first lookup before any form | Prevents duplicates by construction. |
| 2026-09-11 | Insert mode locks the email; update mode keys by ID and lets email change | The lookup email is the identity until an ID exists. |
| 2026-09-11 | Email conflict checked on save only (409), no live check | The backend must enforce it anyway; keeps the page to one async flow. |
| 2026-09-11 | Organizations loaded once, filtered client-side | List is small (10–50) and won't grow much. |
| 2026-09-11 | Role belongs to the user and is immutable after creation | Role is an identity attribute, not a membership attribute. |
| 2026-09-11 | Page state in the URL as `?email=` | Every state shareable in review. Accepted privacy trade-off for the prototype only. |

## Open questions

- **Who is the admin?** A platform super-admin, or an Admin Institusi managing
  only their own institution's users? This decides which organizations they can
  assign.
- **Role changes.** If a role is ever wrong, who fixes it, and through what flow?
- **Removing an organization.** Is there a separate, audited path, or is
  membership truly permanent?
- **Production URL keying.** `?email=` puts personal data in URLs; production
  likely needs `?userId=` or no URL state.
- **Not yet covered:** deactivating or deleting users, invitations and email
  notifications, bulk import, and an audit trail of who changed what.
