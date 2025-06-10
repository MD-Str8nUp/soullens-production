// Storage utilities for SoulLens user preferences
export const STORAGE_KEYS = {
  NOTIFICATIONS: 'soullens_notifications',
  SOUND_EFFECTS: 'soullens_sound_effects',
  VIBRATION: 'soullens_vibration',
  AUTO_BACKUP: 'soullens_auto_backup',
  THEME: 'soullens_theme',
  USER_PROFILE: 'soullens_user_profile',
  SUBSCRIPTION: 'soullens_subscription'
};

// Save user preference to localStorage
export const saveUserPreference = (key, value) => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save preference:', error);
    return false;
  }
};

// Get user preference from localStorage
export const getUserPreference = (key, defaultValue) => {
  try {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Failed to get preference:', error);
    return defaultValue;
  }
};

// Get all user preferences
export const getAllPreferences = () => {
  const preferences = {};
  if (typeof window === 'undefined') {
    return preferences;
  }
  
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        preferences[key] = JSON.parse(stored);
      }
    } catch (error) {
      console.error(`Failed to get preference ${key}:`, error);
    }
  });
  return preferences;
};

// Clear all user preferences
export const clearAllPreferences = () => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear preferences:', error);
    return false;
  }
};

// Default user profile
export const getDefaultUserProfile = () => ({
  name: "SoulLens User",
  email: "user@soullens.ai",
  avatar: "S",
  joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
});

// Default subscription data
export const getDefaultSubscription = () => ({
  plan: 'trial',
  status: 'active',
  daysLeft: 14,
  nextBilling: null,
  features: {
    unlimitedChats: false,
    advancedInsights: false,
    dataExport: true,
    prioritySupport: false
  }
});