'use client';

import { AlertTriangle, Crown, MessageCircle } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useSubscription';
import { TRIAL_LIMITS } from '@/constants/subscription';

const MessageLimitWarning = ({ onUpgradeClick, onDismiss }) => {
  const { canSendMessage, messagesUsedToday, daysRemaining, isTrialActive } = useTrialStatus();
  
  // Only show if trial is active and user can't send messages
  if (!isTrialActive || canSendMessage()) return null;

  return (
    <div className="message-limit-warning bg-orange-50 border border-orange-200 rounded-xl p-6 m-4 shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            Daily message limit reached
          </h3>
          
          <p className="text-orange-800 mb-4">
            You've used <strong>{messagesUsedToday} of {TRIAL_LIMITS.messagesPerDay}</strong> daily messages. 
            Upgrade to Premium for unlimited conversations with all 6 AI personas.
          </p>

          {/* Benefits preview */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Crown className="w-4 h-4 text-yellow-500 mr-2" />
              What you'll get with Premium:
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-center">
                <MessageCircle className="w-3 h-3 text-green-600 mr-2" />
                Unlimited daily conversations
              </li>
              <li className="flex items-center">
                <Crown className="w-3 h-3 text-purple-600 mr-2" />
                Access to all 6 AI personas (Coach, Friend, Challenger, Therapist, Sage)
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                Complete insights history & advanced analytics
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></span>
                Custom AI companion naming & priority support
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onUpgradeClick}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium - $29/month
            </button>
            
            <button 
              onClick={onDismiss}
              className="px-4 py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Try again tomorrow
            </button>
          </div>

          {daysRemaining > 0 && (
            <p className="text-sm text-orange-600 mt-3 text-center">
              ⏰ {daysRemaining} days left in your free trial
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageLimitWarning;