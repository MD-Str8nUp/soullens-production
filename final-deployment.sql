-- =========================================================================
-- SoulLens.AI Complete Database Schema
-- Production Deployment for mysoullens.com
-- Generated: 2025-06-09
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
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
    lesson_content JSONB NOT NULL,
    estimated_duration INTEGER DEFAULT 15,
    learning_objectives TEXT[] DEFAULT '{}',
    integration_prompts JSONB DEFAULT '{}',
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
    total_time_spent INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
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
    time_spent INTEGER DEFAULT 0,
    reflection_notes TEXT,
    ai_integration_used BOOLEAN DEFAULT false,
    journal_entry_id UUID REFERENCES public.journal_entries(id),
    lesson_rating INTEGER CHECK (lesson_rating >= 1 AND lesson_rating <= 5),
    completion_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
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
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_tier_required ON public.programs(tier_required);
CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs(is_active);
CREATE INDEX IF NOT EXISTS idx_user_programs_user_id ON public.user_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_program_progress_user_id ON public.program_progress(user_id);

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

CREATE TRIGGER set_timestamp_programs
    BEFORE UPDATE ON public.programs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_user_programs
    BEFORE UPDATE ON public.user_programs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_progress ENABLE ROW LEVEL SECURITY;

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

-- Programs policies (public read access)
CREATE POLICY "Anyone can view active programs"
    ON public.programs FOR SELECT
    USING (is_active = true);

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

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, trial_ends_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name',
        NOW() + INTERVAL '14 days'
    );
    
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

-- Insert the Into Confidence program
INSERT INTO public.programs (name, slug, tagline, description, detailed_description, duration_days, difficulty_level, tier_required, category, learning_outcomes, prerequisites, sort_order) VALUES
(
    'Into Confidence',
    'into-confidence',
    'Build unshakeable self-confidence in 30 days',
    'A comprehensive 30-day journey to discover and build authentic confidence from within. Learn practical techniques, mindset shifts, and daily practices that will transform how you see yourself and interact with the world.',
    'Into Confidence is your gateway to authentic self-assurance. This program takes you through a carefully crafted journey that starts with understanding your unique confidence baseline and ends with you having a toolkit of proven strategies for maintaining confidence in any situation.',
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
);

-- Insert sample lessons for Into Confidence
INSERT INTO public.program_lessons (program_id, day_number, title, subtitle, lesson_content, estimated_duration, learning_objectives, integration_prompts) VALUES

-- Day 1
(
    (SELECT id FROM public.programs WHERE slug = 'into-confidence'),
    1,
    'Understanding Your Confidence Baseline',
    'Where are you starting from?',
    '{
        "introduction": "Welcome to your confidence transformation journey! Today we begin by understanding exactly where you are right now.",
        "main_content": "Confidence isn''t a single trait but rather a collection of skills, beliefs, and behaviors. It varies across different areas of your life.",
        "exercise": {
            "title": "Confidence Assessment Wheel",
            "instructions": "Rate your current confidence level (1-10) in each area: Professional/Work, Social interactions, Physical appearance, Intelligence/Learning, Decision-making, Expressing opinions, Handling criticism, Taking challenges, Relationships, Creative expression",
            "reflection_questions": [
                "Which areas surprised you with how confident you feel?",
                "What patterns do you notice across different areas?",
                "What do your confident moments have in common?"
            ]
        },
        "key_insights": [
            "Confidence is situation-specific, not a fixed personality trait",
            "Everyone has areas of strength and areas for growth",
            "Awareness is the first step toward change"
        ]
    }',
    20,
    ARRAY[
        'Assess current confidence levels across life areas',
        'Identify patterns in confident vs unconfident moments',
        'Create baseline for tracking progress'
    ],
    '{
        "ai_chat_prompt": "I just completed my confidence baseline assessment. I''d love to discuss what I discovered.",
        "journal_prompt": "Reflect on your confidence assessment. What surprised you? What patterns do you notice?"
    }'
),

-- Day 15
(
    (SELECT id FROM public.programs WHERE slug = 'into-confidence'),
    15,
    'Building Micro-Confidence Wins',
    'Small actions, big transformation',
    '{
        "introduction": "You''re halfway through your confidence journey! Today we focus on micro-confidence wins.",
        "main_content": "Micro-confidence wins work because they create positive momentum without overwhelming you and build neural pathways associated with confidence.",
        "exercise": {
            "title": "Design Your Micro-Confidence Challenges",
            "instructions": "Choose 3 micro-actions to practice this week. Examples: Make eye contact with 3 new people, Ask one question in a meeting, Give yourself one genuine compliment",
            "reflection_questions": [
                "How did it feel to take these small actions?",
                "What did you learn about yourself?",
                "How can you build on these wins?"
            ]
        },
        "key_insights": [
            "Small consistent actions create lasting change",
            "Confidence builds through successful experiences",
            "Progress compounds over time"
        ]
    }',
    18,
    ARRAY[
        'Design personalized micro-confidence challenges',
        'Practice taking manageable confidence-building actions',
        'Build momentum through consistent small steps'
    ],
    '{
        "ai_chat_prompt": "I''ve been working on micro-confidence wins. I''d like to share my experiences.",
        "journal_prompt": "Write about your micro-confidence challenges this week. What worked? How do these small wins make you feel?"
    }'
),

-- Day 30
(
    (SELECT id FROM public.programs WHERE slug = 'into-confidence'),
    30,
    'Your Confidence Transformation',
    'Integrating confidence into daily life',
    '{
        "introduction": "Congratulations! You''ve completed 30 days of dedicated confidence work.",
        "main_content": "True transformation is about integrating new ways of being into your daily life. The confidence skills you''ve developed need to become second nature.",
        "exercise": {
            "title": "Confidence Transformation Review",
            "instructions": "Complete your before/after comparison, identify your biggest wins, design your maintenance plan, and set next-level goals",
            "reflection_questions": [
                "What surprised you most about your transformation?",
                "Which techniques had the biggest impact?",
                "How has your relationship with yourself changed?",
                "How will you continue growing your confidence?"
            ]
        },
        "key_insights": [
            "Confidence is a skill that can be developed and maintained",
            "Small consistent practices create lasting change",
            "Transformation is an ongoing journey, not a destination"
        ]
    }',
    25,
    ARRAY[
        'Assess transformation and progress made',
        'Create sustainable confidence maintenance system',
        'Plan for continued confidence growth'
    ],
    '{
        "ai_chat_prompt": "I''ve completed the Into Confidence program! I''d love to share my transformation and explore what to focus on next.",
        "journal_prompt": "Reflect on your 30-day confidence journey. How have you changed? What are you most proud of?"
    }'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =========================================================================
-- DEPLOYMENT VERIFICATION QUERIES
-- =========================================================================

-- Uncomment these queries after deployment to verify everything worked:

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT name, slug, duration_days FROM programs WHERE slug = 'into-confidence';
-- SELECT day_number, title FROM program_lessons WHERE program_id = (SELECT id FROM programs WHERE slug = 'into-confidence') ORDER BY day_number LIMIT 5;