-- SOULLENS MOBILE-FIRST DATABASE SCHEMA
-- Optimized for iOS/Android apps with offline sync

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- MOBILE USERS & AUTHENTICATION
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  apple_id TEXT UNIQUE, -- Apple Sign-In
  google_id TEXT UNIQUE, -- Google Sign-In
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'premium')),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
  device_tokens TEXT[] DEFAULT '{}', -- Push notification tokens
  app_version TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_banned BOOLEAN DEFAULT FALSE,
  deletion_requested_at TIMESTAMP WITH TIME ZONE
);

-- MOBILE USER PROFILES
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  goals TEXT[] DEFAULT '{}',
  ai_companion_name TEXT DEFAULT 'Sage',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'UTC',
  preferred_notification_time TIME DEFAULT '19:00',
  privacy_settings JSONB DEFAULT '{
    "analytics_enabled": true,
    "crash_reporting": true,
    "personalized_ads": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MOBILE AI CONVERSATIONS
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_type TEXT DEFAULT 'chat' CHECK (session_type IN ('chat', 'journal', 'reflection')),
  persona_used TEXT DEFAULT 'mentor' CHECK (persona_used IN ('mentor', 'coach', 'friend', 'challenger', 'therapist', 'sage')),
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_platform TEXT,
  is_synced BOOLEAN DEFAULT TRUE,
  conversation_title TEXT,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- MOBILE MESSAGES WITH OFFLINE SYNC
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  persona TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sentiment_score FLOAT CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  is_synced BOOLEAN DEFAULT TRUE,
  local_id TEXT, -- For offline sync
  edited_at TIMESTAMP WITH TIME ZONE,
  parent_message_id UUID REFERENCES messages(id)
);

-- MOBILE PERSONAL DEVELOPMENT DATA
CREATE TABLE user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern_type TEXT CHECK (pattern_type IN ('emotional', 'behavioral', 'conversational', 'growth')),
  description TEXT NOT NULL,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  identified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_points INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evidence_messages UUID[] DEFAULT '{}', -- Message IDs that support this pattern
  is_active BOOLEAN DEFAULT TRUE
);

-- MOBILE AI INSIGHTS
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('growth', 'pattern', 'recommendation', 'warning')),
  relevance_score FLOAT CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'ai_analysis',
  triggered_by_message_id UUID REFERENCES messages(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  action_taken BOOLEAN DEFAULT FALSE
);

-- MOBILE JOURNAL ENTRIES
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  mood_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reflection_prompts TEXT[] DEFAULT '{}',
  ai_insights TEXT[] DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  is_synced BOOLEAN DEFAULT TRUE,
  local_id TEXT,
  photos_attached TEXT[] DEFAULT '{}', -- Future: voice notes, photos
  location_context TEXT -- Future: location-based insights
);

-- MOBILE USAGE TRACKING & ANALYTICS
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  messages_sent INTEGER DEFAULT 0,
  personas_used TEXT[] DEFAULT '{}',
  features_accessed TEXT[] DEFAULT '{}',
  session_count INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  ai_calls_made INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  journal_entries INTEGER DEFAULT 0,
  
  -- Mobile-specific metrics
  app_opens INTEGER DEFAULT 0,
  push_notifications_opened INTEGER DEFAULT 0,
  crash_count INTEGER DEFAULT 0,
  background_time_minutes INTEGER DEFAULT 0,
  
  UNIQUE(user_id, date)
);

-- MOBILE SESSION TRACKING
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  app_version TEXT,
  device_model TEXT,
  os_version TEXT,
  pages_visited TEXT[] DEFAULT '{}',
  messages_sent INTEGER DEFAULT 0,
  session_duration_seconds INTEGER,
  push_notification_source TEXT, -- What brought them back
  crash_occurred BOOLEAN DEFAULT FALSE,
  network_type TEXT -- wifi, cellular, offline
);

-- MOBILE ANALYTICS EVENTS
CREATE TABLE mobile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  platform TEXT,
  app_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID REFERENCES user_sessions(id),
  screen_name TEXT,
  user_agent TEXT
);

-- MOBILE SUBSCRIPTION MANAGEMENT
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN (
    'trial_started', 'subscription_created', 'payment_succeeded', 
    'payment_failed', 'subscription_cancelled', 'subscription_renewed',
    'refund_issued', 'chargeback_received'
  )),
  platform TEXT CHECK (platform IN ('ios', 'android', 'stripe', 'manual')),
  transaction_id TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  subscription_period_start TIMESTAMP WITH TIME ZONE,
  subscription_period_end TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MOBILE PUSH NOTIFICATIONS
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN (
    'daily_reminder', 'insight_ready', 'streak_reminder', 
    'conversation_followup', 'trial_ending', 'welcome_series',
    'retention_campaign', 'feature_announcement'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
  device_tokens TEXT[] DEFAULT '{}',
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0
);

-- MOBILE OFFLINE SYNC
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT CHECK (operation IN ('insert', 'update', 'delete')),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT
);

-- Create indexes for mobile performance
CREATE INDEX idx_users_last_active ON users(last_active DESC);
CREATE INDEX idx_users_platform ON users(platform);
CREATE INDEX idx_users_subscription ON users(subscription_tier, trial_ends_at);

CREATE INDEX idx_conversations_user_recent ON conversations(user_id, last_message_at DESC);
CREATE INDEX idx_conversations_platform ON conversations(device_platform);

CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, timestamp DESC);
CREATE INDEX idx_messages_sync ON messages(is_synced, timestamp) WHERE NOT is_synced;

CREATE INDEX idx_insights_user_unread ON insights(user_id, is_read, created_at DESC);
CREATE INDEX idx_insights_category ON insights(category, created_at DESC);

CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, date DESC);
CREATE INDEX idx_usage_tracking_date ON usage_tracking(date DESC);

CREATE INDEX idx_mobile_analytics_user_event ON mobile_analytics(user_id, event_type, created_at DESC);
CREATE INDEX idx_mobile_analytics_platform ON mobile_analytics(platform, created_at DESC);

CREATE INDEX idx_notifications_scheduled ON notification_queue(scheduled_for, status);
CREATE INDEX idx_notifications_user_status ON notification_queue(user_id, status);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_analytics ENABLE ROW LEVEL SECURITY;