'use client';

import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useSubscription';

const TrialStatusBanner = ({ onUpgradeClick }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isTrialActive, daysRemaining, trialProgress, isPremium } = useTrialStatus();
  
  // Don't show if premium or dismissed or trial expired
  if (!isTrialActive || isPremium || isDismissed) return null;

  const getUrgencyLevel = () => {
    if (daysRemaining <= 2) return 'urgent';
    if (daysRemaining <= 5) return 'warning';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();
  
  const getBackgroundClass = () => {
    switch (urgencyLevel) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-600 to-red-700';
      case 'warning': 
        return 'bg-gradient-to-r from-orange-500 to-red-500';
      default:
        return 'bg-gradient-to-r from-purple-600 to-blue-600';
    }
  };

  const getMessage = () => {
    if (daysRemaining === 0) return 'Trial expires today!';
    if (daysRemaining === 1) return 'Trial expires tomorrow!';
    return `${daysRemaining} days left in trial`;
  };

  return (
    <div className={`trial-banner ${getBackgroundClass()} text-white relative`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold truncate">{getMessage()}</span>
                {urgencyLevel === 'urgent' && (
                  <span className="animate-pulse">⚡</span>
                )}
              </div>
              <p className="text-xs opacity-90 mt-1">
                Upgrade now for unlimited conversations & all AI personas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button 
              onClick={onUpgradeClick}
              className="bg-white text-purple-600 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-purple-50 transition-colors"
            >
              Upgrade Now
            </button>
            <button 
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/30 rounded-full h-1.5 mt-3">
          <div 
            className="bg-white h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${trialProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrialStatusBanner;