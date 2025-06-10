'use client'

import { useState, useEffect } from 'react'
import { useTrial } from '../../hooks/useMobile'
import { supabase } from '../../utils/supabase'

export default function MobileTrialBanner({ userId, className = '' }) {
  const { 
    trialStatus, 
    loading, 
    canSendMessage, 
    isTrialActive, 
    daysRemaining, 
    messagesUsed, 
    limits,
    refreshTrial 
  } = useTrial(userId)

  const [showUpgrade, setShowUpgrade] = useState(false)

  if (loading || !trialStatus) {
    return (
      <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 ${className}`}>
        <div className="animate-pulse flex items-center">
          <div className="h-4 bg-blue-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  const isLimitReached = !canSendMessage && isTrialActive
  const isTrialExpired = !isTrialActive && trialStatus.subscription_tier === 'trial'

  const getBannerStyle = () => {
    if (isTrialExpired) return 'bg-red-50 border-red-400 text-red-800'
    if (isLimitReached) return 'bg-orange-50 border-orange-400 text-orange-800'
    if (isTrialActive) return 'bg-blue-50 border-blue-400 text-blue-800'
    return 'bg-green-50 border-green-400 text-green-800'
  }

  const getIconColor = () => {
    if (isTrialExpired) return 'text-red-400'
    if (isLimitReached) return 'text-orange-400'
    if (isTrialActive) return 'text-blue-400'
    return 'text-green-400'
  }

  const getIcon = () => {
    if (isTrialExpired) return '⚠️'
    if (isLimitReached) return '⏱️'
    if (isTrialActive) return '🆓'
    return '⭐'
  }

  const getMessage = () => {
    if (isTrialExpired) {
      return 'Your free trial has expired. Upgrade to continue your AI journey!'
    }
    if (isLimitReached) {
      return `Daily limit reached (${messagesUsed}/${limits.daily_message_limit}). Upgrade for unlimited messages!`
    }
    if (isTrialActive) {
      return `Free trial: ${daysRemaining} days left • ${messagesUsed}/${limits.daily_message_limit} messages used today`
    }
    return 'Premium active - Unlimited conversations!'
  }

  return (
    <div className={`border-l-4 p-4 ${getBannerStyle()} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          <span className="text-lg" role="img" aria-label="status">
            {getIcon()}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {getMessage()}
          </p>
          
          {/* Progress bar for trial usage */}
          {isTrialActive && limits.daily_message_limit > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Messages today</span>
                <span>{messagesUsed}/{limits.daily_message_limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(messagesUsed / limits.daily_message_limit) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(isTrialExpired || isLimitReached) && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Upgrade Now
              </button>
            )}
            
            <button
              onClick={refreshTrial}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal 
          onClose={() => setShowUpgrade(false)}
          trialStatus={trialStatus}
        />
      )}
    </div>
  )
}

// Simple upgrade modal component
function UpgradeModal({ onClose, trialStatus }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upgrade to Premium</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Unlock Full AI Power
            </h4>
            <p className="text-gray-600 text-sm">
              Get unlimited conversations with all AI personas
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              Unlimited daily messages
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              All 6 AI personas (Mentor, Coach, Friend, Challenger, Therapist, Sage)
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              Advanced insights & analytics
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              Data export capabilities
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">$9.99/month</div>
            <div className="text-sm text-gray-500">Cancel anytime</div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                // Implement subscription logic here
                window.open('/api/subscription/create-checkout-session', '_blank')
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}