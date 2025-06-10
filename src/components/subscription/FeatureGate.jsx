'use client';

import { useState } from 'react';
import { useTrialStatus, useFeatureAccess } from '@/hooks/useSubscription';
import { UPGRADE_TRIGGERS } from '@/constants/subscription';
import UpgradeModal from './UpgradeModal';
import PersonaUpgradePrompt from './PersonaUpgradePrompt';
import MessageLimitWarning from './MessageLimitWarning';

const FeatureGate = ({ 
  feature, 
  children, 
  fallback, 
  trigger = 'feature_access',
  showModal = true,
  blockedPersona = null 
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { hasFeature } = useFeatureAccess();
  const { isPremium, trackUpgradePrompt } = useTrialStatus();

  const hasAccess = hasFeature(feature);

  if (hasAccess || isPremium) {
    return children;
  }

  const handleUpgradeClick = () => {
    trackUpgradePrompt(trigger);
    setShowUpgradeModal(true);
  };

  const renderFallback = () => {
    // Custom fallback provided
    if (fallback) {
      return typeof fallback === 'function' 
        ? fallback({ onUpgradeClick: handleUpgradeClick }) 
        : fallback;
    }

    // Default fallbacks based on feature
    switch (feature) {
      case 'unlimited_messages':
        return (
          <MessageLimitWarning 
            onUpgradeClick={handleUpgradeClick}
            onDismiss={() => {}}
          />
        );
      
      case 'all_personas':
        return (
          <PersonaUpgradePrompt 
            onUpgradeClick={handleUpgradeClick}
            blockedPersona={blockedPersona}
          />
        );
      
      case 'ai_naming':
        return (
          <div className="feature-gate-prompt bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-blue-900 mb-2">Custom AI Naming</h4>
            <p className="text-blue-800 text-sm mb-3">
              Name your AI companion to create a more personal experience
            </p>
            <button 
              onClick={handleUpgradeClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
            >
              Upgrade to Premium
            </button>
          </div>
        );
      
      case 'full_insights':
        return (
          <div className="feature-gate-prompt bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-indigo-900 mb-2">Complete Insights History</h4>
            <p className="text-indigo-800 text-sm mb-3">
              Access your complete personal development journey and advanced analytics
            </p>
            <button 
              onClick={handleUpgradeClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
            >
              Upgrade to Premium
            </button>
          </div>
        );
      
      case 'unlimited_imports':
        return (
          <div className="feature-gate-prompt bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-green-900 mb-2">Unlimited Data Imports</h4>
            <p className="text-green-800 text-sm mb-3">
              Import unlimited documents and data sources to enrich your AI conversations
            </p>
            <button 
              onClick={handleUpgradeClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
            >
              Upgrade to Premium
            </button>
          </div>
        );
      
      case 'all_exports':
        return (
          <div className="feature-gate-prompt bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-yellow-900 mb-2">Complete Data Export</h4>
            <p className="text-yellow-800 text-sm mb-3">
              Export all your data in multiple formats including insights and analytics
            </p>
            <button 
              onClick={handleUpgradeClick}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium"
            >
              Upgrade to Premium
            </button>
          </div>
        );
      
      default:
        return (
          <div className="feature-gate-prompt bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-purple-900 mb-2">Premium Feature</h4>
            <p className="text-purple-800 text-sm mb-3">
              This feature is available with Premium subscription
            </p>
            <button 
              onClick={handleUpgradeClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
            >
              Upgrade to Premium
            </button>
          </div>
        );
    }
  };

  return (
    <>
      {renderFallback()}
      
      {showModal && (
        <UpgradeModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          trigger={trigger}
        />
      )}
    </>
  );
};

export default FeatureGate;