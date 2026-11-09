const B = import.meta.env.VITE_API || 'http://localhost:8000'
export const token = {
  get: () => localStorage.getItem('fmk_t'),
  set: t => (t ? localStorage.setItem('fmk_t', t) : localStorage.removeItem('fmk_t')),
}
export async function api(path, { method = 'GET', body, form } = {}) {
  const h = {}
  if (token.get()) h.Authorization = 'Bearer ' + token.get()
  let b
  if (form) b = new URLSearchParams(form)
  else if (body) { h['Content-Type'] = 'application/json'; b = JSON.stringify(body) }
  const r = await fetch(B + path, { method, headers: h, body: b })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(typeof e.detail === 'string' ? e.detail : 'Data belum lengkap atau tidak valid.')
  }
  return r.json()
}