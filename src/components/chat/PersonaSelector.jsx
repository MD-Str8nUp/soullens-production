'use client'

import { useState } from 'react'
import { User, Zap, Heart, Target, Brain, Sparkles, X, Lock, Crown } from 'lucide-react'
import { useTrialStatus } from '@/hooks/useSubscription'

const personas = [
  {
    id: 'friend',
    name: 'Friend',
    icon: Heart,
    description: 'Casual, supportive conversation',
    gradient: 'from-pink-400 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-300',
    shadowColor: 'shadow-pink-200'
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: User,
    description: 'Wise guidance and advice',
    gradient: 'from-[#0B3D91] to-[#1a56db]',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-300',
    shadowColor: 'shadow-blue-200'
  },
  {
    id: 'coach',
    name: 'Coach',
    icon: Zap,
    description: 'Energetic motivation',
    gradient: 'from-[#FFC857] to-[#FFB700]',
    bgGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-300',
    shadowColor: 'shadow-yellow-200'
  },
  {
    id: 'therapist',
    name: 'Therapist',
    icon: Brain,
    description: 'Deep understanding',
    gradient: 'from-[#A56CC1] to-[#8b5cf6]',
    bgGradient: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-300',
    shadowColor: 'shadow-purple-200'
  },
  {
    id: 'challenger',
    name: 'Challenger',
    icon: Target,
    description: 'Push your limits',
    gradient: 'from-red-400 to-orange-500',
    bgGradient: 'from-red-50 to-orange-50',
    borderColor: 'border-red-300',
    shadowColor: 'shadow-red-200'
  },
  {
    id: 'sage',
    name: 'Sage',
    icon: Sparkles,
    description: 'Profound wisdom',
    gradient: 'from-indigo-500 to-purple-600',
    bgGradient: 'from-indigo-50 to-purple-50',
    borderColor: 'border-indigo-300',
    shadowColor: 'shadow-indigo-200'
  },
]

export default function PersonaSelector({ currentPersona, onPersonaChange }) {
  const current = personas.find(p => p.id === currentPersona) || personas[0]
  const { canAccessPersona, isPremium } = useTrialStatus()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-800">Choose AI Personality</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${current.gradient} animate-pulse`} />
          <span className="text-sm font-semibold text-gray-900">{current.name} Mode</span>
        </div>
      </div>

      {/* Trial limitation notice */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-800 text-sm">
              <Sparkles className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="font-semibold">14-Day Trial Active</div>
                <div className="text-blue-700">5 personalities unlocked • SAGE requires Premium</div>
              </div>
            </div>
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              $29/mo
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {personas.map((persona) => {
          const Icon = persona.icon
          const isSelected = currentPersona === persona.id
          const hasAccess = canAccessPersona(persona.id)
          const isLocked = !hasAccess && !isPremium
          
          return (
            <button
              key={persona.id}
              onClick={() => onPersonaChange(persona.id)}
              disabled={isLocked}
              className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 transform ${
                !isLocked ? 'hover:scale-[1.02]' : 'cursor-not-allowed'
              } ${
                isSelected
                  ? `bg-gradient-to-br ${persona.bgGradient} ${persona.borderColor} shadow-lg ${persona.shadowColor}`
                  : isLocked
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Locked overlay for SAGE */}
              {isLocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100/90 to-gray-200/90 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-gray-700 font-semibold">Premium Only</div>
                    <div className="text-xs text-gray-600 mt-1">$29/month</div>
                  </div>
                </div>
              )}

              {isSelected && !isLocked && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 shimmer opacity-20"></div>
                </div>
              )}
              
              <div className="relative flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  isSelected && !isLocked
                    ? `bg-gradient-to-br ${persona.gradient} text-white shadow-lg transform scale-110`
                    : isLocked
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold transition-all duration-300 ${
                    isSelected && !isLocked ? 'text-gray-900' :
                    isLocked ? 'text-gray-400' :
                    'text-gray-800 group-hover:text-gray-900'
                  }`}>
                    {persona.name}
                  </div>
                  <div className={`text-xs leading-tight mt-1 transition-all duration-300 ${
                    isSelected && !isLocked ? 'text-gray-700 font-medium' :
                    isLocked ? 'text-gray-400' :
                    'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {persona.description}
                  </div>
                </div>
                
                {isSelected && !isLocked && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

              </div>
            </button>
          )
        })}
      </div>

      <div className="text-center pt-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          {isPremium
            ? "Choose how you want SoulLens to interact with you. Switch anytime during conversations."
            : "Trial includes 5 personalities • Upgrade to Premium for SAGE + unlimited access"
          }
        </p>
        {!isPremium && (
          <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold underline">
            View Premium Benefits →
          </button>
        )}
      </div>
    </div>
  )
}