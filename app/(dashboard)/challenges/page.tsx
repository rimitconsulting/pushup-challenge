'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Plus, Trophy, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function ChallengesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [challenges, setChallenges] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'my'>('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadChallenges()
    }
  }, [user, authLoading, router, filter])

  const loadChallenges = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase.from('challenges').select('*')

      if (filter === 'active') {
        query = query.eq('status', 'active')
      } else if (filter === 'upcoming') {
        query = query.eq('status', 'upcoming')
      } else if (filter === 'my') {
        // Get challenges user is participating in
        const { data: participants } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .eq('user_id', user.id)

        if (participants && participants.length > 0) {
          const challengeIds = participants.map((p) => p.challenge_id)
          query = query.in('id', challengeIds)
        } else {
          setChallenges([])
          setLoading(false)
          return
        }
      }

      query = query.order('created_at', { ascending: false })

      const { data } = await query

      if (data) {
        // Check user participation for each challenge
        const challengesWithParticipation = await Promise.all(
          data.map(async (challenge) => {
            const { data: participant } = await supabase
              .from('challenge_participants')
              .select('*')
              .eq('challenge_id', challenge.id)
              .eq('user_id', user.id)
              .single()

            const { count } = await supabase
              .from('challenge_participants')
              .select('*', { count: 'exact', head: true })
              .eq('challenge_id', challenge.id)

            return {
              ...challenge,
              isParticipating: !!participant,
              participantCount: count || 0,
            }
          })
        )

        setChallenges(challengesWithParticipation)
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (challengeId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: user.id,
      })

      if (error) throw error

      loadChallenges()
    } catch (error: any) {
      console.error('Error joining challenge:', error)
      alert('Failed to join challenge: ' + error.message)
    }
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
            <Link href="/challenges/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'active', 'upcoming', 'my'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        {challenges.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold flex-1">{challenge.name}</h3>
                  {challenge.isParticipating && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Joined
                    </span>
                  )}
                </div>

                {challenge.description && (
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participantCount} participants</span>
                  </div>

                  {challenge.rules?.total_reps && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Trophy className="w-4 h-4" />
                      <span>Goal: {challenge.rules.total_reps} push-ups</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/challenges/${challenge.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {!challenge.isParticipating && challenge.status === 'active' && (
                    <Button
                      onClick={() => handleJoin(challenge.id)}
                      className="flex-1"
                    >
                      Join
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No challenges found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'my'
                ? "You haven't joined any challenges yet."
                : 'Be the first to create a challenge!'}
            </p>
            <Link href="/challenges/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}

