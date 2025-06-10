'use client'

import { useState, useEffect, useRef } from 'react'
import { useTrial, useAnalytics, useMobileConversation } from '../../hooks/useMobile'
import { mobileHelpers } from '../../utils/supabase'
import MobileTrialBanner from './MobileTrialBanner'

export default function MobileChatInterface({ conversationId, userId }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState('mentor')
  const messagesEndRef = useRef(null)
  
  const { canSendMessage, trialStatus, messagesUsed, limits } = useTrial(userId)
  const { trackEvent } = useAnalytics()
  const { messages, sendMessage, loading } = useMobileConversation(conversationId)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    trackEvent('chat_page_view', { conversation_id: conversationId })
  }, [conversationId, trackEvent])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !canSendMessage) return

    try {
      setSending(true)
      
      const result = await sendMessage(message, selectedPersona)
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to send message')
      }

      setMessage('')
      await trackEvent('message_sent', {
        persona: selectedPersona,
        message_length: message.length,
        conversation_id: conversationId
      })
      
    } catch (error) {
      console.error('Send message failed:', error)
      alert(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return <ChatSkeleton />
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-3 p-1 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Chat with {selectedPersona.charAt(0).toUpperCase() + selectedPersona.slice(1)}
              </h1>
              <p className="text-sm text-gray-600">
                AI Companion • {messages.length} messages
              </p>
            </div>
          </div>
          <PersonaSelector
            selected={selectedPersona}
            onChange={setSelectedPersona}
            available={limits.available_personas || ['mentor']}
            onSelect={() => trackEvent('persona_changed', { persona: selectedPersona })}
          />
        </div>
      </div>

      {/* Trial Banner */}
      {!canSendMessage && (
        <MobileTrialBanner userId={userId} className="mx-4 mt-4" />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState persona={selectedPersona} />
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              isUser={msg.role === 'user'}
              persona={msg.persona || selectedPersona}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        {canSendMessage ? (
          <div className="space-y-3">
            {/* Usage indicator */}
            {trialStatus?.subscription_tier === 'trial' && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Messages today: {messagesUsed}/{limits.daily_message_limit}</span>
                <span>{limits.daily_message_limit - messagesUsed} left</span>
              </div>
            )}
            
            {/* Message input */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your message to ${selectedPersona}...`}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="2"
                  disabled={sending}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {message.length}/500
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending || message.length > 500}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
              >
                {sending ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-500 text-sm mb-2">
              {trialStatus?.subscription_tier === 'trial' 
                ? 'Daily message limit reached' 
                : 'Trial expired'
              }
            </div>
            <button
              onClick={() => trackEvent('upgrade_prompt_click', { location: 'chat_input' })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PersonaSelector({ selected, onChange, available, onSelect }) {
  const [showSelector, setShowSelector] = useState(false)

  const personas = {
    mentor: { icon: '🧙‍♂️', name: 'Mentor', desc: 'Wise guidance' },
    coach: { icon: '💪', name: 'Coach', desc: 'Motivation & goals' },
    friend: { icon: '😊', name: 'Friend', desc: 'Casual & supportive' },
    challenger: { icon: '⚡', name: 'Challenger', desc: 'Push your limits' },
    therapist: { icon: '🫂', name: 'Therapist', desc: 'Deep reflection' },
    sage: { icon: '🌟', name: 'Sage', desc: 'Ancient wisdom' }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSelector(true)}
        className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
      >
        <span>{personas[selected]?.icon}</span>
        <span>{personas[selected]?.name}</span>
        <span className="text-gray-400">▼</span>
      </button>

      {showSelector && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-48">
          <div className="p-2">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">
              Choose AI Persona
            </div>
            {Object.entries(personas).map(([key, persona]) => (
              <button
                key={key}
                onClick={() => {
                  if (available.includes(key)) {
                    onChange(key)
                    onSelect()
                  }
                  setShowSelector(false)
                }}
                disabled={!available.includes(key)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selected === key
                    ? 'bg-indigo-50 border border-indigo-200'
                    : available.includes(key)
                    ? 'hover:bg-gray-50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{persona.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{persona.name}</div>
                    <div className="text-xs text-gray-500">{persona.desc}</div>
                  </div>
                  {!available.includes(key) && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => setShowSelector(false)}
              className="w-full text-center py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showSelector && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSelector(false)}
        />
      )}
    </div>
  )
}

function MessageBubble({ message, isUser, persona }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getPersonaIcon = (persona) => {
    const icons = {
      mentor: '🧙‍♂️',
      coach: '💪',
      friend: '😊',
      challenger: '⚡',
      therapist: '🫂',
      sage: '🌟'
    }
    return icons[persona] || '🤖'
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          {!isUser && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getPersonaIcon(persona)}</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {persona}
              </span>
            </div>
          )}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          <div className={`text-xs mt-2 opacity-75 ${isUser ? 'text-indigo-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ persona }) {
  const getPersonaIcon = (persona) => {
    const icons = {
      mentor: '🧙‍♂️',
      coach: '💪',
      friend: '😊',
      challenger: '⚡',
      therapist: '🫂',
      sage: '🌟'
    }
    return icons[persona] || '🤖'
  }

  const getGreeting = (persona) => {
    const greetings = {
      mentor: "Hello! I'm here to guide you on your journey of self-discovery. What would you like to explore today?",
      coach: "Hey there! Ready to tackle some goals and push your limits? I'm here to help you achieve greatness!",
      friend: "Hi! I'm so glad you're here. Think of me as your supportive friend who's always ready to listen and chat.",
      challenger: "Alright, let's get real! I'm here to challenge your thinking and help you break through barriers. Ready?",
      therapist: "Welcome to a safe space for reflection. I'm here to help you process your thoughts and feelings with care.",
      sage: "Greetings, seeker. I'm here to share wisdom and help you find deeper understanding. What weighs on your mind?"
    }
    return greetings[persona] || "Hello! I'm your AI companion, ready to chat and help however I can."
  }

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{getPersonaIcon(persona)}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Start a conversation with {persona.charAt(0).toUpperCase() + persona.slice(1)}
      </h3>
      <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
        {getGreeting(persona)}
      </p>
    </div>
  )
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-2xl w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}