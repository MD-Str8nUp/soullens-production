import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { lessonId } = params;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get lesson details with program info
    const { data: lesson, error } = await supabase
      .from('program_lessons')
      .select(`
        *,
        programs!inner(
          id,
          name,
          slug,
          duration_days,
          tier_required
        )
      `)
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      return NextResponse.json({ 
        success: false, 
        error: 'Lesson not found' 
      }, { status: 404 });
    }

    // Check if user is enrolled in this program
    const { data: userProgram } = await supabase
      .from('user_programs')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', lesson.programs.id)
      .single();

    if (!userProgram) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not enrolled in this program' 
      }, { status: 403 });
    }

    // Get user's progress for this lesson
    const { data: progress } = await supabase
      .from('program_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    // Check if lesson is available (user can access this day)
    const isAvailable = lesson.day_number <= userProgram.current_day;
    const isCompleted = progress?.completion_status === 'completed';

    const enrichedLesson = {
      ...lesson,
      is_available: isAvailable,
      is_completed: isCompleted,
      user_progress: progress || null,
      user_program_id: userProgram.id
    };

    return NextResponse.json({
      success: true,
      lesson: enrichedLesson
    });

  } catch (error) {
    console.error('Error fetching lesson details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { lessonId } = params;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Get lesson and user program info
    const { data: lesson } = await supabase
      .from('program_lessons')
      .select(`
        *,
        programs!inner(id, duration_days)
      `)
      .eq('id', lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const { data: userProgram } = await supabase
      .from('user_programs')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', lesson.programs.id)
      .single();

    if (!userProgram) {
      return NextResponse.json({ error: 'Not enrolled in this program' }, { status: 403 });
    }

    if (action === 'start') {
      // Create or update progress record
      const { data: existingProgress } = await supabase
        .from('program_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (!existingProgress) {
        const { error: insertError } = await supabase
          .from('program_progress')
          .insert({
            user_id: user.id,
            user_program_id: userProgram.id,
            lesson_id: lessonId,
            completion_status: 'in_progress'
          });

        if (insertError) {
          console.error('Error creating progress record:', insertError);
          return NextResponse.json({ error: 'Failed to start lesson' }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true });

    } else if (action === 'complete') {
      const { 
        completion_data, 
        reflection_notes, 
        time_spent, 
        lesson_rating 
      } = body;

      // Update or create progress record
      const progressData = {
        user_id: user.id,
        user_program_id: userProgram.id,
        lesson_id: lessonId,
        completion_status: 'completed',
        completed_date: new Date().toISOString().split('T')[0],
        time_spent: time_spent || 0,
        reflection_notes: reflection_notes || null,
        lesson_rating: lesson_rating || null,
        completion_data: completion_data || {}
      };

      const { data: existingProgress } = await supabase
        .from('program_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('program_progress')
          .update(progressData)
          .eq('id', existingProgress.id);

        if (updateError) {
          console.error('Error updating progress:', updateError);
          return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 });
        }
      } else {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('program_progress')
          .insert(progressData);

        if (insertError) {
          console.error('Error creating progress record:', insertError);
          return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 });
        }
      }

      // The trigger function will automatically update user_programs progress
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in lesson POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}