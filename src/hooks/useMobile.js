import { useState, useEffect, useCallback, useRef } from 'react'
import { mobileHelpers } from '../utils/supabase'

// Custom hook for mobile trial management
export function useTrial(userId) {
  const [trialStatus, setTrialStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkTrial = useCallback(async (useCache = true) => {
    if (!userId) return

    try {
      setLoading(true)
      const status = await mobileHelpers.checkTrialStatus(userId, useCache)
      setTrialStatus(status)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Trial check failed:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    checkTrial(true)
  }, [checkTrial])

  return {
    trialStatus,
    loading,
    error,
    refreshTrial: () => checkTrial(false),
    canSendMessage: trialStatus?.can_send_message || false,
    isTrialActive: trialStatus?.is_trial_active || false,
    daysRemaining: trialStatus?.days_remaining || 0,
    messagesUsed: trialStatus?.messages_today || 0,
    limits: trialStatus?.trial_limits || {}
  }
}

// Custom hook for mobile analytics tracking
export function useAnalytics() {
  const sessionId = useRef(null)
  const pageViews = useRef([])
  const startTime = useRef(Date.now())

  const trackEvent = useCallback(async (eventType, eventData = {}) => {
    try {
      await mobileHelpers.trackEvent(eventType, 'web', '1.0.0', {
        ...eventData,
        timestamp: Date.now(),
        session_id: sessionId.current
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }, [])

  const trackPageView = useCallback(async (pageName) => {
    pageViews.current.push({
      page: pageName,
      timestamp: Date.now(),
      duration: Date.now() - startTime.current
    })

    await trackEvent('page_view', {
      page_name: pageName,
      session_duration: Date.now() - startTime.current
    })
  }, [trackEvent])

  const startSession = useCallback(async () => {
    try {
      const id = await mobileHelpers.startSession('web', '1.0.0', {
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      sessionId.current = id
      startTime.current = Date.now()
    } catch (error) {
      console.error('Session start failed:', error)
    }
  }, [])

  const endSession = useCallback(async () => {
    if (!sessionId.current) return

    try {
      await mobileHelpers.endSession(sessionId.current, {
        pagesVisited: pageViews.current.map(p => p.page),
        messagesSent: 0, // This should be tracked separately
        duration: Math.floor((Date.now() - startTime.current) / 1000)
      })
    } catch (error) {
      console.error('Session end failed:', error)
    }
  }, [])

  useEffect(() => {
    startSession()

    // End session on page unload
    const handleUnload = () => {
      endSession()
    }

    window.addEventListener('beforeunload', handleUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      endSession()
    }
  }, [startSession, endSession])

  return {
    trackEvent,
    trackPageView,
    sessionId: sessionId.current
  }
}

// Custom hook for mobile dashboard data
export function useMobileDashboard(userId) {
  const [dashboardData, setDashboardData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshDashboard = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const data = await mobileHelpers.getDashboard(userId)
      setDashboardData(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Dashboard fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refreshDashboard()
  }, [refreshDashboard])

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard
  }
}

// Custom hook for mobile-optimized conversations
export function useMobileConversation(conversationId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscription, setSubscription] = useState(null)

  const sendMessage = useCallback(async (content, persona = 'mentor') => {
    try {
      const result = await mobileHelpers.sendMessage(conversationId, content, persona)
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to send message')
      }

      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, result.data])
      
      return result
    } catch (error) {
      console.error('Send message failed:', error)
      throw error
    }
  }, [conversationId])

  const subscribeToMessages = useCallback(() => {
    if (!conversationId || subscription) return

    const sub = mobileHelpers.subscribeToConversation(conversationId, (payload) => {
      const newMessage = payload.new
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(msg => msg.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
    })

    setSubscription(sub)

    return () => {
      sub.unsubscribe()
      setSubscription(null)
    }
  }, [conversationId, subscription])

  useEffect(() => {
    subscribeToMessages()
    
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [subscribeToMessages, subscription])

  return {
    messages,
    loading,
    error,
    sendMessage
  }
}

// Custom hook for mobile notifications (for PWA/web)
export function useMobileNotifications() {
  const [permission, setPermission] = useState('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!supported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Notification permission failed:', error)
      return false
    }
  }, [supported])

  const showNotification = useCallback(async (title, options = {}) => {
    if (permission !== 'granted') return false

    try {
      new Notification(title, {
        icon: '/images/app_icon.jpg',
        badge: '/images/app_icon.jpg',
        ...options
      })
      return true
    } catch (error) {
      console.error('Show notification failed:', error)
      return false
    }
  }, [permission])

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
    canNotify: permission === 'granted'
  }
}

// Custom hook for offline detection and sync
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingSync, setPendingSync] = useState([])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Process pending sync items when back online
      processPendingSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addToSyncQueue = useCallback((operation) => {
    setPendingSync(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...operation
    }])
  }, [])

  const processPendingSync = useCallback(async () => {
    if (!isOnline || pendingSync.length === 0) return

    try {
      // Process sync queue - this would integrate with your sync logic
      console.log('Processing offline sync queue:', pendingSync)
      
      // Clear processed items
      setPendingSync([])
    } catch (error) {
      console.error('Sync processing failed:', error)
    }
  }, [isOnline, pendingSync])

  return {
    isOnline,
    pendingSync: pendingSync.length,
    addToSyncQueue
  }
}