import { useState } from 'react'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isEmail = (v: string) => emailRe.test(v.trim())

export function validateEmail(v: string) {
  if (!v.trim()) return 'Email wajib diisi.'
  if (!isEmail(v)) return 'Format email tidak valid.'
}

export function validateDisplayName(v: string) {
  const t = v.trim()
  if (!t) return 'Nama tampilan wajib diisi.'
  if (t.length < 3) return 'Nama tampilan minimal 3 karakter.'
  if (t.length > 100) return 'Nama tampilan maksimal 100 karakter.'
}

/** Errors surface on blur or after a submit attempt — never per keystroke. */
export function useReveal<F extends string>() {
  const [touched, setTouched] = useState<Partial<Record<F, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  return {
    touch: (field: F) => setTouched((t) => ({ ...t, [field]: true })),
    submit: () => setSubmitted(true),
    shows: (field: F) => submitted || !!touched[field],
  }
}
