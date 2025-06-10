'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Bell,
  Moon,
  Shield,
  Database,
  Download,
  FileText,
  Upload,
  Trash2,
  LogOut,
  ChevronRight,
  Volume2,
  Vibrate,
  Palette,
  HelpCircle,
  Star,
  MessageCircle,
  Crown,
  Sun,
  Monitor,
  Edit3,
  Mail,
  Calendar,
  Loader,
  Check,
  X,
  Sparkles,
  Clock,
  CreditCard
} from 'lucide-react';

import { useTrialStatus, useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/subscription/UpgradeModal';

import Modal from '../../components/ui/Modal';
import { ToastProvider, showToast } from '../../components/ui/Toast';
import { 
  saveUserPreference, 
  getUserPreference, 
  clearAllPreferences,
  STORAGE_KEYS,
  getDefaultUserProfile,
  getDefaultSubscription
} from '../../utils/storage';
import { 
  exportUserData, 
  importUserData, 
  clearAllUserData, 
  getDataSummary 
} from '../../utils/dataExport';

export default function Settings() {
  const router = useRouter();
  
  // Subscription hooks
  const {
    isTrialActive,
    isPremium,
    daysRemaining,
    messagesUsedToday,
    totalMessagesUsed,
    dataImportsUsed,
    trialProgress
  } = useTrialStatus();

  // State for preferences - using null initially to prevent hydration issues
  const [notifications, setNotifications] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(null);
  const [vibrationEnabled, setVibrationEnabled] = useState(null);
  const [autoBackup, setAutoBackup] = useState(null);
  const [theme, setTheme] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [crashReports, setCrashReports] = useState(null);

  // State for user data
  const [userProfile, setUserProfile] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Initialize state after component mounts
  useEffect(() => {
    setNotifications(getUserPreference(STORAGE_KEYS.NOTIFICATIONS, true));
    setSoundEnabled(getUserPreference(STORAGE_KEYS.SOUND_EFFECTS, true));
    setVibrationEnabled(getUserPreference(STORAGE_KEYS.VIBRATION, true));
    setAutoBackup(getUserPreference(STORAGE_KEYS.AUTO_BACKUP, true));
    setAnalytics(getUserPreference('soullens_analytics', true));
    setCrashReports(getUserPreference('soullens_crash_reports', true));
    
    const savedTheme = getUserPreference(STORAGE_KEYS.THEME, 'light');
    setTheme(savedTheme);
    applyTheme(savedTheme);
    
    setUserProfile(getUserPreference(STORAGE_KEYS.USER_PROFILE, getDefaultUserProfile()));
  }, []);

  // Apply theme to document
  const applyTheme = (themeName) => {
    if (typeof window === 'undefined') return;
    
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (themeName === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (themeName === 'auto') {
      // Follow system preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHeaderProfile, setShowHeaderProfile] = useState(false);

  // Loading states
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    aiCompanionName: ''
  });
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'feedback',
    message: ''
  });
  const [exportOptions, setExportOptions] = useState({
    type: 'all',
    format: 'json'
  });

  // Update profile form when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        email: userProfile.email || '',
        aiCompanionName: userProfile.aiCompanionName || ''
      });
    }
  }, [userProfile]);

  const fileInputRef = useRef(null);

  // Save preference helper
  const handlePreferenceChange = (key, value, setter, successMessage) => {
    setter(value);
    const success = saveUserPreference(key, value);
    
    if (success) {
      showToast(successMessage, 'success');
      
      // Add haptic feedback if vibration is enabled
      if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else {
      showToast('Failed to save setting', 'error');
    }
  };

  // Toggle handlers
  const handleNotificationToggle = () => {
    handlePreferenceChange(
      STORAGE_KEYS.NOTIFICATIONS, 
      !notifications, 
      setNotifications,
      `Notifications ${!notifications ? 'enabled' : 'disabled'}`
    );
  };

  const handleSoundToggle = () => {
    handlePreferenceChange(
      STORAGE_KEYS.SOUND_EFFECTS,
      !soundEnabled,
      setSoundEnabled,
      `Sound effects ${!soundEnabled ? 'enabled' : 'disabled'}`
    );
  };

  const handleVibrationToggle = () => {
    handlePreferenceChange(
      STORAGE_KEYS.VIBRATION,
      !vibrationEnabled,
      setVibrationEnabled,
      `Vibration ${!vibrationEnabled ? 'enabled' : 'disabled'}`
    );
  };

  const handleAutoBackupToggle = () => {
    handlePreferenceChange(
      STORAGE_KEYS.AUTO_BACKUP,
      !autoBackup,
      setAutoBackup,
      `Auto backup ${!autoBackup ? 'enabled' : 'disabled'}`
    );
  };

  // Privacy settings handlers
  const handleAnalyticsToggle = () => {
    handlePreferenceChange(
      'soullens_analytics',
      !analytics,
      setAnalytics,
      `Analytics ${!analytics ? 'enabled' : 'disabled'}`
    );
  };

  const handleCrashReportsToggle = () => {
    handlePreferenceChange(
      'soullens_crash_reports',
      !crashReports,
      setCrashReports,
      `Crash reporting ${!crashReports ? 'enabled' : 'disabled'}`
    );
  };

  // Profile management
  const handleProfileSave = () => {
    const updatedProfile = {
      ...userProfile,
      name: profileForm.name,
      email: profileForm.email,
      aiCompanionName: profileForm.aiCompanionName
    };
    
    setUserProfile(updatedProfile);
    const success = saveUserPreference(STORAGE_KEYS.USER_PROFILE, updatedProfile);
    
    if (success) {
      showToast('Profile updated successfully', 'success');
      setShowProfileModal(false);
    } else {
      showToast('Failed to update profile', 'error');
    }
  };

  // Theme management
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    const success = saveUserPreference(STORAGE_KEYS.THEME, newTheme);
    
    if (success) {
      showToast(`Theme changed to ${newTheme} mode`, 'success');
      applyTheme(newTheme);
      setShowAppearanceModal(false);
    } else {
      showToast('Failed to change theme', 'error');
    }
  };

  // Data export
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const result = await exportUserData();
      
      if (result.success) {
        showToast(`Data exported as ${result.filename}`, 'success');
      } else {
        showToast('Failed to export data', 'error');
      }
    } catch (error) {
      showToast('Export failed: ' + error.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Data import
  const handleImportData = async (file) => {
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      const result = await importUserData(file);
      
      if (result.success) {
        showToast(`Successfully imported ${result.importedItems} items`, 'success');
        setShowImportModal(false);
        
        // Refresh state from localStorage
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast('Failed to import data', 'error');
      }
    } catch (error) {
      showToast('Import failed: ' + error.message, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Delete all data
  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    
    try {
      const result = clearAllUserData();
      
      if (result.success) {
        showToast(`Deleted ${result.clearedItems} items`, 'success');
        setShowDeleteConfirm(false);
        
        // Reset all state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast('Failed to delete data', 'error');
      }
    } catch (error) {
      showToast('Delete failed: ' + error.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    // Clear user session data but keep preferences
    localStorage.removeItem('soullens_session');
    localStorage.removeItem('soullens_conversations');
    localStorage.removeItem('soullens_journal_entries');
    
    showToast('Signed out successfully', 'success');
    setShowSignOutConfirm(false);
    
    // Redirect to home
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  // Feedback submission
  const handleFeedbackSubmit = () => {
    // In a real app, this would send to your backend
    console.log('Feedback submitted:', feedbackForm);
    
    showToast('Feedback sent successfully! Thank you.', 'success');
    setShowFeedbackModal(false);
    setFeedbackForm({ type: 'feedback', message: '' });
  };

  const dataSummary = typeof window !== 'undefined' ? getDataSummary() : { conversations: 0, journalEntries: 0 };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: "Profile",
          subtitle: "Manage your personal information",
          icon: User,
          action: "modal",
          onClick: () => setShowProfileModal(true)
        },
        {
          id: "subscription",
          title: "Subscription",
          subtitle: isPremium
            ? "Premium • Unlimited access"
            : isTrialActive
            ? `Trial • ${daysRemaining} days left`
            : "Trial expired",
          icon: Crown,
          action: "modal",
          onClick: () => setShowUpgradeModal(true),
          badge: isPremium ? 'Premium' : isTrialActive ? 'Trial' : 'Expired'
        }
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          id: "notifications",
          title: "Notifications",
          subtitle: "Daily reminders and insights",
          icon: Bell,
          action: "toggle",
          value: notifications,
          onChange: handleNotificationToggle
        },
        {
          id: "sound",
          title: "Sound Effects",
          subtitle: "Audio feedback and alerts",
          icon: Volume2,
          action: "toggle",
          value: soundEnabled,
          onChange: handleSoundToggle
        },
        {
          id: "vibration",
          title: "Vibration",
          subtitle: "Haptic feedback",
          icon: Vibrate,
          action: "toggle",
          value: vibrationEnabled,
          onChange: handleVibrationToggle
        },
        {
          id: "theme",
          title: "Appearance",
          subtitle: theme ? `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode` : 'Loading...',
          icon: Palette,
          action: "modal",
          onClick: () => setShowAppearanceModal(true)
        }
      ]
    },
    {
      title: "Privacy & Data",
      items: [
        {
          id: "privacy",
          title: "Privacy",
          subtitle: "Data handling and permissions",
          icon: Shield,
          action: "modal",
          onClick: () => setShowPrivacyModal(true)
        },
        {
          id: "backup",
          title: "Auto Backup",
          subtitle: "Sync your data across devices",
          icon: Database,
          action: "toggle",
          value: autoBackup,
          onChange: handleAutoBackupToggle
        },
        {
          id: "export",
          title: "Export Data",
          subtitle: `Download ${dataSummary.conversations + dataSummary.journalEntries} items`,
          icon: Download,
          action: "function",
          onClick: handleExportData,
          loading: isExporting
        },
        {
          id: "import",
          title: "Import Documents",
          subtitle: "Import therapy notes, journals, PDFs",
          icon: FileText,
          action: "function",
          onClick: () => router.push('/import')
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help & Support",
          subtitle: "FAQs and contact support",
          icon: HelpCircle,
          action: "modal",
          onClick: () => setShowHelpModal(true)
        },
        {
          id: "feedback",
          title: "Send Feedback",
          subtitle: "Help us improve SoulLens",
          icon: MessageCircle,
          action: "modal",
          onClick: () => setShowFeedbackModal(true)
        },
        {
          id: "rate",
          title: "Rate SoulLens",
          subtitle: "Share your experience",
          icon: Star,
          action: "function",
          onClick: () => {
            showToast('Thank you! Opening app store...', 'success');
            // In real app: window.open(appStoreUrl)
          }
        }
      ]
    },
    {
      title: "Account Actions",
      items: [
        {
          id: "delete",
          title: "Delete All Data",
          subtitle: "Permanently remove your data",
          icon: Trash2,
          action: "modal",
          onClick: () => setShowDeleteConfirm(true),
          textColor: "text-red-600"
        },
        {
          id: "logout",
          title: "Sign Out",
          subtitle: "Sign out of your account",
          icon: LogOut,
          action: "modal",
          onClick: () => setShowSignOutConfirm(true),
          textColor: "text-red-600"
        }
      ]
    }
  ];

  return (
    <ToastProvider>
      <div className="h-full bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 safe-area-top">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="bg-white border-b border-gray-100 p-4">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-4 w-full hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{userProfile?.avatar || 'U'}</span>
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-lg font-semibold text-gray-900">{userProfile?.name || 'Loading...'}</h2>
                <p className="text-gray-600 text-sm">{userProfile?.email || 'Loading...'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded-full">
                    <Crown className="h-3 w-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">
                      {isPremium ? 'Premium' : isTrialActive ? 'Trial' : 'Expired'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Since {userProfile?.joinDate || 'Jan 2025'}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Settings Sections */}
          <div className="p-4 space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                  {section.title}
                </h3>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => {
                            if (item.action === 'toggle') {
                              item.onChange();
                            } else if (item.onClick) {
                              item.onClick();
                            }
                          }}
                          disabled={item.loading}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${
                              item.textColor === 'text-red-600' 
                                ? 'bg-red-50' 
                                : 'bg-gray-50'
                            }`}>
                              {item.loading ? (
                                <Loader className="h-5 w-5 text-gray-600 animate-spin" />
                              ) : (
                                <Icon className={`h-5 w-5 ${
                                  item.textColor || 'text-gray-600'
                                }`} />
                              )}
                            </div>
                            <div className="text-left">
                              <h4 className={`font-medium ${
                                item.textColor || 'text-gray-900'
                              }`}>
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-500">{item.subtitle}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {item.badge && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.badge === 'Trial' 
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-purple-100 text-purple-600'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            {item.action === 'toggle' ? (
                              <div className={`w-12 h-6 rounded-full transition-colors ${
                                item.value ? 'bg-green-500' : 'bg-gray-300'
                              }`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-y-0.5 ${
                                  item.value ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                              </div>
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        {itemIndex < section.items.length - 1 && (
                          <div className="border-b border-gray-50 ml-16" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* App Info */}
          <div className="px-4 pb-8">
            <div className="text-center text-gray-500">
              <p className="text-sm font-medium">SoulLens AI</p>
              <p className="text-xs">Version 2.1.0 • Build 2024.12</p>
              <p className="text-xs mt-2">Made with ❤️ for personal growth</p>
            </div>
          </div>

          <div className="h-6" />
        </div>

        {/* Profile Modal */}
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Edit Profile"
          size="large"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="section">
              <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="section border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Security</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">Change Password</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => showToast('Two-factor authentication setup would open here', 'info')}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">Two-Factor Authentication</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* AI Companion */}
            <div className="section border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">AI Companion</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Companion Name
                </label>
                <input
                  type="text"
                  value={profileForm.aiCompanionName}
                  onChange={(e) => setProfileForm({...profileForm, aiCompanionName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="SAGE, ALEX, NOVA, etc."
                />
                <p className="text-sm text-gray-600 mt-2">
                  Give your AI companion a personal name (Premium feature)
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="section border-t border-red-200 pt-4">
              <h4 className="font-semibold text-red-600 mb-3">Danger Zone</h4>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Delete Account
              </button>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>

        {/* Subscription Modal */}
        <Modal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          title="Subscription"
          size="large"
        >
          <div className="space-y-6">
            {/* Trial Status */}
            {isTrialActive && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Free Trial</h4>
                <p className="text-orange-800 mb-3">{daysRemaining} days remaining</p>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(10, (daysRemaining / 14) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upgrade Benefits */}
            <div>
              <h4 className="font-medium mb-4">
                {isTrialActive ? 'Upgrade to Premium ($29/month)' : 'Premium Features'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Unlimited conversations with all 6 AI personas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Name your AI companion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Advanced insights and pattern analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Export unlimited data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Priority support and early access</span>
                </div>
              </div>
            </div>

            {isTrialActive ? (
              <button
                onClick={() => {
                  showToast('Redirecting to payment...', 'success');
                  setShowSubscriptionModal(false);
                }}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-lg"
              >
                Upgrade to Premium - $29/month
              </button>
            ) : (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Crown className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">You're on Premium!</p>
                <p className="text-sm text-green-700">Enjoying all premium features</p>
              </div>
            )}
          </div>
        </Modal>

        {/* Appearance Modal */}
        <Modal
          isOpen={showAppearanceModal}
          onClose={() => setShowAppearanceModal(false)}
          title="Appearance"
        >
          <div className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">Choose your preferred theme</p>
            <div className="space-y-3">
              {[
                { id: 'light', name: 'Light', icon: Sun, description: 'Light mode' },
                { id: 'dark', name: 'Dark', icon: Moon, description: 'Dark mode' },
                { id: 'auto', name: 'Auto', icon: Monitor, description: 'Follow system' }
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                      theme === option.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      theme === option.id ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                    <div className="flex-1 text-left">
                      <h4 className={`font-medium ${
                        theme === option.id ? 'text-purple-900' : 'text-gray-900'
                      }`}>
                        {option.name}
                      </h4>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                    {theme === option.id && (
                      <Check className="h-5 w-5 text-purple-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>

        {/* Privacy Modal */}
        <Modal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          title="Privacy Settings"
        >
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Your conversations and journal entries are always private and stored securely on your device.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleAnalyticsToggle}
                className="flex items-center justify-between w-full py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">Analytics</h4>
                  <p className="text-sm text-gray-500">Help improve the app</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  analytics ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-y-0.5 ${
                    analytics ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
              
              <button
                onClick={handleCrashReportsToggle}
                className="flex items-center justify-between w-full py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">Crash Reports</h4>
                  <p className="text-sm text-gray-500">Send crash data to help fix issues</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  crashReports ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-y-0.5 ${
                    crashReports ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                🔒 Your conversations and journal entries are always private and
                stored securely on your device. We never read or share your personal content.
              </p>
            </div>
          </div>
        </Modal>

        {/* Help Modal */}
        <Modal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="Help & Support"
          size="large"
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Frequently Asked Questions</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900">How does SoulLens work?</h5>
                  <p className="text-sm text-gray-600 mt-1">SoulLens uses advanced AI to provide personalized insights and support for your mental wellness journey.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900">Is my data private?</h5>
                  <p className="text-sm text-gray-600 mt-1">Yes, all your conversations and journal entries are stored securely on your device and never shared.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900">How do I upgrade to Premium?</h5>
                  <p className="text-sm text-gray-600 mt-1">Go to Settings → Subscription to upgrade and unlock advanced features.</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600">Need more help? Email us at support@soullens.ai</p>
            </div>
          </div>
        </Modal>

        {/* Feedback Modal */}
        <Modal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title="Send Feedback"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={feedbackForm.type}
                onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="feedback">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Tell us what you think..."
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackForm.message.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </Modal>

        {/* Import Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Data"
          size="large"
        >
          <div className="space-y-6">
            {/* Clear Explanation */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What does importing do?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Adds your data to your AI companion's memory</li>
                <li>• Helps your AI understand your patterns and history</li>
                <li>• Makes conversations more personalized and relevant</li>
                <li>• Limited to 10MB per import to ensure fast performance</li>
              </ul>
            </div>

            {/* Supported Formats */}
            <div>
              <h4 className="font-medium mb-3">Supported formats:</h4>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">JSON</span>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">TXT</span>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">CSV</span>
              </div>
            </div>

            {/* Import Limits */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Import Limits</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Maximum file size: 10MB</li>
                <li>• Text content only (no images or videos)</li>
                <li>• Premium users: 5 imports per month</li>
                <li>• Trial users: 1 import total</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Choose a file to import into your AI companion's memory
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.txt,.csv"
                onChange={(e) => handleImportData(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Select File'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          showCloseButton={false}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete All Data?</h3>
            <p className="text-gray-600 text-sm mb-6">
              This will permanently delete all your journal entries, conversations, and insights. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isDeleting && <Loader className="h-4 w-4 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Everything'}</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* Sign Out Confirmation Modal */}
        <Modal
          isOpen={showSignOutConfirm}
          onClose={() => setShowSignOutConfirm(false)}
          showCloseButton={false}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out?</h3>
            <p className="text-gray-600 text-sm mb-6">
              You'll need to sign back in to access your account. Your data will remain safe.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
               Cancel
             </button>
             <button
               onClick={() => {
                 showToast('Password updated successfully', 'success');
                 setShowPasswordModal(false);
               }}
               className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
             >
               Update
             </button>
           </div>
         </div>
       </Modal>

       {/* Upgrade Modal */}
       <UpgradeModal
         isOpen={showUpgradeModal}
         onClose={() => setShowUpgradeModal(false)}
         trigger="settings"
       />
     </div>
   </ToastProvider>
 );
}