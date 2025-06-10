import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tier = searchParams.get('tier');
    
    // Get current user for personalized data
    const { data: { user } } = await supabase.auth.getUser();
    
    // First, check if any programs exist at all
    const { data: existingPrograms, error: checkError } = await supabase
      .from('programs')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking programs:', checkError);
      return NextResponse.json({ error: 'Failed to check programs' }, { status: 500 });
    }
    
    // If no programs exist, return sample data instead of empty
    if (!existingPrograms || existingPrograms.length === 0) {
      console.log('No programs found, returning sample data');
      const samplePrograms = [
        {
          id: 'sample-1',
          name: 'Into Confidence',
          slug: 'into-confidence',
          tagline: 'Build unshakeable self-confidence in 30 days',
          description: 'A comprehensive 30-day journey to discover and build authentic confidence from within.',
          detailed_description: 'Into Confidence is your gateway to authentic self-assurance.',
          duration_days: 30,
          difficulty_level: 'Beginner',
          tier_required: 'free',
          category: 'Self-Development',
          learning_outcomes: [
            'Understand the psychology of confidence',
            'Master practical confidence-building techniques',
            'Develop a daily confidence practice'
          ],
          prerequisites: ['Willingness to engage in self-reflection'],
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          program_lessons: [
            {
              id: 'lesson-1',
              day_number: 1,
              title: 'Understanding Your Confidence Foundation',
              subtitle: 'Discover where you are right now',
              estimated_duration: 20
            }
          ],
          is_enrolled: false,
          user_progress: null,
          requires_upgrade: false
        },
        {
          id: 'sample-2',
          name: 'Into Anxiety',
          slug: 'into-anxiety',
          tagline: 'Transform your relationship with anxiety in 90 days',
          description: 'A deep, personalized 90-day program that helps you understand and work with anxiety.',
          detailed_description: 'Into Anxiety goes beyond surface-level coping strategies.',
          duration_days: 90,
          difficulty_level: 'Intermediate',
          tier_required: 'premium',
          category: 'Mental Health',
          learning_outcomes: [
            'Map your unique anxiety patterns',
            'Develop emotional regulation skills',
            'Master anxiety management techniques'
          ],
          prerequisites: ['Basic self-awareness skills'],
          sort_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          program_lessons: [
            {
              id: 'lesson-2',
              day_number: 1,
              title: 'Understanding Anxiety',
              subtitle: 'What is anxiety trying to tell you?',
              estimated_duration: 25
            }
          ],
          is_enrolled: false,
          user_progress: null,
          requires_upgrade: !user || user.subscription_tier !== 'premium'
        }
      ];
      
      return NextResponse.json({
        success: true,
        programs: samplePrograms
      });
    }
    
    let query = supabase
      .from('programs')
      .select(`
        *,
        program_lessons!inner(
          id,
          day_number,
          title,
          subtitle,
          estimated_duration
        )
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (tier && tier !== 'all') {
      query = query.eq('tier_required', tier);
    }

    const { data: programs, error } = await query;

    if (error) {
      console.error('Error fetching programs:', error);
      return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
    }

    // If user is logged in, get their enrollment status and progress
    let enrichedPrograms = programs;
    
    if (user) {
      const { data: userPrograms } = await supabase
        .from('user_programs')
        .select('*')
        .eq('user_id', user.id);

      const userProgramsMap = {};
      userPrograms?.forEach(up => {
        userProgramsMap[up.program_id] = up;
      });

      enrichedPrograms = programs.map(program => {
        const userProgram = userProgramsMap[program.id];
        return {
          ...program,
          is_enrolled: !!userProgram,
          user_progress: userProgram || null,
          requires_upgrade: program.tier_required === 'premium' && (!user || !user.subscription_tier || user.subscription_tier === 'free')
        };
      });
    } else {
      enrichedPrograms = programs.map(program => ({
        ...program,
        is_enrolled: false,
        user_progress: null,
        requires_upgrade: program.tier_required === 'premium'
      }));
    }

    return NextResponse.json({
      success: true,
      programs: enrichedPrograms
    });

  } catch (error) {
    console.error('Error in programs API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { program_id, action } = body;

    if (action === 'enroll') {
      // Check if program exists and get details
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', program_id)
        .eq('is_active', true)
        .single();

      if (programError || !program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      // Check if user already enrolled
      const { data: existingEnrollment } = await supabase
        .from('user_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', program_id)
        .single();

      if (existingEnrollment) {
        return NextResponse.json({ error: 'Already enrolled in this program' }, { status: 400 });
      }

      // Check if premium program requires upgrade
      if (program.tier_required === 'premium') {
        // TODO: Check user subscription status
        // For now, assume user has access
      }

      // Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('user_programs')
        .insert({
          user_id: user.id,
          program_id: program_id,
          status: 'active',
          started_date: new Date().toISOString().split('T')[0],
          current_day: 1
        })
        .select()
        .single();

      if (enrollmentError) {
        console.error('Error enrolling user:', enrollmentError);
        return NextResponse.json({ error: 'Failed to enroll in program' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        enrollment
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in programs POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}