'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading, initialLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !initialLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, initialLoading, router])

  // Show loading while checking authentication
  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B3D91] via-[#A56CC1] to-[#FFC857] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Loader2 className="w-8 h-8 text-[#0B3D91] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Loading SoulLens AI...</h1>
          <p className="text-white/80">Preparing your personalized experience</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting unauthenticated users
  if (!user) {
    return null
  }

  // User is authenticated, show the protected content
  return children
}