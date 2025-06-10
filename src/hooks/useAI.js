'use client'

import { useState, useCallback, useRef } from 'react'
import SoulLensAI from '@/ai-engine/soullens-ai-engine'

export function useAI() {
  const [aiEngine, setAiEngine] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const aiEngineRef = useRef(null)

  const initializeAI = useCallback(async () => {
    if (isInitialized || aiEngineRef.current) return

    try {
      // Get API key from environment or use a placeholder for development
      const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || ''
      
      if (!apiKey) {
        console.warn('No Claude API key found. Using mock responses for development.')
      }

      // Create AI engine instance
      const engine = new SoulLensAI(apiKey)
      
      // Set default preferences
      engine.userProfile.preferences = {
        allowProfanity: false,
        conversationStyle: 'casual'
      }

      aiEngineRef.current = engine
      setAiEngine(engine)
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize AI engine:', error)
    }
  }, [isInitialized])

  const toggleProfanity = useCallback((allow) => {
    if (aiEngineRef.current) {
      return aiEngineRef.current.toggleProfanity(allow)
    }
  }, [])

  const changePersona = useCallback((persona) => {
    if (aiEngineRef.current) {
      return aiEngineRef.current.changePersona(persona)
    }
  }, [])

  const setConversationStyle = useCallback((style) => {
    if (aiEngineRef.current) {
      return aiEngineRef.current.setStyle(style)
    }
  }, [])

  const getUserInsights = useCallback(() => {
    if (aiEngineRef.current) {
      return aiEngineRef.current.getUserInsights()
    }
    return null
  }, [])

  return {
    aiEngine,
    isInitialized,
    initializeAI,
    toggleProfanity,
    changePersona,
    setConversationStyle,
    getUserInsights,
  }
}