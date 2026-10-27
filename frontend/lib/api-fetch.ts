// The APIs run on a free host that sleeps when idle and takes up to about a minute to wake.
// Requests sent meanwhile fail at the network level (or get a 502/503/504 from the host), so
// apiFetch retries them until the API answers, and tells listeners (the banner) it is waking.

const RETRY_STATUSES = new Set([502, 503, 504])
const DEFAULT_TIMEOUT_MS = 120_000

type WakingListener = (waking: boolean) => void
const listeners = new Set<WakingListener>()
let pendingWakes = 0

function setWaking(delta: number) {
  const before = pendingWakes > 0
  pendingWakes = Math.max(0, pendingWakes + delta)
  const after = pendingWakes > 0
  if (before !== after) listeners.forEach((listener) => listener(after))
}

/** Subscribe to "an API is waking up"; returns the unsubscribe function. */
export function onBackendWaking(listener: WakingListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * fetch() that keeps retrying while the API is waking up (network errors and 502/503/504), for up
 * to `timeoutMs`. Other responses, including 4xx/500, are returned as-is.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
  { timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch, sleepImpl = sleep } = {}
): Promise<Response> {
  const deadline = Date.now() + timeoutMs
  let delay = 1_000
  let waking = false
  try {
    for (;;) {
      try {
        const response = await fetchImpl(input, init)
        if (!RETRY_STATUSES.has(response.status) || Date.now() >= deadline) return response
      } catch (error) {
        if (init?.signal?.aborted || Date.now() >= deadline) throw error
      }
      if (!waking) {
        waking = true
        setWaking(1)
      }
      await sleepImpl(delay)
      delay = Math.min(delay * 2, 8_000)
    }
  } finally {
    if (waking) setWaking(-1)
  }
}

/** Fire-and-forget request that starts waking an API before anyone needs it. */
export function warmUp(baseUrl: string) {
  // no-cors: the response is irrelevant, so no CORS headers are needed for the ping to land
  fetch(`${baseUrl}/docs`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {})
}
