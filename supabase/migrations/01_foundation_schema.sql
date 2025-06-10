-- SoulLens AI Complete Database Schema
-- Foundation migration - Core tables and extensions
-- Version: 1.0.0
-- Production-ready for 50K+ users

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set timezone
SET timezone = 'UTC';

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing', 'unpaid');
CREATE TYPE conversation_type AS ENUM ('chat', 'journal_session', 'program_discussion', 'support');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE program_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
CREATE TYPE completion_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped');
CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE tier_required AS ENUM ('free', 'premium');

-- =========================================================================
-- CORE USER TABLES
-- =========================================================================

-- Enhanced profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    
    -- Subscription information
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    subscription_id TEXT, -- Stripe subscription ID
    customer_id TEXT, -- Stripe customer ID
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_current_period_start TIMESTAMP WITH TIME ZONE,
    subscription_current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- User preferences
    timezone TEXT DEFAULT 'UTC',
    preferred_language TEXT DEFAULT 'en',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    theme_preference TEXT DEFAULT 'auto', -- 'light', 'dark', 'auto'
    
    -- Privacy and notifications
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false,
    analytics_consent BOOLEAN DEFAULT true,
    
    -- Profile status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table for detailed preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- AI Preferences
    ai_persona TEXT DEFAULT 'balanced', -- 'mentor', 'friend', 'therapist', 'coach', 'balanced'
    response_style TEXT DEFAULT 'balanced', -- 'concise', 'detailed', 'balanced'
    conversation_memory BOOLEAN DEFAULT true,
    
    -- Journal Settings
    journal_reminders JSONB DEFAULT '{
        "enabled": false,
        "time": "20:00",
        "frequency": "daily",
        "timezone": "UTC"
    }',
    journal_privacy_level TEXT DEFAULT 'private', -- 'private', 'anonymous_insights'
    auto_save_drafts BOOLEAN DEFAULT true,
    
    -- Program Settings
    program_reminders BOOLEAN DEFAULT true,
    daily_goal_reminders BOOLEAN DEFAULT true,
    progress_sharing BOOLEAN DEFAULT false,
    
    -- Interface Settings
    mobile_app_settings JSONB DEFAULT '{
        "offline_mode": true,
        "auto_sync": true,
        "data_saver": false
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for analytics and mobile app tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session details
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    session_duration_seconds INTEGER,
    
    -- Device information
    platform TEXT NOT NULL, -- 'web', 'ios', 'android'
    device_model TEXT,
    app_version TEXT,
    os_version TEXT,
    browser_name TEXT,
    browser_version TEXT,
    
    -- Activity tracking
    pages_visited TEXT[] DEFAULT '{}',
    actions_performed JSONB DEFAULT '{}',
    messages_sent INTEGER DEFAULT 0,
    journal_entries_created INTEGER DEFAULT 0,
    
    -- Location (anonymized)
    country_code CHAR(2),
    timezone TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- CONVERSATIONS AND MESSAGING
-- =========================================================================

-- Conversations table for chat history
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Conversation metadata
    title TEXT NOT NULL,
    conversation_type conversation_type DEFAULT 'chat',
    persona_used TEXT DEFAULT 'balanced',
    
    -- Context and state
    context_data JSONB DEFAULT '{}', -- Previous conversations, journal context, etc.
    conversation_summary TEXT,
    total_messages INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Settings
    is_archived BOOLEAN DEFAULT false,
    is_favorited BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for individual chat messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Message content
    role message_role NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Token count, processing time, model used, etc.
    
    -- AI processing details
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    model_used TEXT,
    persona_used TEXT,
    
    -- Message state
    is_edited BOOLEAN DEFAULT false,
    edit_history JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- JOURNAL SYSTEM
-- =========================================================================

-- Journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Entry content
    title TEXT,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    
    -- Contextual information
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    entry_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    question_prompt TEXT, -- If responding to a specific prompt
    
    -- Emotional analysis
    primary_emotion TEXT,
    emotion_intensity INTEGER CHECK (emotion_intensity >= 1 AND emotion_intensity <= 10),
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
    emotions_detected TEXT[] DEFAULT '{}',
    
    -- Categorization
    category TEXT DEFAULT 'general', -- 'gratitude', 'reflection', 'goals', 'challenges', etc.
    tags TEXT[] DEFAULT '{}',
    
    -- AI analysis results
    ai_insights JSONB DEFAULT '{}',
    key_themes TEXT[] DEFAULT '{}',
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    
    -- Privacy and sharing
    is_private BOOLEAN DEFAULT true,
    allow_ai_analysis BOOLEAN DEFAULT true,
    
    -- Related content
    related_conversation_id UUID REFERENCES public.conversations(id),
    related_program_lesson_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal insights cache for performance
CREATE TABLE IF NOT EXISTS public.journal_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Analysis scope
    timeframe TEXT NOT NULL, -- 'week', 'month', 'quarter', 'year', 'all'
    analysis_type TEXT NOT NULL, -- 'mood_trends', 'emotion_patterns', 'theme_analysis', 'growth_insights'
    
    -- Results
    insights JSONB NOT NULL,
    entry_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2), -- 0.0 to 1.0
    
    -- Cache management
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    last_updated_entry_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- PROGRAMS SYSTEM
-- =========================================================================

-- Programs table for structured courses
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic information
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT NOT NULL,
    detailed_description TEXT,
    
    -- Program structure
    duration_days INTEGER NOT NULL,
    difficulty_level difficulty_level NOT NULL,
    tier_required tier_required NOT NULL DEFAULT 'free',
    category TEXT NOT NULL,
    
    -- Content
    preview_content JSONB DEFAULT '{}',
    learning_outcomes TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    success_metrics JSONB DEFAULT '{}',
    
    -- Pricing and access
    price_cents INTEGER DEFAULT 0,
    currency_code CHAR(3) DEFAULT 'USD',
    
    -- Status and ordering
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Analytics
    total_enrollments INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program lessons table
CREATE TABLE IF NOT EXISTS public.program_lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    
    -- Lesson structure
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    estimated_duration INTEGER DEFAULT 15, -- minutes
    
    -- Content
    lesson_content JSONB NOT NULL, -- Introduction, main content, exercises, reflection questions
    learning_objectives TEXT[] DEFAULT '{}',
    integration_prompts JSONB DEFAULT '{}', -- AI chat and journal prompts
    completion_criteria JSONB DEFAULT '{}',
    
    -- Resources
    additional_resources JSONB DEFAULT '{}', -- Links, documents, videos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(program_id, day_number)
);

-- User program enrollments
CREATE TABLE IF NOT EXISTS public.user_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    
    -- Enrollment details
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    status program_status DEFAULT 'active',
    
    -- Progress tracking
    current_day INTEGER DEFAULT 1,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Engagement metrics
    streak_count INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- minutes
    lessons_completed INTEGER DEFAULT 0,
    
    -- Personalization
    settings JSONB DEFAULT '{}', -- User preferences for this program
    notes TEXT,
    
    -- Payment (if applicable)
    payment_id TEXT, -- Stripe payment intent ID
    amount_paid_cents INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, program_id)
);

