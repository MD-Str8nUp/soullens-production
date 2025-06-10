'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()

  // Get user session and profile
  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Auth error:', error)
        setUser(null)
        setProfile(null)
        return
      }

      setUser(user)

      if (user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                subscription_tier: 'free',
                subscription_status: 'trialing',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
              }
            ])
            .select()
            .single()

          if (createError) {
            console.error('Profile creation error:', createError)
          } else {
            setProfile(newProfile)
          }
        } else {
          setProfile(profile)
        }
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Unexpected auth error:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email, password, userData = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            onboarding_data: userData.onboardingData || {}
          }
        }
      })

      if (error) throw error

      // Don't set user immediately - wait for email confirmation
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      setUser(data.user)
      router.push('/') // Redirect to dashboard
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error }
    }
  }

  // Update password
  const updatePassword = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error }
    }
  }

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    }
  }

  // Check if user has premium access
  const hasPremiumAccess = () => {
    if (!profile) return false
    
    // Check if user has premium subscription
    if (profile.subscription_tier === 'premium' && profile.subscription_status === 'active') {
      return true
    }
    
    // Check if user has active trial
    if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) {
      return true
    }
    
    return false
  }

  // Check trial status
  const getTrialStatus = () => {
    if (!profile || !profile.trial_ends_at) return null
    
    const trialEnd = new Date(profile.trial_ends_at)
    const now = new Date()
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
    
    return {
      isActive: trialEnd > now,
      daysLeft: Math.max(0, daysLeft),
      endsAt: trialEnd
    }
  }

  // Listen for auth changes
  useEffect(() => {
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
        if (session?.user) {
          await getUser()
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    initialLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    hasPremiumAccess,
    getTrialStatus,
    refreshUser: getUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}