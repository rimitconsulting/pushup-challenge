import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ensureUserProfile } from '@/lib/utils/user'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // If user successfully authenticated, ensure profile exists
    if (!error && data?.user) {
      try {
        await ensureUserProfile(
          supabase,
          data.user.id,
          data.user.email || undefined
        )
      } catch (error) {
        console.error('Error creating user profile:', error)
        // Continue anyway - profile creation will be retried on next API call
      }
    }
  }

  // Redirect to dashboard after auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}

