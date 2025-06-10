// Subscription constants and configuration
export const SUBSCRIPTION_PLANS = {
  TRIAL: 'trial',
  PREMIUM: 'premium'
};

export const TRIAL_LIMITS = {
  messagesPerDay: 15, // Increased from 3 to 15 for better trial experience
  totalMessages: 210, // 14 days × 15 messages
  trialDays: 14,
  availablePersonas: ['mentor', 'coach', 'friend', 'challenger', 'therapist'], // All except SAGE
  insightsDays: 7, // Only last 7 days of insights
  dataImports: 1, // One import total
  exportTypes: ['conversations'], // Limited export options
  aiNaming: false, // Can't name AI companion
  fullInsights: false,
  prioritySupport: false
};

export const PREMIUM_FEATURES = {
  unlimitedMessages: true,
  allPersonas: ['mentor', 'coach', 'friend', 'challenger', 'therapist', 'sage'],
  unlimitedInsights: true,
  unlimitedDataImports: true,
  allExportTypes: ['conversations', 'insights', 'analytics', 'complete'],
  aiNaming: true,
  prioritySupport: true,
  advancedAnalytics: true
};

export const PRICING = {
  monthly: {
    amount: 29,
    currency: 'USD',
    interval: 'month'
  }
};

export const UPGRADE_TRIGGERS = {
  MESSAGE_LIMIT: 'message_limit',
  PERSONA_BLOCK: 'persona_block', 
  INSIGHTS_LIMIT: 'insights_limit',
  DAY_THRESHOLD: 'day_threshold',
  AI_NAMING: 'ai_naming',
  EXPORT_LIMIT: 'export_limit',
  DATA_IMPORT_LIMIT: 'data_import_limit'
};

export const TRIAL_PROMPT_DAYS = [3, 7, 10, 13]; // Days to show upgrade prompts