'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, BookOpen, TrendingUp, Settings, GraduationCap } from 'lucide-react';
import TrialStatusBanner from '@/components/subscription/TrialStatusBanner';
import UpgradeModal from '@/components/subscription/UpgradeModal';

export default function MobileLayout({ children }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    // Determine active tab based on pathname
    if (pathname === '/') {
      setActiveTab('dashboard');
    } else if (pathname.startsWith('/chat') || pathname.startsWith('/conversations')) {
      setActiveTab('chat');
    } else if (pathname.startsWith('/journal')) {
      setActiveTab('journal');
    } else if (pathname.startsWith('/programs')) {
      setActiveTab('programs');
    } else if (pathname.startsWith('/insights')) {
      setActiveTab('insights');
    } else if (pathname.startsWith('/settings')) {
      setActiveTab('settings');
    }
  }, [pathname]);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      href: '/',
      color: 'text-[#0B3D91]'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      href: '/chat',
      color: 'text-[#A56CC1]'
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: BookOpen,
      href: '/journal',
      color: 'text-purple-600'
    },
    {
      id: 'programs',
      label: 'Programs',
      icon: GraduationCap,
      href: '/programs',
      color: 'text-[#FFC857]'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: TrendingUp,
      href: '/insights',
      color: 'text-orange-500'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Trial Status Banner */}
      <TrialStatusBanner onUpgradeClick={() => setShowUpgradeModal(true)} />
      
      {/* Main Content - Make it scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white text-black scrollbar-hide" style={{ paddingBottom: "100px" }}>
        {children}
      </div>

      {/* Premium Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-4 py-2 flex justify-around items-center safe-area-bottom shadow-lg z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <a
              key={tab.id}
              href={tab.href}
              className={`relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 min-w-[64px] ${
                isActive
                  ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm'
                  : 'hover:bg-gray-50'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D91]/10 to-[#A56CC1]/10 rounded-2xl"></div>
              )}
              <div className="relative">
                <Icon className={`h-6 w-6 mb-1 transition-all duration-300 ${
                  isActive
                    ? `${tab.color} drop-shadow-sm scale-110`
                    : 'text-gray-400 scale-100'
                }`} />
              </div>
              <span className={`relative text-[11px] font-medium transition-all duration-300 ${
                isActive
                  ? `${tab.color} font-semibold`
                  : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className={`absolute -bottom-1 w-8 h-0.5 rounded-full ${tab.color.replace('text-', 'bg-')} opacity-60`}></div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="trial_banner"
      />
    </div>
  );
}