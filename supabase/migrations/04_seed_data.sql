-- SoulLens AI Sample Data and Performance Optimizations
-- Seeds database with sample programs and optimizes for production
-- Version: 1.0.0
-- Production-ready for 50K+ users

-- =========================================================================
-- SAMPLE PROGRAMS DATA
-- =========================================================================

-- Insert sample programs
INSERT INTO public.programs (
    id,
    name,
    slug,
    tagline,
    description,
    detailed_description,
    duration_days,
    difficulty_level,
    tier_required,
    category,
    learning_outcomes,
    prerequisites,
    preview_content,
    success_metrics,
    is_active,
    is_featured,
    sort_order,
    price_cents
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Into Confidence',
    'into-confidence',
    'Build unshakeable self-confidence in 30 days',
    'A comprehensive 30-day journey to discover and build authentic confidence from within.',
    'Into Confidence is your gateway to authentic self-assurance. This program takes you through a carefully crafted journey that starts with understanding your unique confidence baseline and ends with you having a toolkit of proven strategies for maintaining confidence in any situation. Through daily lessons, reflective exercises, and AI-powered insights, you''ll develop genuine confidence that comes from within.',
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
    '{
        "intro_video": "https://example.com/intro-confidence.mp4",
        "sample_exercises": [
            "Confidence self-assessment",
            "Daily affirmation practice",
            "Body language awareness"
        ],
        "testimonials": [
            {
                "name": "Sarah M.",
                "quote": "This program completely transformed how I see myself. I went from avoiding social situations to actively seeking them out!",
                "rating": 5
            }
        ]
    }',
    '{
        "completion_rate_target": 80,
        "satisfaction_score_target": 4.5,
        "skill_improvement_target": 70
    }',
    true,
    true,
    1,
    0
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Into Anxiety',
    'into-anxiety',
    'Transform your relationship with anxiety in 90 days',
    'A deep, personalized 90-day program that helps you understand, work with, and transform anxiety from an enemy into valuable information.',
    'Into Anxiety goes beyond surface-level coping strategies to help you fundamentally transform your relationship with anxiety. This program combines cutting-edge AI analysis of your personal patterns with proven therapeutic approaches from CBT, ACT, and mindfulness traditions. You''ll learn to decode anxiety''s messages, develop advanced emotional regulation skills, and build a sustainable toolkit for long-term mental wellness.',
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
        'Completed Into Confidence or equivalent self-awareness work',
        'Commitment to 30+ minutes daily practice',
        'Willingness to engage with challenging emotions'
    ],
    '{
        "intro_video": "https://example.com/intro-anxiety.mp4",
        "sample_exercises": [
            "Anxiety pattern mapping",
            "Mindfulness meditation practices",
            "Cognitive restructuring techniques"
        ],
        "testimonials": [
            {
                "name": "Michael R.",
                "quote": "I never thought I could feel this calm and in control. This program gave me my life back.",
                "rating": 5
            }
        ]
    }',
    '{
        "completion_rate_target": 75,
        "satisfaction_score_target": 4.7,
        "symptom_reduction_target": 60
    }',
    true,
    true,
    2,
    4999
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Mindful Productivity',
    'mindful-productivity',
    'Achieve more by doing less - mindfully',
    'A 21-day program to revolutionize your productivity through mindfulness and intentional action.',
    'Mindful Productivity challenges the hustle culture narrative and introduces you to a sustainable approach to getting things done. Learn to work with your natural rhythms, eliminate mental clutter, and create systems that support both productivity and wellbeing. This program is perfect for busy professionals, entrepreneurs, and anyone feeling overwhelmed by their to-do list.',
    21,
    'Beginner',
    'free',
    'Productivity',
    ARRAY[
        'Understand the neuroscience of focus and attention',
        'Develop a personalized productivity system',
        'Master the art of saying no with confidence',
        'Create healthy boundaries around work and rest',
        'Build sustainable habits that stick',
        'Integrate mindfulness into your daily workflow'
    ],
    ARRAY[
        'Desire to improve work-life balance',
        'Basic understanding of mindfulness concepts'
    ],
    '{
        "intro_video": "https://example.com/intro-productivity.mp4",
        "sample_exercises": [
            "Energy audit assessment",
            "Mindful task prioritization",
            "Focus meditation practices"
        ]
    }',
    '{
        "completion_rate_target": 85,
        "satisfaction_score_target": 4.3,
        "productivity_improvement_target": 40
    }',
    true,
    false,
    3,
    0
);

-- =========================================================================
-- SAMPLE PROGRAM LESSONS
-- =========================================================================

-- Into Confidence Lessons (first 3 days)
INSERT INTO public.program_lessons (
    id,
    program_id,
    day_number,
    title,
    subtitle,
    estimated_duration,
    learning_objectives,
    lesson_content,
    integration_prompts,
    completion_criteria
) VALUES 
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    'Understanding Your Confidence Foundation',
    'Discover where you are right now',
    20,
    ARRAY[
        'Assess your current confidence baseline',
        'Understand the difference between confidence and arrogance',
        'Identify personal confidence patterns'
    ],
    '{
        "introduction": "Welcome to your confidence journey! Today we begin by understanding your current relationship with confidence. This foundation will guide everything we build together over the next 30 days.",
        "main_content": "Confidence is not about being perfect or never feeling doubt. True confidence is about developing a stable sense of self-worth that can weather life''s storms. It''s about knowing your values, understanding your strengths, and being comfortable with your authentic self.\n\nResearch shows that confidence is not fixed - it''s a skill that can be developed through practice and awareness. Today, we''ll establish your starting point and begin building your confidence toolkit.",
        "key_concepts": [
            "The difference between confidence and self-esteem",
            "How confidence affects decision-making",
            "The role of self-awareness in building confidence"
        ],
        "exercises": [
            {
                "name": "Confidence Self-Assessment",
                "instructions": "Rate yourself 1-10 in different areas of life (work, relationships, social situations, etc.)",
                "duration": 5
            },
            {
                "name": "Confidence Timeline",
                "instructions": "Write about 3 times in your life when you felt truly confident. What made those moments special?",
                "duration": 10
            },
            {
                "name": "Values Identification",
                "instructions": "List your top 5 core values and how they show up in your daily life",
                "duration": 5
            }
        ],
        "reflection_questions": [
            "What does confidence mean to you personally?",
            "When do you feel most confident in your daily life?",
            "What would change in your life if you felt more confident?",
            "What stories do you tell yourself about your capabilities?"
        ]
    }',
    '{
        "journal_prompt": "Reflect on a recent situation where you felt confident. What factors contributed to that feeling? How can you recreate those conditions?",
        "ai_chat_topic": "Discuss your confidence assessment results and explore patterns you noticed",
        "daily_practice": "Notice moments throughout the day when your confidence fluctuates and simply observe without judgment"
    }',
    '{
        "required_exercises": 2,
        "reflection_responses": 2,
        "time_spent_minimum": 15
    }'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    2,
    'The Science of Self-Belief',
    'Understanding how confidence works in your brain',
    25,
    ARRAY[
        'Understand the neuroscience of self-belief',
        'Identify limiting beliefs and thought patterns',
        'Learn how body language affects confidence'
    ],
    '{
        "introduction": "Today we explore the fascinating science behind confidence. Understanding how your brain creates and maintains beliefs about yourself is the first step to changing them.",
        "main_content": "Your brain is constantly updating its model of who you are based on your experiences, thoughts, and actions. This process, called neuroplasticity, means you can literally rewire your brain for greater confidence.\n\nResearch in cognitive psychology shows that our beliefs about ourselves become self-fulfilling prophecies. When we believe we''re capable, we act in ways that prove our capability. When we doubt ourselves, we unconsciously sabotage our success.\n\nToday, we''ll examine the mechanics of belief formation and learn how to interrupt negative thought patterns.",
        "key_concepts": [
            "Neuroplasticity and belief formation",
            "The confidence-competence loop",
            "How posture affects hormone levels",
            "Cognitive biases that undermine confidence"
        ],
        "exercises": [
            {
                "name": "Limiting Belief Audit",
                "instructions": "Identify your top 5 limiting beliefs about yourself. Write the opposite, empowering belief for each.",
                "duration": 10
            },
            {
                "name": "Power Posture Practice",
                "instructions": "Practice confident body language for 2 minutes. Notice how it affects your mood and energy.",
                "duration": 5
            },
            {
                "name": "Evidence Collection",
                "instructions": "List 10 pieces of evidence that contradict your biggest limiting belief about yourself.",
                "duration": 10
            }
        ],
        "reflection_questions": [
            "What limiting beliefs have you carried since childhood?",
            "How does your posture change in different situations?",
            "What evidence proves you''re more capable than you think?",
            "How do confident people in your life carry themselves differently?"
        ]
    }',
    '{
        "journal_prompt": "Write about a limiting belief you want to change. Where did it come from? What would your life look like without it?",
        "ai_chat_topic": "Explore the origins of your limiting beliefs and brainstorm strategies to overcome them",
        "daily_practice": "Practice confident posture throughout the day and notice how it affects your interactions"
    }',
    '{
        "required_exercises": 3,
        "reflection_responses": 2,
        "time_spent_minimum": 20
    }'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    3,
    'Building Your Confidence Toolkit',
    'Practical strategies for daily confidence building',
    25,
    ARRAY[
        'Learn evidence-based confidence techniques',
        'Create a personalized confidence routine',
        'Practice self-compassion and positive self-talk'
    ],
    '{
        "introduction": "Now that we understand the foundation and science of confidence, it''s time to build your practical toolkit. These are techniques you can use anywhere, anytime to boost your confidence.",
        "main_content": "Confidence is like a muscle - it grows stronger with regular exercise. Today we''ll learn specific techniques that have been proven effective through research and practice.\n\nThe key is to find the methods that resonate with you personally. Not every technique works for everyone, so we''ll explore a variety of approaches and help you create your personalized confidence toolkit.",
        "key_concepts": [
            "The power of preparation and practice",
            "Self-compassion vs. self-criticism",
            "Anchoring techniques for instant confidence",
            "The confidence spiral vs. the anxiety spiral"
        ],
        "exercises": [
            {
                "name": "Confidence Anchoring",
                "instructions": "Create a physical gesture or mental image that you can use to instantly access confident feelings.",
                "duration": 8
            },
            {
                "name": "Power Phrases Creation",
                "instructions": "Write 5 personal affirmations that feel authentic and energizing to you.",
                "duration": 7
            },
            {
                "name": "Success Visualization",
                "instructions": "Visualize yourself succeeding in a challenging situation, using all your senses.",
                "duration": 10
            }
        ],
        "reflection_questions": [
            "Which confidence technique felt most natural to you?",
            "How do you typically talk to yourself in challenging moments?",
            "What would you say to a friend facing your biggest insecurity?",
            "When you imagine your most confident self, what do you see?"
        ]
    }',
    '{
        "journal_prompt": "Describe your ideal confident self. What does this person think, feel, and do differently than you do now?",
        "ai_chat_topic": "Practice using your new confidence techniques and get feedback on your approach",
        "daily_practice": "Use your confidence anchor technique before any challenging situation today"
    }',
    '{
        "required_exercises": 3,
        "reflection_responses": 3,
        "time_spent_minimum": 20
    }'
);

