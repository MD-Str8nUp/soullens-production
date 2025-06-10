import { createClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Production-ready Supabase client configuration
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: process.env.NEXT_PUBLIC_APP_ENV !== 'mobile',
    // Enhanced security settings
    flowType: 'pkce',
    // Mobile deep linking support
    ...(process.env.NEXT_PUBLIC_APP_ENV === 'mobile' && {
      redirectTo: `${process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME}://auth/callback`
    })
  },
  // Production realtime configuration
  realtime: {
    params: {
      eventsPerSecond: process.env.NEXT_PUBLIC_APP_ENV === 'mobile' ? 10 : 20,
      // Connection optimization for production
      heartbeatIntervalMs: 30000,
      reconnectIntervalMs: 5000,
      timeout: 10000
    }
  },
  // Global configuration
  global: {
    headers: {
      'x-client-info': `soullens-ai/${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`,
      'x-platform': process.env.NEXT_PUBLIC_APP_ENV || 'web'
    }
  },
  // Database connection pooling for production
  db: {
    schema: 'public'
  }
}

// Main client for application use
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)

// Admin client for server-side operations (only available server-side)
export const supabaseAdmin = typeof window === 'undefined' && serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-client-info': `soullens-ai-admin/${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`
        }
      }
    })
  : null

// Production-ready helper functions for database operations
export const supabaseHelpers = {
  // Enhanced insert with error handling and validation
  async insertData(table, data, options = {}) {
    try {
      const { returning = true, onConflict = null } = options
      
      let query = supabase.from(table).insert(data)
      
      if (returning) query = query.select()
      if (onConflict) query = query.onConflict(onConflict)
      
      const { data: result, error } = await query
      
      if (error) {
        console.error(`Insert error for table ${table}:`, error)
        throw new Error(`Failed to insert data into ${table}: ${error.message}`)
      }
      
      return result
    } catch (error) {
      console.error(`Supabase insert operation failed:`, error)
      throw error
    }
  },

  // Enhanced query with pagination and filtering
  async getData(table, options = {}) {
    try {
      const { 
        filters = {}, 
        select = '*', 
        orderBy = null, 
        limit = null, 
        offset = null,
        single = false 
      } = options
      
      let query = supabase.from(table).select(select)
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object' && value.operator) {
          const { operator, operand } = value
          switch (operator) {
            case 'gte':
              query = query.gte(key, operand)
              break
            case 'lte':
              query = query.lte(key, operand)
              break
            case 'gt':
              query = query.gt(key, operand)
              break
            case 'lt':
              query = query.lt(key, operand)
              break
            case 'like':
              query = query.like(key, operand)
              break
            case 'ilike':
              query = query.ilike(key, operand)
              break
            default:
              query = query.eq(key, operand)
          }
        } else {
          query = query.eq(key, value)
        }
      })
      
      // Apply ordering
      if (orderBy) {
        if (Array.isArray(orderBy)) {
          orderBy.forEach(order => {
            const { column, ascending = true } = order
            query = query.order(column, { ascending })
          })
        } else {
          const { column, ascending = true } = orderBy
          query = query.order(column, { ascending })
        }
      }
      
      // Apply pagination
      if (limit) query = query.limit(limit)
      if (offset) query = query.range(offset, offset + (limit || 999) - 1)
      
      // Execute query
      const { data, error } = single ? await query.single() : await query
      
      if (error) {
        console.error(`Query error for table ${table}:`, error)
        throw new Error(`Failed to fetch data from ${table}: ${error.message}`)
      }
      
      return data
    } catch (error) {
      console.error(`Supabase query operation failed:`, error)
      throw error
    }
  },

  // Enhanced update with conditional logic
  async updateData(table, id, updates, options = {}) {
    try {
      const { returning = true } = options
      
      let query = supabase.from(table).update(updates).eq('id', id)
      
      if (returning) query = query.select()
      
      const { data, error } = await query
      
      if (error) {
        console.error(`Update error for table ${table}:`, error)
        throw new Error(`Failed to update data in ${table}: ${error.message}`)
      }
      
      return data
    } catch (error) {
      console.error(`Supabase update operation failed:`, error)
      throw error
    }
  },

  // Enhanced delete with safety checks
  async deleteData(table, id, options = {}) {
    try {
      const { softDelete = false, returning = false } = options
      
      let query
      if (softDelete) {
        // Soft delete by setting is_active to false
        query = supabase.from(table).update({ is_active: false }).eq('id', id)
      } else {
        query = supabase.from(table).delete().eq('id', id)
      }
      
      if (returning) query = query.select()
      
      const { data, error } = await query
      
      if (error) {
        console.error(`Delete error for table ${table}:`, error)
        throw new Error(`Failed to delete data from ${table}: ${error.message}`)
      }
      
      return returning ? data : true
    } catch (error) {
      console.error(`Supabase delete operation failed:`, error)
      throw error
    }
  },

  // Batch operations for performance
  async batchInsert(table, dataArray, chunkSize = 100) {
    try {
      const results = []
      
      for (let i = 0; i < dataArray.length; i += chunkSize) {
        const chunk = dataArray.slice(i, i + chunkSize)
        const { data, error } = await supabase
          .from(table)
          .insert(chunk)
          .select()
        
        if (error) throw error
        results.push(...data)
      }
      
      return results
    } catch (error) {
      console.error(`Batch insert failed for table ${table}:`, error)
      throw error
    }
  },

  // Connection health check
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      return { healthy: !error, error: error?.message }
    } catch (error) {
      return { healthy: false, error: error.message }
    }
  }
}

