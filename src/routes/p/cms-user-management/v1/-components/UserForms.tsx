import { useState, type FormEvent, type ReactNode } from 'react'
import { Card, CardHeader, CardBody } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Field, Input, controlClass } from '@/shared/ui/Field'
import { toast } from '@/shared/ui/Toast'
import { roles, type Organization, type Role, type User } from '../-data/seed'
import { ApiError, useCreateUser, useUpdateUser } from '../-queries'
import { OrgSelect } from './OrgSelect'
import { useReveal, validateDisplayName, validateEmail } from './validation'

const linkClass = 'text-body-sm font-semibold text-interactive hover:underline'

function FormFrame({
  title,
  subtitle,
  badge,
  onSubmit,
  pending,
  footerLink,
  children,
}: {
  title: string
  subtitle: ReactNode
  badge: ReactNode
  onSubmit: (e: FormEvent) => void
  pending: boolean
  footerLink: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} actions={badge} />
      <CardBody>
        <form onSubmit={onSubmit} noValidate className="flex max-w-xl flex-col gap-5">
          {children}
          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan…' : 'Simpan'}
            </Button>
            {footerLink}
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

// ---------------------------------------------------------------- insert

type InsertField = 'displayName' | 'role' | 'organizationIds'

export function InsertForm({
  email,
  organizations,
  onChangeEmail,
  onSaved,
}: {
  email: string
  organizations: Organization[]
  onChangeEmail: () => void
  onSaved: (user: User) => void
}) {
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [organizationIds, setOrganizationIds] = useState<string[]>([])
  const reveal = useReveal<InsertField>()
  const create = useCreateUser()

  const errors: Record<InsertField, string | undefined> = {
    displayName: validateDisplayName(displayName),
    role: role ? undefined : 'Peran wajib dipilih.',
    organizationIds: organizationIds.length ? undefined : 'Pilih minimal 1 organisasi.',
  }
  const shown = (f: InsertField) => (reveal.shows(f) ? errors[f] : undefined)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    reveal.submit()
    if (Object.values(errors).some(Boolean) || !role) return
    create.mutate(
      { email, displayName: displayName.trim(), role, organizationIds },
      {
        onSuccess: (user) => {
          toast('Pengguna berhasil ditambahkan')
          onSaved(user)
        },
        onError: (err) =>
          toast(err instanceof ApiError ? err.message : 'Gagal menyimpan pengguna.', 'critical'),
      },
    )
  }

  return (
    <FormFrame
      title="Tambah Pengguna Baru"
      subtitle="Email ini belum terdaftar. Lengkapi data untuk membuat pengguna."
      badge={<Badge tone="informational">Pengguna baru</Badge>}
      onSubmit={submit}
      pending={create.isPending}
      footerLink={
        <button type="button" onClick={onChangeEmail} className={linkClass}>
          Batal
        </button>
      }
    >
      <Field label="Email" htmlFor="email">
        <div className="flex items-center gap-3">
          <Input id="email" value={email} readOnly />
          <button type="button" onClick={onChangeEmail} className={`${linkClass} shrink-0`}>
            Ganti email
          </button>
        </div>
      </Field>

      <Field label="Nama tampilan" htmlFor="displayName" error={shown('displayName')}>
        <Input
          id="displayName"
          value={displayName}
          maxLength={120}
          invalid={!!shown('displayName')}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => reveal.touch('displayName')}
        />
      </Field>

      <Field label="Peran" htmlFor="role" error={shown('role')}>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          onBlur={() => reveal.touch('role')}
          className={controlClass(!!shown('role'))}
        >
          <option value="" disabled hidden>
            Pilih peran
          </option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Organisasi" htmlFor="organizations" error={shown('organizationIds')}>
        <OrgSelect
          inputId="organizations"
          organizations={organizations}
          value={organizationIds}
          invalid={!!shown('organizationIds')}
          onChange={setOrganizationIds}
          onBlur={() => reveal.touch('organizationIds')}
        />
      </Field>
    </FormFrame>
  )
}

// ---------------------------------------------------------------- update

type UpdateField = 'email' | 'displayName' | 'organizationIds'

export function UpdateForm({
  user,
  organizations,
  onLookupAnother,
  onSaved,
}: {
  user: User
  organizations: Organization[]
  onLookupAnother: () => void
  onSaved: (user: User) => void
}) {
  const [email, setEmail] = useState(user.email)
  const [displayName, setDisplayName] = useState(user.displayName)
  const [organizationIds, setOrganizationIds] = useState(user.organizationIds)
  const [serverError, setServerError] = useState<Partial<Record<UpdateField, string>>>({})
  const reveal = useReveal<UpdateField>()
  const update = useUpdateUser(user.id)

  const errors: Record<UpdateField, string | undefined> = {
    email: validateEmail(email),
    displayName: validateDisplayName(displayName),
    organizationIds: organizationIds.length ? undefined : 'Pilih minimal 1 organisasi.',
  }
  const shown = (f: UpdateField) =>
    serverError[f] ?? (reveal.shows(f) ? errors[f] : undefined)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    reveal.submit()
    if (Object.values(errors).some(Boolean)) return
    update.mutate(
      { email: email.trim(), displayName: displayName.trim(), organizationIds },
      {
        onSuccess: (saved) => {
          toast('Pengguna berhasil diperbarui')
          onSaved(saved)
        },
        onError: (err) => {
          if (err instanceof ApiError && err.field === 'email') {
            setServerError({ email: err.message })
          } else {
            toast(err instanceof ApiError ? err.message : 'Gagal menyimpan pengguna.', 'critical')
          }
        },
      },
    )
  }

  return (
    <FormFrame
      title="Ubah Pengguna"
      subtitle={`Email ini sudah terdaftar · ID ${user.id}`}
      badge={<Badge tone="success">Terdaftar</Badge>}
      onSubmit={submit}
      pending={update.isPending}
      footerLink={
        <button type="button" onClick={onLookupAnother} className={linkClass}>
          Cari email lain
        </button>
      }
    >
      <Field label="Email" htmlFor="email" error={shown('email')}>
        <Input
          id="email"
          type="email"
          value={email}
          invalid={!!shown('email')}
          onChange={(e) => {
            setEmail(e.target.value)
            setServerError((s) => ({ ...s, email: undefined }))
          }}
          onBlur={() => reveal.touch('email')}
        />
      </Field>

      <Field label="Nama tampilan" htmlFor="displayName" error={shown('displayName')}>
        <Input
          id="displayName"
          value={displayName}
          maxLength={120}
          invalid={!!shown('displayName')}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => reveal.touch('displayName')}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-body-sm font-semibold">Peran</span>
        <span>
          <Badge tone="informational">{user.role}</Badge>
        </span>
      </div>

      <Field label="Organisasi" htmlFor="organizations" error={shown('organizationIds')}>
        <OrgSelect
          inputId="organizations"
          organizations={organizations}
          value={organizationIds}
          fixedIds={user.organizationIds}
          invalid={!!shown('organizationIds')}
          onChange={setOrganizationIds}
          onBlur={() => reveal.touch('organizationIds')}
        />
      </Field>
    </FormFrame>
  )
}
