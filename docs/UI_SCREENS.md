# UI/UX Screens Documentation

## Design Principles
- **Mobile-first**: Optimized for mobile with responsive desktop layouts
- **Clean & Modern**: Minimalist design with clear visual hierarchy
- **Motivational**: Positive colors, encouraging messaging, achievement highlights
- **Fast**: Instant feedback, optimistic updates, smooth animations

## Color Palette
- **Primary**: Red (#ef4444) - Energy, motivation
- **Success**: Green (#10b981) - Achievements, completion
- **Warning**: Orange (#f59e0b) - Reminders, streaks at risk
- **Neutral**: Gray scale for backgrounds and text
- **Accent**: Gradient backgrounds for hero sections

## Typography
- **Headings**: Bold, sans-serif
- **Body**: Regular weight, readable size (16px base)
- **Numbers**: Monospace font for stats and counts

## Core Screens

### 1. Landing Page (`/`)
**Purpose**: First impression, explain value proposition

**Components:**
- Hero section with app name and tagline
- Key features (3-4 cards)
- Social proof / testimonials (optional)
- CTA buttons: "Sign Up" / "Log In"

**Layout:**
```
┌─────────────────────────────┐
│     PushUp Challenge        │
│  Build strength together    │
│                             │
│  [Sign Up]  [Log In]       │
└─────────────────────────────┘
│                             │
│  🏋️ Track Daily Progress    │
│  🏆 Compete in Challenges   │
│  👥 Connect with Friends    │
│  🔥 Earn Badges & Streaks   │
│                             │
└─────────────────────────────┘
```

---

### 2. Authentication Screens

#### Login (`/login`)
**Components:**
- Email/password form
- "Forgot password?" link
- OAuth buttons (Google, GitHub)
- "Don't have an account? Sign up" link

#### Sign Up (`/signup`)
**Components:**
- Email/password form
- Display name field
- Fitness level selector (beginner/intermediate/advanced)
- OAuth buttons
- Terms & privacy checkbox

#### Forgot Password (`/forgot-password`)
**Components:**
- Email input
- Submit button
- Back to login link

---

### 3. Dashboard (`/dashboard`)
**Purpose**: Central hub showing overview of user's progress

**Components:**
- **Header**: User avatar, notifications bell, profile menu
- **Stats Cards**:
  - Current streak (large, prominent)
  - Total push-ups (all-time)
  - This week's total
  - Longest streak
- **Quick Log**: Input field to quickly log push-ups for today
- **Recent Activity**: Last 5-7 days calendar view
- **Active Challenges**: Cards showing user's current challenges
- **Friend Activity**: Recent friend achievements/updates
- **Badges Preview**: Recently earned badges

**Layout:**
```
┌─────────────────────────────────┐
│ 👤 [Avatar]  🔔  [Menu]        │
├─────────────────────────────────┤
│                                 │
│  🔥 Current Streak: 7 days      │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 5,000│ │  350 │ │  30  │   │
│  │Total │ │Week  │ │Best  │   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  [Quick Log: __ push-ups] [Log]│
│                                 │
│  📅 This Week                    │
│  [Calendar view]                │
│                                 │
│  🏆 Active Challenges            │
│  [Challenge cards...]           │
│                                 │
└─────────────────────────────────┘
```

---

### 4. Log Push-Ups (`/log`)
**Purpose**: Log daily push-ups with detailed entry

**Components:**
- Date picker (default: today)
- Count input (number)
- Notes textarea (optional)
- Save button
- History below: List of recent entries with edit/delete

**Layout:**
```
┌─────────────────────────────────┐
│  Log Push-Ups                   │
├─────────────────────────────────┤
│                                 │
│  Date: [Jan 15, 2024]           │
│                                 │
│  Count: [____] push-ups         │
│                                 │
│  Notes:                         │
│  [________________________]     │
│  [________________________]     │
│                                 │
│  [Save Entry]                   │
│                                 │
│  Recent Entries:                │
│  • Jan 14: 50 push-ups          │
│  • Jan 13: 45 push-ups          │
│                                 │
└─────────────────────────────────┘
```

---

### 5. Calendar View (`/calendar`)
**Purpose**: Visual calendar showing push-up history

**Components:**
- Month/year selector
- Calendar grid with:
  - Date numbers
  - Push-up count badges on days with entries
  - Streak highlighting
  - Color intensity based on count
- Totals for selected month
- Click day to view/edit entry

**Visual:**
```
┌─────────────────────────────────┐
│  January 2024         [<]  [>] │
├─────────────────────────────────┤
│  Sun Mon Tue Wed Thu Fri Sat   │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐     │
│  │  │ │ 1│ │ 2│ │ 3│ │ 4│     │
│  │  │ │50│ │45│ │  │ │60│     │
│  └──┘ └──┘ └──┘ └──┘ └──┘     │
│                                 │
│  Total: 1,550 push-ups          │
└─────────────────────────────────┘
```

---

### 6. Challenges (`/challenges`)
**Purpose**: Browse and join challenges

**Components:**
- Tab filters: "Active", "Upcoming", "Completed", "My Challenges"
- Create Challenge button (floating action button on mobile)
- Challenge cards showing:
  - Challenge name
  - Duration (dates)
  - Goal/rules
  - Participant count
  - Join/View button
- Search/filter options

**Challenge Card:**
```
┌─────────────────────────────────┐
│  January Challenge              │
│  500 push-ups this month        │
│                                 │
│  📅 Jan 1 - Jan 31              │
│  👥 25 participants             │
│  🏆 Active                      │
│                                 │
│  [Join Challenge]               │
└─────────────────────────────────┘
```

---

### 7. Challenge Detail (`/challenges/[id]`)
**Purpose**: View challenge details and leaderboard

**Components:**
- Challenge header (name, dates, rules)
- User's progress card (rank, total reps, days completed)
- Leaderboard table/list:
  - Rank
  - User avatar & name
  - Total reps
  - Days completed
  - Streak
  - Action: Send trash-talk message
- Trash-talk section (if friends are in challenge)
- Progress chart (line chart showing progress over time)

**Layout:**
```
┌─────────────────────────────────┐
│  January Challenge              │
│  500 push-ups | Jan 1-31        │
├─────────────────────────────────┤
│                                 │
│  Your Progress:                 │
│  Rank: #5  |  250/500 reps      │
│  [Progress bar 50%]             │
│                                 │
│  Leaderboard:                   │
│  1. 👤 Jane Smith  450 reps     │
│  2. 👤 John Doe    380 reps     │
│  3. 👤 You         250 reps 💬  │
│                                 │
│  [Send Trash-Talk]              │
│                                 │
└─────────────────────────────────┘
```

---

### 8. Create Challenge (`/challenges/create`)
**Purpose**: Create a new challenge

**Components:**
- Challenge name input
- Description textarea
- Type selector (weekly/monthly/custom)
- Date range picker
- Visibility selector (public/friends/private)
- Rules section:
  - Total reps goal
  - Daily minimum (optional)
  - Streak requirement (optional)
- Friend selector (for private challenges)
- Create button

---

### 9. Friends (`/friends`)
**Purpose**: Manage friends and friend requests

**Components:**
- Search bar to find users
- Tabs: "Friends", "Requests" (with badge count)
- Friend cards showing:
  - Avatar & name
  - Stats (streak, total push-ups)
  - Action buttons (Message, Challenge, Compare)
- Friend request cards with Accept/Decline buttons

**Friend Card:**
```
┌─────────────────────────────────┐
│  👤 Jane Smith                  │
│                                 │
│  🔥 15 day streak               │
│  💪 5,000 total push-ups        │
│                                 │
│  [Message] [Challenge]          │
└─────────────────────────────────┘
```

---

### 10. Trash-Talk / Messages (`/messages`)
**Purpose**: View and send rivalry messages

**Components:**
- Message list (inbox-style)
- Filter: "All", "Unread", "From Friends", "Challenge-related"
- Message cards showing:
  - Sender avatar & name
  - Challenge context (if applicable)
  - Message content
  - Timestamp
  - Read/unread indicator
- Compose button (floating)
- Quick actions: Reply, Challenge, View Profile

**Message Card:**
```
┌─────────────────────────────────┐
│  👤 John Doe                    │
│  📅 January Challenge           │
│                                 │
│  "You're falling behind! 💪"    │
│                                 │
│  2 hours ago                    │
│  [Reply] [Challenge]            │
└─────────────────────────────────┘
```

---

### 11. Analytics (`/analytics`)
**Purpose**: Detailed stats and charts

**Components:**
- Time range selector (week/month/year/all-time)
- Stats summary cards
- Line chart: Push-ups over time
- Bar chart: Weekly/monthly totals
- Streak visualization
- Comparison with friends (optional)
- Export data button

**Layout:**
```
┌─────────────────────────────────┐
│  Analytics    [Week|Month|All] │
├─────────────────────────────────┤
│                                 │
│  📊 Push-Ups Over Time          │
│  [Line chart]                   │
│                                 │
│  📊 Weekly Breakdown            │
│  [Bar chart]                    │
│                                 │
│  🔥 Streak History              │
│  [Visualization]                │
│                                 │
└─────────────────────────────────┘
```

---

### 12. Profile (`/profile`)
**Purpose**: User profile and settings

**Components:**
- Profile header (avatar, name, fitness level)
- Edit profile button
- Stats overview
- Badge showcase (earned badges grid)
- Settings section:
  - Privacy settings
  - Notifications preferences
  - Integrations (Strava, Garmin)
  - Account settings (change password, delete account)

---

### 13. Badges (`/badges`)
**Purpose**: View all badges and earned achievements

**Components:**
- Tab: "Earned", "Available"
- Badge grid with:
  - Badge icon/emoji
  - Badge name
  - Description
  - Earned date (if earned)
  - Locked indicator (if not earned)
- Filter by category (streak/volume/challenge/social)

---

### 14. Integrations (`/integrations`)
**Purpose**: Connect fitness platforms

**Components:**
- Integration cards (Strava, Garmin):
  - Platform logo
  - Description
  - Connection status
  - Connect/Disconnect button
  - Last synced timestamp
- Sync button (manual sync)
- Instructions for each integration

---

## Mobile-Specific Considerations

### Navigation
- Bottom navigation bar on mobile (Dashboard, Log, Challenges, Friends, Profile)
- Hamburger menu for additional options
- Swipe gestures for quick actions

### Touch Targets
- Minimum 44x44px touch targets
- Spacing between interactive elements
- Large, accessible buttons

### Performance
- Lazy loading for images
- Infinite scroll for lists
- Optimistic UI updates
- Skeleton loaders

## Accessibility
- Screen reader support (ARIA labels)
- Keyboard navigation
- High contrast mode support
- Font size scaling
- Color-blind friendly color schemes

## Animations
- Smooth page transitions
- Micro-interactions (button presses, card hovers)
- Progress animations (streak flames, progress bars)
- Achievement celebrations (confetti, badge animations)

