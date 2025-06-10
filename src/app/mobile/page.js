'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useAnalytics } from '../../hooks/useMobile'
import MobileDashboard from '../../components/mobile/MobileDashboard'
import MobileTrialBanner from '../../components/mobile/MobileTrialBanner'

export default function MobilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { trackEvent, trackPageView } = useAnalytics()

  useEffect(() => {
    // Track page view
    trackPageView('mobile_home')

    // Get current user
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (event === 'SIGNED_IN') {
          await trackEvent('user_signed_in', { platform: 'mobile' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [trackPageView, trackEvent])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/app_icon.jpg" 
                alt="SoulLens AI" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SoulLens AI</h1>
                <p className="text-xs text-gray-600">Mobile Experience</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  await trackEvent('settings_click')
                  window.location.href = '/settings'
                }}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                ⚙️
              </button>
              <button
                onClick={async () => {
                  await trackEvent('user_menu_click')
                  // Show user menu
                }}
                className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dashboard */}
      <MobileDashboard userId={user.id} />

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  )
}

function MobileBottomNav() {
  const { trackEvent } = useAnalytics()
  
  const navItems = [
    { icon: '🏠', label: 'Home', href: '/mobile', active: true },
    { icon: '💬', label: 'Chat', href: '/chat' },
    { icon: '📝', label: 'Journal', href: '/journal' },
    { icon: '💡', label: 'Insights', href: '/insights' },
    { icon: '📊', label: 'Journey', href: '/journey' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
      <div className="flex justify-around">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={async () => {
              await trackEvent('bottom_nav_click', { 
                item: item.label.toLowerCase(),
                href: item.href 
              })
              if (!item.active) {
                window.location.href = item.href
              }
            }}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
              item.active 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading SoulLens AI...</p>
      </div>
    </div>
  )
}

function AuthScreen() {
  const { trackEvent } = useAnalytics()
  
  const handleSignIn = async (provider) => {
    try {
      await trackEvent('auth_attempt', { provider })
      
      if (provider === 'email') {
        window.location.href = '/auth/signin'
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/mobile`
          }
        })
        if (error) throw error
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Sign in failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center">
          <img 
            src="/images/app_icon.jpg" 
            alt="SoulLens AI" 
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to SoulLens AI
          </h1>
          <p className="text-gray-600 text-sm mb-8">
            Your personal AI companion for self-discovery and growth
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSignIn('google')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">🚀</span>
            Continue with Google
          </button>
          
          <button
            onClick={() => handleSignIn('apple')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">🍎</span>
            Continue with Apple
          </button>
          
          <button
            onClick={() => handleSignIn('email')}
            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span className="mr-2">📧</span>
            Continue with Email
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Start your 14-day free trial with 3 daily messages
        </p>
      </div>
    </div>
  )
}