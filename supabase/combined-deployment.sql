
-- =========================================================================
-- SoulLens.AI Complete Database Schema
-- Generated for Production Deployment: 2025-06-09T12:59:06.528Z
-- =========================================================================

-- STEP 1: Main Schema
-- SoulLens AI Database Schema
-- This file contains all table definitions and initial setup for the SoulLens AI application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    question TEXT NOT NULL,
    content TEXT NOT NULL,
    emotion TEXT NOT NULL,
    category TEXT DEFAULT 'self-awareness',
    word_count INTEGER DEFAULT 0,
    mood_score INTEGER DEFAULT 3 CHECK (mood_score >= 1 AND mood_score <= 5),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    messages JSONB NOT NULL DEFAULT '[]',
    related_journal_entries UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_insights table (for caching insights)
CREATE TABLE IF NOT EXISTS public.journal_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    timeframe TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    insights JSONB NOT NULL,
    entry_count INTEGER DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    ai_persona TEXT DEFAULT 'balanced',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    privacy_settings JSONB DEFAULT '{"data_sharing": false, "analytics": true}',
    journal_reminders JSONB DEFAULT '{"enabled": false, "time": "20:00", "frequency": "daily"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table (for tracking individual chat sessions)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    persona_used TEXT,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    context_data JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_emotion ON public.journal_entries(emotion);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON public.journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON public.journal_entries USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON public.conversations(category);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_journal_insights_user_id ON public.journal_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_insights_timeframe ON public.journal_insights(timeframe);
CREATE INDEX IF NOT EXISTS idx_journal_insights_expires_at ON public.journal_insights(expires_at);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_journal_entries
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_conversations
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_user_settings
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries"
    ON public.journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
    ON public.journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
    ON public.journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON public.conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON public.conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Journal insights policies
CREATE POLICY "Users can view their own insights"
    ON public.journal_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
    ON public.journal_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can view their own chat sessions"
    ON public.chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
    ON public.chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to clean up expired insights
CREATE OR REPLACE FUNCTION public.cleanup_expired_insights()
RETURNS void AS $$
BEGIN
    DELETE FROM public.journal_insights 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create views for common queries

-- Recent journal entries view
CREATE OR REPLACE VIEW public.recent_journal_entries AS
SELECT 
    id,
    date,
    timestamp,
    question,
    content,
    emotion,
    category,
    word_count,
    mood_score,
    tags,
    created_at
FROM public.journal_entries
WHERE user_id = auth.uid()
ORDER BY date DESC, timestamp DESC
LIMIT 10;

-- Monthly mood summary view
CREATE OR REPLACE VIEW public.monthly_mood_summary AS
SELECT 
    DATE_TRUNC('month', date) as month,
    AVG(mood_score) as avg_mood,
    COUNT(*) as entry_count,
    array_agg(DISTINCT emotion) as emotions_experienced
FROM public.journal_entries
WHERE user_id = auth.uid()
    AND date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insert some sample data for testing (optional - remove in production)
-- This will only work after you have users in your system

-- STEP 2: Programs Feature Migration
-- SoulLens AI Programs Feature Migration
-- This migration adds the Programs feature to enable structured personal development courses

-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT NOT NULL,
    detailed_description TEXT,
    duration_days INTEGER NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    tier_required TEXT NOT NULL DEFAULT 'free' CHECK (tier_required IN ('free', 'premium')),
    category TEXT NOT NULL,
    preview_content JSONB DEFAULT '{}',
    learning_outcomes TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    sample_structure JSONB DEFAULT '{}',
    success_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create program_lessons table
CREATE TABLE IF NOT EXISTS public.program_lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    lesson_content JSONB NOT NULL, -- Contains text, exercises, reflection questions
    estimated_duration INTEGER DEFAULT 15, -- minutes
    learning_objectives TEXT[] DEFAULT '{}',
    integration_prompts JSONB DEFAULT '{}', -- AI chat and journal prompts
    completion_criteria JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, day_number)
);

