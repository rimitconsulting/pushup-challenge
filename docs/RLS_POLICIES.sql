-- Row Level Security (RLS) Policies for PushUp Challenge
-- Run this in Supabase SQL Editor after creating tables

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can view public profiles
CREATE POLICY "Users can view public profiles"
ON users FOR SELECT
USING (privacy_level = 'public');

-- Users can view friends' profiles
CREATE POLICY "Users can view friends' profiles"
ON users FOR SELECT
USING (
  privacy_level IN ('public', 'friends') AND
  (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (requester_id = auth.uid() AND addressee_id = users.id AND status = 'accepted')
         OR (addressee_id = auth.uid() AND requester_id = users.id AND status = 'accepted')
    )
  )
);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- PUSHUPS TABLE POLICIES
-- ============================================

-- Users can view their own push-ups
CREATE POLICY "Users can view own pushups"
ON pushups FOR SELECT
USING (auth.uid() = user_id);

-- Users can view friends' push-ups (if privacy allows)
CREATE POLICY "Users can view friends' pushups"
ON pushups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    JOIN friendships ON (
      (friendships.requester_id = auth.uid() AND friendships.addressee_id = pushups.user_id)
      OR (friendships.addressee_id = auth.uid() AND friendships.requester_id = pushups.user_id)
    )
    WHERE users.id = pushups.user_id
      AND friendships.status = 'accepted'
      AND users.privacy_level IN ('public', 'friends')
  )
);

-- Users can insert their own push-ups
CREATE POLICY "Users can insert own pushups"
ON pushups FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own push-ups
CREATE POLICY "Users can update own pushups"
ON pushups FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own push-ups
CREATE POLICY "Users can delete own pushups"
ON pushups FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- USER_STATS TABLE POLICIES
-- ============================================

-- Users can view their own stats
CREATE POLICY "Users can view own stats"
ON user_stats FOR SELECT
USING (auth.uid() = user_id);

-- Users can view friends' stats (if privacy allows)
CREATE POLICY "Users can view friends' stats"
ON user_stats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    JOIN friendships ON (
      (friendships.requester_id = auth.uid() AND friendships.addressee_id = user_stats.user_id)
      OR (friendships.addressee_id = auth.uid() AND friendships.requester_id = user_stats.user_id)
    )
    WHERE users.id = user_stats.user_id
      AND friendships.status = 'accepted'
      AND users.privacy_level IN ('public', 'friends')
  )
);

-- Users can insert their own stats (for initialization)
CREATE POLICY "Users can insert own stats"
ON user_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update own stats"
ON user_stats FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CHALLENGES TABLE POLICIES
-- ============================================

-- Anyone can view public challenges
CREATE POLICY "Anyone can view public challenges"
ON challenges FOR SELECT
USING (visibility = 'public' OR creator_id = auth.uid());

-- Users can view friends-only challenges
CREATE POLICY "Users can view friends' challenges"
ON challenges FOR SELECT
USING (
  visibility = 'friends' AND (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (requester_id = auth.uid() AND addressee_id = challenges.creator_id AND status = 'accepted')
         OR (addressee_id = auth.uid() AND requester_id = challenges.creator_id AND status = 'accepted')
    )
  )
);

-- Users can view private challenges they created or joined
CREATE POLICY "Users can view joined private challenges"
ON challenges FOR SELECT
USING (
  visibility = 'private' AND (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM challenge_participants
      WHERE challenge_id = challenges.id AND user_id = auth.uid()
    )
  )
);

-- Users can create challenges
CREATE POLICY "Users can create challenges"
ON challenges FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Users can update challenges they created
CREATE POLICY "Users can update own challenges"
ON challenges FOR UPDATE
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Users can delete challenges they created
CREATE POLICY "Users can delete own challenges"
ON challenges FOR DELETE
USING (auth.uid() = creator_id);

-- ============================================
-- CHALLENGE_PARTICIPANTS TABLE POLICIES
-- ============================================

-- Users can view participants of challenges they can see
CREATE POLICY "Users can view challenge participants"
ON challenge_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM challenges
    WHERE challenges.id = challenge_participants.challenge_id
      AND (
        challenges.visibility = 'public'
        OR challenges.creator_id = auth.uid()
        OR challenge_participants.user_id = auth.uid()
        OR (
          challenges.visibility = 'friends' AND
          EXISTS (
            SELECT 1 FROM friendships
            WHERE (requester_id = auth.uid() AND addressee_id = challenges.creator_id AND status = 'accepted')
               OR (addressee_id = auth.uid() AND requester_id = challenges.creator_id AND status = 'accepted')
          )
        )
      )
  )
);

-- Users can join challenges
CREATE POLICY "Users can join challenges"
ON challenge_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "Users can update own participation"
ON challenge_participants FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can leave challenges (delete their participation)
CREATE POLICY "Users can leave challenges"
ON challenge_participants FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FRIENDSHIPS TABLE POLICIES
-- ============================================

-- Users can view friendships they're involved in
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON friendships FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Users can accept friend requests sent to them
CREATE POLICY "Users can accept friend requests"
ON friendships FOR UPDATE
USING (addressee_id = auth.uid())
WITH CHECK (addressee_id = auth.uid());

-- Users can delete friendships they're involved in
CREATE POLICY "Users can delete own friendships"
ON friendships FOR DELETE
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- ============================================
-- TRASH_TALK TABLE POLICIES
-- ============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON trash_talk FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages"
ON trash_talk FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they sent (mark as read)
CREATE POLICY "Users can update received messages"
ON trash_talk FOR UPDATE
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Users can delete messages they sent
CREATE POLICY "Users can delete own messages"
ON trash_talk FOR DELETE
USING (sender_id = auth.uid());

-- ============================================
-- BADGES TABLE POLICIES
-- ============================================

-- Anyone can view badges (public)
CREATE POLICY "Anyone can view badges"
ON badges FOR SELECT
USING (true);

-- ============================================
-- USER_BADGES TABLE POLICIES
-- ============================================

-- Users can view their own badges
CREATE POLICY "Users can view own badges"
ON user_badges FOR SELECT
USING (auth.uid() = user_id);

-- Users can view friends' badges (if privacy allows)
CREATE POLICY "Users can view friends' badges"
ON user_badges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    JOIN friendships ON (
      (friendships.requester_id = auth.uid() AND friendships.addressee_id = user_badges.user_id)
      OR (friendships.addressee_id = auth.uid() AND friendships.requester_id = user_badges.user_id)
    )
    WHERE users.id = user_badges.user_id
      AND friendships.status = 'accepted'
      AND users.privacy_level IN ('public', 'friends')
  )
);

-- System can insert badges (will be handled via triggers/functions)
-- Note: Badge insertion should be done via database triggers or server-side functions
-- For now, we'll allow users to insert (though this should be automated)
CREATE POLICY "System can insert badges"
ON user_badges FOR INSERT
WITH CHECK (true); -- Note: In production, restrict this via server-side logic

-- ============================================
-- INTEGRATIONS TABLE POLICIES
-- ============================================

-- Users can view their own integrations
CREATE POLICY "Users can view own integrations"
ON integrations FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own integrations
CREATE POLICY "Users can create own integrations"
ON integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own integrations
CREATE POLICY "Users can update own integrations"
ON integrations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own integrations
CREATE POLICY "Users can delete own integrations"
ON integrations FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications (for friend requests, etc.)
-- Note: In production, restrict this via server-side logic
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

