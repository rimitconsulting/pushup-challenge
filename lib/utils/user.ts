import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures a user profile exists in the users table.
 * Creates it if missing, using data from auth.users.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  email?: string
): Promise<{ exists: boolean; created: boolean }> {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (existingProfile) {
    return { exists: true, created: false }
  }

  // Get user email from auth if not provided
  let userEmail = email
  if (!userEmail) {
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email || 'user@example.com'
  }

  // Get user metadata (display name from OAuth providers)
  const { data: { user } } = await supabase.auth.getUser()
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'

  // Create profile
  const { error } = await supabase.from('users').insert({
    id: userId,
    email: userEmail,
    display_name: displayName,
    fitness_level: 'intermediate',
  })

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  // Initialize user stats
  await supabase.from('user_stats').insert({
    user_id: userId,
  })

  return { exists: true, created: true }
}