// Mobile-specific API helpers
export const mobileHelpers = {
  // Check trial status with caching
  async checkTrialStatus(userId, useCache = true) {
    try {
      const cacheKey = `trial_status_${userId}`
      
      // Check cache first (valid for 1 minute)
      if (useCache && typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 60000) { // 1 minute cache
            return data
          }
        }
      }

      const { data, error } = await supabase.rpc('check_trial_status', {
        user_uuid: userId
      })
      
      if (error) throw error
      
      const result = data?.[0] || null
      
      // Cache the result
      if (typeof window !== 'undefined' && result) {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }))
      }
      
      return result
    } catch (error) {
      console.error('Trial status check failed:', error)
      return null
    }
  },

  // Track mobile events
  async trackEvent(eventType, platform = 'web', appVersion = '1.0.0', eventData = {}) {
    try {
      const { error } = await supabase.rpc('track_mobile_usage', {
        p_event_type: eventType,
        p_platform: platform,
        p_app_version: appVersion,
        p_event_data: eventData
      })
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Event tracking failed:', error)
      return false
    }
  },

  // Get mobile dashboard data
  async getDashboard(userId) {
    try {
      const { data, error } = await supabase.rpc('get_mobile_dashboard', {
        user_uuid: userId
      })
      
      if (error) throw error
      return data || {}
    } catch (error) {
      console.error('Dashboard data fetch failed:', error)
      return {}
    }
  },

  // Send message with trial validation
  async sendMessage(conversationId, content, persona = 'mentor') {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) throw new Error('Not authenticated')

      // Check trial status first
      const trialStatus = await this.checkTrialStatus(user.data.user.id, false)
      if (!trialStatus?.can_send_message) {
        return {
          success: false,
          error: {
            type: 'TRIAL_LIMIT',
            message: 'Daily message limit reached',
            data: trialStatus
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

      if (error) throw error

      // Track the event
      await this.trackEvent('message_sent', 'web', '1.0.0', {
        persona,
        message_length: content.length
      })

      return { success: true, data, trial_status: trialStatus }
    } catch (error) {
      console.error('Send message failed:', error)
      return { success: false, error: error.message }
    }
  },

  // Create conversation with mobile optimization
  async createConversation(title, sessionType = 'chat', persona = 'mentor') {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.data.user.id,
          conversation_title: title,
          session_type: sessionType,
          persona_used: persona,
          device_platform: 'web'
        })
        .select()
        .single()

      if (error) throw error

      // Track conversation creation
      await this.trackEvent('conversation_created', 'web', '1.0.0', {
        session_type: sessionType,
        persona
      })

      return data
    } catch (error) {
      console.error('Create conversation failed:', error)
      throw error
    }
  },

  // Subscribe to real-time conversation updates
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

  // Start session tracking
  async startSession(platform = 'web', appVersion = '1.0.0', deviceInfo = {}) {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return null

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.data.user.id,
          platform,
          app_version: appVersion,
          device_model: deviceInfo.model || 'unknown',
          os_version: deviceInfo.osVersion || 'unknown',
          session_start: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Track app open
      await this.trackEvent('app_opened', platform, appVersion, deviceInfo)

      return data.id
    } catch (error) {
      console.error('Start session failed:', error)
      return null
    }
  },

  // End session tracking
  async endSession(sessionId, stats = {}) {
    try {
      if (!sessionId) return

      const { error } = await supabase
        .from('user_sessions')
        .update({
          session_end: new Date().toISOString(),
          pages_visited: stats.pagesVisited || [],
          messages_sent: stats.messagesSent || 0,
          session_duration_seconds: stats.duration || 0
        })
        .eq('id', sessionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('End session failed:', error)
      return false
    }
  }
}