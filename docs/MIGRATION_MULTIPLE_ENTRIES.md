# Migration: Allow Multiple Entries Per Day

## Overview
Updated the database schema and application code to allow users to log multiple push-up entries for the same day (e.g., morning and evening workouts).

## Database Changes

### Remove Unique Constraint

Run this SQL in Supabase SQL Editor to remove the unique constraint:

```sql
-- Remove the unique constraint on (user_id, date)
ALTER TABLE pushups DROP CONSTRAINT IF EXISTS pushups_user_id_date_key;
```

Note: The constraint name might vary. If the above doesn't work, first check the constraint name:

```sql
-- Find the constraint name
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'pushups' 
  AND constraint_type = 'UNIQUE';
```

Then drop it:
```sql
ALTER TABLE pushups DROP CONSTRAINT <constraint_name>;
```

## Code Changes

✅ **Already Updated:**
- Changed `upsert()` to `insert()` in pushups API
- Changed `upsert()` to `insert()` in dashboard quick log
- Changed `upsert()` to `insert()` in log page
- Updated best_single_day calculation to sum all entries per day
- Updated log page to handle multiple entries per day

## Behavior Changes

### Before:
- Only one entry allowed per day per user
- Logging a new entry for the same day would update the existing entry

### After:
- Multiple entries allowed per day per user
- Each log creates a new entry
- Daily totals are summed across all entries for that day
- Streaks work the same (at least one entry per day)
- Best single day now reflects the total push-ups across all entries in a day

## Example

**Before:**
- Morning: Log 50 push-ups → Saved
- Evening: Log 30 push-ups → **Replaces** morning entry (now just 30)

**After:**
- Morning: Log 50 push-ups → Saved
- Evening: Log 30 push-ups → **New entry** (total for day: 80)
- Daily total: 80 push-ups

## UI Impact

- Log page: Shows all entries separately (not grouped by day)
- Dashboard: Shows daily totals summed across all entries
- Calendar view: Shows total push-ups per day (sum of all entries)
- Statistics: Best single day now reflects the best day's total (sum of all entries)

## Notes

- Existing data remains unchanged
- No data migration needed
- The unique constraint removal is the only database change required

