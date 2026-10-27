'use client'

import { useEffect, useState } from 'react'
import { API_BASE_URL, SENTIMENT_API_BASE_URL } from '@/lib/api-config'
import { onBackendWaking, warmUp } from '@/lib/api-fetch'

/** Wakes the APIs as soon as the site loads, and explains the wait while they start. */
export default function BackendWarmup() {
  const [waking, setWaking] = useState(false)

  useEffect(() => {
    warmUp(API_BASE_URL)
    warmUp(SENTIMENT_API_BASE_URL)
    return onBackendWaking(setWaking)
  }, [])

  if (!waking) return null
  return (
    <div
      role="status"
      className="surface fixed bottom-5 left-1/2 z-[1001] flex -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground"
    >
      <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-b-2 border-brand" />
      Waking up the server, this can take up to a minute…
    </div>
  )
}
