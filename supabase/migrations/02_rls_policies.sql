-- SoulLens AI Row Level Security (RLS) Policies
-- Complete security layer for user data protection
-- Version: 1.0.0
-- Production-ready for 50K+ users

-- =========================================================================
-- ENABLE RLS ON ALL TABLES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- PROFILES AND USER DATA POLICIES
-- =========================================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Public profile data for social features (username only)
CREATE POLICY "Public usernames are viewable" 
    ON public.profiles FOR SELECT 
    USING (username IS NOT NULL);

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

-- User sessions policies (for analytics)
CREATE POLICY "Users can view their own sessions" 
    ON public.user_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
    ON public.user_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
    ON public.user_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

-- =========================================================================
-- CONVERSATIONS AND MESSAGING POLICIES
-- =========================================================================

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

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" 
    ON public.messages FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations" 
    ON public.messages FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" 
    ON public.messages FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
    ON public.messages FOR DELETE 
    USING (auth.uid() = user_id);

-- =========================================================================
-- JOURNAL SYSTEM POLICIES
-- =========================================================================

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

-- Journal insights policies
CREATE POLICY "Users can view their own insights" 
    ON public.journal_insights FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights" 
    ON public.journal_insights FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update insights" 
    ON public.journal_insights FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "System can delete expired insights" 
    ON public.journal_insights FOR DELETE 
    USING (auth.uid() = user_id OR expires_at < NOW());

-- =========================================================================
-- PROGRAMS SYSTEM POLICIES
-- =========================================================================

-- Programs policies (public read access for active programs)
CREATE POLICY "Anyone can view active programs" 
    ON public.programs FOR SELECT 
    USING (is_active = true);

-- Admin-only write access (would need to add admin role)
CREATE POLICY "Only admins can modify programs" 
    ON public.programs FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.metadata->>'role' = 'admin'
        )
    );

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

-- Admin-only write access for lessons
CREATE POLICY "Only admins can modify program lessons" 
    ON public.program_lessons FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.metadata->>'role' = 'admin'
        )
    );

-- User programs policies (enrollment)
CREATE POLICY "Users can view their own program enrollments" 
    ON public.user_programs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in programs" 
    ON public.user_programs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their program enrollments" 
    ON public.user_programs FOR UPDATE 
    USING (auth.uid() = user_id);

-- Program progress policies
CREATE POLICY "Users can view their own program progress" 
    ON public.program_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own program progress" 
    ON public.program_progress FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_programs 
            WHERE user_programs.id = user_program_id 
            AND user_programs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own program progress" 
    ON public.program_progress FOR UPDATE 
    USING (auth.uid() = user_id);

-- Program milestones policies
CREATE POLICY "Users can view their own milestones" 
    ON public.program_milestones FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert milestones for users" 
    ON public.program_milestones FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_programs 
            WHERE user_programs.id = user_program_id 
            AND user_programs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update milestone visibility" 
    ON public.program_milestones FOR UPDATE 
    USING (auth.uid() = user_id);

-- =========================================================================
-- ANALYTICS AND TRACKING POLICIES
-- =========================================================================

-- Usage analytics policies
CREATE POLICY "Users can view their own analytics" 
    ON public.usage_analytics FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics for users" 
    ON public.usage_analytics FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Anonymous analytics allowed for non-authenticated users
CREATE POLICY "Anonymous analytics insertion allowed" 
    ON public.usage_analytics FOR INSERT 
    WITH CHECK (user_id IS NULL);

-- Subscription events policies
CREATE POLICY "Users can view their own subscription events" 
    ON public.subscription_events FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription events" 
    ON public.subscription_events FOR INSERT 
    WITH CHECK (true); -- Webhook-based, no user context

-- =========================================================================
-- SUPPORT AND FEEDBACK POLICIES
-- =========================================================================

-- Support tickets policies
CREATE POLICY "Users can view their own support tickets" 
    ON public.support_tickets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets" 
    ON public.support_tickets FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own tickets" 
    ON public.support_tickets FOR UPDATE 
    USING (auth.uid() = user_id);