-- Create user_programs table (enrollment and progress tracking)
CREATE TABLE IF NOT EXISTS public.user_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    started_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_date DATE,
    current_day INTEGER DEFAULT 1,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    streak_count INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- minutes
    settings JSONB DEFAULT '{}', -- user preferences for this program
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- Create program_progress table (daily lesson completion tracking)
CREATE TABLE IF NOT EXISTS public.program_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_program_id UUID REFERENCES public.user_programs(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.program_lessons(id) ON DELETE CASCADE,
    completion_status TEXT NOT NULL DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    completed_date DATE,
    time_spent INTEGER DEFAULT 0, -- minutes
    reflection_notes TEXT,
    ai_integration_used BOOLEAN DEFAULT false,
    journal_entry_id UUID REFERENCES public.journal_entries(id),
    lesson_rating INTEGER CHECK (lesson_rating >= 1 AND lesson_rating <= 5),
    completion_data JSONB DEFAULT '{}', -- store exercise responses, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Create program_milestones table (track major achievements)
CREATE TABLE IF NOT EXISTS public.program_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_program_id UUID REFERENCES public.user_programs(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL, -- 'week_completed', 'phase_completed', 'program_completed', 'streak_achieved'
    milestone_data JSONB NOT NULL,
    achieved_date DATE NOT NULL DEFAULT CURRENT_DATE,
    celebration_shown BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_programs_tier_required ON public.programs(tier_required);
CREATE INDEX IF NOT EXISTS idx_programs_category ON public.programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs(is_active);
CREATE INDEX IF NOT EXISTS idx_programs_sort_order ON public.programs(sort_order);

CREATE INDEX IF NOT EXISTS idx_program_lessons_program_id ON public.program_lessons(program_id);
CREATE INDEX IF NOT EXISTS idx_program_lessons_day_number ON public.program_lessons(day_number);

CREATE INDEX IF NOT EXISTS idx_user_programs_user_id ON public.user_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_programs_status ON public.user_programs(status);
CREATE INDEX IF NOT EXISTS idx_user_programs_current_day ON public.user_programs(current_day);

CREATE INDEX IF NOT EXISTS idx_program_progress_user_id ON public.program_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_program_progress_user_program_id ON public.program_progress(user_program_id);
CREATE INDEX IF NOT EXISTS idx_program_progress_completion_status ON public.program_progress(completion_status);

CREATE INDEX IF NOT EXISTS idx_program_milestones_user_id ON public.program_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_program_milestones_milestone_type ON public.program_milestones(milestone_type);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER set_timestamp_programs
    BEFORE UPDATE ON public.programs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_program_lessons
    BEFORE UPDATE ON public.program_lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_user_programs
    BEFORE UPDATE ON public.user_programs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_program_progress
    BEFORE UPDATE ON public.program_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Programs policies (public read access for active programs)
CREATE POLICY "Anyone can view active programs"
    ON public.programs FOR SELECT
    USING (is_active = true);

-- Program lessons policies (public read access for active program lessons)
CREATE POLICY "Anyone can view lessons for active programs"
    ON public.program_lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.programs 
            WHERE programs.id = program_lessons.program_id 
            AND programs.is_active = true
        )
    );

-- User programs policies
CREATE POLICY "Users can view their own program enrollments"
    ON public.user_programs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own program enrollments"
    ON public.user_programs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own program enrollments"
    ON public.user_programs FOR UPDATE
    USING (auth.uid() = user_id);

-- Program progress policies
CREATE POLICY "Users can view their own program progress"
    ON public.program_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own program progress"
    ON public.program_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own program progress"
    ON public.program_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Program milestones policies
CREATE POLICY "Users can view their own program milestones"
    ON public.program_milestones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own program milestones"
    ON public.program_milestones FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own program milestones"
    ON public.program_milestones FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to update program progress automatically
CREATE OR REPLACE FUNCTION public.update_program_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    completion_pct DECIMAL(5,2);
    current_streak INTEGER;
    user_program_record RECORD;
