# 📱 SoulLens AI Mobile Foundation Deployment Guide

## Overview
This guide will deploy the mobile-optimized SoulLens AI foundation with advanced features for iOS/Android apps, offline sync, push notifications, and subscription management.

## 🚀 Phase 1: Database Migration

### Step 1: Deploy Mobile Foundation Schema
```bash
# Deploy the mobile-optimized database tables
npx supabase db push

# Or manually run in Supabase SQL Editor:
# 1. Run: supabase/migrations/20241130_mobile_foundation.sql
# 2. Run: supabase/migrations/20241130_mobile_rls_policies.sql  
# 3. Run: supabase/migrations/20241130_mobile_functions.sql
```

### Step 2: Enable Required Extensions
In your Supabase SQL Editor, run:
```sql
-- Enable required extensions for mobile features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### Step 3: Set Up Authentication Providers

#### Apple Sign-In (iOS)
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Apple provider
3. Add your Apple App ID and certificates
4. Set redirect URL: `soullens://auth/callback`

#### Google Sign-In (Android)
1. Enable Google provider in Supabase
2. Add your Google OAuth credentials
3. Set redirect URL: `soullens://auth/callback`

## 📊 Mobile Database Features

### ✅ Core Tables Created
- **`users`** - Enhanced user management with mobile fields
- **`user_profiles`** - Mobile-optimized user preferences
- **`conversations`** - AI conversations with offline sync
- **`messages`** - Individual messages with sentiment tracking
- **`user_patterns`** - Personal development pattern recognition
- **`insights`** - AI-generated insights with expiration
- **`journal_entries`** - Mobile journal with mood tracking
- **`usage_tracking`** - Daily usage analytics
- **`user_sessions`** - Mobile session tracking
- **`mobile_analytics`** - Event tracking for mobile apps
- **`subscription_events`** - Mobile subscription management
- **`notification_queue`** - Push notification system
- **`sync_queue`** - Offline sync management

### ✅ Mobile Performance Optimizations
- Strategic indexes for mobile queries
- Row Level Security (RLS) on all tables
- Optimized functions for frequent mobile operations
- Real-time subscriptions with battery-friendly limits

## 🔧 Business Logic Functions

### `check_trial_status()`
Critical function for mobile apps - checks user trial status and message limits:
```sql
SELECT * FROM check_trial_status();
-- Returns: trial status, days remaining, message limits, available features
```

### `track_mobile_usage()`
Tracks user events and updates analytics:
```sql
SELECT track_mobile_usage('message_sent', 'ios', '1.0.0', '{"persona": "mentor"}');
```

### `get_mobile_dashboard()`
Single optimized query for mobile dashboard:
```sql
SELECT get_mobile_dashboard();
-- Returns: user stats, conversations, insights, usage data
```

### `schedule_mobile_notifications()`
Automatically schedules push notifications:
```sql
SELECT schedule_mobile_notifications();
-- Returns: number of notifications scheduled
```

## 📱 Mobile API Integration

### Using the Mobile API Client
```javascript
import { mobileAPI, mobileAuth } from './lib/supabase-mobile.js'

// Check trial status
const status = await mobileAPI.checkTrialStatus()
console.log(`Messages today: ${status.data.messages_today}/3`)

// Track events
await mobileAPI.trackEvent('app_opened', 'ios', '1.0.0')

// Send message with trial checking
const result = await mobileAPI.sendMessage(conversationId, 'Hello!', 'mentor')
```

### Authentication Examples
```javascript
// Apple Sign-In (iOS)
const { data, error } = await mobileAuth.signInWithApple()

// Google Sign-In (Android)
const { data, error } = await mobileAuth.signInWithGoogle()

// Phone authentication
const { data, error } = await mobileAuth.signInWithPhone('+1234567890')
```

## 🔄 Migration from Existing Schema

### Data Migration Strategy
If you have existing data in the old schema:

1. **Backup existing data** first
2. **Map old tables to new structure**:
   - `profiles` → `users` + `user_profiles`
   - `conversations.messages` (JSONB) → `messages` table
   - `journal_entries` → enhanced `journal_entries`

3. **Run migration script** (create custom migration based on your data)

### Backward Compatibility
The new mobile foundation is designed to coexist with existing tables. You can:
- Keep existing API routes working
- Gradually migrate to mobile-optimized endpoints
- Run both schemas in parallel during transition

## 🔒 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Service role has admin access for backend operations
- Optimized policies for mobile performance

