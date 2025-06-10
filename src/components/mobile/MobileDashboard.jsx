'use client'

import { useState, useEffect } from 'react'
import { useMobileDashboard, useAnalytics, useTrial } from '../../hooks/useMobile'
import { supabase } from '../../utils/supabase'
import MobileTrialBanner from './MobileTrialBanner'

export default function MobileDashboard({ userId }) {
  const { dashboardData, loading, error, refreshDashboard } = useMobileDashboard(userId)
  const { trackEvent, trackPageView } = useAnalytics()
  const { trialStatus, canSendMessage } = useTrial(userId)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    trackPageView('mobile_dashboard')
  }, [trackPageView])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshDashboard()
    await trackEvent('dashboard_refresh')
    setRefreshing(false)
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-400 text-lg mr-2">⚠️</span>
            <div>
              <h3 className="text-red-800 font-medium">Dashboard Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const {
    user: userStats = {},
    conversations: conversationStats = {},
    insights: insightStats = {},
    usage: usageStats = {}
  } = dashboardData

  return (
    <div className="space-y-4 p-4">
      {/* Trial Status Banner */}
      <MobileTrialBanner userId={userId} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon="💬"
          title="Conversations"
          value={conversationStats.total_conversations || 0}
          subtitle="Total chats"
          onClick={() => trackEvent('stat_card_click', { type: 'conversations' })}
        />
        <StatCard
          icon="💡"
          title="Insights"
          value={insightStats.unread_count || 0}
          subtitle="New insights"
          onClick={() => trackEvent('stat_card_click', { type: 'insights' })}
          highlight={insightStats.unread_count > 0}
        />
        <StatCard
          icon="📈"
          title="Messages"
          value={usageStats.total_messages || 0}
          subtitle="This week"
          onClick={() => trackEvent('stat_card_click', { type: 'messages' })}
        />
        <StatCard
          icon="🎯"
          title="Sessions"
          value={usageStats.total_sessions || 0}
          subtitle="This week"
          onClick={() => trackEvent('stat_card_click', { type: 'sessions' })}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          <QuickActionButton
            icon="💬"
            title="Start New Chat"
            subtitle="Begin a conversation with your AI companion"
            onClick={async () => {
              await trackEvent('quick_action', { action: 'new_chat' })
              window.location.href = '/chat'
            }}
            disabled={!canSendMessage}
          />
          <QuickActionButton
            icon="📝"
            title="Journal Entry"
            subtitle="Reflect on your thoughts and feelings"
            onClick={async () => {
              await trackEvent('quick_action', { action: 'journal' })
              window.location.href = '/journal'
            }}
          />
          <QuickActionButton
            icon="💡"
            title="View Insights"
            subtitle="Discover patterns in your conversations"
            onClick={async () => {
              await trackEvent('quick_action', { action: 'insights' })
              window.location.href = '/insights'
            }}
            badge={insightStats.unread_count > 0 ? insightStats.unread_count : null}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-indigo-600 text-sm hover:text-indigo-800 disabled:opacity-50"
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </button>
        </div>
        
        {conversationStats.last_conversation ? (
          <div className="space-y-3">
            <ActivityItem
              icon="💬"
              title="Last conversation"
              time={new Date(conversationStats.last_conversation).toLocaleDateString()}
              onClick={async () => {
                await trackEvent('activity_click', { type: 'last_conversation' })
                window.location.href = '/conversations'
              }}
            />
            {userStats.ai_companion_name && (
              <ActivityItem
                icon="🤖"
                title={`Your AI companion: ${userStats.ai_companion_name}`}
                time="Active"
              />
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">🌟</div>
            <p className="text-sm">Start your first conversation!</p>
          </div>
        )}
      </div>

      {/* Onboarding Progress */}
      {!userStats.onboarding_complete && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Complete Your Setup</h3>
              <p className="text-indigo-100 text-sm mt-1">
                Finish onboarding to unlock full features
              </p>
            </div>
            <button
              onClick={async () => {
                await trackEvent('onboarding_continue')
                window.location.href = '/onboarding'
              }}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-md text-sm hover:bg-opacity-30 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable components
function StatCard({ icon, title, value, subtitle, onClick, highlight = false }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
        highlight ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

function QuickActionButton({ icon, title, subtitle, onClick, disabled = false, badge = null }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative text-left p-4 rounded-lg border transition-all ${
        disabled
          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
        </div>
        {badge && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {badge}
          </div>
        )}
      </div>
    </button>
  )
}

function ActivityItem({ icon, title, time, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg transition-colors ${
        onClick ? 'hover:bg-gray-50 cursor-pointer' : ''
      }`}
    >
      <div className="text-lg mr-3">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {/* Trial banner skeleton */}
      <div className="bg-gray-200 rounded h-20"></div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
        ))}
      </div>
      
      {/* Quick actions skeleton */}
      <div className="bg-gray-200 rounded-lg h-48"></div>
      
      {/* Recent activity skeleton */}
      <div className="bg-gray-200 rounded-lg h-32"></div>
    </div>
  )
}