'use client'

import { useState, useEffect } from 'react'
import { useAnalytics } from '../../hooks/useMobile'

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
          trackEvent('sw_registered')
        })
        .catch((error) => {
          console.error('SW registration failed:', error)
        })
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after user has used the app for a bit
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
          trackEvent('install_prompt_shown')
        }
      }, 30000) // Show after 30 seconds
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      trackEvent('app_installed')
      
      // Show success message
      showInstallSuccessMessage()
    }

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, trackEvent])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await trackEvent('install_clicked')
      
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        await trackEvent('install_accepted')
      } else {
        await trackEvent('install_dismissed')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Install failed:', error)
      await trackEvent('install_failed', { error: error.message })
    }
  }

  const handleDismiss = async () => {
    setShowInstallPrompt(false)
    await trackEvent('install_prompt_dismissed')
    
    // Don't show again for a while
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }

  const showInstallSuccessMessage = () => {
    // Create and show a temporary success message
    const message = document.createElement('div')
    message.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 500;
      ">
        🎉 SoulLens AI installed successfully!
      </div>
    `
    
    document.body.appendChild(message)
    
    setTimeout(() => {
      document.body.removeChild(message)
    }, 3000)
  }

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  const lastDismissed = localStorage.getItem('pwa_install_dismissed')
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) {
    return null // Don't show for 24 hours after dismissal
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <img 
              src="/images/app_icon.jpg" 
              alt="SoulLens AI" 
              className="w-10 h-10 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Install SoulLens AI
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Get the full app experience with offline access, push notifications, and faster loading.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}