BEGIN
    -- Get the user_program record
    SELECT * INTO user_program_record
    FROM public.user_programs
    WHERE id = NEW.user_program_id;

    -- Calculate total lessons for this program
    SELECT COUNT(*) INTO total_lessons
    FROM public.program_lessons
    WHERE program_id = user_program_record.program_id;

    -- Calculate completed lessons for this user
    SELECT COUNT(*) INTO completed_lessons
    FROM public.program_progress
    WHERE user_program_id = NEW.user_program_id
    AND completion_status = 'completed';

    -- Calculate completion percentage
    completion_pct := CASE 
        WHEN total_lessons > 0 THEN (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100
        ELSE 0 
    END;

    -- Calculate current streak (consecutive days)
    WITH daily_completions AS (
        SELECT 
            completed_date,
            ROW_NUMBER() OVER (ORDER BY completed_date DESC) as rn
        FROM public.program_progress
        WHERE user_program_id = NEW.user_program_id
        AND completion_status = 'completed'
        AND completed_date IS NOT NULL
        ORDER BY completed_date DESC
    ),
    consecutive_days AS (
        SELECT 
            completed_date,
            completed_date + INTERVAL '1 day' * rn as expected_date
        FROM daily_completions
    )
    SELECT COUNT(*) INTO current_streak
    FROM consecutive_days
    WHERE completed_date = expected_date - INTERVAL '1 day' * (
        SELECT rn FROM daily_completions WHERE completed_date = consecutive_days.completed_date
    );

    -- Update user_programs with new progress
    UPDATE public.user_programs
    SET 
        completion_percentage = completion_pct,
        current_day = GREATEST(current_day, 
            CASE WHEN NEW.completion_status = 'completed' 
                 THEN (SELECT day_number + 1 FROM public.program_lessons WHERE id = NEW.lesson_id)
                 ELSE current_day
            END
        ),
        last_activity_date = CURRENT_DATE,
        streak_count = COALESCE(current_streak, 0),
        status = CASE 
            WHEN completion_pct >= 100 THEN 'completed'
            ELSE status
        END,
        completed_date = CASE 
            WHEN completion_pct >= 100 AND completed_date IS NULL THEN CURRENT_DATE
            ELSE completed_date
        END,
        updated_at = NOW()
    WHERE id = NEW.user_program_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic progress updates
CREATE TRIGGER update_program_progress_trigger
    AFTER INSERT OR UPDATE ON public.program_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_program_progress();

-- Create function to check program access based on subscription
CREATE OR REPLACE FUNCTION public.check_program_access(program_tier TEXT, user_subscription_tier TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Free programs are accessible to everyone
    IF program_tier = 'free' THEN
        RETURN true;
    END IF;
    
    -- Premium programs require premium subscription
    IF program_tier = 'premium' AND user_subscription_tier = 'premium' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for user program dashboard
CREATE OR REPLACE VIEW public.user_program_dashboard AS
SELECT 
    up.id as enrollment_id,
    up.user_id,
    p.id as program_id,
    p.name as program_name,
    p.slug as program_slug,
    p.tagline,
    p.duration_days,
    p.difficulty_level,
    p.tier_required,
    up.status,
    up.started_date,
    up.current_day,
    up.completion_percentage,
    up.streak_count,
    up.last_activity_date,
    CASE 
        WHEN up.current_day <= p.duration_days THEN 
            (SELECT title FROM public.program_lessons 
             WHERE program_id = p.id AND day_number = up.current_day)
        ELSE 'Program Complete'
    END as next_lesson_title,
    CASE 
        WHEN up.last_activity_date = CURRENT_DATE THEN true
        ELSE false
    END as completed_today
FROM public.user_programs up
JOIN public.programs p ON up.program_id = p.id
WHERE up.user_id = auth.uid();

-- Grant permissions
GRANT SELECT ON public.programs TO authenticated, anon;
GRANT SELECT ON public.program_lessons TO authenticated, anon;
GRANT ALL ON public.user_programs TO authenticated;
GRANT ALL ON public.program_progress TO authenticated;
GRANT ALL ON public.program_milestones TO authenticated;
GRANT SELECT ON public.user_program_dashboard TO authenticated;

-- STEP 3: Programs Seed Data
-- SoulLens AI Programs Seed Data
-- This file contains the initial program data and lessons

-- Insert the main programs
INSERT INTO public.programs (name, slug, tagline, description, detailed_description, duration_days, difficulty_level, tier_required, category, learning_outcomes, prerequisites, sort_order) VALUES

-- 1. Into Confidence (FREE)
(
    'Into Confidence',
    'into-confidence',
    'Build unshakeable self-confidence in 30 days',
    'A comprehensive 30-day journey to discover and build authentic confidence from within. Learn practical techniques, mindset shifts, and daily practices that will transform how you see yourself and interact with the world.',
    'Into Confidence is your gateway to authentic self-assurance. This program takes you through a carefully crafted journey that starts with understanding your unique confidence baseline and ends with you having a toolkit of proven strategies for maintaining confidence in any situation. You''ll explore the psychology of confidence, practice micro-confidence building exercises, and develop a personalized confidence maintenance system.',
    30,
    'Beginner',
    'free',
    'Self-Development',
    ARRAY[
        'Understand the psychology of confidence and how it affects your daily life',
        'Identify your personal confidence triggers and blockers',
        'Master 15+ practical confidence-building techniques',
        'Develop a daily confidence practice that fits your lifestyle',
        'Build resilience to confidence setbacks',
        'Create a personalized confidence maintenance system'
    ],
    ARRAY[
        'Willingness to engage in self-reflection',
        'Commitment to 15-20 minutes daily practice'
    ],
    1
),

-- 2. Into Anxiety (PREMIUM)
(
    'Into Anxiety',
    'into-anxiety',
    'Transform your relationship with anxiety in 90 days',
    'A deep, personalized 90-day program that helps you understand, work with, and transform anxiety from an enemy into valuable information. Using AI-powered insights and proven therapeutic techniques.',
    'Into Anxiety goes beyond surface-level coping strategies to help you fundamentally transform your relationship with anxiety. This program combines cutting-edge AI analysis of your personal patterns with proven therapeutic approaches from CBT, ACT, and mindfulness traditions. You''ll learn to decode what your anxiety is trying to tell you and develop a sophisticated toolkit for different types of anxious experiences.',
    90,
    'Intermediate',
    'premium',
    'Mental Health',
    ARRAY[
        'Map your unique anxiety patterns and triggers',
        'Develop advanced emotional regulation skills',
        'Master 20+ evidence-based anxiety management techniques',
        'Create personalized coping strategies based on your anxiety type',
        'Build resilience and post-traumatic growth',
        'Establish a sustainable anxiety management lifestyle'
    ],
    ARRAY[
        'Basic understanding of mindfulness or meditation',
        'Commitment to 25-30 minutes daily practice',
        'Willingness to track patterns and engage in detailed self-reflection'
    ],
    2
),

-- 3. Into Motivation (PREMIUM)
(
    'Into Motivation',
    'into-motivation',
    'Reignite your drive and sustain long-term motivation',
    'A 60-day deep dive into the science of motivation. Discover your unique motivation patterns, overcome procrastination, and build systems that sustain your drive even when inspiration fades.',
    'Into Motivation tackles the complex challenge of sustaining drive in modern life. This program helps you understand the neuroscience behind motivation, identify your personal motivation patterns, and build robust systems that work even when you don''t feel like it. You''ll explore intrinsic vs extrinsic motivation, develop anti-procrastination strategies, and create a motivation ecosystem tailored to your brain and lifestyle.',
    60,
    'Intermediate',
    'premium',
    'Productivity',
    ARRAY[
        'Understand the science behind motivation and procrastination',
        'Identify your unique motivation patterns and energy cycles',
        'Build anti-procrastination systems that actually work',
        'Develop intrinsic motivation for long-term sustainability',
        'Create environment and habit systems that support motivation',
        'Master the art of maintaining motivation during difficult periods'
    ],
    ARRAY[
        'Basic goal-setting experience',
        'Willingness to experiment with new routines',
        'Commitment to 20-25 minutes daily practice'
    ],
    3
),

-- 4. Into Relationships (PREMIUM)
(
    'Into Relationships',
    'into-relationships',
    'Build deeper, more authentic connections',
    'A comprehensive 120-day journey through all your relationships - romantic, family, friendships, and professional. Learn communication skills, boundary setting, and how to create the relationships you truly want.',
    'Into Relationships is the most comprehensive relationship program available, covering every aspect of human connection. From understanding your attachment style to mastering difficult conversations, this program provides both the psychological insights and practical skills needed for thriving relationships. The program adapts to your specific relationship challenges and goals.',
    120,
    'Advanced',
    'premium',
    'Relationships',
    ARRAY[
        'Understand your attachment style and relationship patterns',
        'Master effective communication and conflict resolution',
        'Develop healthy boundary-setting skills',
        'Build emotional intelligence and empathy',
        'Navigate difficult relationships and toxic dynamics',
        'Create and maintain the relationships you truly want'
    ],
    ARRAY[
        'Completed at least one other SoulLens program',
        'Willingness to practice with real relationships',
        'Commitment to 30-35 minutes daily practice'
    ],
    4
),

-- 5. Into Purpose (PREMIUM)
(
    'Into Purpose',
    'into-purpose',
    'Discover and align with your deeper purpose',
    'A profound 90-day exploration of meaning, values, and purpose. Move beyond surface-level goals to discover what truly matters to you and how to align your life accordingly.',
    'Into Purpose is a deep philosophical and practical exploration of what gives life meaning. This program combines ancient wisdom traditions with modern positive psychology to help you uncover your core values, identify your unique gifts, and align your daily life with your deeper purpose. It''s designed for those ready to move beyond conventional success to authentic fulfillment.',
    90,
    'Advanced',
    'premium',
    'Life Purpose',
    ARRAY[
        'Clarify your core values and what truly matters to you',
        'Identify your unique gifts and how to use them',
        'Develop a personal mission and vision for your life',
        'Align your daily actions with your deeper purpose',
        'Navigate purpose transitions and life changes',
        'Create a lifestyle that reflects your authentic self'
    ],
    ARRAY[
        'Life experience and readiness for deep self-exploration',
        'Completed basic self-awareness work',
        'Commitment to 25-30 minutes daily practice'
    ],
    5
),

-- 6. 90-Day Reset (PREMIUM)
(
    '90-Day Reset',
    '90-day-reset',
    'Complete life transformation in 90 days',
    'The ultimate comprehensive program covering all areas of life - mental health, relationships, purpose, habits, and goals. A complete reset for those ready for total transformation.',
    'The 90-Day Reset is our flagship transformation program, integrating insights and techniques from all our other programs into one comprehensive journey. This program is for those ready to make significant changes across all areas of life. You''ll work on mindset, relationships, health, purpose, and productivity simultaneously, with AI-powered coordination to ensure all areas support each other.',
    90,
    'Advanced',
    'premium',
    'Holistic Transformation',
    ARRAY[
        'Transform all major areas of life simultaneously',
        'Develop an integrated approach to personal growth',
        'Build sustainable systems for ongoing development',
        'Master advanced techniques from multiple disciplines',
        'Create a lifestyle designed for continuous growth',
        'Become your own personal development expert'
    ],
    ARRAY[
        'Significant life experience and self-awareness',
        'Previous personal development work',
        'Commitment to 45-60 minutes daily practice',
        'Ready for significant life changes'
    ],
    6
);

-- Insert sample lessons for Into Confidence (Day 1, 15, and 30)
INSERT INTO public.program_lessons (program_id, day_number, title, subtitle, lesson_content, estimated_duration, learning_objectives, integration_prompts) VALUES

-- Into Confidence Day 1
(
    (SELECT id FROM public.programs WHERE slug = 'into-confidence'),
    1,
    'Understanding Your Confidence Baseline',
    'Where are you starting from?',
    '{
        "introduction": "Welcome to your confidence transformation journey! Today we begin by understanding exactly where you are right now. True confidence isn''t about pretending to be someone you''re not - it''s about knowing yourself deeply and appreciating your authentic self.",
        "main_content": "Confidence isn''t a single trait but rather a collection of skills, beliefs, and behaviors. It varies across different areas of your life. You might feel confident in your professional abilities but struggle with social situations, or feel great about your intelligence but doubt your physical capabilities. This is completely normal and gives us a roadmap for growth.",
        "exercise": {
            "title": "Confidence Assessment Wheel",
            "instructions": "Rate your current confidence level (1-10) in each of these areas:\n\n1. Professional/Work situations\n2. Social interactions\n3. Physical appearance\n4. Intelligence/Learning\n5. Decision-making\n6. Expressing opinions\n7. Handling criticism\n8. Taking on challenges\n9. Relationships\n10. Creative expression\n\nFor each area, also note:\n- One specific situation where you felt confident\n- One specific situation where you felt less confident",
            "reflection_questions": [
                "Which areas surprised you with how confident (or unconfident) you feel?",
                "What patterns do you notice across different areas?",
                "What do your confident moments have in common?",
                "What tends to shake your confidence most?"
            ]
        },
        "key_insights": [
            "Confidence is situation-specific, not a fixed personality trait",
            "Everyone has areas of strength and areas for growth",
            "Your past confident moments contain clues for building future confidence",
            "Awareness is the first step toward change"
        ],
        "tomorrow_preview": "Tomorrow we''ll explore the science behind confidence and discover why some people seem naturally confident while others struggle."
    }',
    20,
    ARRAY[
        'Assess current confidence levels across life areas',
        'Identify patterns in confident vs unconfident moments',
        'Understand that confidence varies by situation',
        'Create baseline for tracking progress'
    ],
    '{
        "ai_chat_prompt": "I just completed my confidence baseline assessment. I''d love to discuss what I discovered about my confidence patterns and explore what these insights might mean for my growth journey.",
        "journal_prompt": "Reflect on your confidence assessment. What surprised you? What patterns do you notice? What do you want your confidence to look like 30 days from now?",
        "conversation_starter": "Based on your confidence assessment today, what would you like to explore in our conversation?"
    }'
),

