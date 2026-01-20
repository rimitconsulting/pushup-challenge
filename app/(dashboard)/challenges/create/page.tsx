'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateChallengePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'custom',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    visibility: 'public' as 'public' | 'friends' | 'private',
    total_reps: '',
    daily_minimum: '',
    streak_required: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Calculate end date if not provided
      let endDate = formData.end_date
      if (!endDate && formData.type !== 'custom') {
        const start = new Date(formData.start_date)
        const days = formData.type === 'weekly' ? 7 : 30
        endDate = new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      }

      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert({
          creator_id: user.id,
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          start_date: formData.start_date,
          end_date: endDate,
          visibility: formData.visibility,
          rules: {
            total_reps: formData.total_reps ? parseInt(formData.total_reps) : undefined,
            daily_minimum: formData.daily_minimum
              ? parseInt(formData.daily_minimum)
              : undefined,
            streak_required: formData.streak_required
              ? parseInt(formData.streak_required)
              : undefined,
          },
          status: new Date(formData.start_date) <= new Date() ? 'active' : 'upcoming',
        })
        .select()
        .single()

      if (error) throw error

      // Auto-join the challenge as creator
      await supabase.from('challenge_participants').insert({
        challenge_id: challenge.id,
        user_id: user.id,
      })

      router.push(`/challenges/${challenge.id}`)
    } catch (error: any) {
      console.error('Error creating challenge:', error)
      alert('Failed to create challenge: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/challenges">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Challenge</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Challenge Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="January Push-Up Challenge"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input min-h-[100px]"
                placeholder="Challenge description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Type
              </label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'weekly' | 'monthly' | 'custom',
                  })
                }
              >
                <option value="weekly">Weekly (7 days)</option>
                <option value="monthly">Monthly (30 days)</option>
                <option value="custom">Custom Duration</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />

              <Input
                label={formData.type === 'custom' ? 'End Date' : 'End Date (optional)'}
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required={formData.type === 'custom'}
                min={formData.start_date}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                className="input"
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visibility: e.target.value as 'public' | 'friends' | 'private',
                  })
                }
              >
                <option value="public">Public (Anyone can join)</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private (Invite only)</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold mb-4">Challenge Rules (Optional)</h3>

              <div className="space-y-4">
                <Input
                  label="Total Reps Goal"
                  type="number"
                  value={formData.total_reps}
                  onChange={(e) =>
                    setFormData({ ...formData, total_reps: e.target.value })
                  }
                  placeholder="500"
                  min="1"
                />

                <Input
                  label="Daily Minimum (optional)"
                  type="number"
                  value={formData.daily_minimum}
                  onChange={(e) =>
                    setFormData({ ...formData, daily_minimum: e.target.value })
                  }
                  placeholder="50"
                  min="1"
                />

                <Input
                  label="Streak Required (optional)"
                  type="number"
                  value={formData.streak_required}
                  onChange={(e) =>
                    setFormData({ ...formData, streak_required: e.target.value })
                  }
                  placeholder="7"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/challenges" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create Challenge'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}

