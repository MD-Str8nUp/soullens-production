import { createClient } from '@supabase/supabase-js'

// Mobile-optimized Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Mobile deep linking
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
    // Mobile auth providers
    providers: {
      apple: {
        redirectTo: 'soullens://auth/callback'
      },
      google: {
        redirectTo: 'soullens://auth/callback'
      }
    }
  },
  // Mobile performance optimization
  realtime: {
    params: {
      eventsPerSecond: 10 // Limit for mobile battery
    }
  },
  // Mobile network optimization
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      // Mobile-friendly timeouts
      timeout: 10000
    })
  }
})

// MOBILE AUTHENTICATION HELPERS
export const mobileAuth = {
  // Apple Sign-In (iOS priority)
  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: 'soullens://auth/callback',
        scopes: 'name email'
      }
    })
    return { data, error }
  },

  // Google Sign-In (Android priority)
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'soullens://auth/callback',
        scopes: 'profile email'
      }
    })
    return { data, error }
  },

  // Phone authentication (international)
  async signInWithPhone(phone) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        // Mobile-optimized OTP
        shouldCreateUser: true
      }
    })
    return { data, error }
  }
}

// MOBILE-OPTIMIZED API FUNCTIONS
export const mobileAPI = {
  // Check trial status (called frequently on mobile)
  async checkTrialStatus() {
    const { data, error } = await supabase.rpc('check_trial_status')
    return { data: data?.[0], error }
  },

  // Track mobile usage
  async trackEvent(eventType, platform = 'unknown', appVersion = '1.0.0', eventData = {}) {
    const { error } = await supabase.rpc('track_mobile_usage', {
      p_event_type: eventType,
      p_platform: platform,
      p_app_version: appVersion,
      p_event_data: eventData
    })
    return { error }
  },

  // Get dashboard data (optimized single query)
  async getDashboardData() {
    const { data, error } = await supabase.rpc('get_mobile_dashboard')
    return { data, error }
  },

  // Send message with trial checking
  async sendMessage(conversationId, content, persona = 'mentor') {
    // Check trial first
    const trialStatus = await this.checkTrialStatus()
    if (trialStatus.error) return { error: trialStatus.error }
    
    if (!trialStatus.data.can_send_message) {
      return { 
        error: { 
          message: 'Trial limit reached',
          type: 'TRIAL_LIMIT',
          data: trialStatus.data 
        }
      }
    }

    // Send message
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

    if (!error) {
      // Track usage
      await this.trackEvent('message_sent', 'mobile', '1.0.0', { persona })
    }

    return { data, error }
  },

  // Real-time conversation subscription (mobile-optimized)
  subscribeToConversation(conversationId, callback) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe()
  },

  // Offline sync (mobile critical)
  async syncOfflineData(offlineData) {
    const { data, error } = await supabase
      .from('sync_queue')
      .insert(offlineData)
      .select()
    
    return { data, error }
  }
}