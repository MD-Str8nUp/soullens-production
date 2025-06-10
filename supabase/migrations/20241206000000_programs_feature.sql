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