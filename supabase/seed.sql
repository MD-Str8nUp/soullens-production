-- Seed data for SoulLens AI
-- This file contains sample data for testing and development

-- Note: This seed data will only work after users are created through authentication
-- You can run this after setting up authentication or modify it to suit your needs

-- Sample journal questions for the question generator
INSERT INTO public.journal_questions (id, question, category, tags) VALUES
  (uuid_generate_v4(), 'What am I most grateful for today?', 'gratitude', ARRAY['gratitude', 'reflection']),
  (uuid_generate_v4(), 'What challenge did I overcome recently?', 'growth', ARRAY['growth', 'resilience']),
  (uuid_generate_v4(), 'How did I show kindness to myself or others today?', 'relationships', ARRAY['kindness', 'relationships']),
  (uuid_generate_v4(), 'What emotion am I feeling most strongly right now?', 'emotions', ARRAY['emotions', 'self-awareness']),
  (uuid_generate_v4(), 'What would I like to learn or improve about myself?', 'self-awareness', ARRAY['learning', 'growth'])
ON CONFLICT DO NOTHING;

-- Sample conversation categories
INSERT INTO public.conversation_categories (name, description, color) VALUES
  ('General', 'General conversations and thoughts', '#6B7280'),
  ('Advice', 'Seeking guidance and recommendations', '#3B82F6'),
  ('Venting', 'Expressing frustrations and releasing emotions', '#EF4444'),
  ('Goals', 'Planning and tracking personal objectives', '#10B981'),
  ('Relationships', 'Discussing connections with others', '#8B5CF6'),
  ('Work', 'Career and professional topics', '#F59E0B'),
  ('Health', 'Physical and mental wellness', '#06B6D4'),
  ('Ideas', 'Creative thoughts and brainstorming', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Sample AI personas for chat
INSERT INTO public.ai_personas (name, description, personality_traits, communication_style) VALUES
  ('Balanced', 'A well-rounded companion that adapts to your needs', 
   ARRAY['empathetic', 'analytical', 'supportive'], 
   'Balanced between emotional support and practical advice'),
  ('Empathetic', 'A deeply caring companion focused on emotional support',
   ARRAY['compassionate', 'understanding', 'gentle'],
   'Warm, validating, and emotionally attuned'),
  ('Analytical', 'A logical companion that helps you think through problems',
   ARRAY['logical', 'systematic', 'solution-focused'],
   'Clear, structured, and evidence-based'),
  ('Motivational', 'An energetic companion that inspires action',
   ARRAY['encouraging', 'optimistic', 'action-oriented'],
   'Upbeat, challenging, and goal-focused')
ON CONFLICT (name) DO NOTHING;

-- Function to generate sample data for a specific user (call this after user creation)
CREATE OR REPLACE FUNCTION generate_sample_data_for_user(user_email TEXT)
RETURNS void AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Insert sample journal entries
    INSERT INTO public.journal_entries (user_id, date, question, content, emotion, category, word_count, mood_score, tags) VALUES
        (user_uuid, CURRENT_DATE - INTERVAL '1 day', 
         'What am I most grateful for today?', 
         'I''m grateful for the warm coffee this morning and the peaceful moment I had watching the sunrise. It reminded me to slow down and appreciate the small things.',
         'grateful', 'gratitude', 32, 4, ARRAY['gratitude', 'mindfulness']),
        
        (user_uuid, CURRENT_DATE - INTERVAL '2 days',
         'What challenge did I overcome recently?',
         'I finally had that difficult conversation with my colleague about our project. It was uncomfortable but necessary, and I''m proud of myself for being honest and direct.',
         'proud', 'growth', 28, 4, ARRAY['growth', 'communication', 'work']),
        
        (user_uuid, CURRENT_DATE - INTERVAL '3 days',
         'How am I feeling about my current goals?',
         'I''ve been making steady progress on my fitness goals, but I''m struggling with consistency in my reading habit. I need to find a better time of day for it.',
         'neutral', 'goals', 26, 3, ARRAY['goals', 'fitness', 'reading']);
    
    -- Insert a sample conversation
    INSERT INTO public.conversations (user_id, title, category, messages) VALUES
        (user_uuid, 'Discussing morning routines', 'Goals', 
         '[
           {"role": "user", "content": "I want to build a better morning routine", "timestamp": "2024-01-01T08:00:00Z"},
           {"role": "assistant", "content": "That''s a great goal! What does your current morning look like, and what would you like to change about it?", "timestamp": "2024-01-01T08:00:30Z"},
           {"role": "user", "content": "I usually rush to get ready and skip breakfast. I''d like to be more mindful.", "timestamp": "2024-01-01T08:01:00Z"}
         ]'::jsonb);
    
    RAISE NOTICE 'Sample data generated for user: %', user_email;
END;
$$ LANGUAGE plpgsql;