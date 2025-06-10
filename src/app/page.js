'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Brain, TrendingUp, MessageCircle, Target, Calendar, BookOpen, Crown, Clock } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useSubscription';

function DashboardContent() {
  const [greeting, setGreeting] = useState('');
  const { user, profile } = useAuth();
  const { isTrialActive, daysRemaining, isPremium, messagesUsedToday } = useTrialStatus();
  const [stats, setStats] = useState({
    streakDays: 7,
    conversations: 23,
    insights: 12,
    growth: 85
  });

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Friend';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D91] via-[#A56CC1] to-[#FFC857] opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#FFC857]/20 rounded-full blur-3xl animate-pulse delay-75"></div>
        
        <div className="relative px-6 pt-8 pb-20">
          <h1 className="text-3xl font-bold text-white mb-2">
            {greeting}, {userName}
          </h1>
          <p className="text-white/80 text-lg">
            Your journey to self-discovery continues
          </p>
        </div>
      </div>

      {/* Trial Status Banner */}
      {isTrialActive && !isPremium && (
        <div className="px-6 -mt-8 relative z-20 mb-4">
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 rounded-2xl p-4 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold">14-Day Premium Trial Active</div>
                  <div className="text-blue-100 text-sm">
                    {daysRemaining} days left • {15 - messagesUsedToday}/15 messages today
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Link href="/settings" className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                  <Crown className="w-4 h-4 mr-1" />
                  $29/mo
                </Link>
                <div className="text-xs text-blue-100 mt-1">Unlock SAGE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Check-in Card */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0B3D91] to-[#A56CC1] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Daily Check-in</h3>
                <p className="text-sm text-gray-500">How are you feeling today?</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#0B3D91]">{stats.streakDays}</p>
              <p className="text-xs text-gray-500">day streak</p>
            </div>
          </div>
          
          <Link href="/chat" className="block">
            <button className="w-full bg-gradient-to-r from-[#0B3D91] to-[#A56CC1] text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
              <MessageCircle className="w-5 h-5" />
              Start Today's Conversation
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* AI Companion Card */}
      <div className="px-6 mt-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC857]/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Your AI Companion</h3>
                <p className="text-gray-300 text-sm">Empathetic guide for self-discovery</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFC857] to-[#FFB700] rounded-2xl flex items-center justify-center shadow-xl">
                <Brain className="w-8 h-8 text-gray-900" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-300 mb-1">Ready to chat with</p>
                  <p className="text-2xl font-bold text-[#FFC857]">5 AI Personalities</p>
                </div>
                <Sparkles className="w-6 h-6 text-[#FFC857] animate-pulse" />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Choose from Mentor, Coach, Friend, Challenger, and Therapist personalities. 
                Upgrade to Premium to unlock SAGE, the most advanced AI companion.
              </p>
            </div>

            <Link href="/chat" className="block">
              <button className="w-full bg-gradient-to-r from-[#FFC857] to-[#FFB700] text-gray-900 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                <MessageCircle className="w-5 h-5" />
                Start AI Conversation
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        <Link href="/conversations" className="block">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <MessageCircle className="w-8 h-8 text-[#0B3D91]" />
              <span className="text-2xl font-bold text-gray-900">{stats.conversations}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Conversations</p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
        </Link>

        <Link href="/insights" className="block">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-[#A56CC1]" />
              <span className="text-2xl font-bold text-gray-900">{stats.insights}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">New Insights</p>
            <p className="text-xs text-gray-400 mt-1">About yourself</p>
          </div>
        </Link>
      </div>

      {/* Programs Section */}
      <div className="px-6 mt-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FFC857]" />
            Your Programs
          </h3>
          
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Into Confidence</h4>
                <p className="text-sm text-gray-600">Day 3 of 30 • 10% Complete</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#FFC857]">Active</p>
                <p className="text-xs text-gray-500">3 day streak</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="h-full bg-gradient-to-r from-[#FFC857] to-[#FFB700] rounded-full w-[10%]"></div>
            </div>
          </div>

          <Link href="/programs" className="block">
            <button className="w-full bg-white/80 backdrop-blur text-gray-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all duration-200 border border-gray-200">
              View All Programs
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Insights Preview */}
      <div className="px-6 mt-6 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#A56CC1]" />
            Your Growth Progress
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Self-Awareness</span>
                <span className="text-sm font-bold text-[#0B3D91]">{stats.growth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0B3D91] to-[#A56CC1] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${stats.growth}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Link href="/insights" className="block mt-4">
            <button className="w-full bg-white/80 backdrop-blur text-gray-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all duration-200 border border-gray-200">
              View All Insights
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}