-- Into Anxiety Lessons (first lesson)
INSERT INTO public.program_lessons (
    id,
    program_id,
    day_number,
    title,
    subtitle,
    estimated_duration,
    learning_objectives,
    lesson_content,
    integration_prompts,
    completion_criteria
) VALUES 
(
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    1,
    'Understanding Your Anxiety Landscape',
    'What is anxiety trying to tell you?',
    30,
    ARRAY[
        'Understand the purpose and function of anxiety',
        'Identify your personal anxiety triggers and patterns',
        'Learn the difference between helpful and unhelpful anxiety',
        'Begin developing a compassionate relationship with anxiety'
    ],
    '{
        "introduction": "Welcome to your anxiety transformation journey. Today we start by fundamentally reframing what anxiety is and why it exists. Instead of seeing anxiety as the enemy, we''ll learn to view it as information - sometimes helpful, sometimes outdated, but always meaningful.",
        "main_content": "Anxiety is not a character flaw or a sign of weakness. It''s an ancient survival system that helped our ancestors stay alive. The problem is that our modern brains often activate this system in response to non-life-threatening situations.\n\nThe goal isn''t to eliminate anxiety completely - that would actually be dangerous. Instead, we''ll learn to understand its messages, update its threat detection system, and develop a more balanced relationship with it.\n\nThroughout this program, we''ll use evidence-based approaches from Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), and mindfulness-based interventions.",
        "key_concepts": [
            "The evolutionary purpose of anxiety",
            "Acute vs. chronic anxiety patterns",
            "The anxiety feedback loop",
            "Anxiety as information vs. anxiety as truth",
            "The window of tolerance concept"
        ],
        "exercises": [
            {
                "name": "Anxiety Pattern Mapping",
                "instructions": "Track your anxiety triggers, physical sensations, thoughts, and behaviors over the past week. Look for patterns.",
                "duration": 15
            },
            {
                "name": "Anxiety Dialogue Exercise",
                "instructions": "Write a conversation between you and your anxiety. What is it trying to protect you from?",
                "duration": 10
            },
            {
                "name": "Body Scan Practice",
                "instructions": "Practice noticing physical sensations without trying to change them. This builds awareness and tolerance.",
                "duration": 5
            }
        ],
        "reflection_questions": [
            "What physical sensations do you associate with anxiety?",
            "What situations consistently trigger anxious feelings for you?",
            "How has anxiety influenced your life decisions, both positively and negatively?",
            "If your anxiety could speak, what would it be trying to tell you?",
            "What would your life look like if you felt safe and calm most of the time?"
        ]
    }',
    '{
        "journal_prompt": "Write a letter to your anxiety, acknowledging its attempts to protect you while also expressing your desire for a healthier relationship",
        "ai_chat_topic": "Explore your anxiety patterns and discuss strategies for building a more balanced relationship with anxious feelings",
        "daily_practice": "Practice the body scan exercise and notice anxiety signals throughout the day without judgment"
    }',
    '{
        "required_exercises": 3,
        "reflection_responses": 3,
        "time_spent_minimum": 25
    }'
);

