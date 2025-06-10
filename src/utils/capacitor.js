'use client';

// Web-only implementation - no Capacitor imports
// This prevents build errors when deploying to Vercel

export const isNativeApp = () => {
  return false; // Always false for web
};

export const isWebApp = () => {
  return true; // Always true for web
};

export const getPlatform = () => {
  return 'web';
};

// Deep link handling for authentication (no-op on web)
export const setupDeepLinkHandling = (router) => {
  // No-op on web
  console.log('Deep link handling not needed on web');
};

// App state management (no-op on web)
export const setupAppStateHandling = () => {
  // No-op on web
  console.log('App state handling not needed on web');
};

// Network status
export const getNetworkStatus = async () => {
  return { connected: navigator.onLine };
};

// Device info
export const getDeviceInfo = async () => {
  return {
    platform: 'web',
    operatingSystem: navigator.platform || 'Unknown',
    model: 'Web Browser',
    manufacturer: 'Unknown'
  };
};