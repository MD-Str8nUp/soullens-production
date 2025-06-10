-- SoulLens AI Database Functions and Triggers
-- Automated business logic and data management
-- Version: 1.0.0
-- Production-ready for 50K+ users

-- =========================================================================
-- UTILITY FUNCTIONS
-- =========================================================================

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate word count
CREATE OR REPLACE FUNCTION public.calculate_word_count(content TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Simple word count by splitting on whitespace
    RETURN array_length(string_to_array(trim(content), ' '), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =========================================================================
-- USER MANAGEMENT FUNCTIONS
-- =========================================================================

-- Function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_username TEXT;
BEGIN
    -- Generate a default username from email
    default_username := split_part(NEW.email, '@', 1);
    
    -- Ensure username is unique by appending random suffix if needed
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = default_username) LOOP
        default_username := split_part(NEW.email, '@', 1) || '_' || substring(gen_random_uuid()::text, 1, 6);
    END LOOP;
    
    -- Insert profile
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        username,
        subscription_tier,
        subscription_status,
        trial_ends_at
    ) VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        default_username,
        'free',
        'active',
        NOW() + INTERVAL '14 days' -- 14-day trial
    );
    
    -- Insert default user settings
    INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET last_seen_at = NOW() 
    WHERE id = auth.uid();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- CONVERSATION MANAGEMENT FUNCTIONS