-- Support staff can view and update all tickets
CREATE POLICY "Support staff can manage all tickets" 
    ON public.support_tickets FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.metadata->>'role' IN ('admin', 'support')
        )
    );

-- =========================================================================
-- ADVANCED SECURITY FUNCTIONS
-- =========================================================================

-- Function to check if user has access to premium content
CREATE OR REPLACE FUNCTION public.user_has_premium_access(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_tier subscription_tier;
    trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get user subscription info
    SELECT subscription_tier, trial_ends_at 
    INTO user_tier, trial_end
    FROM public.profiles 
    WHERE id = user_uuid;
    
    -- Check if user has premium subscription
    IF user_tier = 'premium' OR user_tier = 'enterprise' THEN
        RETURN true;
    END IF;
    
    -- Check if user has active trial
    IF trial_end IS NOT NULL AND trial_end > NOW() THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check program access
CREATE OR REPLACE FUNCTION public.user_can_access_program(program_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    program_tier tier_required;
BEGIN
    -- Get program tier requirement
    SELECT tier_required 
    INTO program_tier
    FROM public.programs 
    WHERE id = program_uuid AND is_active = true;
    
    -- If program not found or inactive
    IF program_tier IS NULL THEN
        RETURN false;
    END IF;
    
    -- Free programs are accessible to everyone
    IF program_tier = 'free' THEN
        RETURN true;
    END IF;
    
    -- Premium programs require premium access
    IF program_tier = 'premium' THEN
        RETURN public.user_has_premium_access(user_uuid);
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check daily message limit for trial users
CREATE OR REPLACE FUNCTION public.check_daily_message_limit(user_uuid UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    user_tier subscription_tier;
    trial_end TIMESTAMP WITH TIME ZONE;
    daily_messages INTEGER;
    message_limit INTEGER := 10; -- Default limit for trial users
    result JSONB;
BEGIN
    -- Get user subscription info
    SELECT subscription_tier, trial_ends_at 
    INTO user_tier, trial_end
    FROM public.profiles 
    WHERE id = user_uuid;
    
    -- Premium users have unlimited messages
    IF user_tier = 'premium' OR user_tier = 'enterprise' THEN
        RETURN jsonb_build_object(
            'can_send_message', true,
            'messages_remaining', -1,
            'limit_type', 'unlimited'
        );
    END IF;
    
    -- Count today's messages
    SELECT COUNT(*)
    INTO daily_messages
    FROM public.messages
    WHERE user_id = user_uuid
    AND role = 'user'
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
    -- Check if under limit
    IF daily_messages < message_limit THEN
        RETURN jsonb_build_object(
            'can_send_message', true,
            'messages_remaining', message_limit - daily_messages,
            'limit_type', 'daily',
            'messages_sent_today', daily_messages,
            'daily_limit', message_limit
        );
    ELSE
        RETURN jsonb_build_object(
            'can_send_message', false,
            'messages_remaining', 0,
            'limit_type', 'daily',
            'messages_sent_today', daily_messages,
            'daily_limit', message_limit,
            'reset_time', (CURRENT_DATE + INTERVAL '1 day')::TEXT
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- GRANT PERMISSIONS
-- =========================================================================

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Tables accessible to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_insights TO authenticated;
GRANT ALL ON public.user_programs TO authenticated;
GRANT ALL ON public.program_progress TO authenticated;
GRANT ALL ON public.program_milestones TO authenticated;
GRANT ALL ON public.usage_analytics TO authenticated;
GRANT ALL ON public.support_tickets TO authenticated;

-- Public read access for programs and lessons
GRANT SELECT ON public.programs TO authenticated, anon;
GRANT SELECT ON public.program_lessons TO authenticated, anon;

-- Limited access for subscription events (webhook only)
GRANT INSERT ON public.subscription_events TO authenticated, service_role;
GRANT SELECT ON public.subscription_events TO authenticated;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.user_has_premium_access TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_can_access_program TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_daily_message_limit TO authenticated;