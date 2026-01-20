'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { Send, Flame, Trophy } from 'lucide-react'

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [recipientId, setRecipientId] = useState<string | null>(
    searchParams.get('user')
  )
  const [recipient, setRecipient] = useState<any>(null)
  const [friends, setFriends] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadMessages()
      loadFriends()
      if (recipientId) {
        loadRecipient()
      }
    }
  }, [user, authLoading, router, recipientId])

  const loadFriends = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          addressee_id,
          requester:users!friendships_requester_id_fkey(id, display_name, avatar_url),
          addressee:users!friendships_addressee_id_fkey(id, display_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (data) {
        const friendList = data.map((f) => {
          return f.requester_id === user.id ? f.addressee : f.requester
        })
        setFriends(friendList)
      }
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const loadRecipient = async () => {
    if (!recipientId) return

    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', recipientId)
        .single()

      if (data) {
        setRecipient(data)
      }
    } catch (error) {
      console.error('Error loading recipient:', error)
    }
  }

  const loadMessages = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('trash_talk')
        .select(`
          *,
          sender:users!trash_talk_sender_id_fkey(id, display_name, avatar_url),
          recipient:users!trash_talk_recipient_id_fkey(id, display_name, avatar_url),
          challenge:challenges(id, name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setMessages(data)

        // Mark messages as read
        const unreadIds = data
          .filter((m) => m.recipient_id === user.id && !m.read)
          .map((m) => m.id)

        if (unreadIds.length > 0) {
          await supabase
            .from('trash_talk')
            .update({ read: true })
            .in('id', unreadIds)
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !recipientId || !newMessage.trim()) return

    try {
      const { error } = await supabase.from('trash_talk').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        message: newMessage,
        message_type: 'custom',
      })

      if (error) throw error

      setNewMessage('')
      loadMessages()
    } catch (error: any) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    }
  }

  const sendQuickMessage = async (message: string, userId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from('trash_talk').insert({
        sender_id: user.id,
        recipient_id: userId,
        message,
        message_type: 'rivalry',
      })

      if (error) throw error

      loadMessages()
      setRecipientId(userId)
      loadRecipient()
    } catch (error: any) {
      console.error('Error sending quick message:', error)
      alert('Failed to send message: ' + error.message)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const filteredMessages = recipientId
    ? messages.filter(
        (m) =>
          (m.sender_id === user?.id && m.recipient_id === recipientId) ||
          (m.recipient_id === user?.id && m.sender_id === recipientId)
      )
    : messages

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages & Trash-Talk</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Friends List / Message List */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="font-semibold mb-4">Conversations</h2>
              {friends.length > 0 ? (
                <div className="space-y-2">
                  {friends.map((friend) => {
                    const conversationMessages = messages.filter(
                      (m) =>
                        (m.sender_id === user?.id && m.recipient_id === friend.id) ||
                        (m.recipient_id === user?.id && m.sender_id === friend.id)
                    )
                    const lastMessage = conversationMessages[0]
                    const unreadCount = conversationMessages.filter(
                      (m) => m.recipient_id === user?.id && !m.read
                    ).length

                    return (
                      <button
                        key={friend.id}
                        onClick={() => {
                          setRecipientId(friend.id)
                          loadRecipient()
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          recipientId === friend.id
                            ? 'bg-red-50 border-2 border-red-600'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {friend.display_name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium">{friend.display_name}</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {lastMessage.message}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No friends yet. Add friends to start trash-talking!</p>
              )}
            </Card>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {recipientId && recipient ? (
              <Card className="flex flex-col h-[600px]">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {recipient.display_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{recipient.display_name}</h3>
                        <p className="text-sm text-gray-600">
                          Send some friendly trash-talk! 💪
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Messages */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendQuickMessage('You\'re falling behind! 💪', recipientId)}
                    >
                      "You're falling behind!"
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendQuickMessage('I\'m crushing it today! 🔥', recipientId)}
                    >
                      "I'm crushing it!"
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendQuickMessage('Catch me if you can! 🏃', recipientId)}
                    >
                      "Catch me if you can!"
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {filteredMessages.length > 0 ? (
                    [...filteredMessages].reverse().map((message) => {
                      const isSender = message.sender_id === user?.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              isSender
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      No messages yet. Start the conversation!
                    </p>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-600">Select a friend to start messaging</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