-- Program progress tracking (daily lesson completion)
CREATE TABLE IF NOT EXISTS public.program_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_program_id UUID REFERENCES public.user_programs(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.program_lessons(id) ON DELETE CASCADE NOT NULL,
    
    -- Completion details
    completion_status completion_status DEFAULT 'not_started',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- minutes
    
    -- User interaction
    reflection_notes TEXT,
    lesson_rating INTEGER CHECK (lesson_rating >= 1 AND lesson_rating <= 5),
    completion_data JSONB DEFAULT '{}', -- Exercise responses, quiz answers, etc.
    
    -- AI integration
    ai_integration_used BOOLEAN DEFAULT false,
    related_journal_entry_id UUID REFERENCES public.journal_entries(id),
    related_conversation_id UUID REFERENCES public.conversations(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

-- Program milestones and achievements
CREATE TABLE IF NOT EXISTS public.program_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_program_id UUID REFERENCES public.user_programs(id) ON DELETE CASCADE NOT NULL,
    
    -- Milestone details
    milestone_type TEXT NOT NULL, -- 'week_completed', 'phase_completed', 'program_completed', 'streak_achieved'
    milestone_name TEXT NOT NULL,
    milestone_data JSONB NOT NULL,
    
    -- Achievement tracking
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    celebration_shown BOOLEAN DEFAULT false,
    shared_publicly BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ANALYTICS AND USAGE TRACKING
-- =========================================================================

-- Usage analytics for insights and optimization
CREATE TABLE IF NOT EXISTS public.usage_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL, -- 'page_view', 'message_sent', 'journal_entry', 'lesson_completed'
    event_name TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- Context
    session_id UUID,
    page_url TEXT,
    referrer TEXT,
    
    -- Device/platform
    platform TEXT, -- 'web', 'ios', 'android'
    app_version TEXT,
    user_agent TEXT,
    
    -- Performance
    load_time_ms INTEGER,
    
    -- Location (anonymized)
    country_code CHAR(2),
    region TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription events for billing and analytics
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL, -- 'subscription_created', 'payment_succeeded', 'payment_failed', 'trial_started'
    subscription_id TEXT,
    customer_id TEXT,
    
    -- Event data
    event_data JSONB NOT NULL,
    stripe_event_id TEXT UNIQUE,
    
    -- Amounts (in cents)
    amount_cents INTEGER,
    currency_code CHAR(3) DEFAULT 'USD',
    
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- SUPPORT AND FEEDBACK
-- =========================================================================

-- User feedback and support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Ticket details
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'bug', 'feature_request', 'billing', 'general'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    
    -- Contact information (for anonymous users)
    contact_email TEXT,
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    
    -- Metadata
    user_agent TEXT,
    url TEXT,
    device_info JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- PERFORMANCE INDEXES
-- =========================================================================

-- User and authentication indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON public.profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at ON public.profiles(last_seen_at);

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON public.conversations(is_archived);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);

-- Journal indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON public.journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood_score ON public.journal_entries(mood_score);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON public.journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_entries_emotions ON public.journal_entries USING GIN(emotions_detected);

CREATE INDEX IF NOT EXISTS idx_journal_insights_user_id ON public.journal_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_insights_timeframe ON public.journal_insights(timeframe);
CREATE INDEX IF NOT EXISTS idx_journal_insights_expires_at ON public.journal_insights(expires_at);

-- Program indexes
CREATE INDEX IF NOT EXISTS idx_programs_tier_required ON public.programs(tier_required);
CREATE INDEX IF NOT EXISTS idx_programs_category ON public.programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs(is_active);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON public.programs(is_featured);
CREATE INDEX IF NOT EXISTS idx_programs_sort_order ON public.programs(sort_order);

CREATE INDEX IF NOT EXISTS idx_program_lessons_program_id ON public.program_lessons(program_id);
CREATE INDEX IF NOT EXISTS idx_program_lessons_day_number ON public.program_lessons(day_number);

CREATE INDEX IF NOT EXISTS idx_user_programs_user_id ON public.user_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_programs_program_id ON public.user_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_user_programs_status ON public.user_programs(status);
CREATE INDEX IF NOT EXISTS idx_user_programs_current_day ON public.user_programs(current_day);
CREATE INDEX IF NOT EXISTS idx_user_programs_completion_percentage ON public.user_programs(completion_percentage);

CREATE INDEX IF NOT EXISTS idx_program_progress_user_id ON public.program_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_program_progress_user_program_id ON public.program_progress(user_program_id);
CREATE INDEX IF NOT EXISTS idx_program_progress_lesson_id ON public.program_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_program_progress_completion_status ON public.program_progress(completion_status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON public.usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_type ON public.usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON public.usage_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_platform ON public.usage_analytics(platform);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_platform ON public.user_sessions(platform);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON public.user_sessions(session_start DESC);

-- Support indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);