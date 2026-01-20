'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatNumber, formatDate } from '@/lib/utils'
import { ensureUserProfile } from '@/lib/utils/user'
import { Flame, Calendar, Trophy, TrendingUp, Users, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [stats, setStats] = useState({
    total_pushups: 0,
    current_streak: 0,
    longest_streak: 0,
    this_week: 0,
    best_single_day: 0,
  })
  const [quickLogCount, setQuickLogCount] = useState('')
  const [loading, setLoading] = useState(true)
  const [logging, setLogging] = useState(false)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [activeChallenges, setActiveChallenges] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadDashboardData()
    }
  }, [user, authLoading, router])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Ensure user profile exists (fixes foreign key constraint errors)
      await ensureUserProfile(supabase, user.id, user.email || undefined)

      // Load user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsData) {
        setStats({
          total_pushups: statsData.total_pushups || 0,
          current_streak: statsData.current_streak || 0,
          longest_streak: statsData.longest_streak || 0,
          this_week: 0, // Calculate this
          best_single_day: statsData.best_single_day || 0,
        })
      }

      // Load recent push-up entries
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const { data: entries } = await supabase
        .from('pushups')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date', { ascending: false })
        .limit(7)

      if (entries) {
        setRecentEntries(entries)
        const weekTotal = entries
          .filter((e) => {
            const entryDate = new Date(e.date)
            const weekStart = new Date()
            weekStart.setDate(weekStart.getDate() - 7)
            return entryDate >= weekStart
          })
          .reduce((sum, e) => sum + e.count, 0)
        setStats((prev) => ({ ...prev, this_week: weekTotal }))
      }

      // Load active challenges
      const { data: challenges } = await supabase
        .from('challenge_participants')
        .select(`
          challenge_id,
          challenges (
            id,
            name,
            description,
            status,
            end_date
          )
        `)
        .eq('user_id', user.id)

      if (challenges) {
        setActiveChallenges(
          challenges
            .map((c: any) => c.challenges)
            .filter((c: any) => c && c.status === 'active')
        )
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !quickLogCount) return

    setLogging(true)
    const today = new Date().toISOString().split('T')[0]

    try {
      const { error } = await supabase.from('pushups').insert({
        user_id: user.id,
        count: parseInt(quickLogCount),
        date: today,
      })

      if (error) throw error

      setQuickLogCount('')
      loadDashboardData()
    } catch (error: any) {
      console.error('Error logging push-ups:', error)
      alert('Failed to log push-ups: ' + error.message)
    } finally {
      setLogging(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-600">🏋️ PushUp Challenge</h1>
            <div className="flex items-center gap-4">
              <Link href="/messages">
                <MessageSquare className="w-6 h-6 text-gray-600" />
              </Link>
              <Link href="/profile">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 mb-1">Current Streak</p>
                <div className="flex items-center gap-2">
                  <Flame className="w-8 h-8" />
                  <h2 className="text-4xl font-bold">{stats.current_streak} days</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-100 mb-1">Total Push-Ups</p>
                <h2 className="text-3xl font-bold">{formatNumber(stats.total_pushups)}</h2>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatNumber(stats.this_week)}</p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Flame className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.longest_streak}</p>
              <p className="text-sm text-gray-600">Best Streak</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.best_single_day}</p>
              <p className="text-sm text-gray-600">Best Day</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{recentEntries.length}</p>
              <p className="text-sm text-gray-600">Active Days</p>
            </div>
          </Card>
        </div>

        {/* Quick Log */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Log</h3>
          <form onSubmit={handleQuickLog} className="flex gap-4">
            <Input
              type="number"
              placeholder="Push-ups today"
              value={quickLogCount}
              onChange={(e) => setQuickLogCount(e.target.value)}
              min="1"
              className="flex-1"
            />
            <Button type="submit" disabled={logging || !quickLogCount}>
              {logging ? 'Logging...' : 'Log'}
            </Button>
          </form>
          <Link href="/log" className="text-sm text-red-600 hover:text-red-700 mt-2 inline-block">
            Log for a different date →
          </Link>
        </Card>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Challenges</h3>
              <Link href="/challenges" className="text-sm text-red-600 hover:text-red-700">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {activeChallenges.map((challenge: any) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-semibold">{challenge.name}</h4>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Link href="/calendar" className="text-sm text-red-600 hover:text-red-700">
              View Calendar →
            </Link>
          </div>
          {recentEntries.length > 0 ? (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatDate(entry.date)}</p>
                    {entry.notes && (
                      <p className="text-sm text-gray-600">{entry.notes}</p>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-red-600">{entry.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No entries yet. Log your first push-ups to get started!
            </p>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link href="/log">
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
              <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium">Log Push-Ups</p>
            </Card>
          </Link>

          <Link href="/challenges">
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
              <Trophy className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium">Challenges</p>
            </Card>
          </Link>

          <Link href="/friends">
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
              <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium">Friends</p>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
              <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium">Analytics</p>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}

