import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Sign in with Google OAuth.
 * Enable the Google provider in Supabase Dashboard → Authentication → Providers
 * and add your Google OAuth credentials to use this.
 * Returns an error message when the redirect could not be started.
 */
export async function signInWithGoogle(next?: string): Promise<string | null> {
  const supabase = createClient()
  const callback = new URL('/auth/callback', window.location.origin)
  if (next) callback.searchParams.set('next', next)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callback.toString(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  return error?.message ?? null
}

/**
 * Whether the Google provider is enabled in Supabase. Supabase answers a disabled provider with a
 * raw JSON error page, so the button is only shown once the project's auth settings confirm it.
 */
export function useGoogleAuthEnabled(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    let cancelled = false
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (!cancelled) setEnabled(Boolean(settings?.external?.google))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return enabled
}
