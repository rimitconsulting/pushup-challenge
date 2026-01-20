# Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier)

## Step 1: Clone & Install

```bash
# Navigate to project directory
cd "pushup-challenge"

# Install dependencies
npm install
```

## Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your:
   - Project URL
   - Anon/Public key

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Set Up Database

### Option A: SQL Script (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL script below to create all tables, functions, and triggers:

```sql
-- See docs/DATABASE_SCHEMA.md for the complete SQL schema
-- Copy all SQL from that file and run it in Supabase SQL Editor
```

### Option B: Manual Setup

Create tables manually using the Supabase Table Editor:

1. **users** table:
   - id (uuid, primary key, references auth.users)
   - email (text)
   - display_name (text)
   - avatar_url (text, nullable)
   - fitness_level (text: beginner/intermediate/advanced)
   - bio (text, nullable)
   - timezone (text, default: UTC)
   - privacy_level (text, default: friends)
   - created_at (timestamptz)
   - updated_at (timestamptz)

2. **pushups** table:
   - id (uuid, primary key)
   - user_id (uuid, references users)
   - count (integer)
   - date (date)
   - notes (text, nullable)
   - created_at (timestamptz)
   - updated_at (timestamptz)
   - Unique constraint on (user_id, date)

3. **user_stats** table:
   - user_id (uuid, primary key, references users)
   - total_pushups (integer, default: 0)
   - current_streak (integer, default: 0)
   - longest_streak (integer, default: 0)
   - last_activity_date (date, nullable)
   - best_single_day (integer, default: 0)
   - average_per_day (numeric, default: 0)
   - updated_at (timestamptz)

4. **challenges** table:
   - id (uuid, primary key)
   - creator_id (uuid, references users)
   - name (text)
   - description (text, nullable)
   - type (text: weekly/monthly/custom)
   - start_date (date)
   - end_date (date)
   - visibility (text: public/friends/private)
   - rules (jsonb)
   - status (text: upcoming/active/completed/cancelled)
   - created_at (timestamptz)
   - updated_at (timestamptz)

5. **challenge_participants** table:
   - id (uuid, primary key)
   - challenge_id (uuid, references challenges)
   - user_id (uuid, references users)
   - total_reps (integer, default: 0)
   - days_completed (integer, default: 0)
   - current_streak (integer, default: 0)
   - joined_at (timestamptz)
   - Unique constraint on (challenge_id, user_id)

6. **friendships** table:
   - id (uuid, primary key)
   - requester_id (uuid, references users)
   - addressee_id (uuid, references users)
   - status (text: pending/accepted/blocked)
   - created_at (timestamptz)
   - updated_at (timestamptz)
   - Unique constraint on (requester_id, addressee_id)

7. **trash_talk** table:
   - id (uuid, primary key)
   - sender_id (uuid, references users)
   - recipient_id (uuid, references users)
   - challenge_id (uuid, references challenges, nullable)
   - message (text)
   - message_type (text: custom/challenge/achievement/rivalry)
   - read (boolean, default: false)
   - created_at (timestamptz)

8. **badges** table:
   - id (uuid, primary key)
   - name (text, unique)
   - description (text)
   - icon (text)
   - category (text: streak/volume/challenge/social)
   - criteria (jsonb)
   - created_at (timestamptz)

9. **user_badges** table:
   - id (uuid, primary key)
   - user_id (uuid, references users)
   - badge_id (uuid, references badges)
   - earned_at (timestamptz)
   - Unique constraint on (user_id, badge_id)

10. **integrations** table:
    - id (uuid, primary key)
    - user_id (uuid, references users)
    - provider (text: strava/garmin)
    - access_token (text)
    - refresh_token (text, nullable)
    - expires_at (timestamptz, nullable)
    - provider_user_id (text, nullable)
    - enabled (boolean, default: true)
    - last_synced_at (timestamptz, nullable)
    - created_at (timestamptz)
    - updated_at (timestamptz)
    - Unique constraint on (user_id, provider)

11. **notifications** table:
    - id (uuid, primary key)
    - user_id (uuid, references users)
    - type (text: friend_request/trash_talk/challenge_invite/badge_earned/challenge_update)
    - title (text)
    - message (text)
    - link (text, nullable)
    - read (boolean, default: false)
    - created_at (timestamptz)

### Enable Row Level Security (RLS)

**CRITICAL:** You must run the RLS policies after creating tables, otherwise signup will fail!

1. Enable RLS on all tables (this is done in the schema SQL above)
2. **Run the complete RLS policies SQL:**
   - Go to Supabase Dashboard → SQL Editor
   - Open `docs/RLS_POLICIES.sql` from your project
   - Copy and paste the entire file
   - Click "Run" to execute

This file contains all necessary policies for:
- ✅ Users can insert their own profile during signup (fixes signup errors!)
- ✅ Users can read/write their own data
- ✅ Friends can view each other's data (based on privacy settings)
- ✅ Challenge visibility rules (public/friends/private)
- ✅ All other table permissions

**Without these policies, you'll get "violates row-level security policy" errors!**

## Step 5: Configure Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider (already enabled by default)
3. Optional: Enable Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add client ID and secret to Supabase
   - Add redirect URL: `http://localhost:3000/auth/callback`

## Step 6: Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 7: Create Your First User

1. Go to the signup page
2. Create an account
3. The app will automatically create:
   - User profile in `users` table
   - Initial stats in `user_stats` table

## Troubleshooting

### Database Connection Issues
- Verify your `.env.local` file has correct Supabase credentials
- Check Supabase project is active
- Ensure database is accessible

### Authentication Errors
- Verify RLS policies are set up correctly
- Check authentication providers are enabled in Supabase
- Ensure redirect URLs are configured correctly

### Missing Tables/Columns
- Run the SQL schema from `docs/DATABASE_SCHEMA.md`
- Or manually create missing tables/columns

## Next Steps

- See [docs/ROADMAP.md](./ROADMAP.md) for feature roadmap
- See [docs/API.md](./API.md) for API documentation
- Customize UI in `app/` and `components/` directories

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted VPS

Ensure environment variables are set in production.

