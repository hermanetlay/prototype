import { useSyncExternalStore } from 'react'

export type Sim = { e2Error: boolean; e1Forbidden: boolean; e1BadRequest: boolean; program409: boolean; programListError: boolean }

let state: Sim = { e2Error: false, e1Forbidden: false, e1BadRequest: false, program409: false, programListError: false }
const listeners = new Set<() => void>()

export const getSim = () => state
export function setSim(patch: Partial<Sim>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
export function useSim() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  )
}