### Data Privacy
- Automatic data isolation per user
- Optional data deletion workflows
- Privacy settings in user profiles
- GDPR-compliant data handling

## 📈 Analytics & Monitoring

### Mobile Analytics Tracking
```javascript
// Track screen views
await mobileAPI.trackEvent('screen_view', 'ios', '1.0.0', {
  screen_name: 'chat',
  session_id: sessionId
})

// Track user actions
await mobileAPI.trackEvent('button_click', 'android', '1.0.0', {
  button_name: 'send_message',
  persona: 'mentor'
})
```

### Usage Monitoring
- Daily active users (DAU)
- Message volume per user
- Feature adoption rates
- Crash reporting integration
- Session duration tracking

## 🔔 Push Notifications

### Notification Types
- **Daily reminders** - Timezone-aware reflection prompts
- **Insight notifications** - When AI discovers patterns
- **Trial expiration** - Subscription conversion
- **Retention campaigns** - Re-engagement for inactive users

### Scheduling Notifications
```sql
-- Auto-schedule daily reminders
SELECT schedule_mobile_notifications();

-- Manual notification
INSERT INTO notification_queue (user_id, notification_type, title, body, scheduled_for)
VALUES (user_id, 'insight_ready', '💡 New insight!', 'Check your latest pattern discovery', NOW() + INTERVAL '1 hour');
```

## 💰 Subscription Management

### Trial System
- 14-day free trial per user
- 3 messages per day during trial
- Limited to 'mentor' persona only
- Automatic trial status checking

### Premium Features
- Unlimited daily messages
- All 6 AI personas available
- Advanced insights and analytics
- Voice message support (future)
- Data export capabilities

### Subscription Events Tracking
```javascript
// Track subscription events
INSERT INTO subscription_events (user_id, event_type, platform, transaction_id, amount_cents)
VALUES (user_id, 'subscription_created', 'ios', 'txn_123', 999);
```

## 🔧 Environment Configuration

Update your `.env` file with mobile-specific variables:
```bash
# Mobile-specific settings
NEXT_PUBLIC_APP_ENV=mobile
NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME=soullens
NEXT_PUBLIC_APPLE_APP_ID=your-apple-app-id
NEXT_PUBLIC_GOOGLE_PLAY_ID=your-google-play-id

# Push notifications
NEXT_PUBLIC_FIREBASE_SERVER_KEY=your-firebase-key
NEXT_PUBLIC_APPLE_PUSH_CERT=your-apple-cert

# Mobile analytics
NEXT_PUBLIC_MOBILE_ANALYTICS_KEY=your-analytics-key
```

## 🧪 Testing the Mobile Foundation

### 1. Test Database Functions
```sql
-- Test trial status
SELECT * FROM check_trial_status();

-- Test usage tracking
SELECT track_mobile_usage('test_event', 'web', '1.0.0', '{}');

-- Test dashboard data
SELECT get_mobile_dashboard();
```

### 2. Test Mobile API
```javascript
// Test in browser console or Node.js
import { mobileAPI } from './lib/supabase-mobile.js'

const status = await mobileAPI.checkTrialStatus()
console.log('Trial Status:', status)

const dashboard = await mobileAPI.getDashboardData()
console.log('Dashboard:', dashboard)
```

### 3. Test Real-time Features
```javascript
// Subscribe to conversation updates
const subscription = mobileAPI.subscribeToConversation(conversationId, (payload) => {
  console.log('New message:', payload)
})
```

## 🚀 Next Steps

1. **Deploy the migrations** to your Supabase project
2. **Test all functions** in the SQL Editor
3. **Update your frontend** to use mobile API client
4. **Configure authentication providers** for mobile
5. **Set up push notification service** (Firebase/APNs)
6. **Implement subscription logic** with App Store/Play Store
7. **Add mobile analytics tracking** throughout your app

## 📊 Performance Benchmarks

The mobile foundation is optimized for:
- **Sub-100ms** trial status checks
- **Single query** dashboard loads
- **Batch insertions** for analytics
- **Efficient real-time** subscriptions
- **Minimal battery drain** from notifications

## 🐛 Troubleshooting

### Common Issues
1. **RLS Policy Errors**: Make sure user is authenticated before accessing tables
2. **Function Not Found**: Ensure migrations ran successfully
3. **Subscription Limits**: Check trial status before allowing actions
4. **Real-time Issues**: Verify RLS policies allow real-time access

Your mobile-optimized SoulLens AI foundation is now ready! 🎉