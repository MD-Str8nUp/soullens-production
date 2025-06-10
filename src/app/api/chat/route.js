import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import SoulLensAI from '@/ai-engine/soullens-ai-engine';

// Store AI engine instance in memory (in production, use proper session management)
let aiEngine = null;

function getAIEngine() {
  if (!aiEngine) {
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '';
    
    if (!apiKey) {
      console.warn('No Claude API key found. AI responses will use fallback mode.');
    }
    
    aiEngine = new SoulLensAI(apiKey);
    
    // Set default preferences
    if (aiEngine.userProfile) {
      aiEngine.userProfile.preferences = {
        allowProfanity: false,
        conversationStyle: 'casual'
      };
    }
  }
  
  return aiEngine;
}

async function fetchUserProgramData(supabase, userId) {
  try {
    // Get user's current programs with progress
    const { data: userPrograms } = await supabase
      .from('user_program_dashboard')
      .select('*')
      .eq('user_id', userId);

    // Get recent lesson completions (last 7 days)
    const { data: recentLessons } = await supabase
      .from('program_progress')
      .select(`
        *,
        program_lessons (
          title,
          day_number,
          programs (name)
        )
      `)
      .eq('user_id', userId)
      .eq('completion_status', 'completed')
      .gte('completed_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('completed_date', { ascending: false })
      .limit(5);

    // Get recent milestones (last 30 days)
    const { data: recentMilestones } = await supabase
      .from('program_milestones')
      .select('*')
      .eq('user_id', userId)
      .gte('achieved_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('achieved_date', { ascending: false })
      .limit(3);

    // Calculate total progress stats
    const { data: totalStats } = await supabase
      .from('program_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('completion_status', 'completed');

    const totalDaysCompleted = totalStats?.length || 0;
    
    // Calculate longest streak (simplified version)
    let longestStreak = 0;
    if (userPrograms && userPrograms.length > 0) {
      longestStreak = Math.max(...userPrograms.map(p => p.streak_count || 0));
    }

    return {
      currentPrograms: userPrograms || [],
      completedPrograms: userPrograms?.filter(p => p.status === 'completed') || [],
      currentDayLessons: recentLessons || [],
      recentMilestones: recentMilestones || [],
      totalDaysCompleted,
      longestStreak,
      insights: {
        // Could add more sophisticated insights here
        totalPrograms: userPrograms?.length || 0,
        activePrograms: userPrograms?.filter(p => p.status === 'active').length || 0
      }
    };
  } catch (error) {
    console.error('Error fetching program data:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const { message, sessionType = 'check_in', includeJournalContext, persona } = await request.json();
    
    // Get or create AI engine instance
    const ai = getAIEngine();
    
    // Set persona if provided
    if (persona && ai.changePersona) {
      ai.changePersona(persona);
    }

    // Fetch and update program context
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user's program data
        const programData = await fetchUserProgramData(supabase, user.id);
        
        // Update AI engine with program context
        if (programData && ai.updateProgramProgress) {
          ai.updateProgramProgress(programData);
        }
      }
    } catch (programError) {
      console.warn('Could not fetch program data:', programError);
      // Continue without program context
    }
    
    // Get AI response using the sophisticated engine
    const aiResponse = await ai.startConversation(message, sessionType);
    
    // If no API key, use the response directly from the fallback
    if (!aiResponse || !aiResponse.message) {
      // Fallback to simple responses if AI engine fails
      const responses = {
        'excited': "YESSS! I can feel that excitement radiating through the screen! That energy is infectious, and I'm genuinely pumped for you. What's got you feeling so alive right now?",
        'stressed': "I hear you, and that sounds really overwhelming. You're carrying a lot right now, aren't you? Sometimes when everything feels heavy, it helps to just breathe and focus on one thing at a time. What feels most urgent to you?",
        'confused': "That uncertainty can feel really unsettling, and I want you to know that's completely normal. Sometimes our minds need space to process before clarity emerges. What's the biggest question you're sitting with right now?",
        'default': "I'm really glad you shared that with me. There's something meaningful in what you're saying, and I want to understand it better. Tell me more about what's on your heart."
      };
      
      const input = message ? message.toLowerCase() : '';
      let responseKey = 'default';
      
      if (input.includes('excited') || input.includes('amazing') || input.includes('awesome')) {
        responseKey = 'excited';
      } else if (input.includes('stressed') || input.includes('overwhelmed') || input.includes('anxious')) {
        responseKey = 'stressed';
      } else if (input.includes('confused') || input.includes('lost') || input.includes('unclear')) {
        responseKey = 'confused';
      }
      
      return NextResponse.json({
        result: responses[responseKey]
      });
    }
    
    // Return the AI response
    return NextResponse.json({
      result: aiResponse.message,
      analysis: aiResponse.analysis,
      insights: aiResponse.insights
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// TODO: Actual Claude API integration
/*
export async function POST(request) {
  try {
    const { prompt, maxTokens = 200 } = await request.json();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return NextResponse.json({
      result: data.content[0].text
    });
    
  } catch (error) {
    console.error('Claude API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
*/