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