-- Into Confidence Day 15
(
    (SELECT id FROM public.programs WHERE slug = 'into-confidence'),
    15,
    'Building Micro-Confidence Wins',
    'Small actions, big transformation',
    '{
        "introduction": "You''re halfway through your confidence journey! Today we focus on the power of micro-confidence wins - small, manageable actions that build confidence incrementally. This approach is more sustainable and effective than trying to make huge leaps.",
        "main_content": "Micro-confidence wins work because they:\n• Create positive momentum without overwhelming you\n• Provide frequent success experiences\n• Build neural pathways associated with confidence\n• Are achievable regardless of your starting point\n• Compound over time into significant change\n\nThe key is choosing actions that are challenging enough to matter but small enough to be consistently achievable.",
        "exercise": {
            "title": "Design Your Micro-Confidence Challenges",
            "instructions": "Choose 3 micro-actions to practice this week. Each should:\n- Take 5 minutes or less\n- Feel slightly challenging but achievable\n- Be specific and measurable\n- Align with your confidence goals\n\nExamples:\n• Make eye contact with 3 new people today\n• Ask one question in a meeting\n• Give yourself one genuine compliment\n• Try one new thing (food, route, activity)\n• Speak up once when you normally wouldn''t\n• Post something you''re proud of\n• Practice good posture for 5 minutes\n\nYour 3 micro-actions this week:",
            "reflection_questions": [
                "What stopped you from being confident in these situations before?",
                "How did it feel to take these small actions?",
                "What did you learn about yourself?",
                "How can you build on these wins?"
            ]
        },
        "key_insights": [
            "Small consistent actions create lasting change",
            "Confidence builds through successful experiences",
            "You can create confidence opportunities anywhere",
            "Progress compounds over time"
        ],
        "tomorrow_preview": "Tomorrow we''ll explore how to handle confidence setbacks and maintain momentum when things don''t go perfectly."
    }',
    18,
    ARRAY[
        'Design personalized micro-confidence challenges',
        'Understand the psychology of small wins',
        'Practice taking manageable confidence-building actions',
        'Build momentum through consistent small steps'
    ],
    '{
        "ai_chat_prompt": "I''ve been working on micro-confidence wins this week. I''d like to share my experiences and get insights on how to build on these small victories.",
        "journal_prompt": "Write about your micro-confidence challenges this week. What worked? What was harder than expected? How do these small wins make you feel about bigger challenges?",
        "conversation_starter": "I''ve been practicing micro-confidence wins. What patterns do you notice in how I approach these challenges?"
    }'
),

