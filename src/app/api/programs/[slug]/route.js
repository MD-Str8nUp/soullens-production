import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/programs/[slug]
 * 
 * Retrieves a specific program by slug with user-specific enrollment and progress data.
 * Handles authentication, subscription validation, and mobile optimization.
 * 
 * @param {Request} request - The request object
 * @param {Object} params - Route parameters containing the program slug
 * @returns {NextResponse} JSON response with program data or error
 */
export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid program slug' 
      }, { status: 400 });
    }

    // Get authorization header for mobile clients
    const authHeader = request.headers.get('authorization');
    let user = null;
    let userProfile = null;

    // Try to get authenticated user
    try {
      if (authHeader?.startsWith('Bearer ')) {
        // For mobile clients using token-based auth
        const token = authHeader.substring(7);
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
        user = authUser;
      } else {
        // For web clients using session-based auth
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        user = sessionUser;
      }
      
      // Get user profile with subscription info if authenticated
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, trial_ends_at')
          .eq('id', user.id)
          .single();
        
        userProfile = profile;
      }
    } catch (authErr) {
      console.warn('Authentication check failed:', authErr);
      // Continue as unauthenticated user
    }

    // Check if programs exist in database
    const { data: existingPrograms, error: checkError } = await supabase
      .from('programs')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Database check error:', checkError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        code: 'DB_ERROR'
      }, { status: 503 });
    }
    
    // Return sample data if no programs exist in database (dev/demo mode)
    if (!existingPrograms || existingPrograms.length === 0) {
      return getSampleProgramData(slug, user, userProfile);
    }
    
    // Get program from database with lessons
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select(`
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
        is_active,
        sort_order,
        created_at,
        updated_at,
        program_lessons (
          id,
          day_number,
          title,
          subtitle,
          estimated_duration,
          learning_objectives,
          lesson_content,
          integration_prompts,
          completion_criteria
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (programError || !program) {
      return NextResponse.json({ 
        success: false, 
        error: 'Program not found',
        code: 'PROGRAM_NOT_FOUND'
      }, { status: 404 });
    }

    // Sort lessons by day number
    const sortedLessons = program.program_lessons?.sort((a, b) => a.day_number - b.day_number) || [];
    
    // Build base program response
    const enrichedProgram = {
      ...program,
      lessons: sortedLessons,
      is_enrolled: false,
      user_progress: null,
      requires_upgrade: false
    };
    
    // Remove the nested program_lessons array
    delete enrichedProgram.program_lessons;

    // Check subscription access
    const hasAccess = checkProgramAccess(program.tier_required, userProfile?.subscription_tier, userProfile?.trial_ends_at);
    enrichedProgram.requires_upgrade = !hasAccess;

    // Add user-specific data if authenticated
    if (user) {
      await enrichProgramWithUserData(enrichedProgram, user.id, program.id, hasAccess);
    } else {
      // For unauthenticated users, only show preview of first lesson
      enrichedProgram.lessons = enrichedProgram.lessons.map((lesson, index) => ({
        ...lesson,
        is_completed: false,
        is_available: index === 0, // Only first lesson preview
        is_current: false,
        progress: null,
        // Limit content for preview
        lesson_content: index === 0 ? {
          ...lesson.lesson_content,
          // Show only introduction and first exercise for preview
          exercises: lesson.lesson_content.exercises?.slice(0, 1) || [],
          reflection_questions: lesson.lesson_content.reflection_questions?.slice(0, 1) || []
        } : { preview_only: true }
      }));
    }

    // Add mobile-specific optimizations
    const isMobileRequest = request.headers.get('user-agent')?.toLowerCase().includes('mobile') || 
                           request.headers.get('x-mobile-app') === 'true';
    
    if (isMobileRequest) {
      // Optimize response for mobile
      enrichedProgram.mobile_optimized = true;
      enrichedProgram.offline_capable = true;
      
      // Add essential data for offline functionality
      enrichedProgram.essential_data = {
        program_id: program.id,
        slug: program.slug,
        name: program.name,
        current_lesson: enrichedProgram.user_progress?.current_day || 1
      };
    }

    return NextResponse.json({
      success: true,
      program: enrichedProgram,
      timestamp: new Date().toISOString(),
      user_authenticated: !!user
    });

  } catch (error) {
    console.error('Critical error in programs API:', error);
    
    // Return appropriate error based on error type
    if (error.message?.includes('rate limit')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT'
      }, { status: 429 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

/**
 * Checks if user has access to a program based on subscription tier and trial status
 */
function checkProgramAccess(programTier, userTier, trialEndsAt) {
  // Free programs are accessible to everyone
  if (programTier === 'free') {
    return true;
  }
  
  // Premium programs require premium subscription or active trial
  if (programTier === 'premium') {
    // Check if user has premium subscription
    if (userTier === 'premium') {
      return true;
    }
    
    // Check if user has active trial
    if (trialEndsAt && new Date(trialEndsAt) > new Date()) {
      return true;
    }
  }
  
  return false;
}

/**
 * Enriches program data with user-specific enrollment and progress information
 */
async function enrichProgramWithUserData(program, userId, programId, hasAccess) {
  try {
    // Get user's enrollment status
    const { data: userProgram } = await supabase
      .from('user_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .single();

    if (userProgram) {
      // User is enrolled - get detailed progress
      const { data: lessonProgress } = await supabase
        .from('program_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('user_program_id', userProgram.id);

      // Create progress lookup map
      const progressMap = {};
      lessonProgress?.forEach(progress => {
        progressMap[progress.lesson_id] = progress;
      });

      // Enrich lessons with progress and availability
      program.lessons = program.lessons.map((lesson) => {
        const progress = progressMap[lesson.id];
        const isCompleted = progress?.completion_status === 'completed';
        const isCurrentDay = lesson.day_number === userProgram.current_day;
        const isAvailable = hasAccess && lesson.day_number <= userProgram.current_day;

        return {
          ...lesson,
          is_completed: isCompleted,
          is_available: isAvailable,
          is_current: isCurrentDay,
          progress: progress || null
        };
      });

      program.is_enrolled = true;
      program.user_progress = {
        ...userProgram,
        lessons_completed: lessonProgress?.filter(p => p.completion_status === 'completed').length || 0,
        total_lessons: program.lessons.length
      };
    } else {
      // Not enrolled - show limited access based on subscription
      program.lessons = program.lessons.map((lesson, index) => {
        // Allow preview of first lesson for all authenticated users
        // Allow access to all lessons if user has proper subscription
        const isPreviewLesson = index === 0;
        const canAccessLesson = hasAccess || isPreviewLesson;

        return {
          ...lesson,
          is_completed: false,
          is_available: canAccessLesson,
          is_current: false,
          progress: null,
          // Limit content for preview lessons when no access
          lesson_content: (!hasAccess && isPreviewLesson) ? {
            ...lesson.lesson_content,
            exercises: lesson.lesson_content.exercises?.slice(0, 1) || [],
            reflection_questions: lesson.lesson_content.reflection_questions?.slice(0, 1) || []
          } : lesson.lesson_content
        };
      });

      program.is_enrolled = false;
      program.user_progress = null;
    }
  } catch (error) {
    console.error('Error enriching program with user data:', error);
    // Continue with base program data if user enrichment fails
  }
}

/**
 * Returns sample program data for development/demo purposes
 */
function getSampleProgramData(slug, user, userProfile) {
  const samplePrograms = {
    'into-confidence': {
      id: 'sample-1',
      name: 'Into Confidence',
      slug: 'into-confidence',
      tagline: 'Build unshakeable self-confidence in 30 days',
      description: 'A comprehensive 30-day journey to discover and build authentic confidence from within.',
      detailed_description: 'Into Confidence is your gateway to authentic self-assurance. This program takes you through a carefully crafted journey that starts with understanding your unique confidence baseline and ends with you having a toolkit of proven strategies for maintaining confidence in any situation.',
      duration_days: 30,
      difficulty_level: 'Beginner',
      tier_required: 'free',
      category: 'Self-Development',
      learning_outcomes: [
        'Understand the psychology of confidence and how it affects your daily life',
        'Identify your personal confidence triggers and blockers',
        'Master 15+ practical confidence-building techniques',
        'Develop a daily confidence practice that fits your lifestyle',
        'Build resilience to confidence setbacks',
        'Create a personalized confidence maintenance system'
      ],
      prerequisites: [
        'Willingness to engage in self-reflection',
        'Commitment to 15-20 minutes daily practice'
      ],
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    'into-anxiety': {
      id: 'sample-2',
      name: 'Into Anxiety',
      slug: 'into-anxiety',
      tagline: 'Transform your relationship with anxiety in 90 days',
      description: 'A deep, personalized 90-day program that helps you understand, work with, and transform anxiety from an enemy into valuable information.',
      detailed_description: 'Into Anxiety goes beyond surface-level coping strategies to help you fundamentally transform your relationship with anxiety. This program combines cutting-edge AI analysis of your personal patterns with proven therapeutic approaches from CBT, ACT, and mindfulness traditions.',
      duration_days: 90,
      difficulty_level: 'Intermediate',
      tier_required: 'premium',
      category: 'Mental Health',
      learning_outcomes: [
        'Map your unique anxiety patterns and triggers',
        'Develop advanced emotional regulation skills',
        'Master 20+ evidence-based anxiety management techniques',
        'Create personalized coping strategies based on your anxiety type',
        'Build resilience and post-traumatic growth',
        'Establish a sustainable anxiety management lifestyle'
      ],
      prerequisites: [
        'Completed Into Confidence or equivalent self-awareness work',
        'Commitment to 30+ minutes daily practice',
        'Willingness to engage with challenging emotions'
      ],
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  const program = samplePrograms[slug];
  if (!program) {
    return NextResponse.json({ 
      success: false, 
      error: 'Program not found',
      code: 'PROGRAM_NOT_FOUND'
    }, { status: 404 });
  }

  // Add sample lessons
  program.lessons = [
    {
      id: `lesson-${slug}-1`,
      day_number: 1,
      title: slug === 'into-confidence' ? 'Understanding Your Confidence Foundation' : 'Understanding Your Anxiety Landscape',
      subtitle: slug === 'into-confidence' ? 'Discover where you are right now' : 'What is anxiety trying to tell you?',
      estimated_duration: slug === 'into-confidence' ? 20 : 25,
      learning_objectives: slug === 'into-confidence' 
        ? ['Assess your current confidence baseline', 'Understand the difference between confidence and arrogance', 'Identify personal confidence patterns']
        : ['Understand the purpose and function of anxiety', 'Identify your personal anxiety triggers', 'Learn the difference between helpful and unhelpful anxiety'],
      lesson_content: {
        introduction: slug === 'into-confidence' 
          ? 'Welcome to your confidence journey! Today we begin by understanding your current relationship with confidence.'
          : 'Welcome to your anxiety transformation journey. Today we start by understanding what anxiety really is.',
        main_content: slug === 'into-confidence'
          ? 'Confidence is not about being perfect or never feeling doubt. It is about developing a stable sense of self-worth that can weather life\'s storms.'
          : 'Anxiety is not your enemy - it is information. Learning to decode this information is the first step to transformation.',
        exercises: slug === 'into-confidence'
          ? ['Complete the confidence self-assessment', 'Identify 3 areas where you feel most confident', 'Write about a time when you felt truly confident']
          : ['Complete the anxiety patterns assessment', 'Map your personal anxiety triggers', 'Practice the anxiety acceptance meditation'],
        reflection_questions: slug === 'into-confidence'
          ? ['What does confidence mean to you personally?', 'When do you feel most confident in your daily life?', 'What would change in your life if you felt more confident?']
          : ['What physical sensations accompany your anxiety?', 'What situations consistently trigger anxious feelings?', 'How has anxiety influenced your decisions in the past?']
      },
      is_completed: false,
      is_available: !!user,
      is_current: false,
      progress: null
    }
  ];

  // Set enrollment and access status
  const hasAccess = checkProgramAccess(program.tier_required, userProfile?.subscription_tier, userProfile?.trial_ends_at);
  program.is_enrolled = false;
  program.user_progress = null;
  program.requires_upgrade = !hasAccess;

  return NextResponse.json({
    success: true,
    program: program,
    demo_mode: true,
    timestamp: new Date().toISOString(),
    user_authenticated: !!user
  });
}