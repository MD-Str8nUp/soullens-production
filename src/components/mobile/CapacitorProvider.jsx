'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setupDeepLinkHandling, setupAppStateHandling, isNativeApp } from '@/utils/capacitor';

export const CapacitorProvider = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    // Since we're on web, isNativeApp() will always return false
    // This component is just a pass-through for web deployment
    if (isNativeApp()) {
      console.log('Initializing Capacitor features...');
      
      // These functions will be no-ops on web
      setupDeepLinkHandling(router);
      setupAppStateHandling();
      
      console.log('Capacitor features initialized');
    } else {
      console.log('Running in web mode - Capacitor features disabled');
    }
  }, [router]);

  return <>{children}</>;
};

export default CapacitorProvider;