-- Into Confidence Day 30
(
    (SELECT id FROM public.programs WHERE slug = 'into-confidence'),
    30,
    'Your Confidence Transformation',
    'Integrating confidence into daily life',
    '{
        "introduction": "Congratulations! You''ve completed 30 days of dedicated confidence work. Today we celebrate your transformation and create a sustainable system for maintaining and continuing to build your confidence.",
        "main_content": "True transformation isn''t just about temporary changes - it''s about integrating new ways of being into your daily life. The confidence skills you''ve developed need to become second nature, not something you have to think about consciously.",
        "exercise": {
            "title": "Confidence Transformation Review",
            "instructions": "Complete this comprehensive review:\n\n1. BEFORE & AFTER COMPARISON\nReturn to your Day 1 confidence assessment and rate yourself again in each area:\n• Professional/Work situations\n• Social interactions  \n• Physical appearance\n• Intelligence/Learning\n• Decision-making\n• Expressing opinions\n• Handling criticism\n• Taking on challenges\n• Relationships\n• Creative expression\n\n2. BIGGEST WINS\nIdentify your 3 biggest confidence victories from this program\n\n3. MAINTENANCE PLAN\nDesign your ongoing confidence practice:\n• Which techniques will you continue daily?\n• Which techniques will you use when facing specific challenges?\n• How will you track your ongoing progress?\n• What will you do when you have confidence setbacks?\n\n4. NEXT LEVEL GOALS\nWhat confidence challenges are you now ready to tackle?",
            "reflection_questions": [
                "What surprised you most about your transformation?",
                "Which techniques had the biggest impact?",
                "How has your relationship with yourself changed?",
                "What confidence challenges no longer feel overwhelming?",
                "How will you continue growing your confidence?"
            ]
        },
        "key_insights": [
            "Confidence is a skill that can be developed and maintained",
            "Small consistent practices create lasting change",
            "You have more control over your confidence than you realized",
            "Transformation is an ongoing journey, not a destination"
        ],
        "tomorrow_preview": "Consider exploring our other programs to continue your growth journey. Into Anxiety or Into Motivation might be perfect next steps."
    }',
    25,
    ARRAY[
        'Assess transformation and progress made',
        'Create sustainable confidence maintenance system',
        'Plan for continued confidence growth',
        'Celebrate achievements and integrate learnings'
    ],
    '{
        "ai_chat_prompt": "I''ve just completed the Into Confidence program! I''d love to share my transformation, discuss what I''ve learned about myself, and explore what growth area I should focus on next.",
        "journal_prompt": "Reflect on your 30-day confidence journey. How have you changed? What are you most proud of? What kind of person are you becoming? How will you continue growing?",
        "conversation_starter": "I''ve completed my confidence transformation program. I''d love to share my progress and discuss what I want to work on next."
    }'
);

