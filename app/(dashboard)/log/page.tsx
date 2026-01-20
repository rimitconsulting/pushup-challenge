'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { ensureUserProfile } from '@/lib/utils/user'
import { ArrowLeft, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'

export default function LogPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [count, setCount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadEntries()
    }
  }, [user, authLoading, router])

  const loadEntries = async () => {
    if (!user) return

    try {
      // Ensure user profile exists
      await ensureUserProfile(supabase, user.id, user.email || undefined)

      // Load entries
      const { data } = await supabase
        .from('pushups')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20)

      if (data) {
        setEntries(data)
        // Check if today's entry exists - only pre-fill if single entry
        const today = new Date().toISOString().split('T')[0]
        const todayEntries = data.filter((e) => e.date === today)
        if (todayEntries.length === 1) {
          // Only pre-fill if there's exactly one entry for today
          setCount(todayEntries[0].count.toString())
          setNotes(todayEntries[0].notes || '')
        }
        // If multiple entries exist, leave form blank for new entry
      }
    } catch (error) {
      console.error('Error loading entries:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !count) return

    setLoading(true)

    try {
      const { error } = await supabase.from('pushups').insert({
        user_id: user.id,
        count: parseInt(count),
        date,
        notes: notes || null,
      })

      if (error) throw error

      setCount('')
      setNotes('')
      loadEntries()
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving entry:', error)
      alert('Failed to save entry: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase.from('pushups').delete().eq('id', id)

      if (error) throw error

      loadEntries()
    } catch (error: any) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry: ' + error.message)
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Log Push-Ups</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-8">
          <h2 className="text-lg font-semibold mb-4">New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
              />
            </div>

            <Input
              label="Push-ups"
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
              required
              placeholder="50"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Morning workout, felt strong today..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Entry'}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
          {entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{formatDate(entry.date)}</p>
                    <p className="text-2xl font-bold text-red-600">{entry.count}</p>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No entries yet</p>
          )}
        </Card>
      </main>
    </div>
  )
}

