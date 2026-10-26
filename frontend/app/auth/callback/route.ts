import { createClient } from '@/lib/supabase/server'
import { destinationAfterLogin } from '@/lib/auth/redirect'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // Email templates using {{ .TokenHash }} link here with token_hash + type instead of a PKCE code
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next')

  const supabase = await createClient()
  let error: { message: string } | null = null

  if (code) {
    ;({ error } = await supabase.auth.exchangeCodeForSession(code))
  } else if (tokenHash && type) {
    ;({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }))
  } else {
    // Supabase reports failures (e.g. an expired link) as ?error=...&error_description=...
    error = { message: searchParams.get('error_description') ?? 'Missing auth code' }
  }

  if (!error) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      return NextResponse.redirect(new URL(await destinationAfterLogin(supabase, user, next), request.url))
    }
  }

  // A confirmation link opened in a different browser than the one that signed up can't finish
  // the PKCE exchange, though Supabase has already confirmed the email: send them to sign in.
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('error', 'auth_callback_error')
  if (next) loginUrl.searchParams.set('next', next)
  return NextResponse.redirect(loginUrl)
}
