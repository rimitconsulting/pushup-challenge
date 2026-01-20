# Database Schema

## Overview
PostgreSQL database managed by Supabase with Row Level Security (RLS) enabled.

## Setup Instructions

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL below
3. Execute to create all tables, indexes, and functions

## Tables

### `users`
Extended user profile beyond Supabase auth.users.

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### `pushups`
Daily push-up entries.

```sql
CREATE TABLE IF NOT EXISTS pushups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL CHECK (count > 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
  -- Note: No UNIQUE constraint - users can log multiple entries per day
);

CREATE INDEX IF NOT EXISTS idx_pushups_user_date ON pushups(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pushups_date ON pushups(date);
```

### `user_stats`
Denormalized statistics for quick access.

```sql
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_pushups INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  best_single_day INTEGER DEFAULT 0,
  average_per_day NUMERIC(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `challenges`
Challenge definitions.

```sql
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'friends')),
  rules JSONB, -- { total_reps: 500, daily_minimum: 50, streak_required: 5 }
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
```

### `challenge_participants`
Users participating in challenges.

```sql
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_reps INTEGER DEFAULT 0,
  days_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
```

### `friendships`
Friend relationships.

```sql
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
```

### `trash_talk`
Rivalry messages between users.

```sql
CREATE TABLE IF NOT EXISTS trash_talk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'custom' CHECK (message_type IN ('custom', 'challenge', 'achievement', 'rivalry')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (sender_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_trash_talk_recipient ON trash_talk(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_trash_talk_challenge ON trash_talk(challenge_id);
```

### `badges`
Badge definitions.

```sql
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'volume', 'challenge', 'social')),
  criteria JSONB NOT NULL, -- { type: 'streak', value: 7 }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `user_badges`
Earned badges by users.

```sql
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
```

### `integrations`
Third-party integrations (Strava, Garmin).

```sql
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('strava', 'garmin')),
  access_token TEXT NOT NULL, -- Encrypted in production
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  provider_user_id TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);
```

### `notifications`
User notifications.

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'trash_talk', 'challenge_invite', 'badge_earned', 'challenge_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
```

## Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pushups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash_talk ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

**Important:** Run the complete RLS policies SQL file after creating tables.

See `docs/RLS_POLICIES.sql` for complete policy definitions. Key policies include:

- **Users table**: Allow users to insert their own profile during signup
- **Push-ups**: Users can CRUD their own entries, view friends' entries
- **Challenges**: Public/friends/private visibility rules
- **Friendships**: Request, accept, view own friendships
- **All tables**: Proper read/write permissions based on relationships

Quick reference for users table (most important for signup):

```sql
-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);
```

## Functions & Triggers (Optional)

### Auto-update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables with updated_at columns
```

## Initial Badge Data

```sql
INSERT INTO badges (name, description, icon, category, criteria) VALUES
('7-Day Streak', 'Complete 7 consecutive days', '🔥', 'streak', '{"type": "streak", "value": 7}'),
('30-Day Streak', 'Complete 30 consecutive days', '🔥🔥', 'streak', '{"type": "streak", "value": 30}'),
('100 Push-Ups', 'Reach 100 total push-ups', '💪', 'volume', '{"type": "volume", "value": 100}'),
('1,000 Push-Ups', 'Reach 1,000 total push-ups', '💪💪', 'volume', '{"type": "volume", "value": 1000}'),
('First Challenge', 'Complete your first challenge', '🏆', 'challenge', '{"type": "challenge", "value": 1}'),
('Social Butterfly', 'Add 5 friends', '👥', 'social', '{"type": "friends", "value": 5}');
```