-- Mindful Productivity Lessons (first lesson)
INSERT INTO public.program_lessons (
    id,
    program_id,
    day_number,
    title,
    subtitle,
    estimated_duration,
    learning_objectives,
    lesson_content,
    integration_prompts,
    completion_criteria
) VALUES 
(
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440003',
    1,
    'The Mindful Productivity Revolution',
    'Why less is actually more',
    20,
    ARRAY[
        'Understand the science behind mindful productivity',
        'Identify your current productivity patterns and pain points',
        'Learn the difference between being busy and being productive',
        'Set intentions for your productivity transformation'
    ],
    '{
        "introduction": "Welcome to a revolutionary approach to productivity. Instead of doing more, faster, we''re going to learn to do less, better. This isn''t about slowing down your ambitions - it''s about achieving them more sustainably and with greater satisfaction.",
        "main_content": "Traditional productivity advice often leads to burnout because it treats humans like machines. But we''re not machines - we have natural rhythms, emotions, and need for rest and recovery.\n\nMindful productivity combines the efficiency of proven systems with the wisdom of mindfulness. It''s about working with your brain''s natural patterns rather than against them, creating space for creativity and deep work, and building sustainable habits that support both achievement and wellbeing.\n\nResearch shows that mindful approaches to work can increase focus by up to 50%, reduce stress by 30%, and improve creative problem-solving significantly.",
        "key_concepts": [
            "The attention economy and cognitive load",
            "Flow states and deep work",
            "Energy management vs. time management",
            "The myth of multitasking",
            "Sustainable vs. unsustainable productivity patterns"
        ],
        "exercises": [
            {
                "name": "Productivity Audit",
                "instructions": "Track how you spend your time for one day, noting energy levels and satisfaction with each activity.",
                "duration": 5
            },
            {
                "name": "Peak Performance Analysis",
                "instructions": "Identify 3 times when you were highly productive and satisfied. What conditions made this possible?",
                "duration": 10
            },
            {
                "name": "Intention Setting",
                "instructions": "Write your vision for what mindful productivity would look and feel like in your life.",
                "duration": 5
            }
        ],
        "reflection_questions": [
            "When do you feel most energized and focused during the day?",
            "What activities make you feel busy but not productive?",
            "How does stress affect your ability to think clearly and creatively?",
            "What would change in your life if you felt more in control of your time and energy?"
        ]
    }',
    '{
        "journal_prompt": "Reflect on your relationship with productivity. What beliefs about work and achievement do you carry? Where did they come from?",
        "ai_chat_topic": "Discuss your productivity audit results and explore personalized strategies for working with your natural rhythms",
        "daily_practice": "Notice when you''re in ''busy mode'' vs. ''productive mode'' throughout the day"
    }',
    '{
        "required_exercises": 3,
        "reflection_responses": 2,
        "time_spent_minimum": 15
    }'
);