-- Insert sample lessons for Into Anxiety (Day 1 and 45 as examples)
INSERT INTO public.program_lessons (program_id, day_number, title, subtitle, lesson_content, estimated_duration, learning_objectives, integration_prompts) VALUES

-- Into Anxiety Day 1
(
    (SELECT id FROM public.programs WHERE slug = 'into-anxiety'),
    1,
    'Mapping Your Unique Anxiety',
    'Understanding your personal anxiety landscape',
    '{
        "introduction": "Welcome to Into Anxiety, where we transform your relationship with one of the most misunderstood emotions. Anxiety isn''t your enemy - it''s information. Today we begin mapping your unique anxiety landscape using your personal data.",
        "main_content": "Your anxiety is as unique as your fingerprint. It has specific triggers, patterns, physical sensations, and thoughts. By understanding these patterns deeply, we can work with your anxiety rather than against it. This program will use insights from your previous conversations and journal entries to create a personalized anxiety map.",
        "exercise": {
            "title": "Personal Anxiety Mapping",
            "instructions": "We''ll create a comprehensive map of your anxiety using multiple data sources:\n\n1. TRIGGER ANALYSIS\nBased on your conversation history, identify:\n• Physical triggers (crowds, tight spaces, etc.)\n• Social triggers (conflict, judgment, etc.)\n• Cognitive triggers (uncertainty, perfectionism, etc.)\n• Temporal triggers (deadlines, transitions, etc.)\n\n2. PHYSICAL SIGNATURES\nMap how anxiety shows up in your body:\n• Where do you feel tension?\n• How does your breathing change?\n• What happens to your energy?\n• Physical symptoms you experience\n\n3. THOUGHT PATTERNS\nIdentify your anxious thinking styles:\n• Catastrophizing\n• All-or-nothing thinking\n• Mind reading\n• Future-focused worry\n\n4. CURRENT COPING STRATEGIES\nWhat do you currently do when anxious? (Both helpful and unhelpful)",
            "reflection_questions": [
                "What patterns surprise you in your anxiety map?",
                "When has anxiety actually been helpful to you?",
                "What would change if you saw anxiety as information rather than a problem?",
                "Which triggers feel most manageable to work with first?"
            ]
        },
        "key_insights": [
            "Anxiety contains valuable information about what matters to you",
            "Understanding patterns is the first step to transformation",
            "Anxiety varies greatly between individuals",
            "Your anxiety map guides personalized intervention strategies"
        ],
        "tomorrow_preview": "Tomorrow we''ll explore the neuroscience of anxiety and why your brain creates anxious responses."
    }',
    30,
    ARRAY[
        'Create comprehensive personal anxiety map',
        'Identify unique triggers and patterns',
        'Understand anxiety as information system',
        'Establish baseline for transformation work'
    ],
    '{
        "ai_chat_prompt": "I just completed my anxiety mapping exercise. I remember you mentioned work stress in our previous conversations - let''s explore how that fits into my anxiety patterns and what it might be telling me.",
        "journal_prompt": "Reflect on your anxiety map. What does your anxiety seem to be trying to protect you from? How might these patterns have developed? What feels most important to address first?",
        "conversation_starter": "Based on our previous conversations and my anxiety mapping today, what patterns do you notice in how I experience and cope with anxiety?"
    }'
),

