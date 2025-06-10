-- MOBILE-OPTIMIZED BUSINESS LOGIC FUNCTIONS

-- Check trial status (CRITICAL for mobile app)
CREATE OR REPLACE FUNCTION check_trial_status(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  is_trial_active BOOLEAN,
  days_remaining INTEGER,
  messages_today INTEGER,
  can_send_message BOOLEAN,
  trial_limits JSONB,
  subscription_tier TEXT
) AS $$
DECLARE
  user_record RECORD;
  usage_record RECORD;
BEGIN
  -- Get user info
  SELECT * INTO user_record
  FROM users 
  WHERE id = user_uuid;
  
  -- Get today's usage
  SELECT * INTO usage_record
  FROM usage_tracking 
  WHERE user_id = user_uuid AND date = CURRENT_DATE;
  
  -- Return trial status
  RETURN QUERY
  SELECT 
    CASE 
      WHEN user_record.subscription_tier = 'premium' THEN FALSE
      WHEN user_record.trial_ends_at > NOW() THEN TRUE
      ELSE FALSE
    END as is_active,
    
    CASE 
      WHEN user_record.subscription_tier = 'premium' THEN 0
      ELSE GREATEST(0, EXTRACT(days FROM (user_record.trial_ends_at - NOW()))::INTEGER)
    END as days_left,
    
    COALESCE(usage_record.messages_sent, 0) as msgs_today,
    
    CASE 
      WHEN user_record.subscription_tier = 'premium' THEN TRUE
      WHEN user_record.trial_ends_at > NOW() AND COALESCE(usage_record.messages_sent, 0) < 3 THEN TRUE
      ELSE FALSE
    END as can_send,
    
    CASE 
      WHEN user_record.subscription_tier = 'premium' THEN 
        jsonb_build_object(
          'daily_message_limit', -1,
          'available_personas', ARRAY['mentor', 'coach', 'friend', 'challenger', 'therapist', 'sage'],
          'insights_unlimited', true,
          'voice_messages', true,
          'data_export', true
        )
      ELSE 
        jsonb_build_object(
          'daily_message_limit', 3,
          'available_personas', ARRAY['mentor'],
          'insights_days_limit', 7,
          'voice_messages', false,
          'data_export', false
        )
    END as limits,
    
    user_record.subscription_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track mobile usage (called after each message)
CREATE OR REPLACE FUNCTION track_mobile_usage(
  p_event_type TEXT,
  p_platform TEXT DEFAULT 'unknown',
  p_app_version TEXT DEFAULT '1.0.0',
  p_event_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  -- Update daily usage tracking
  INSERT INTO usage_tracking (user_id, date, messages_sent, app_opens)
  VALUES (current_user_id, CURRENT_DATE, 
    CASE WHEN p_event_type = 'message_sent' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'app_opened' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    messages_sent = usage_tracking.messages_sent + CASE WHEN p_event_type = 'message_sent' THEN 1 ELSE 0 END,
    app_opens = usage_tracking.app_opens + CASE WHEN p_event_type = 'app_opened' THEN 1 ELSE 0 END;
  
  -- Log detailed analytics
  INSERT INTO mobile_analytics (user_id, event_type, platform, app_version, event_data)
  VALUES (current_user_id, p_event_type, p_platform, p_app_version, p_event_data);
  
  -- Update user last_active
  UPDATE users 
  SET last_active = NOW(), 
      platform = p_platform,
      app_version = p_app_version
  WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get mobile dashboard data (optimized single query)
CREATE OR REPLACE FUNCTION get_mobile_dashboard(user_uuid UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  WITH user_stats AS (
    SELECT 
      u.subscription_tier,
      u.trial_ends_at,
      up.ai_companion_name,
      up.onboarding_complete
    FROM users u
    JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = user_uuid
  ),
  recent_conversations AS (
    SELECT 
      COUNT(*) as total_conversations,
      MAX(last_message_at) as last_conversation
    FROM conversations 
    WHERE user_id = user_uuid
      AND last_message_at >= NOW() - INTERVAL '30 days'
  ),
  unread_insights AS (
    SELECT COUNT(*) as unread_count
    FROM insights 
    WHERE user_id = user_uuid AND is_read = FALSE
  ),
  usage_stats AS (
    SELECT 
      COALESCE(SUM(messages_sent), 0) as total_messages,
      COALESCE(SUM(session_count), 0) as total_sessions
    FROM usage_tracking 
    WHERE user_id = user_uuid
      AND date >= CURRENT_DATE - INTERVAL '7 days'
  )
  SELECT jsonb_build_object(
    'user', row_to_json(us.*),
    'conversations', row_to_json(rc.*),
    'insights', row_to_json(ui.*),
    'usage', row_to_json(ust.*)
  ) INTO result
  FROM user_stats us, recent_conversations rc, unread_insights ui, usage_stats ust;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule push notifications (mobile engagement)
CREATE OR REPLACE FUNCTION schedule_mobile_notifications()
RETURNS INTEGER AS $$
DECLARE
  notifications_scheduled INTEGER := 0;
BEGIN
  -- Daily reflection reminders (respecting user timezone)
  INSERT INTO notification_queue (user_id, notification_type, title, body, scheduled_for)
  SELECT 
    u.id,
    'daily_reminder',
    '🌟 Time for reflection',
    format('Hey %s, your AI companion is ready for today''s conversation', COALESCE(up.name, 'there')),
    (CURRENT_DATE + INTERVAL '1 day' + COALESCE(up.preferred_notification_time, '19:00'::TIME))
      AT TIME ZONE COALESCE(up.timezone, 'UTC')
      AT TIME ZONE 'UTC'
  FROM users u
  JOIN user_profiles up ON u.id = up.user_id
  WHERE u.last_active > NOW() - INTERVAL '7 days'
    AND u.subscription_tier IN ('trial', 'premium')
    AND array_length(u.device_tokens, 1) > 0
    AND NOT EXISTS (
      SELECT 1 FROM notification_queue nq 
      WHERE nq.user_id = u.id 
        AND nq.notification_type = 'daily_reminder'
        AND nq.scheduled_for > NOW()
        AND nq.status != 'failed'
    );
  
  GET DIAGNOSTICS notifications_scheduled = ROW_COUNT;
  
  -- Insight ready notifications
  INSERT INTO notification_queue (user_id, notification_type, title, body, scheduled_for, data)
  SELECT 
    i.user_id,
    'insight_ready',
    '💡 New insight discovered!',
    'Your AI has identified a new pattern worth exploring',
    NOW() + INTERVAL '5 minutes',
    jsonb_build_object('insight_id', i.id, 'category', i.category)
  FROM insights i
  JOIN users u ON i.user_id = u.id
  WHERE i.created_at > NOW() - INTERVAL '1 hour'
    AND i.is_read = FALSE
    AND array_length(u.device_tokens, 1) > 0
    AND NOT EXISTS (
      SELECT 1 FROM notification_queue nq 
      WHERE nq.user_id = i.user_id 
        AND nq.data->>'insight_id' = i.id::TEXT
    );
  
  RETURN notifications_scheduled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;