import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ensureUserProfile } from '@/lib/utils/user'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('pushups')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit)

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data, total: data?.length || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists (fixes foreign key constraint errors)
    try {
      await ensureUserProfile(supabase, user.id, user.email)
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to initialize user profile: ' + error.message },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { count, date, notes } = body

    if (!count || count < 1) {
      return NextResponse.json(
        { error: 'Count must be at least 1' },
        { status: 400 }
      )
    }

    // Insert new push-up entry (allow multiple entries per day)
    const { data: pushupData, error: pushupError } = await supabase
      .from('pushups')
      .insert({
        user_id: user.id,
        count: parseInt(count),
        date,
        notes: notes || null,
      })
      .select()
      .single()

    if (pushupError) throw pushupError

    // Update user stats (this would ideally be a database trigger)
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Calculate new totals (simplified - in production, use database functions)
    const { data: allPushups } = await supabase
      .from('pushups')
      .select('count, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (allPushups) {
      const total = allPushups.reduce((sum, p) => sum + p.count, 0)
      const dates = [...new Set(allPushups.map((p) => p.date))].sort()

      // Simple streak calculation
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[dates.length - 1 - i])
        date.setHours(0, 0, 0, 0)
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)

        if (date.getTime() === expectedDate.getTime()) {
          streak++
        } else {
          break
        }
      }

      const longestStreak = stats?.longest_streak || 0
      
      // Calculate best single day by summing all entries per day
      const dailyTotals = allPushups.reduce((acc, p) => {
        acc[p.date] = (acc[p.date] || 0) + p.count
        return acc
      }, {} as Record<string, number>)
      
      const bestSingleDay = Math.max(
        ...Object.values(dailyTotals),
        stats?.best_single_day || 0
      )

      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_pushups: total,
          current_streak: streak,
          longest_streak: Math.max(streak, longestStreak),
          best_single_day: bestSingleDay,
          last_activity_date: date,
          updated_at: new Date().toISOString(),
        })
    }

    // Get updated stats
    const { data: updatedStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      data: pushupData,
      stats: updatedStats || {},
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

