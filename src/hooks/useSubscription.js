'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { TRIAL_LIMITS, SUBSCRIPTION_PLANS, UPGRADE_TRIGGERS } from '@/constants/subscription';

// Subscription Context
const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Subscription Provider
export const SubscriptionProvider = ({ children }) => {
  const [subscriptionState, setSubscriptionState] = useState({
    plan: SUBSCRIPTION_PLANS.TRIAL,
    status: 'active',
    trialStartDate: null,
    trialEndDate: null,
    customerId: null,
    subscriptionId: null
  });

  const [usageState, setUsageState] = useState({
    messagesUsedToday: 0,
    totalMessagesUsed: 0,
    lastMessageDate: null,
    dataImportsUsed: 0,
    upgradePromptsShown: []
  });

  // Initialize trial on first visit
  useEffect(() => {
    const initializeTrial = () => {
      const stored = localStorage.getItem('soullens_subscription');
      const storedUsage = localStorage.getItem('soullens_usage');
      
      if (stored) {
        setSubscriptionState(JSON.parse(stored));
      } else {
        // Start new trial
        const now = new Date();
        const endDate = new Date(now.getTime() + (TRIAL_LIMITS.trialDays * 24 * 60 * 60 * 1000));
        
        const newState = {
          plan: SUBSCRIPTION_PLANS.TRIAL,
          status: 'active',
          trialStartDate: now.toISOString(),
          trialEndDate: endDate.toISOString(),
          customerId: null,
          subscriptionId: null
        };
        
        setSubscriptionState(newState);
        localStorage.setItem('soullens_subscription', JSON.stringify(newState));
      }

      if (storedUsage) {
        setUsageState(JSON.parse(storedUsage));
      }
    };

    initializeTrial();
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('soullens_subscription', JSON.stringify(subscriptionState));
  }, [subscriptionState]);

  useEffect(() => {
    localStorage.setItem('soullens_usage', JSON.stringify(usageState));
  }, [usageState]);

  const value = {
    subscriptionState,
    usageState,
    setSubscriptionState,
    setUsageState
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Trial Status Hook
export const useTrialStatus = () => {
  const { subscriptionState, usageState, setUsageState } = useSubscription();

  const getTrialDaysRemaining = () => {
    if (subscriptionState.plan === SUBSCRIPTION_PLANS.PREMIUM) return 0;
    
    if (!subscriptionState.trialEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(subscriptionState.trialEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const getTrialProgress = () => {
    const totalDays = TRIAL_LIMITS.trialDays;
    const daysRemaining = getTrialDaysRemaining();
    const daysUsed = totalDays - daysRemaining;
    return Math.min(100, (daysUsed / totalDays) * 100);
  };

  const isTrialActive = () => {
    return subscriptionState.plan === SUBSCRIPTION_PLANS.TRIAL && getTrialDaysRemaining() > 0;
  };

  const isTrialExpired = () => {
    return subscriptionState.plan === SUBSCRIPTION_PLANS.TRIAL && getTrialDaysRemaining() === 0;
  };

  const isPremium = () => {
    return subscriptionState.plan === SUBSCRIPTION_PLANS.PREMIUM && subscriptionState.status === 'active';
  };

  const resetDailyUsage = () => {
    const today = new Date().toDateString();
    const lastMessageDate = usageState.lastMessageDate;
    
    if (!lastMessageDate || new Date(lastMessageDate).toDateString() !== today) {
      setUsageState(prev => ({
        ...prev,
        messagesUsedToday: 0,
        lastMessageDate: today
      }));
      return true;
    }
    return false;
  };

  const canSendMessage = () => {
    if (isPremium()) return true;
    if (isTrialExpired()) return false;
    
    resetDailyUsage();
    return usageState.messagesUsedToday < TRIAL_LIMITS.messagesPerDay;
  };

  const trackMessageUsage = () => {
    if (isPremium()) return;
    
    resetDailyUsage();
    
    setUsageState(prev => ({
      ...prev,
      messagesUsedToday: prev.messagesUsedToday + 1,
      totalMessagesUsed: prev.totalMessagesUsed + 1,
      lastMessageDate: new Date().toDateString()
    }));
  };

  const canAccessPersona = (persona) => {
    if (isPremium()) return true;
    return TRIAL_LIMITS.availablePersonas.includes(persona);
  };

  const canNameAI = () => {
    return isPremium() || TRIAL_LIMITS.aiNaming;
  };

  const canImportData = () => {
    if (isPremium()) return true;
    return usageState.dataImportsUsed < TRIAL_LIMITS.dataImports;
  };

  const trackDataImport = () => {
    if (!isPremium()) {
      setUsageState(prev => ({
        ...prev,
        dataImportsUsed: prev.dataImportsUsed + 1
      }));
    }
  };

  const shouldShowUpgradePrompt = (trigger) => {
    const daysRemaining = getTrialDaysRemaining();
    const daysSinceStart = TRIAL_LIMITS.trialDays - daysRemaining;
    
    // Don't show if already premium
    if (isPremium()) return false;
    
    // Show based on trigger type
    switch (trigger) {
      case UPGRADE_TRIGGERS.MESSAGE_LIMIT:
        return !canSendMessage();
      case UPGRADE_TRIGGERS.PERSONA_BLOCK:
        return isTrialActive();
      case UPGRADE_TRIGGERS.DAY_THRESHOLD:
        return [3, 7, 10, 13].includes(daysSinceStart);
      case UPGRADE_TRIGGERS.AI_NAMING:
        return !canNameAI();
      case UPGRADE_TRIGGERS.DATA_IMPORT_LIMIT:
        return !canImportData();
      default:
        return false;
    }
  };

  const trackUpgradePrompt = (trigger) => {
    setUsageState(prev => ({
      ...prev,
      upgradePromptsShown: [...prev.upgradePromptsShown, {
        trigger,
        timestamp: new Date().toISOString()
      }]
    }));
  };

  return {
    // State
    isTrialActive: isTrialActive(),
    isTrialExpired: isTrialExpired(),
    isPremium: isPremium(),
    daysRemaining: getTrialDaysRemaining(),
    trialProgress: getTrialProgress(),
    
    // Usage
    messagesUsedToday: usageState.messagesUsedToday,
    totalMessagesUsed: usageState.totalMessagesUsed,
    dataImportsUsed: usageState.dataImportsUsed,
    
    // Permissions
    canSendMessage,
    canAccessPersona,
    canNameAI,
    canImportData,
    
    // Actions
    trackMessageUsage,
    trackDataImport,
    shouldShowUpgradePrompt,
    trackUpgradePrompt,
    resetDailyUsage
  };
};

// Feature Gate Hook
export const useFeatureAccess = () => {
  const { isPremium } = useTrialStatus();

  const hasFeature = (feature) => {
    if (isPremium) return true;

    switch (feature) {
      case 'unlimited_messages':
        return false;
      case 'all_personas': 
        return false;
      case 'ai_naming':
        return TRIAL_LIMITS.aiNaming;
      case 'full_insights':
        return false;
      case 'unlimited_imports':
        return false;
      case 'all_exports':
        return false;
      case 'priority_support':
        return false;
      default:
        return true;
    }
  };

  return { hasFeature };
};