-- Into Anxiety Day 45
(
    (SELECT id FROM public.programs WHERE slug = 'into-anxiety'),
    45,
    'Advanced Anxiety Toolkit',
    'Personalized strategies based on your patterns',
    '{
        "introduction": "You''re halfway through your anxiety transformation! By now you understand your patterns deeply. Today we build an advanced, personalized toolkit based on your specific anxiety profile and what you''ve learned works for you.",
        "main_content": "Your anxiety toolkit should be as unique as your anxiety patterns. Based on your progress and data, we''ll select from advanced techniques across multiple therapeutic modalities. This isn''t about having more tools - it''s about having the RIGHT tools for YOUR anxiety.",
        "exercise": {
            "title": "Build Your Personalized Anxiety Toolkit",
            "instructions": "Based on your anxiety profile and what you''ve learned works, select and practice techniques from each category:\n\n1. IMMEDIATE RESPONSE (0-5 minutes)\nFor acute anxiety moments:\n• Box breathing (you''ve been using this successfully)\n• 5-4-3-2-1 grounding\n• Progressive muscle release\n• Cold water technique\n\n2. SHORT-TERM REGULATION (5-30 minutes)\nFor ongoing anxiety:\n• Anxiety dialogue technique\n• Values-based action\n• Worry window practice\n• Body scan meditation\n\n3. LONG-TERM PREVENTION (daily practices)\nFor building resilience:\n• Morning anxiety check-in\n• Evening worry processing\n• Weekly pattern review\n• Monthly anxiety goal setting\n\n4. SPECIFIC SITUATION TOOLS\nBased on your triggers:\n• Work stress: boundary-setting phrases\n• Social anxiety: confidence anchoring\n• Health anxiety: reality checking process\n• General worry: uncertainty tolerance building\n\nPractice your top 3 techniques from each category this week.",
            "reflection_questions": [
                "Which techniques feel most natural and effective for you?",
                "How has your relationship with anxiety changed since Day 1?",
                "What anxiety challenges that once felt overwhelming now feel manageable?",
                "How can you remember to use these tools when you need them most?"
            ]
        },
        "key_insights": [
            "Personalized tools are more effective than generic approaches",
            "Different anxiety situations require different tools",
            "Practice during calm moments improves crisis effectiveness",
            "Your toolkit will continue evolving as you grow"
        ],
        "tomorrow_preview": "Tomorrow we''ll focus on building anxiety resilience and developing post-traumatic growth mindset."
    }',
    35,
    ARRAY[
        'Build personalized anxiety management toolkit',
        'Practice situation-specific techniques',
        'Develop multi-layered anxiety response system',
        'Create sustainable daily anxiety practices'
    ],
    '{
        "ai_chat_prompt": "I''ve been building my personalized anxiety toolkit. You mentioned that breathing techniques helped me last week - let''s discuss how to build on what''s working and refine my approach.",
        "journal_prompt": "Write about your experience with different anxiety techniques. Which ones feel most natural? How has your confidence in handling anxiety grown? What does it feel like to have tools that actually work?",
        "conversation_starter": "I''ve been developing my anxiety toolkit. Based on our conversations, which techniques seem to align best with my personality and lifestyle?"
    }'
);

-- =========================================================================
-- Deployment Complete!
-- =========================================================================
