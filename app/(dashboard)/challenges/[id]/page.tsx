'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatNumber } from '@/lib/utils'
import { ArrowLeft, Trophy, Users, Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [challenge, setChallenge] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [userParticipation, setUserParticipation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && id) {
      loadChallenge()
    }
  }, [user, authLoading, router, id])

  const loadChallenge = async () => {
    if (!user || !id) return

    try {
      // Load challenge details
      const { data: challengeData } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:users!challenges_creator_id_fkey(id, display_name, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (!challengeData) {
        router.push('/challenges')
        return
      }

      setChallenge(challengeData)

      // Load participants
      const { data: participantsData } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:users!challenge_participants_user_id_fkey(id, display_name, avatar_url)
        `)
        .eq('challenge_id', id)
        .order('total_reps', { ascending: false })

      if (participantsData) {
        setParticipants(participantsData)

        // Find user's participation
        const userPart = participantsData.find((p: any) => p.user_id === user.id)
        setUserParticipation(userPart)
      }
    } catch (error) {
      console.error('Error loading challenge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!user || !id) return

    try {
      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: id,
        user_id: user.id,
      })

      if (error) throw error

      loadChallenge()
    } catch (error: any) {
      console.error('Error joining challenge:', error)
      alert('Failed to join challenge: ' + error.message)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this challenge?')) return

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', id)
        .eq('user_id', user?.id)

      if (error) throw error

      router.push('/challenges')
    } catch (error: any) {
      console.error('Error leaving challenge:', error)
      alert('Failed to leave challenge: ' + error.message)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!challenge) {
    return null
  }

  const userRank = userParticipation
    ? participants.findIndex((p: any) => p.user_id === user?.id) + 1
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/challenges">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{challenge.name}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Challenge Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Challenge Details</h2>
              {challenge.description && (
                <p className="text-gray-600 mb-4">{challenge.description}</p>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">
                      {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-medium">{participants.length}</p>
                  </div>
                </div>

                {challenge.rules?.total_reps && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Goal</p>
                      <p className="font-medium">{formatNumber(challenge.rules.total_reps)} push-ups</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Created by</p>
                  <p className="font-medium">{challenge.creator?.display_name || 'Unknown'}</p>
                </div>
              </div>
            </Card>

            {/* User Progress */}
            {userParticipation && (
              <Card>
                <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Rank</p>
                    <p className="text-2xl font-bold text-red-600">#{userRank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Reps</p>
                    <p className="text-2xl font-bold">{formatNumber(userParticipation.total_reps)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Completed</p>
                    <p className="text-2xl font-bold">{userParticipation.days_completed}</p>
                  </div>
                </div>

                {challenge.rules?.total_reps && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {Math.round(
                          (userParticipation.total_reps / challenge.rules.total_reps) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (userParticipation.total_reps / challenge.rules.total_reps) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={handleLeave}
                >
                  Leave Challenge
                </Button>
              </Card>
            )}

            {/* Leaderboard */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
              {participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((participant: any, index: number) => {
                    const isCurrentUser = participant.user_id === user?.id
                    return (
                      <div
                        key={participant.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          isCurrentUser
                            ? 'bg-red-50 border-2 border-red-600'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 text-center font-bold text-gray-600">
                            #{index + 1}
                          </div>
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {participant.user?.display_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {participant.user?.display_name || 'Unknown'}
                              {isCurrentUser && ' (You)'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {participant.days_completed} days • {participant.current_streak} day streak
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatNumber(participant.total_reps)}</p>
                          {isCurrentUser && (
                            <Link href={`/messages?user=${participant.user_id}`}>
                              <Button size="sm" variant="ghost" className="mt-1">
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No participants yet</p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {!userParticipation && challenge.status === 'active' && (
              <Card className="mb-6">
                <h3 className="font-semibold mb-4">Join Challenge</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Compete with other participants and climb the leaderboard!
                </p>
                <Button onClick={handleJoin} className="w-full">
                  Join Now
                </Button>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold mb-4">Challenge Rules</h3>
              <div className="space-y-3 text-sm">
                {challenge.rules?.total_reps && (
                  <div>
                    <p className="font-medium">Total Reps Goal</p>
                    <p className="text-gray-600">{formatNumber(challenge.rules.total_reps)} push-ups</p>
                  </div>
                )}
                {challenge.rules?.daily_minimum && (
                  <div>
                    <p className="font-medium">Daily Minimum</p>
                    <p className="text-gray-600">{challenge.rules.daily_minimum} push-ups/day</p>
                  </div>
                )}
                {challenge.rules?.streak_required && (
                  <div>
                    <p className="font-medium">Streak Required</p>
                    <p className="text-gray-600">{challenge.rules.streak_required} day streak</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

