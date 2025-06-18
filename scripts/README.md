# Scripts

This directory contains utility scripts for managing the application.

## cleanup-user-scores.ts

Removes all score-related data for a specific user from Redis.

### Usage

```bash
# Run the cleanup script
pnpm run cleanup:scores
```

### What it does

The script will remove the specified user ("Cooker" by default) from:

1. **All leaderboards:**

   - Lifetime scores
   - Category scores (trading, social, influence, achievement)
   - Time-based scores (daily, weekly, monthly) for the last 365 days

2. **User-specific data:**
   - All keys matching `user:{username}:*`
   - All keys matching `trader:{username}:*`
   - This includes:
     - Recent actions
     - Achievements
     - Streaks
     - Action counters
     - Daily limits
     - Stats and volume data

### Configuration

To change the target user, edit the `USERNAME_TO_CLEANUP` constant in the script:

```typescript
const USERNAME_TO_CLEANUP = 'Cooker' // Change this to target a different user
```

### Safety Features

- Shows a 3-second warning before proceeding
- Logs all operations for transparency
- Reports any errors encountered
- Shows a summary of what was removed

### Example Output

```
🚀 Score Cleanup Script
📍 Target user: Cooker
⏰ Started at: 2024-01-10T10:30:00.000Z
✅ Redis connection established

⚠️  WARNING: This will permanently delete all score data for this user!
Press Ctrl+C to cancel, or wait 3 seconds to continue...

🧹 Starting cleanup for user: Cooker
==================================================

📊 Removing from leaderboards...
  ✅ Removed from scores:lifetime
  ✅ Removed from scores:category:trading

📅 Removing from time-based leaderboards...
  ✅ Checked 1095 time-based leaderboards

🗑️  Removing user-specific data...
  Found 15 keys matching pattern: user:Cooker:*
  Found 3 keys matching pattern: trader:Cooker:*

==================================================
📋 CLEANUP SUMMARY:
  ✅ Total items removed: 20
  ✅ Keys affected: 20
==================================================

✅ Cleanup completed successfully!
👋 Script finished
```
