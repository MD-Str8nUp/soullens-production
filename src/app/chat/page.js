'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { useAI } from '@/hooks/useAI';

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { aiEngine, initializeAI } = useAI();

  useEffect(() => {
    const init = async () => {
      await initializeAI();
      setIsLoading(false);
    };
    init();
  }, [initializeAI]);

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-[#0B3D91] to-[#A56CC1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg">Loading SoulLens...</p>
          <p className="text-white/80 text-sm mt-2">Preparing your AI companion</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <ChatInterface aiEngine={aiEngine} />
    </div>
  );
}