# System Architecture & Tech Stack

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile Web  │  │  React Native│     │
│  │  (Next.js)   │  │  (Responsive)│  │   (Future)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ REST API     │  │  Auth API    │  │ Webhooks     │     │
│  │ /api/*       │  │  (Supabase)  │  │ (Integrations)│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Supabase    │  │  Supabase    │  │ External APIs│     │
│  │  PostgreSQL  │  │  Auth        │  │ (Strava/     │     │
│  │  Database    │  │  + Storage   │  │  Garmin)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + Headless UI
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **BaaS**: Supabase (free tier)
  - PostgreSQL database
  - Authentication (email/password, OAuth)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage (for avatars)

### API
- **Type**: REST API (Next.js API routes)
- **Authentication**: JWT tokens (Supabase)
- **Rate Limiting**: Built into Supabase / Vercel
- **CORS**: Configured for web app

### External Integrations
- **Strava API**: OAuth 2.0 for workout data
- **Garmin API**: OAuth for Garmin Connect data
- **Future**: Apple HealthKit, Google Fit

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint (Next.js config)
- **Type Checking**: TypeScript
- **Git**: Version control

### Deployment
- **Web**: Vercel (recommended, free tier)
- **Database**: Supabase Cloud (free tier)
- **CDN**: Vercel Edge Network
- **Analytics**: Vercel Analytics (optional)

## 📁 Project Structure

```
pushup-challenge/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── log/           # Log push-ups
│   │   ├── challenges/    # Challenges list
│   │   ├── friends/       # Friends management
│   │   ├── profile/       # User profile
│   │   └── analytics/     # Stats & charts
│   ├── api/               # API routes
│   │   ├── pushups/       # Push-up CRUD
│   │   ├── challenges/    # Challenge management
│   │   ├── friends/       # Friend requests
│   │   ├── trash-talk/    # Rivalry messages
│   │   └── integrations/  # Strava/Garmin
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components
├── lib/                   # Utilities & helpers
│   ├── supabase/         # Supabase client & helpers
│   ├── utils/            # General utilities
│   └── validations/      # Zod schemas
├── types/                 # TypeScript types
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── docs/                  # Documentation

```

## 🔄 Data Flow

### Authentication Flow
1. User signs up/logs in → Supabase Auth
2. JWT token stored in HTTP-only cookie
3. Middleware validates token on protected routes
4. User data fetched from database

### Push-Up Logging Flow
1. User enters push-ups → Client validation (Zod)
2. POST `/api/pushups` → Server validation
3. Insert into database → Supabase PostgreSQL
4. Real-time update → Broadcast to subscribed clients
5. Streak calculation → Database trigger/function
6. Badge check → Background job or trigger

### Challenge Flow
1. User creates challenge → POST `/api/challenges`
2. Challenge stored in database
3. Friends invited → Notifications sent
4. Users join → Update challenge_participants
5. Push-ups logged → Update challenge progress
6. Leaderboard updates → Real-time via Supabase subscriptions

## 🔐 Security Architecture

### Authentication
- JWT tokens (Supabase)
- HTTP-only cookies (secure, SameSite)
- Refresh token rotation
- OAuth 2.0 for third-party logins

### Authorization
- Row Level Security (RLS) in Supabase
- User can only access their own data
- Friend relationships checked server-side
- Challenge visibility enforced

### Data Protection
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries)
- XSS protection (React's built-in escaping)
- CSRF protection (SameSite cookies)

## 📊 Database Architecture

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema.

### Key Tables
- `users` - User profiles
- `pushups` - Push-up entries
- `challenges` - Challenge definitions
- `challenge_participants` - Challenge membership
- `friendships` - Friend relationships
- `trash_talk` - Rivalry messages
- `badges` - Badge definitions
- `user_badges` - Earned badges

## 🚀 Performance Considerations

### Client-Side
- Code splitting (Next.js automatic)
- Image optimization (next/image)
- Lazy loading for charts
- Memoization for expensive calculations

### Server-Side
- API route caching where appropriate
- Database indexes on frequently queried columns
- Connection pooling (Supabase handles this)
- Pagination for large datasets

### Real-Time
- Supabase real-time subscriptions (efficient)
- Selective subscriptions (only relevant data)
- Debouncing for rapid updates

## 🔌 Integration Architecture

### Strava Integration
1. OAuth flow → Redirect to Strava
2. User authorizes → Callback with code
3. Exchange code for access token
4. Store token securely in database
5. Periodic sync (webhook or cron)
6. Parse workout data → Extract push-ups
7. Present to user for confirmation

### Garmin Integration
Similar flow to Strava with Garmin Connect API.

## 📱 Mobile Strategy

### Phase 1: Responsive Web
- Mobile-first CSS
- Touch-optimized interactions
- PWA capabilities (installable)

### Phase 2: React Native App
- Shared business logic
- Native performance
- Push notifications
- Better offline support

## 🧪 Testing Strategy (Future)
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright
- API tests: Supertest
- Database tests: Test database with fixtures

