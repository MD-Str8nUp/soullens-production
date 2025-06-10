import { NextResponse } from 'next/server'
import { supabase, mobileHelpers } from '@/utils/supabase'

// Mobile API endpoint for SoulLens AI
// Handles trial status, usage tracking, dashboard data, and mobile-specific operations

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'trial-status':
        return await handleTrialStatus(userId)
      
      case 'dashboard':
        return await handleDashboard(userId)
      
      case 'usage-stats':
        return await handleUsageStats(userId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: trial-status, dashboard, or usage-stats' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Mobile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, userId, ...params } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'track-event':
        return await handleTrackEvent(userId, params)
      
      case 'send-message':
        return await handleSendMessage(userId, params)
      
      case 'start-session':
        return await handleStartSession(userId, params)
      
      case 'end-session':
        return await handleEndSession(userId, params)
      
      case 'update-profile':
        return await handleUpdateProfile(userId, params)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Mobile API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle trial status check (most frequently called mobile function)
async function handleTrialStatus(userId) {
  try {
    const { data, error } = await supabase.rpc('check_trial_status', {
      user_uuid: userId
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data?.[0] || {
        is_trial_active: false,
        days_remaining: 0,
        messages_today: 0,
        can_send_message: false,
        trial_limits: {},
        subscription_tier: 'trial'
      }
    })
  } catch (error) {
    console.error('Trial status error:', error)
    return NextResponse.json(
      { error: 'Failed to check trial status' },
      { status: 500 }
    )
  }
}

// Handle mobile dashboard data
async function handleDashboard(userId) {
  try {
    const { data, error } = await supabase.rpc('get_mobile_dashboard', {
      user_uuid: userId
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || {}
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}

// Handle usage statistics
async function handleUsageStats(userId) {
  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json(
      { error: 'Failed to load usage statistics' },
      { status: 500 }
    )
  }
}

// Handle event tracking
async function handleTrackEvent(userId, params) {
  try {
    const { eventType, platform, appVersion, eventData } = params

    const { error } = await supabase.rpc('track_mobile_usage', {
      p_event_type: eventType,
      p_platform: platform || 'unknown',
      p_app_version: appVersion || '1.0.0',
      p_event_data: eventData || {}
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    })
  } catch (error) {
    console.error('Track event error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// Handle sending messages with trial checking
async function handleSendMessage(userId, params) {
  try {
    const { conversationId, content, persona = 'mentor' } = params

    // First check trial status
    const trialCheck = await supabase.rpc('check_trial_status', {
      user_uuid: userId
    })

    if (trialCheck.error) {
      throw trialCheck.error
    }

    const trialStatus = trialCheck.data?.[0]
    if (!trialStatus?.can_send_message) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'TRIAL_LIMIT',
          message: 'Daily message limit reached',
          data: trialStatus
        }
      }, { status: 429 })
    }

    // Send the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        persona
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Track the message event
    await supabase.rpc('track_mobile_usage', {
      p_event_type: 'message_sent',
      p_platform: 'mobile',
      p_app_version: '1.0.0',
      p_event_data: { persona, message_length: content.length }
    })

    return NextResponse.json({
      success: true,
      data,
      trial_status: trialStatus
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// Handle starting a new session
async function handleStartSession(userId, params) {
  try {
    const { platform, appVersion, deviceModel, osVersion } = params

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        platform,
        app_version: appVersion,
        device_model: deviceModel,
        os_version: osVersion,
        session_start: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Track app open event
    await supabase.rpc('track_mobile_usage', {
      p_event_type: 'app_opened',
      p_platform: platform,
      p_app_version: appVersion,
      p_event_data: { device_model: deviceModel, os_version: osVersion }
    })

    return NextResponse.json({
      success: true,
      data: { sessionId: data.id }
    })
  } catch (error) {
    console.error('Start session error:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}

// Handle ending a session
async function handleEndSession(userId, params) {
  try {
    const { sessionId, pagesVisited, messagesSent, crashOccurred } = params

    const sessionEnd = new Date().toISOString()
    
    const { error } = await supabase
      .from('user_sessions')
      .update({
        session_end: sessionEnd,
        pages_visited: pagesVisited || [],
        messages_sent: messagesSent || 0,
        crash_occurred: crashOccurred || false
      })
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully'
    })
  } catch (error) {
    console.error('End session error:', error)
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    )
  }
}

// Handle profile updates
async function handleUpdateProfile(userId, params) {
  try {
    const { 
      name, 
      age, 
      goals, 
      ai_companion_name, 
      timezone, 
      preferred_notification_time,
      privacy_settings 
    } = params

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (age !== undefined) updateData.age = age
    if (goals !== undefined) updateData.goals = goals
    if (ai_companion_name !== undefined) updateData.ai_companion_name = ai_companion_name
    if (timezone !== undefined) updateData.timezone = timezone
    if (preferred_notification_time !== undefined) updateData.preferred_notification_time = preferred_notification_time
    if (privacy_settings !== undefined) updateData.privacy_settings = privacy_settings

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}