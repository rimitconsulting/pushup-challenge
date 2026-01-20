# API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://yourdomain.com/api`

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are automatically managed via Supabase Auth.

---

## Push-Ups Endpoints

### `GET /api/pushups`
Get user's push-up entries.

**Query Parameters:**
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `limit` (optional): Limit results (default: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "count": 50,
      "date": "2024-01-15",
      "notes": "Morning workout",
      "created_at": "2024-01-15T08:00:00Z"
    }
  ],
  "total": 1
}
```

### `POST /api/pushups`
Log push-ups for a date.

**Request Body:**
```json
{
  "count": 50,
  "date": "2024-01-15",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "count": 50,
    "date": "2024-01-15",
    "user_id": "uuid",
    "created_at": "2024-01-15T08:00:00Z"
  },
  "stats": {
    "total_pushups": 1500,
    "current_streak": 7,
    "longest_streak": 10
  }
}
```

### `PUT /api/pushups/[id]`
Update a push-up entry.

**Request Body:**
```json
{
  "count": 60,
  "notes": "Updated count"
}
```

### `DELETE /api/pushups/[id]`
Delete a push-up entry.

**Response:**
```json
{
  "success": true
}
```

### `GET /api/pushups/stats`
Get user statistics.

**Response:**
```json
{
  "total_pushups": 5000,
  "current_streak": 7,
  "longest_streak": 30,
  "average_per_day": 50.5,
  "best_single_day": 200,
  "last_activity_date": "2024-01-15"
}
```

---

## Challenges Endpoints

### `GET /api/challenges`
Get challenges (public, friends-only, or user's challenges).

**Query Parameters:**
- `status` (optional): Filter by status (`upcoming`, `active`, `completed`)
- `visibility` (optional): Filter by visibility (`public`, `friends`, `private`)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "January Push-Up Challenge",
      "description": "500 push-ups this month",
      "type": "monthly",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "visibility": "public",
      "status": "active",
      "creator": {
        "id": "uuid",
        "display_name": "John Doe"
      },
      "participant_count": 25,
      "user_participation": true
    }
  ]
}
```

### `POST /api/challenges`
Create a new challenge.

**Request Body:**
```json
{
  "name": "Weekly Warrior",
  "description": "300 push-ups this week",
  "type": "weekly",
  "start_date": "2024-01-15",
  "end_date": "2024-01-21",
  "visibility": "friends",
  "rules": {
    "total_reps": 300,
    "daily_minimum": 30
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Weekly Warrior",
    "creator_id": "uuid",
    "created_at": "2024-01-14T12:00:00Z"
  }
}
```

### `GET /api/challenges/[id]`
Get challenge details.

**Response:**
```json
{
  "id": "uuid",
  "name": "January Push-Up Challenge",
  "description": "500 push-ups this month",
  "type": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "visibility": "public",
  "status": "active",
  "rules": {
    "total_reps": 500,
    "daily_minimum": 50
  },
  "creator": {
    "id": "uuid",
    "display_name": "John Doe",
    "avatar_url": "https://..."
  },
  "participants": [
    {
      "user_id": "uuid",
      "display_name": "Jane Smith",
      "total_reps": 250,
      "days_completed": 10,
      "current_streak": 5,
      "rank": 1
    }
  ],
  "user_participation": {
    "total_reps": 200,
    "days_completed": 8,
    "current_streak": 3,
    "rank": 5
  }
}
```

### `POST /api/challenges/[id]/join`
Join a challenge.

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined challenge"
}
```

### `POST /api/challenges/[id]/leave`
Leave a challenge.

**Response:**
```json
{
  "success": true,
  "message": "Successfully left challenge"
}
```

### `GET /api/challenges/[id]/leaderboard`
Get challenge leaderboard.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "data": [
    {
      "rank": 1,
      "user_id": "uuid",
      "display_name": "Jane Smith",
      "avatar_url": "https://...",
      "total_reps": 450,
      "days_completed": 15,
      "current_streak": 10
    }
  ]
}
```

---

## Friends Endpoints

### `GET /api/friends`
Get user's friends and pending requests.

**Query Parameters:**
- `status` (optional): Filter by status (`accepted`, `pending`)

