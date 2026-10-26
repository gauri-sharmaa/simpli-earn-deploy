import type { SupabaseClient, User } from '@supabase/supabase-js'

export const DEFAULT_AFTER_LOGIN = '/my-dashboard'

/** Only same-site paths, so `?next=` can't send a signed-in user to another origin. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return DEFAULT_AFTER_LOGIN
  }
  return next
}

/**
 * Where a freshly signed-in user goes: onboarding until it is completed (including when the
 * profile row is missing, e.g. users created before the profiles trigger existed), else `next`.
 */
export async function destinationAfterLogin(
  supabase: SupabaseClient,
  user: User,
  next: string | null | undefined
): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed) {
    return '/onboarding'
  }
  return safeNext(next)
}
