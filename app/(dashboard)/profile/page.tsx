'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatNumber } from '@/lib/utils'
import { LogOut, Settings } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, authLoading, router])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-2xl font-bold mb-2">{profile?.display_name || 'User'}</h2>
              <p className="text-gray-600 mb-4">{profile?.email}</p>
              <p className="text-sm text-gray-500 capitalize mb-6">
                {profile?.fitness_level || 'Not set'}
              </p>

              {stats && (
                <div className="space-y-3 text-left">
                  <div>
                    <p className="text-sm text-gray-600">Total Push-Ups</p>
                    <p className="text-xl font-bold">{formatNumber(stats.total_pushups || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Streak</p>
                    <p className="text-xl font-bold">{stats.current_streak || 0} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longest Streak</p>
                    <p className="text-xl font-bold">{stats.longest_streak || 0} days</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Settings */}
          <Card className="md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Account Settings</h3>
              <Settings className="w-5 h-5 text-gray-600" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <Input value={profile?.display_name || ''} disabled />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input value={profile?.email || ''} disabled />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitness Level
                </label>
                <Input value={profile?.fitness_level || ''} disabled className="capitalize" />
              </div>

              {profile?.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