-- =========================================================================

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversation last_message_at and total_messages
    UPDATE public.conversations
    SET 
        last_message_at = NEW.created_at,
        total_messages = total_messages + 1,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    -- If this is the first user message, update the conversation title
    IF NEW.role = 'user' AND NOT EXISTS (
        SELECT 1 FROM public.messages 
        WHERE conversation_id = NEW.conversation_id 
        AND role = 'user' 
        AND id != NEW.id
    ) THEN
        UPDATE public.conversations
        SET title = CASE 
            WHEN length(NEW.content) > 50 THEN left(NEW.content, 47) || '...'
            ELSE NEW.content
        END
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate conversation summary
CREATE OR REPLACE FUNCTION public.generate_conversation_summary(conversation_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    message_count INTEGER;
    first_message TEXT;
    last_message TEXT;
    conversation_summary TEXT;
BEGIN
    -- Get conversation statistics
    SELECT COUNT(*), 
           (SELECT content FROM public.messages WHERE conversation_id = conversation_uuid AND role = 'user' ORDER BY created_at LIMIT 1),
           (SELECT content FROM public.messages WHERE conversation_id = conversation_uuid AND role = 'user' ORDER BY created_at DESC LIMIT 1)
    INTO message_count, first_message, last_message
    FROM public.messages 
    WHERE conversation_id = conversation_uuid;
    
    -- Generate summary based on message count and content
    IF message_count <= 2 THEN
        conversation_summary := 'Brief conversation about: ' || COALESCE(substring(first_message, 1, 100), 'general topics');
    ELSE
        conversation_summary := format('Extended conversation (%s messages) starting with "%s" and discussing various topics.', 
                                     message_count, 
                                     substring(first_message, 1, 50));
    END IF;
    
    RETURN conversation_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- JOURNAL MANAGEMENT FUNCTIONS
-- =========================================================================

-- Function to process journal entry on insert/update
CREATE OR REPLACE FUNCTION public.process_journal_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count
    NEW.word_count := public.calculate_word_count(NEW.content);
    
    -- Set default title if not provided
    IF NEW.title IS NULL OR NEW.title = '' THEN
        NEW.title := CASE 
            WHEN length(NEW.content) > 50 THEN left(NEW.content, 47) || '...'
            ELSE NEW.content
        END;
    END IF;
    
    -- Set entry date if not provided
    IF NEW.date IS NULL THEN
        NEW.date := CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired insights
CREATE OR REPLACE FUNCTION public.cleanup_expired_insights()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.journal_insights 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- PROGRAM MANAGEMENT FUNCTIONS
-- =========================================================================

-- Function to update program progress and enrollment status
CREATE OR REPLACE FUNCTION public.update_program_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    completion_pct DECIMAL(5,2);
    current_streak INTEGER;
    user_program_record RECORD;
    next_day INTEGER;
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
    
    -- Calculate current streak (consecutive days with completed lessons)
    WITH daily_completions AS (
        SELECT 
            DATE(completed_at) as completion_date,
            COUNT(*) as lessons_completed
        FROM public.program_progress
        WHERE user_program_id = NEW.user_program_id
        AND completion_status = 'completed'
        AND completed_at IS NOT NULL
        GROUP BY DATE(completed_at)
        ORDER BY completion_date DESC
    ),
    consecutive_days AS (
        SELECT 
            completion_date,
            ROW_NUMBER() OVER (ORDER BY completion_date DESC) as row_num,
            completion_date + INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY completion_date DESC) as expected_date
        FROM daily_completions
    )
    SELECT COUNT(*) INTO current_streak
    FROM consecutive_days
    WHERE completion_date = CURRENT_DATE - INTERVAL '1 day' * (row_num - 1);
    
    -- Determine next day
    IF NEW.completion_status = 'completed' THEN
        SELECT day_number + 1 INTO next_day
        FROM public.program_lessons 
        WHERE id = NEW.lesson_id;
    ELSE
        next_day := user_program_record.current_day;
    END IF;
    
    -- Update user_programs with new progress
    UPDATE public.user_programs
    SET 
        completion_percentage = completion_pct,
        current_day = GREATEST(current_day, next_day),
        last_activity_date = CASE 
            WHEN NEW.completion_status = 'completed' THEN CURRENT_DATE
            ELSE last_activity_date
        END,
        streak_count = COALESCE(current_streak, 0),
        lessons_completed = completed_lessons,
        status = CASE 
            WHEN completion_pct >= 100 THEN 'completed'
            ELSE status
        END,
        completed_date = CASE 
            WHEN completion_pct >= 100 AND completed_date IS NULL THEN CURRENT_DATE
            ELSE completed_date
        END,
        total_time_spent = total_time_spent + COALESCE(NEW.time_spent, 0),
        updated_at = NOW()
    WHERE id = NEW.user_program_id;
    
    -- Create milestone if program completed
    IF completion_pct >= 100 AND NOT EXISTS (
        SELECT 1 FROM public.program_milestones 
        WHERE user_program_id = NEW.user_program_id 
        AND milestone_type = 'program_completed'
    ) THEN
        INSERT INTO public.program_milestones (
            user_id, 
            user_program_id, 
            milestone_type, 
            milestone_name,
            milestone_data
        ) VALUES (
            NEW.user_id,
            NEW.user_program_id,
            'program_completed',
            'Program Completed!',
            jsonb_build_object(
                'completion_date', CURRENT_DATE,
                'total_days', total_lessons,
                'completion_percentage', completion_pct
            )
        );
    END IF;
    
    -- Create streak milestones
    IF current_streak > 0 AND current_streak % 7 = 0 THEN -- Weekly streak milestone
        INSERT INTO public.program_milestones (
            user_id, 
            user_program_id, 
            milestone_type, 
            milestone_name,
            milestone_data
        ) VALUES (
            NEW.user_id,
            NEW.user_program_id,
            'streak_achieved',
            format('%s Day Streak!', current_streak),
            jsonb_build_object(
                'streak_count', current_streak,
                'achievement_date', CURRENT_DATE
            )
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enroll user in program
CREATE OR REPLACE FUNCTION public.enroll_user_in_program(
    p_user_id UUID,
    p_program_id UUID,
    p_payment_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    program_record RECORD;
    enrollment_record RECORD;
    result JSONB;
BEGIN
    -- Get program details
    SELECT * INTO program_record
    FROM public.programs
    WHERE id = p_program_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Program not found or inactive'
        );
    END IF;
    
    -- Check if user has access to this program
    IF NOT public.user_can_access_program(p_program_id, p_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Access denied - upgrade required'
        );
    END IF;
    
    -- Check if already enrolled
    SELECT * INTO enrollment_record
    FROM public.user_programs
    WHERE user_id = p_user_id AND program_id = p_program_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Already enrolled in this program',
            'enrollment_id', enrollment_record.id
        );
    END IF;
    
    -- Create enrollment
    INSERT INTO public.user_programs (
        user_id,
        program_id,
        payment_id,
        amount_paid_cents
    ) VALUES (
        p_user_id,
        p_program_id,
        p_payment_id,
        program_record.price_cents
    ) RETURNING * INTO enrollment_record;
    
    -- Update program enrollment count
    UPDATE public.programs
    SET total_enrollments = total_enrollments + 1
    WHERE id = p_program_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'enrollment_id', enrollment_record.id,
        'program_name', program_record.name,
        'current_day', enrollment_record.current_day
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- ANALYTICS AND USAGE TRACKING FUNCTIONS
-- =========================================================================

