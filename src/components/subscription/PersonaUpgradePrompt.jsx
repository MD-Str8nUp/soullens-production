'use client';

import { Crown, Sparkles, Users, Lock } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useSubscription';
import { PREMIUM_FEATURES } from '@/constants/subscription';

const PersonaUpgradePrompt = ({ onUpgradeClick, blockedPersona }) => {
  const { daysRemaining, isPremium } = useTrialStatus();
  
  if (isPremium) return null;

  const personaEmojis = {
    mentor: '🧠',
    coach: '💪', 
    friend: '😊',
    challenger: '🔥',
    therapist: '💙',
    sage: '🔮'
  };

  const personaDescriptions = {
    mentor: 'Wise guidance and strategic thinking',
    coach: 'Motivational support and goal achievement',
    friend: 'Casual conversations and emotional support', 
    challenger: 'Push you beyond your comfort zone',
    therapist: 'Deep emotional healing and trauma work',
    sage: 'Ancient wisdom and philosophical insights'
  };

  return (
    <div className="persona-upgrade bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 text-center shadow-lg">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Crown className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Unlock All 6 AI Personas
      </h3>
      
      <p className="text-gray-700 mb-6 max-w-md mx-auto">
        {blockedPersona ? (
          <>You tried to access <strong>{blockedPersona}</strong> - upgrade to Premium for diverse conversations with all AI personalities!</>
        ) : (
          <>Get access to Coach, Friend, Challenger, Therapist, and Sage for more diverse and engaging conversations.</>
        )}
      </p>
      
      {/* Current vs Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <h4 className="font-semibold text-gray-600">Trial (Current)</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center p-2 bg-green-50 border border-green-200 rounded">
              <span className="text-lg mr-2">{personaEmojis.mentor}</span>
              <span className="text-sm font-medium text-green-800">Mentor Only</span>
            </div>
            <p className="text-xs text-gray-600">Limited to 1 persona</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-center mb-3">
            <Crown className="w-5 h-5 text-yellow-300 mr-2" />
            <h4 className="font-semibold">Premium</h4>
          </div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            {PREMIUM_FEATURES.allPersonas.map(persona => (
              <div key={persona} className="bg-white/20 px-2 py-1 rounded text-xs font-medium flex items-center">
                <span className="mr-1">{personaEmojis[persona]}</span>
                <span className="capitalize">{persona}</span>
              </div>
            ))}
          </div>
          <p className="text-xs opacity-90">All 6 unique personalities</p>
        </div>
      </div>

      {/* Features preview */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
          Premium Benefits
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-gray-700">
            <Users className="w-4 h-4 text-purple-600 mr-2" />
            All 6 AI personas
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
            Unlimited messages
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
            Full insights history
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></span>
            Custom AI naming
          </div>
        </div>
      </div>
      
      <button 
        onClick={onUpgradeClick}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
      >
        <Crown className="w-5 h-5 mr-2" />
        Upgrade to Premium - $29/month
      </button>

      {daysRemaining > 0 && (
        <p className="text-sm text-gray-600 mt-3">
          ⏰ {daysRemaining} days left in your free trial
        </p>
      )}
    </div>
  );
};

export default PersonaUpgradePrompt;