-- =========================================================================
-- ADDITIONAL PERFORMANCE OPTIMIZATIONS
-- =========================================================================

-- Materialized view for program analytics (refresh daily)
CREATE MATERIALIZED VIEW public.program_analytics AS
SELECT 
    p.id as program_id,
    p.name,
    p.tier_required,
    COUNT(up.id) as total_enrollments,
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completions,
    COUNT(CASE WHEN up.status = 'active' THEN 1 END) as active_enrollments,
    ROUND(
        (COUNT(CASE WHEN up.status = 'completed' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(up.id), 0)) * 100, 2
    ) as completion_rate,
    AVG(
        CASE WHEN pp.lesson_rating IS NOT NULL 
        THEN pp.lesson_rating 
        END
    ) as average_rating,
    AVG(up.completion_percentage) as average_progress,
    COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN up.user_id END) as weekly_active_users,
    COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE - INTERVAL '30 days' THEN up.user_id END) as monthly_active_users
FROM public.programs p
LEFT JOIN public.user_programs up ON p.id = up.program_id
LEFT JOIN public.program_progress pp ON up.id = pp.user_program_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.tier_required;

-- Index for the materialized view
CREATE UNIQUE INDEX idx_program_analytics_program_id ON public.program_analytics(program_id);

-- Function to refresh materialized views (for scheduled job)
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.program_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- PRODUCTION PERFORMANCE SETTINGS
-- =========================================================================

-- Additional indexes for high-traffic queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_user_conversation 
    ON public.messages(user_id, conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_user_date_mood 
    ON public.journal_entries(user_id, date DESC, mood_score);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_progress_user_status_completed 
    ON public.program_progress(user_id, completion_status, completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_programs_user_status_activity 
    ON public.user_programs(user_id, status, last_activity_date DESC);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_active_user 
    ON public.conversations(user_id, last_message_at DESC) 
    WHERE is_archived = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programs_active_featured 
    ON public.programs(is_featured DESC, sort_order) 
    WHERE is_active = true;

-- Composite indexes for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_analytics_user_type_date 
    ON public.usage_analytics(user_id, event_type, created_at DESC);

-- =========================================================================
-- GRANT FINAL PERMISSIONS
-- =========================================================================

-- Grant permissions on materialized view
GRANT SELECT ON public.program_analytics TO authenticated;

-- Grant execute permissions on refresh function
GRANT EXECUTE ON FUNCTION public.refresh_analytics_views TO service_role;

-- Update table statistics for query planner
ANALYZE public.profiles;
ANALYZE public.conversations;
ANALYZE public.messages;
ANALYZE public.journal_entries;
ANALYZE public.programs;
ANALYZE public.program_lessons;
ANALYZE public.user_programs;
ANALYZE public.program_progress;