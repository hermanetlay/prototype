import { useState, type FormEvent } from 'react'
import { Card, CardHeader, CardBody } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Field, Input } from '@/shared/ui/Field'
import { validateEmail } from './validation'

export function LookupCard({
  initialEmail = '',
  pending = false,
  failed = false,
  onSubmit,
  onRetry,
}: {
  initialEmail?: string
  pending?: boolean
  failed?: boolean
  onSubmit: (email: string) => void
  onRetry?: () => void
}) {
  const [email, setEmail] = useState(initialEmail)
  // An address that arrived via the URL but is malformed shows its error at once.
  const [revealed, setRevealed] = useState(initialEmail !== '')
  const error = revealed ? validateEmail(email) : undefined

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setRevealed(true)
    if (!validateEmail(email)) onSubmit(email.trim())
  }

  return (
    <Card>
      <CardHeader
        title="Cek Email Pengguna"
        subtitle="Masukkan email untuk menambah pengguna baru atau memperbarui pengguna yang sudah terdaftar."
      />
      <CardBody>
        <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-4">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Field label="Email" htmlFor="lookup-email" error={error}>
                <Input
                  id="lookup-email"
                  type="email"
                  autoComplete="off"
                  placeholder="nama@belajar.id"
                  value={email}
                  invalid={!!error}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => email && setRevealed(true)}
                  disabled={pending}
                />
              </Field>
            </div>
            <Button type="submit" className="mt-7" disabled={pending}>
              {pending ? 'Memeriksa…' : 'Cek Email'}
            </Button>
          </div>

          {failed ? (
            <div
              role="alert"
              className="flex items-center justify-between rounded-xl bg-critical-subdued px-4 py-3 text-body-sm text-text-critical"
            >
              <span>Gagal memeriksa email. Periksa koneksi lalu coba lagi.</span>
              <button
                type="button"
                onClick={onRetry}
                className="font-semibold underline underline-offset-2"
              >
                Coba lagi
              </button>
            </div>
          ) : null}
        </form>
      </CardBody>
    </Card>
  )
}
