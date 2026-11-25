import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { controlClass } from '@/shared/ui/Field'
import type { Program } from '../-data/seed'
import type { AssignForm } from '../-logic/useAssignForm'
import { PROGRAM_LIMIT, programQuery } from '../-queries'
import { Alert } from './Modal'

const summary = (p: Program) => `${p.values?.proses_bisnis} · ${p.values?.review}`

/** Searchable program picker (autocomplete). Program is optional: clearing it means "Tanpa program". */
export function ProgramCombobox({ form }: { form: AssignForm }) {
  const listId = useId()
  const wrap = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [term, setTerm] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setTerm(text.trim()), 250)
    return () => clearTimeout(t)
  }, [text])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const q = useQuery({
    ...programQuery({ jenjang_id: form.jenjangId, tipe: form.tipes[0], q: term }),
    enabled: !form.mixedTipe && !!form.jenjangId && open,
  })

  if (form.mixedTipe) {
    return (
      <Alert tone="informational" title="Program tidak tersedia">
        Pilihan mencakup lebih dari satu tipe materi ({form.tipes.join(', ')}). Isi nilai secara manual.
      </Alert>
    )
  }
  if (!form.jenjangId) return <p className="text-body-sm text-text-subdued">Pilih jenjang dulu.</p>

  const list = q.data?.data ?? []
  const total = q.data?.total ?? 0
  const selected = form.program
  const searching = text.trim() !== term || (q.isFetching && !q.data)

  const pick = (p: Program | null) => {
    form.setProgram(p)
    setText('')
    setTerm('')
    setOpen(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, Math.max(list.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && list[active]) {
        e.preventDefault()
        pick(list[active])
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.stopPropagation()
        setOpen(false)
      }
    }
  }

  return (
    <div ref={wrap} className="relative flex flex-col gap-1">
      <div className="relative">
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className={`${controlClass()} pr-16`}
          placeholder={selected ? '' : 'Tanpa program. Ketik untuk mencari program'}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
        {selected && !text ? (
          <div className="pointer-events-none absolute inset-y-0 left-3 right-16 flex flex-col justify-center overflow-hidden">
            <span className="truncate text-body-sm font-semibold leading-tight">{selected.nama}</span>
            <span className="truncate text-helper leading-tight text-text-subdued">{summary(selected)}</span>
          </div>
        ) : null}
        {selected ? (
          <button
            type="button"
            aria-label="Hapus program"
            className="absolute inset-y-0 right-8 px-1 text-text-subdued hover:text-text"
            onClick={() => pick(null)}
          >
            ×
          </button>
        ) : null}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-subdued">▾</span>
      </div>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="relative mt-1 max-h-60 overflow-auto rounded-md border border-border bg-surface py-1 shadow-lg"
        >
          <li
            role="option"
            aria-selected={!selected}
            className="cursor-pointer px-3 py-2 text-body-sm text-text-subdued hover:bg-surface-selected"
            onMouseDown={(e) => {
              e.preventDefault()
              pick(null)
            }}
          >
            Tanpa program
          </li>
          {q.isError ? (
            <li className="px-3 py-2 text-body-sm text-text-critical">
              Gagal memuat program.{' '}
              <button className="font-semibold text-interactive" onMouseDown={(e) => { e.preventDefault(); q.refetch() }}>
                Coba lagi
              </button>
            </li>
          ) : searching && list.length === 0 ? (
            <li className="px-3 py-2 text-body-sm text-text-subdued">Memuat program...</li>
          ) : list.length === 0 ? (
            <li className="px-3 py-2 text-body-sm text-text-subdued">
              Program tidak ditemukan.{term === '' ? ' Tambah di menu Program Penugasan.' : ''}
            </li>
          ) : (
            list.map((p, i) => (
              <li
                key={p.id}
                role="option"
                aria-selected={selected?.id === p.id}
                className={`cursor-pointer px-3 py-2 ${i === active ? 'bg-surface-selected' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(p)
                }}
              >
                <span className="block text-body-sm font-semibold">{p.nama}</span>
                <span className="text-helper text-text-subdued">{summary(p)}</span>
              </li>
            ))
          )}
          {total > PROGRAM_LIMIT ? (
            <li className="border-t border-border px-3 py-2 text-helper text-text-subdued">Ketik untuk mempersempit</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}
