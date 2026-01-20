'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatNumber } from '@/lib/utils'
import { Search, UserPlus, MessageSquare, Trophy, Users, Flame } from 'lucide-react'

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [friends, setFriends] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadFriends()
      loadPendingRequests()
    }
  }, [user, authLoading, router])

  const loadFriends = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          requester:users!friendships_requester_id_fkey(id, display_name, avatar_url),
          addressee:users!friendships_addressee_id_fkey(id, display_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (data) {
        const friendList: Array<{ id: string; display_name: string; avatar_url?: string; friendship_id: string }> = []
        
        data.forEach((f: any) => {
          const friend = f.requester_id === user.id ? f.addressee : f.requester
          if (friend && typeof friend === 'object' && friend.id) {
            friendList.push({
              id: String(friend.id),
              display_name: String(friend.display_name || ''),
              avatar_url: friend.avatar_url ? String(friend.avatar_url) : undefined,
              friendship_id: String(f.id),
            })
          }
        })

        // Load stats for each friend
        const friendsWithStats = await Promise.all(
          friendList.map(async (friend) => {
            const { data: stats } = await supabase
              .from('user_stats')
              .select('*')
              .eq('user_id', friend.id)
              .single()

            return {
              ...friend,
              stats: stats || {
                total_pushups: 0,
                current_streak: 0,
              },
            }
          })
        )

        setFriends(friendsWithStats)
      }
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const loadPendingRequests = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          requester:users!friendships_requester_id_fkey(id, display_name, avatar_url)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending')

      if (data) {
        setPendingRequests(data)
      }
    } catch (error) {
      console.error('Error loading pending requests:', error)
    }
  }

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return

    try {
      const { data } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, fitness_level')
        .ilike('display_name', `%${searchQuery}%`)
        .limit(10)

      if (data) {
        // Filter out current user and existing friends
        const filtered = data.filter(
          (u) => u.id !== user.id && !friends.some((f) => f.id === u.id)
        )
        setSearchResults(filtered)
        setActiveTab('search')
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const handleSendRequest = async (userId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: userId,
        status: 'pending',
      })

      if (error) throw error

      alert('Friend request sent!')
      handleSearch()
    } catch (error: any) {
      console.error('Error sending friend request:', error)
      alert('Failed to send friend request: ' + error.message)
    }
  }

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)

      if (error) throw error

      loadFriends()
      loadPendingRequests()
    } catch (error: any) {
      console.error('Error accepting request:', error)
      alert('Failed to accept request: ' + error.message)
    }
  }

  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      loadPendingRequests()
    } catch (error: any) {
      console.error('Error declining request:', error)
      alert('Failed to decline request: ' + error.message)
    }
  }

  if (authLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <Card key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {friend.display_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{friend.display_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {friend.stats?.current_streak || 0} day streak
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          {formatNumber(friend.stats?.total_pushups || 0)} total
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/messages?user=${friend.id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                <p className="text-gray-600">Search for users to add them as friends!</p>
              </Card>
            )}
          </div>
        )}

        {/* Pending Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {request.requester.display_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{request.requester.display_name}</h3>
                      <p className="text-sm text-gray-600">Sent you a friend request</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-gray-600">Friend requests will appear here</p>
              </Card>
            )}
          </div>
        )}

        {/* Search Results */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <Card key={result.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {result.display_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{result.display_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {result.fitness_level || 'No level set'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(result.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add Friend
                  </Button>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-600">No results found</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

