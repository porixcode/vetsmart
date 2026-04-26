interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()
const WINDOW_MS = 60_000

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, WINDOW_MS)

export function rateLimit(
  key: string,
  maxAttempts: number,
  windowMs = WINDOW_MS,
): { ok: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: maxAttempts - 1, resetIn: windowMs }
  }

  if (entry.count >= maxAttempts) {
    return { ok: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  entry.count++
  return { ok: true, remaining: maxAttempts - entry.count, resetIn: entry.resetAt - now }
}