**Response:**
```json
{
  "friends": [
    {
      "id": "uuid",
      "display_name": "Jane Smith",
      "avatar_url": "https://...",
      "fitness_level": "intermediate",
      "current_streak": 15,
      "total_pushups": 5000,
      "friendship_id": "uuid",
      "status": "accepted"
    }
  ],
  "pending_sent": [...],
  "pending_received": [...]
}
```

### `POST /api/friends/request`
Send a friend request.

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "friendship": {
    "id": "uuid",
    "requester_id": "uuid",
    "addressee_id": "uuid",
    "status": "pending"
  }
}
```

### `POST /api/friends/[friendshipId]/accept`
Accept a friend request.

**Response:**
```json
{
  "success": true,
  "message": "Friend request accepted"
}
```

### `POST /api/friends/[friendshipId]/decline`
Decline a friend request.

**Response:**
```json
{
  "success": true,
  "message": "Friend request declined"
}
```

### `DELETE /api/friends/[friendshipId]`
Remove a friend.

**Response:**
```json
{
  "success": true,
  "message": "Friend removed"
}
```

### `GET /api/friends/search?q=username`
Search for users to add as friends.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "display_name": "John Doe",
      "avatar_url": "https://...",
      "fitness_level": "advanced",
      "is_friend": false,
      "has_pending_request": false
    }
  ]
}
```

---

## Trash-Talk / Rivalry Endpoints

### `GET /api/trash-talk`
Get trash-talk messages (sent and received).

**Query Parameters:**
- `type` (optional): Filter by type (`sent`, `received`, `all`)
- `challenge_id` (optional): Filter by challenge
- `unread` (optional): Only unread messages

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sender": {
        "id": "uuid",
        "display_name": "John Doe",
        "avatar_url": "https://..."
      },
      "recipient": {
        "id": "uuid",
        "display_name": "Jane Smith"
      },
      "challenge_id": "uuid",
      "challenge_name": "January Challenge",
      "message": "You're falling behind! 💪",
      "message_type": "rivalry",
      "read": false,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### `POST /api/trash-talk`
Send a trash-talk message.

**Request Body:**
```json
{
  "recipient_id": "uuid",
  "challenge_id": "uuid", // optional
  "message": "You're falling behind! 💪",
  "message_type": "rivalry" // or "custom", "challenge", "achievement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### `PUT /api/trash-talk/[id]/read`
Mark message as read.

**Response:**
```json
{
  "success": true
}
```

---

## Badges Endpoints

### `GET /api/badges`
Get all available badges.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "7-Day Streak",
      "description": "Complete 7 consecutive days",
      "icon": "🔥",
      "category": "streak",
      "criteria": {
        "type": "streak",
        "value": 7
      }
    }
  ]
}
```

### `GET /api/badges/user`
Get user's earned badges.

**Response:**
```json
{
  "data": [
    {
      "badge_id": "uuid",
      "badge": {
        "name": "7-Day Streak",
        "description": "Complete 7 consecutive days",
        "icon": "🔥"
      },
      "earned_at": "2024-01-10T12:00:00Z"
    }
  ]
}
```

---

## Integrations Endpoints

### `GET /api/integrations`
Get user's connected integrations.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "provider": "strava",
      "enabled": true,
      "last_synced_at": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### `POST /api/integrations/strava/connect`
Initiate Strava OAuth flow.

**Response:**
```json
{
  "auth_url": "https://www.strava.com/oauth/authorize?..."
}
```

### `POST /api/integrations/strava/callback`
Handle Strava OAuth callback.

**Request Body:**
```json
{
  "code": "oauth_code",
  "state": "state_token"
}
```

### `POST /api/integrations/[id]/sync`
Manually sync integration data.

**Response:**
```json
{
  "success": true,
  "synced_items": 5,
  "message": "Sync completed"
}
```

### `DELETE /api/integrations/[id]`
Disconnect an integration.

**Response:**
```json
{
  "success": true,
  "message": "Integration disconnected"
}
```

---

## User Profile Endpoints

### `GET /api/user/profile`
Get current user's profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "fitness_level": "intermediate",
  "bio": "Fitness enthusiast",
  "privacy_level": "friends",
  "stats": {
    "total_pushups": 5000,
    "current_streak": 7,
    "longest_streak": 30
  }
}
```

### `PUT /api/user/profile`
Update user profile.

**Request Body:**
```json
{
  "display_name": "John Doe",
  "fitness_level": "advanced",
  "bio": "Updated bio",
  "privacy_level": "public"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