-- Function to track user activity
CREATE OR REPLACE FUNCTION public.track_user_activity(
    p_event_type TEXT,
    p_event_name TEXT,
    p_event_data JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.usage_analytics (
        user_id,
        event_type,
        event_name,
        event_data,
        platform,
        created_at
    ) VALUES (
        p_user_id,
        p_event_type,
        p_event_name,
        p_event_data,
        COALESCE(current_setting('request.headers', true)::json->>'x-platform', 'web'),
        NOW()
    );
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail if analytics insertion fails
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard data
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    dashboard_data JSONB := '{}';
    journal_stats JSONB;
    program_stats JSONB;
    conversation_stats JSONB;
    recent_activity JSONB;
BEGIN
    -- Journal statistics
    SELECT jsonb_build_object(
        'total_entries', COUNT(*),
        'entries_this_week', SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END),
        'entries_this_month', SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END),
        'average_mood', ROUND(AVG(mood_score), 1),
        'total_words', SUM(word_count),
        'current_streak', (
            SELECT COUNT(*)
            FROM (
                SELECT date
                FROM public.journal_entries
                WHERE user_id = p_user_id
                AND date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date DESC
            ) consecutive_dates
        )
    ) INTO journal_stats
    FROM public.journal_entries
    WHERE user_id = p_user_id;
    
    -- Program statistics
    SELECT jsonb_build_object(
        'enrolled_programs', COUNT(*),
        'completed_programs', SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
        'active_programs', SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END),
        'total_lessons_completed', SUM(lessons_completed),
        'average_completion', ROUND(AVG(completion_percentage), 1),
        'longest_streak', MAX(longest_streak)
    ) INTO program_stats
    FROM public.user_programs
    WHERE user_id = p_user_id;
    
    -- Conversation statistics
    SELECT jsonb_build_object(
        'total_conversations', COUNT(*),
        'conversations_this_week', SUM(CASE WHEN started_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END),
        'total_messages', SUM(total_messages),
        'favorite_conversations', SUM(CASE WHEN is_favorited THEN 1 ELSE 0 END)
    ) INTO conversation_stats
    FROM public.conversations
    WHERE user_id = p_user_id;
    
    -- Combine all statistics
    dashboard_data := jsonb_build_object(
        'journal', COALESCE(journal_stats, '{}'),
        'programs', COALESCE(program_stats, '{}'),
        'conversations', COALESCE(conversation_stats, '{}'),
        'generated_at', NOW()
    );
    
    RETURN dashboard_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- TRIGGERS
-- =========================================================================

-- Triggers for updated_at timestamps
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_user_settings
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_conversations
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_messages
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_journal_entries
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

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

CREATE TRIGGER set_timestamp_support_tickets
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger for new messages
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message();

-- Trigger for journal entry processing
CREATE TRIGGER process_journal_entry_trigger
    BEFORE INSERT OR UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.process_journal_entry();

-- Trigger for program progress updates
CREATE TRIGGER update_program_progress_trigger
    AFTER INSERT OR UPDATE ON public.program_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_program_progress();

-- Trigger to update user last_seen on activity
CREATE TRIGGER update_last_seen_messages
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_last_seen();

CREATE TRIGGER update_last_seen_journal
    AFTER INSERT ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_last_seen();

-- =========================================================================
-- SCHEDULED FUNCTIONS (for cron jobs)
-- =========================================================================

-- Daily cleanup function
CREATE OR REPLACE FUNCTION public.daily_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Clean up expired insights
    PERFORM public.cleanup_expired_insights();
    
    -- Clean up old anonymous usage analytics (older than 90 days)
    DELETE FROM public.usage_analytics 
    WHERE user_id IS NULL 
    AND created_at < NOW() - INTERVAL '90 days';
    
    -- Clean up old session data (older than 1 year)
    DELETE FROM public.user_sessions 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Update program completion rates
    UPDATE public.programs SET 
        completion_rate = (
            SELECT COALESCE(
                ROUND(
                    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / 
                     NULLIF(COUNT(*), 0)) * 100, 2
                ), 0
            )
            FROM public.user_programs 
            WHERE program_id = programs.id
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;