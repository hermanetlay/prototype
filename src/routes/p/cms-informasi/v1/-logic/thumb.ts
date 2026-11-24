import { PLACEHOLDER_COLORS } from '../-data/seed'

/** CDN url -> object URL of the file the editor just picked (this session only). */
const localPreviews = new Map<string, string>()
export const rememberPreview = (cdnUrl: string, file: File) =>
  localPreviews.set(cdnUrl, URL.createObjectURL(file))

const cache = new Map<string, string>()

/** The prototype never loads the CDN host: map every url to a local picture. */
export function thumbSrc(url: string, label: string): string {
  const local = localPreviews.get(url)
  if (local) return local
  if (!url) return ''
  const key = `${url}|${label}`
  const hit = cache.get(key)
  if (hit) return hit
  let h = 0
  for (const c of url) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const { bg, fg } = PLACEHOLDER_COLORS[h % PLACEHOLDER_COLORS.length]
  const text = (label || 'Thumbnail').slice(0, 30).replace(/[<>&"]/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="${bg}"/><text x="160" y="96" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="${fg}">${text}</text></svg>`
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  cache.set(key, src)
  return src
}
