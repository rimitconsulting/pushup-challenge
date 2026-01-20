export interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  fitness_level?: 'beginner' | 'intermediate' | 'advanced'
  bio?: string
  timezone?: string
  privacy_level?: 'public' | 'friends' | 'private'
  created_at: string
  updated_at: string
}

export interface Pushup {
  id: string
  user_id: string
  count: number
  date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface UserStats {
  user_id: string
  total_pushups: number
  current_streak: number
  longest_streak: number
  last_activity_date?: string
  best_single_day: number
  average_per_day: number
  updated_at: string
}

export interface Challenge {
  id: string
  creator_id: string
  name: string
  description?: string
  type: 'weekly' | 'monthly' | 'custom'
  start_date: string
  end_date: string
  visibility: 'public' | 'private' | 'friends'
  rules: {
    total_reps?: number
    daily_minimum?: number
    streak_required?: number
  }
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  total_reps: number
  days_completed: number
  current_streak: number
  joined_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

export interface TrashTalk {
  id: string
  sender_id: string
  recipient_id: string
  challenge_id?: string
  message: string
  message_type: 'custom' | 'challenge' | 'achievement' | 'rivalry'
  read: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'volume' | 'challenge' | 'social'
  criteria: {
    type: string
    value: number
  }
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface Integration {
  id: string
  user_id: string
  provider: 'strava' | 'garmin'
  access_token: string
  refresh_token?: string
  expires_at?: string
  provider_user_id?: string
  enabled: boolean
  last_synced_at?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'friend_request' | 'trash_talk' | 'challenge_invite' | 'badge_earned' | 'challenge_update'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

